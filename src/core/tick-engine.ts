import type {
  ReactorState,
  SimulationDelta,
  SimulationProvider,
} from "./types.ts";
import { clamp, deterministicId, trendFromDelta } from "./utils.ts";

function applyDelta(state: ReactorState, delta: SimulationDelta): ReactorState {
  const next = structuredClone(state);

  for (const change of delta.variableChanges) {
    const variable = next.variables.find((item) => item.id === change.variableId);
    if (!variable) continue;
    variable.value = clamp(variable.value + change.delta, variable.min, variable.max);
    variable.trend = trendFromDelta(change.delta);
  }

  for (const change of delta.resourceChanges) {
    const current = next.environment.resources[change.resource] ?? 0;
    next.environment.resources[change.resource] = Math.max(0, current + change.delta);
  }

  for (const change of delta.relationshipChanges) {
    const relationship = next.relationships.find(
      (item) =>
        item.fromAgentId === change.fromAgentId && item.toAgentId === change.toAgentId,
    );
    if (!relationship) continue;

    relationship.trust = clamp(relationship.trust + (change.trustDelta ?? 0), 0, 100);
    relationship.affinity = clamp(relationship.affinity + (change.affinityDelta ?? 0), 0, 100);
    relationship.fear = clamp(relationship.fear + (change.fearDelta ?? 0), 0, 100);
    relationship.influence = clamp(
      relationship.influence + (change.influenceDelta ?? 0),
      0,
      100,
    );
    relationship.conflict = clamp(
      relationship.conflict + (change.conflictDelta ?? 0),
      0,
      100,
    );
  }

  for (const entry of delta.newMemories) {
    const agent = next.agents.find((item) => item.id === entry.agentId);
    if (!agent) continue;
    if (entry.importance >= 7) agent.longMemory.push(entry.memory);
    else agent.shortMemory.push(entry.memory);
    agent.shortMemory = agent.shortMemory.slice(-12);
    agent.longMemory = agent.longMemory.slice(-30);
  }

  for (const event of delta.emergentEvents) {
    next.events.push({
      id: deterministicId("event", next.events.length + 1),
      kind: "EMERGENT",
      description: event.description,
      resolved: false,
      createdAtMinute: state.elapsedMinutes,
    });
  }

  return next;
}

function activateScheduledEvents(state: ReactorState, targetMinute: number): ReactorState {
  const next = structuredClone(state);
  for (const event of next.events) {
    if (
      event.kind === "SCHEDULED" &&
      !event.resolved &&
      event.scheduledAtMinute !== undefined &&
      event.scheduledAtMinute <= targetMinute
    ) {
      event.resolved = true;
      for (const agent of next.agents) {
        agent.shortMemory.push(`External event: ${event.description}`);
      }
    }
  }
  return next;
}

export async function runTick(
  current: ReactorState,
  provider: SimulationProvider,
): Promise<ReactorState> {
  if (current.status !== "RUNNING") {
    throw new Error(`Cannot tick reactor in status ${current.status}.`);
  }
  if (current.elapsedMinutes >= current.durationMinutes) {
    return { ...current, status: "COMPLETED" };
  }

  const targetMinute = Math.min(
    current.elapsedMinutes + current.tickMinutes,
    current.durationMinutes,
  );

  const prepared = activateScheduledEvents(current, targetMinute);
  const delta = await provider.simulate(prepared);
  const next = applyDelta(prepared, delta);

  next.elapsedMinutes = targetMinute;
  next.sequence = current.sequence + 1;
  next.observations.push({
    id: deterministicId("obs", next.sequence),
    sequence: next.sequence,
    elapsedMinute: targetMinute,
    text: delta.observation.slice(0, 600),
    createdAt: new Date().toISOString(),
  });

  if (next.elapsedMinutes >= next.durationMinutes) {
    next.status = "COMPLETED";
  }

  return next;
}

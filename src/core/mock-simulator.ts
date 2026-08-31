import type { ReactorState, SimulationDelta, SimulationProvider } from "./types.ts";

const scenes = [
  "A primeira diferença estratégica surge quando os participantes discutem como dividir os recursos disponíveis.",
  "A tentativa de estabelecer regras comuns melhora a coordenação, mas também torna explícitas diferenças de liderança.",
  "Uma informação ambígua sobre o ambiente gera interpretações concorrentes e aumenta a atenção aos movimentos dos demais.",
  "Os participantes começam a formar expectativas sobre o comportamento uns dos outros, transformando pequenas decisões em sinais de confiança.",
];

export class MockSimulationProvider implements SimulationProvider {
  async simulate(state: Readonly<ReactorState>): Promise<SimulationDelta> {
    const index = state.sequence % scenes.length;
    const stress = state.variables.find((v) => v.id === "stress");
    const trust = state.variables.find((v) => v.id === "group-trust");
    const food = state.environment.resources.food ?? 0;
    const nextMinute = Math.min(state.elapsedMinutes + state.tickMinutes, state.durationMinutes);

    const agentA = state.agents[0];
    const agentB = state.agents[1] ?? state.agents[0];
    const eventNote = state.events.find(
      (event) => event.kind === "SCHEDULED" && event.resolved && event.scheduledAtMinute === nextMinute,
    );

    const observation = [
      scenes[index],
      `${agentA.name} propõe uma ação concreta, enquanto ${agentB.name} avalia os custos antes de concordar.`,
      eventNote ? `O evento “${eventNote.description}” altera imediatamente o contexto.` : "",
      `O estoque de alimento está em ${Math.max(0, food - 1)} unidades; o nível de estresse tende a subir e a confiança coletiva sofre uma pequena variação.`,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      actions: [
        { agentId: agentA.id, action: "propose_resource_rule", rationale: "reduce uncertainty" },
        { agentId: agentB.id, action: "evaluate_proposal", rationale: "preserve autonomy" },
      ],
      variableChanges: [
        { variableId: "stress", delta: stress && stress.value > 80 ? 0 : 3, reason: "uncertainty" },
        { variableId: "group-trust", delta: trust && trust.value < 25 ? 1 : -2, reason: "negotiation friction" },
      ],
      resourceChanges: [{ resource: "food", delta: -1, reason: "consumption" }],
      relationshipChanges: [
        {
          fromAgentId: agentA.id,
          toAgentId: agentB.id,
          trustDelta: -1,
          conflictDelta: 2,
          reason: "different strategies",
        },
      ],
      newMemories: [
        {
          agentId: agentA.id,
          memory: `${agentB.name} hesitated before accepting a shared rule.`,
          importance: 5,
        },
      ],
      emergentEvents: state.sequence === 2 ? [{ description: "A tentative leadership hierarchy begins to form." }] : [],
      observation,
    };
  }
}

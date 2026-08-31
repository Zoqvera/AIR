import type { ReactorState } from "../core/types.ts";

export function createDemoReactor(): ReactorState {
  return {
    reactorId: "reactor-demo",
    name: "The Isolation Room",
    status: "RUNNING",
    prompt:
      "Duas pessoas desconhecidas são colocadas em uma sala sem janelas. Há recursos limitados e elas não sabem quanto tempo permanecerão ali.",
    tickMinutes: 30,
    durationMinutes: 300,
    elapsedMinutes: 0,
    sequence: 0,
    agents: [
      {
        id: "olivia",
        name: "Olivia",
        age: 34,
        occupation: "Journalist",
        personality: ["analytical", "assertive", "skeptical"],
        motivations: ["understand the experiment"],
        fears: ["losing control"],
        secrets: [],
        knowledge: ["The room has no visible exit."],
        shortMemory: [],
        longMemory: [],
      },
      {
        id: "marcus",
        name: "Marcus",
        age: 38,
        occupation: "Engineer",
        personality: ["pragmatic", "reserved", "methodical"],
        motivations: ["preserve resources"],
        fears: ["resource exhaustion"],
        secrets: ["He recognizes the facility logo."],
        knowledge: ["The available food appears insufficient for a long stay."],
        shortMemory: [],
        longMemory: [],
      },
    ],
    relationships: [
      {
        fromAgentId: "olivia",
        toAgentId: "marcus",
        trust: 50,
        affinity: 50,
        fear: 5,
        influence: 30,
        conflict: 10,
      },
      {
        fromAgentId: "marcus",
        toAgentId: "olivia",
        trust: 50,
        affinity: 50,
        fear: 5,
        influence: 30,
        conflict: 10,
      },
    ],
    environment: {
      location: "Underground laboratory",
      description: "A windowless controlled room with limited supplies.",
      properties: { temperatureC: 19, lighting: "artificial", communication: false },
      resources: { food: 10, water: 20 },
    },
    variables: [
      { id: "stress", name: "Stress", value: 25, min: 0, max: 100, trend: "STABLE", visibility: "PUBLIC" },
      { id: "group-trust", name: "Group trust", value: 65, min: 0, max: 100, trend: "STABLE", visibility: "PUBLIC" },
      { id: "conflict", name: "Conflict", value: 12, min: 0, max: 100, trend: "STABLE", visibility: "PUBLIC" },
    ],
    events: [
      {
        id: "event-00001",
        kind: "SCHEDULED",
        description: "The lighting switches to emergency mode.",
        scheduledAtMinute: 90,
        resolved: false,
        createdAtMinute: 0,
      },
    ],
    interventions: [],
    observations: [],
  };
}

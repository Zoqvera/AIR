export type ReactorStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "TERMINATED";

export type Trend = "UP" | "DOWN" | "STABLE";
export type Visibility = "PUBLIC" | "INTERNAL";
export type EventKind = "SCHEDULED" | "CONDITIONAL" | "EMERGENT";

export interface Agent {
  id: string;
  name: string;
  age?: number;
  occupation?: string;
  personality: string[];
  motivations: string[];
  fears: string[];
  secrets: string[];
  knowledge: string[];
  shortMemory: string[];
  longMemory: string[];
}

export interface Relationship {
  fromAgentId: string;
  toAgentId: string;
  trust: number;
  affinity: number;
  fear: number;
  influence: number;
  conflict: number;
}

export interface EnvironmentState {
  location: string;
  description: string;
  properties: Record<string, string | number | boolean>;
  resources: Record<string, number>;
}

export interface ReactorVariable {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  trend: Trend;
  visibility: Visibility;
}

export interface ReactorEvent {
  id: string;
  kind: EventKind;
  description: string;
  scheduledAtMinute?: number;
  condition?: string;
  resolved: boolean;
  createdAtMinute: number;
}

export interface Intervention {
  id: string;
  createdAtMinute: number;
  instruction: string;
  applied: boolean;
}

export interface Observation {
  id: string;
  sequence: number;
  elapsedMinute: number;
  text: string;
  createdAt: string;
}

export interface ReactorState {
  reactorId: string;
  name: string;
  status: ReactorStatus;
  prompt: string;
  tickMinutes: number;
  durationMinutes: number;
  elapsedMinutes: number;
  sequence: number;
  agents: Agent[];
  relationships: Relationship[];
  environment: EnvironmentState;
  variables: ReactorVariable[];
  events: ReactorEvent[];
  interventions: Intervention[];
  observations: Observation[];
}

export interface AgentAction {
  agentId: string;
  action: string;
  rationale: string;
}

export interface VariableChange {
  variableId: string;
  delta: number;
  reason: string;
}

export interface ResourceChange {
  resource: string;
  delta: number;
  reason: string;
}

export interface RelationshipChange {
  fromAgentId: string;
  toAgentId: string;
  trustDelta?: number;
  affinityDelta?: number;
  fearDelta?: number;
  influenceDelta?: number;
  conflictDelta?: number;
  reason: string;
}

export interface SimulationDelta {
  actions: AgentAction[];
  variableChanges: VariableChange[];
  resourceChanges: ResourceChange[];
  relationshipChanges: RelationshipChange[];
  newMemories: Array<{ agentId: string; memory: string; importance: number }>;
  emergentEvents: Array<{ description: string }>;
  observation: string;
}

export interface SimulationProvider {
  simulate(state: Readonly<ReactorState>): Promise<SimulationDelta>;
}

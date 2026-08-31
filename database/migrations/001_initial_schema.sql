CREATE TABLE reactors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text,
  code text UNIQUE,
  name text NOT NULL,
  scenario text NOT NULL,
  mode text NOT NULL DEFAULT 'assisted' CHECK (mode IN ('assisted','manual')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','running','paused','completed','failed','terminated')),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  observation_interval_minutes integer NOT NULL DEFAULT 30 CHECK (observation_interval_minutes > 0),
  unpredictability smallint NOT NULL DEFAULT 50 CHECK (unpredictability BETWEEN 0 AND 100),
  current_tick integer NOT NULL DEFAULT 0 CHECK (current_tick >= 0),
  elapsed_minutes integer NOT NULL DEFAULT 0 CHECK (elapsed_minutes >= 0),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  name text NOT NULL,
  role text,
  personality text,
  motivation text,
  fear text,
  secret text,
  initial_knowledge text,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  memory_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reactor_id, display_order)
);

CREATE TABLE variables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  name text NOT NULL,
  current_value double precision NOT NULL DEFAULT 50,
  min_value double precision NOT NULL DEFAULT 0,
  max_value double precision NOT NULL DEFAULT 100,
  trend text NOT NULL DEFAULT 'stable' CHECK (trend IN ('up','down','stable')),
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','internal')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reactor_id, name),
  CHECK (min_value < max_value),
  CHECK (current_value >= min_value AND current_value <= max_value)
);

CREATE TABLE agent_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  source_agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  target_agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  trust smallint NOT NULL DEFAULT 50 CHECK (trust BETWEEN 0 AND 100),
  affinity smallint NOT NULL DEFAULT 50 CHECK (affinity BETWEEN 0 AND 100),
  fear smallint NOT NULL DEFAULT 0 CHECK (fear BETWEEN 0 AND 100),
  influence smallint NOT NULL DEFAULT 0 CHECK (influence BETWEEN 0 AND 100),
  conflict smallint NOT NULL DEFAULT 0 CHECK (conflict BETWEEN 0 AND 100),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reactor_id, source_agent_id, target_agent_id),
  CHECK (source_agent_id <> target_agent_id)
);

CREATE TABLE reactor_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  tick_number integer NOT NULL CHECK (tick_number >= 0),
  elapsed_minutes integer NOT NULL CHECK (elapsed_minutes >= 0),
  state jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reactor_id, tick_number)
);

CREATE TABLE observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  reactor_state_id uuid REFERENCES reactor_states(id) ON DELETE SET NULL,
  tick_number integer NOT NULL CHECK (tick_number >= 0),
  elapsed_minutes integer NOT NULL CHECK (elapsed_minutes >= 0),
  content text NOT NULL,
  variable_changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reactor_id, tick_number)
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('scheduled','conditional','emergent')),
  title text,
  description text NOT NULL,
  trigger_at_minutes integer CHECK (trigger_at_minutes IS NULL OR trigger_at_minutes >= 0),
  condition_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','resolved','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  requested_by_user_id text,
  elapsed_minutes integer NOT NULL DEFAULT 0 CHECK (elapsed_minutes >= 0),
  instruction text NOT NULL,
  parsed_action jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','applied','rejected','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  applied_at timestamptz
);

CREATE TABLE memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  memory_type text NOT NULL CHECK (memory_type IN ('immediate','recent','long_term','system')),
  content text NOT NULL,
  salience smallint NOT NULL DEFAULT 50 CHECK (salience BETWEEN 0 AND 100),
  source_event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  source_observation_id uuid REFERENCES observations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE TABLE reactor_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  tick_number integer NOT NULL CHECK (tick_number >= 0),
  provider text,
  model text,
  status text NOT NULL CHECK (status IN ('queued','running','succeeded','failed')),
  input_tokens integer CHECK (input_tokens IS NULL OR input_tokens >= 0),
  output_tokens integer CHECK (output_tokens IS NULL OR output_tokens >= 0),
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  report_type text NOT NULL DEFAULT 'final' CHECK (report_type IN ('final','checkpoint','fork_comparison')),
  title text,
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reactors_owner_created ON reactors(owner_user_id, created_at DESC);
CREATE INDEX idx_reactors_status ON reactors(status);
CREATE INDEX idx_agents_reactor ON agents(reactor_id);
CREATE INDEX idx_variables_reactor ON variables(reactor_id);
CREATE INDEX idx_relationships_reactor ON agent_relationships(reactor_id);
CREATE INDEX idx_states_reactor_elapsed ON reactor_states(reactor_id, elapsed_minutes DESC);
CREATE INDEX idx_observations_reactor_elapsed ON observations(reactor_id, elapsed_minutes DESC);
CREATE INDEX idx_events_reactor_status ON events(reactor_id, status);
CREATE INDEX idx_interventions_reactor_status ON interventions(reactor_id, status);
CREATE INDEX idx_memories_agent_type ON memories(agent_id, memory_type, created_at DESC);
CREATE INDEX idx_runs_reactor_tick ON reactor_runs(reactor_id, tick_number DESC);
CREATE INDEX idx_reports_reactor_created ON reports(reactor_id, created_at DESC);

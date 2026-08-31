-- AIR v0.1 PostgreSQL schema. UUID generation assumes pgcrypto.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE reactor_status AS ENUM ('DRAFT','SCHEDULED','RUNNING','PAUSED','COMPLETED','FAILED','TERMINATED');
CREATE TYPE event_kind AS ENUM ('SCHEDULED','CONDITIONAL','EMERGENT');
CREATE TYPE visibility AS ENUM ('PUBLIC','INTERNAL');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reactors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  prompt text NOT NULL,
  status reactor_status NOT NULL DEFAULT 'DRAFT',
  tick_minutes integer NOT NULL DEFAULT 30 CHECK (tick_minutes > 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  elapsed_minutes integer NOT NULL DEFAULT 0 CHECK (elapsed_minutes >= 0),
  sequence integer NOT NULL DEFAULT 0 CHECK (sequence >= 0),
  next_tick_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  name text NOT NULL,
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  knowledge jsonb NOT NULL DEFAULT '[]'::jsonb,
  short_memory jsonb NOT NULL DEFAULT '[]'::jsonb,
  long_memory jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE environments (
  reactor_id uuid PRIMARY KEY REFERENCES reactors(id) ON DELETE CASCADE,
  location text NOT NULL,
  description text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  resources jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE reactor_variables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  value numeric NOT NULL,
  min_value numeric NOT NULL DEFAULT 0,
  max_value numeric NOT NULL DEFAULT 100,
  trend text NOT NULL DEFAULT 'STABLE' CHECK (trend IN ('UP','DOWN','STABLE')),
  visibility visibility NOT NULL DEFAULT 'PUBLIC',
  UNIQUE (reactor_id, key)
);

CREATE TABLE agent_relationships (
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  from_agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  to_agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  trust smallint NOT NULL DEFAULT 50 CHECK (trust BETWEEN 0 AND 100),
  affinity smallint NOT NULL DEFAULT 50 CHECK (affinity BETWEEN 0 AND 100),
  fear smallint NOT NULL DEFAULT 0 CHECK (fear BETWEEN 0 AND 100),
  influence smallint NOT NULL DEFAULT 0 CHECK (influence BETWEEN 0 AND 100),
  conflict smallint NOT NULL DEFAULT 0 CHECK (conflict BETWEEN 0 AND 100),
  PRIMARY KEY (reactor_id, from_agent_id, to_agent_id),
  CHECK (from_agent_id <> to_agent_id)
);

CREATE TABLE reactor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  kind event_kind NOT NULL,
  description text NOT NULL,
  scheduled_at_minute integer,
  condition_json jsonb,
  resolved boolean NOT NULL DEFAULT false,
  created_at_minute integer NOT NULL DEFAULT 0
);

CREATE TABLE interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  created_at_minute integer NOT NULL,
  instruction text NOT NULL,
  parsed_effect jsonb,
  applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  elapsed_minute integer NOT NULL,
  text varchar(600) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reactor_id, sequence)
);

CREATE TABLE reactor_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id uuid NOT NULL REFERENCES reactors(id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  elapsed_minute integer NOT NULL,
  state jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reactor_id, sequence)
);

CREATE INDEX reactors_due_tick_idx ON reactors (next_tick_at) WHERE status = 'RUNNING';
CREATE INDEX observations_timeline_idx ON observations (reactor_id, sequence DESC);
CREATE INDEX states_timeline_idx ON reactor_states (reactor_id, sequence DESC);
CREATE INDEX events_pending_idx ON reactor_events (reactor_id, resolved, scheduled_at_minute);

-- AIR v0.1 — Neon Auth + Data API row-level security
-- Assumes Neon Auth and Data API are enabled for the branch.
-- Uses auth.user_id() supplied by Neon's authenticated JWT session.

-- Make authenticated inserts automatically belong to the current user.
ALTER TABLE public.reactors
  ALTER COLUMN owner_user_id SET DEFAULT (auth.user_id());

-- Enable RLS on every application table. Internal engine tables intentionally
-- receive no authenticated policies, so they remain inaccessible via Data API.
ALTER TABLE public.reactors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactor_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactor_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Re-runnable policy setup.
DROP POLICY IF EXISTS reactors_select_own ON public.reactors;
DROP POLICY IF EXISTS reactors_insert_own ON public.reactors;
DROP POLICY IF EXISTS reactors_update_own ON public.reactors;
DROP POLICY IF EXISTS reactors_delete_own ON public.reactors;

CREATE POLICY reactors_select_own ON public.reactors
  FOR SELECT TO authenticated
  USING ((SELECT auth.user_id()) = owner_user_id);

CREATE POLICY reactors_insert_own ON public.reactors
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.user_id()) = owner_user_id);

CREATE POLICY reactors_update_own ON public.reactors
  FOR UPDATE TO authenticated
  USING ((SELECT auth.user_id()) = owner_user_id)
  WITH CHECK ((SELECT auth.user_id()) = owner_user_id);

CREATE POLICY reactors_delete_own ON public.reactors
  FOR DELETE TO authenticated
  USING ((SELECT auth.user_id()) = owner_user_id);

-- Helper pattern: child records are visible/modifiable only when their Reactor
-- belongs to the current authenticated user.
DROP POLICY IF EXISTS agents_own_reactor ON public.agents;
CREATE POLICY agents_own_reactor ON public.agents
  FOR ALL TO authenticated
  USING ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = agents.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )))
  WITH CHECK ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = agents.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )));

DROP POLICY IF EXISTS variables_own_reactor ON public.variables;
CREATE POLICY variables_own_reactor ON public.variables
  FOR ALL TO authenticated
  USING ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = variables.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )))
  WITH CHECK ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = variables.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )));

DROP POLICY IF EXISTS relationships_own_reactor ON public.agent_relationships;
CREATE POLICY relationships_own_reactor ON public.agent_relationships
  FOR ALL TO authenticated
  USING ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = agent_relationships.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )))
  WITH CHECK ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = agent_relationships.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )));

DROP POLICY IF EXISTS events_own_reactor ON public.events;
CREATE POLICY events_own_reactor ON public.events
  FOR ALL TO authenticated
  USING ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = events.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )))
  WITH CHECK ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = events.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )));

-- Interventions are an audit trail: users may create and read them, but not
-- mutate their status after insertion. The engine will apply/update them via a
-- trusted server-side database connection.
DROP POLICY IF EXISTS interventions_select_own ON public.interventions;
DROP POLICY IF EXISTS interventions_insert_own ON public.interventions;

CREATE POLICY interventions_select_own ON public.interventions
  FOR SELECT TO authenticated
  USING ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = interventions.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )));

CREATE POLICY interventions_insert_own ON public.interventions
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = interventions.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )));

-- Generated output is read-only to the browser.
DROP POLICY IF EXISTS observations_select_own ON public.observations;
CREATE POLICY observations_select_own ON public.observations
  FOR SELECT TO authenticated
  USING ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = observations.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )));

DROP POLICY IF EXISTS reports_select_own ON public.reports;
CREATE POLICY reports_select_own ON public.reports
  FOR SELECT TO authenticated
  USING ((SELECT EXISTS (
    SELECT 1 FROM public.reactors r
    WHERE r.id = reports.reactor_id
      AND r.owner_user_id = (SELECT auth.user_id())
  )));

-- Data API privileges for authenticated users.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reactors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.variables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_relationships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT ON public.interventions TO authenticated;
GRANT SELECT ON public.observations TO authenticated;
GRANT SELECT ON public.reports TO authenticated;

-- Explicitly keep internal engine state off the browser-facing API.
REVOKE ALL ON public.reactor_states FROM authenticated;
REVOKE ALL ON public.memories FROM authenticated;
REVOKE ALL ON public.reactor_runs FROM authenticated;

-- AIR experiments are private by default; anonymous users receive no table access.
REVOKE ALL ON public.reactors FROM anonymous;
REVOKE ALL ON public.agents FROM anonymous;
REVOKE ALL ON public.variables FROM anonymous;
REVOKE ALL ON public.agent_relationships FROM anonymous;
REVOKE ALL ON public.reactor_states FROM anonymous;
REVOKE ALL ON public.observations FROM anonymous;
REVOKE ALL ON public.events FROM anonymous;
REVOKE ALL ON public.interventions FROM anonymous;
REVOKE ALL ON public.memories FROM anonymous;
REVOKE ALL ON public.reactor_runs FROM anonymous;
REVOKE ALL ON public.reports FROM anonymous;

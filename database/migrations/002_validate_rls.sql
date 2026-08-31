-- Validate AIR RLS and Data API privileges after applying 002_rls.sql.

SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'reactors','agents','variables','agent_relationships','reactor_states',
    'observations','events','interventions','memories','reactor_runs','reports'
  )
ORDER BY c.relname;

SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'reactors','agents','variables','agent_relationships','reactor_states',
    'observations','events','interventions','memories','reactor_runs','reports'
  )
ORDER BY tablename, policyname;

SELECT
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'authenticated'
  AND table_schema = 'public'
  AND table_name IN (
    'reactors','agents','variables','agent_relationships','reactor_states',
    'observations','events','interventions','memories','reactor_runs','reports'
  )
ORDER BY table_name, privilege_type;

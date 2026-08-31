SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'reactors',
    'agents',
    'variables',
    'agent_relationships',
    'reactor_states',
    'observations',
    'events',
    'interventions',
    'memories',
    'reactor_runs',
    'reports'
  )
ORDER BY table_name;

SELECT
  COUNT(*) FILTER (WHERE table_name = 'reactors') AS reactors,
  COUNT(*) FILTER (WHERE table_name = 'agents') AS agents,
  COUNT(*) FILTER (WHERE table_name = 'variables') AS variables,
  COUNT(*) FILTER (WHERE table_name = 'agent_relationships') AS agent_relationships,
  COUNT(*) FILTER (WHERE table_name = 'reactor_states') AS reactor_states,
  COUNT(*) FILTER (WHERE table_name = 'observations') AS observations,
  COUNT(*) FILTER (WHERE table_name = 'events') AS events,
  COUNT(*) FILTER (WHERE table_name = 'interventions') AS interventions,
  COUNT(*) FILTER (WHERE table_name = 'memories') AS memories,
  COUNT(*) FILTER (WHERE table_name = 'reactor_runs') AS reactor_runs,
  COUNT(*) FILTER (WHERE table_name = 'reports') AS reports
FROM information_schema.tables
WHERE table_schema = 'public';

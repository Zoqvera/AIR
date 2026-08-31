# AIR — Artificial Intelligence Reactor

AIR is a platform for creating and running persistent AI-powered simulations with configurable agents, environments, variables, events and timelines. Users can observe emergent behavior, intervene in experiments and track how simulated worlds evolve over time.

## AIR v0.1

The current prototype includes:

- Next.js + TypeScript interface
- Landing page
- Reactor dashboard
- Create Reactor wizard preview
- Live Reactor experiment view
- Typed Reactor/Agent/Environment/Variable domain model
- Deterministic tick engine
- Layered agent memory
- Scheduled and emergent events
- Structured variable/resource/relationship changes
- 600-character Observation boundary
- Mock simulation provider for zero-API-cost development
- PostgreSQL schema
- Automated engine tests

## Interface routes

- `/` — AIR landing page
- `/dashboard` — Reactor Control Room
- `/create` — Create Reactor workflow
- `/reactors/demo` — Live Reactor prototype

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

The simulation engine can also be exercised without an AI provider:

```bash
npm run demo
npm test
```

## Architecture

The LLM is a `SimulationProvider`, not the source of truth. The persistent Reactor state is authoritative. On each tick, the provider receives a compact state snapshot and returns a structured `SimulationDelta`; the engine validates and applies that delta before the next snapshot is persisted.

## Next milestones

1. Deploy the interface preview.
2. Complete the multi-step Create Reactor workflow.
3. Add PostgreSQL persistence and transactional tick locking.
4. Add a real AI simulation provider with strict structured output validation.
5. Add scheduler/worker execution for real-time experiments.
6. Add interventions, live observations and final Reactor Reports.

import assert from "node:assert/strict";
import test from "node:test";
import { MockSimulationProvider } from "../src/core/mock-simulator.ts";
import { runTick } from "../src/core/tick-engine.ts";
import { createDemoReactor } from "../src/data/demo-reactor.ts";

test("a tick advances time and creates one observation", async () => {
  const reactor = createDemoReactor();
  const next = await runTick(reactor, new MockSimulationProvider());

  assert.equal(next.elapsedMinutes, 30);
  assert.equal(next.sequence, 1);
  assert.equal(next.observations.length, 1);
  assert.ok(next.observations[0].text.length <= 600);
});

test("scheduled event is resolved when its minute is reached", async () => {
  let reactor = createDemoReactor();
  const provider = new MockSimulationProvider();

  reactor = await runTick(reactor, provider);
  reactor = await runTick(reactor, provider);
  reactor = await runTick(reactor, provider);

  assert.equal(reactor.elapsedMinutes, 90);
  assert.equal(reactor.events[0].resolved, true);
  assert.ok(reactor.agents[0].shortMemory.some((m) => m.includes("External event")));
});

test("reactor completes at duration boundary", async () => {
  let reactor = createDemoReactor();
  reactor.durationMinutes = 60;
  const provider = new MockSimulationProvider();

  reactor = await runTick(reactor, provider);
  reactor = await runTick(reactor, provider);

  assert.equal(reactor.status, "COMPLETED");
  assert.equal(reactor.elapsedMinutes, 60);
});

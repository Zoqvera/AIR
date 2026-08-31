import { MockSimulationProvider } from "../src/core/mock-simulator.ts";
import { runTick } from "../src/core/tick-engine.ts";
import { createDemoReactor } from "../src/data/demo-reactor.ts";

let reactor = createDemoReactor();
const provider = new MockSimulationProvider();

console.log(`AIR // ${reactor.name}`);
console.log(`Status: ${reactor.status}\n`);

for (let i = 0; i < 4; i += 1) {
  reactor = await runTick(reactor, provider);
  const latest = reactor.observations.at(-1)!;
  console.log(`[${String(latest.elapsedMinute).padStart(3, "0")} min] ${latest.text}`);
  console.log(
    reactor.variables.map((v) => `${v.name}: ${v.value} ${v.trend}`).join(" | "),
  );
  console.log(`Food: ${reactor.environment.resources.food}\n`);
}

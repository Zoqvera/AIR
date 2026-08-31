import { NextResponse } from "next/server";
import { MockSimulationProvider } from "@/core/mock-simulator";
import { runTick } from "@/core/tick-engine";
import { createDemoReactor } from "@/data/demo-reactor";

export const runtime = "nodejs";

export async function POST() {
  // Demo only: a real endpoint will load the current snapshot transactionally from PostgreSQL.
  const state = createDemoReactor();
  const next = await runTick(state, new MockSimulationProvider());
  return NextResponse.json(next);
}

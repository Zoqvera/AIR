"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AgentDraft = { id: string; name: string; role: string; personality: string; secret: string };
type VariableDraft = { id: string; name: string; initialValue: number };
type ReactorDraft = {
  name: string;
  scenario: string;
  mode: "assisted" | "manual";
  agents: AgentDraft[];
  variables: VariableDraft[];
  rules: string[];
  events: string[];
  unpredictability: number;
  durationMinutes: number;
  observationIntervalMinutes: number;
};

const fallback: ReactorDraft = {
  name: "Arctic Isolation",
  scenario: "Six researchers are isolated in a remote station after communication with the outside world fails. Supplies are finite, and one participant possesses information the others do not.",
  mode: "assisted",
  agents: [
    { id: "1", name: "Elena Voss", role: "Physician", personality: "Watchful", secret: "Knows more about supplies." },
    { id: "2", name: "David Chen", role: "Engineer", personality: "Alert", secret: "None" },
    { id: "3", name: "Noah Reed", role: "Teacher", personality: "Stable", secret: "None" },
    { id: "4", name: "Marta Silva", role: "Logistics", personality: "Stressed", secret: "None" },
    { id: "5", name: "Samir Khan", role: "Researcher", personality: "Stable", secret: "None" },
    { id: "6", name: "Lina Moreau", role: "Journalist", personality: "Watchful", secret: "None" },
  ],
  variables: [
    { id: "v1", name: "Group trust", initialValue: 58 },
    { id: "v2", name: "Conflict", initialValue: 37 },
    { id: "v3", name: "Stress", initialValue: 64 },
    { id: "v4", name: "Cohesion", initialValue: 51 },
  ],
  rules: [],
  events: [],
  unpredictability: 45,
  durationMinutes: 2880,
  observationIntervalMinutes: 30,
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AI";
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${minutes / 60} h`;
  return `${minutes / 1440} d`;
}

export default function DemoReactorClient() {
  const [draft, setDraft] = useState<ReactorDraft>(fallback);
  const [status, setStatus] = useState<"RUNNING" | "PAUSED" | "TERMINATED">("RUNNING");
  const [intervention, setIntervention] = useState("Reduce remaining food supplies by 30%.");
  const [lastIntervention, setLastIntervention] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("air-reactor-draft-v1");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ReactorDraft;
      if (parsed?.name && Array.isArray(parsed.agents) && Array.isArray(parsed.variables)) setDraft(parsed);
    } catch {
      // Keep the public demo if local browser data is malformed.
    }
  }, []);

  const observation = useMemo(() => {
    const first = draft.agents[0]?.name ?? "The first agent";
    const second = draft.agents[1]?.name ?? "another participant";
    const keyVariable = draft.variables[0]?.name ?? "group dynamics";
    return `${first} challenges ${second} over how the group should respond to the experiment's constraints. The disagreement remains controlled, but other participants begin taking positions. AIR records the exchange as an early turning point: ${keyVariable.toLowerCase()} shifts while informal influence starts to concentrate around the agents who propose concrete actions. No single coalition is stable yet.`;
  }, [draft]);

  const applyIntervention = () => {
    const value = intervention.trim();
    if (!value) return;
    setLastIntervention(value);
    setIntervention("");
  };

  return (
    <main className="site-shell reactor-live">
      <header className="topbar">
        <Link className="brand" href="/dashboard">AIR<span> / REACTOR PROTOTYPE</span></Link>
        <div className="live-actions">
          {status !== "TERMINATED" && <button className="secondary button-reset" onClick={() => setStatus((current) => current === "PAUSED" ? "RUNNING" : "PAUSED")}>{status === "PAUSED" ? "Resume" : "Pause"}</button>}
          <button className="danger button-reset" disabled={status === "TERMINATED"} onClick={() => setStatus("TERMINATED")}>Terminate</button>
        </div>
      </header>

      <section className="reactor-head">
        <div>
          <div className="status-line"><span className={status === "RUNNING" ? "status-live" : "status-idle"}><i /> {status}</span><span>OBSERVATION INTERVAL {draft.observationIntervalMinutes} MIN</span><span>{draft.mode.toUpperCase()}</span></div>
          <h1>{draft.name}</h1><p>{draft.scenario}</p>
        </div>
        <div className="clock"><span>PROTOTYPE ELAPSED</span><strong>00:30:00</strong><small>/ {formatDuration(draft.durationMinutes)}</small></div>
      </section>

      <div className="reactor-grid">
        <section className="panel observation-panel">
          <div className="panel-title"><span>LATEST OBSERVATION</span><b>OBS 001 · 00:30</b></div>
          <div className="observation-copy">{observation}</div>
          {lastIntervention && <div className="intervention-log"><span>INTERVENTION QUEUED</span><p>{lastIntervention}</p></div>}
          <div className="observation-footer"><span>NEXT OBSERVATION</span><strong>{status === "RUNNING" ? `${String(draft.observationIntervalMinutes).padStart(2, "0")}:00` : "—"}</strong></div>
          <div className="timeline"><span>START</span><b>● OBS 001</b><span>OBS 002</span><span>OBS 003</span><span>…</span></div>
        </section>

        <aside className="panel variable-panel">
          <div className="panel-title"><span>SYSTEM VARIABLES</span><b>INITIAL STATE</b></div>
          {draft.variables.slice(0, 10).map((variable, index) => (
            <div className="variable" key={variable.id || variable.name}>
              <div><span>{variable.name}</span><strong>{variable.initialValue} {index % 3 === 0 ? "↓" : index % 3 === 1 ? "↑" : "→"}</strong></div>
              <div className="bar"><i style={{ width: `${Math.max(0, Math.min(100, variable.initialValue))}%` }} /></div>
            </div>
          ))}
          <div className="panel-title lower"><span>EXPERIMENT</span></div>
          <div className="resource"><span>Rules</span><strong>{draft.rules.filter(Boolean).length}</strong></div>
          <div className="resource"><span>Events</span><strong>{draft.events.filter(Boolean).length}</strong></div>
          <div className="resource"><span>Unpredictability</span><strong>{draft.unpredictability}%</strong></div>
        </aside>
      </div>

      <div className="reactor-bottom">
        <section>
          <div className="section-heading"><span>AGENTS</span><small>{draft.agents.length} SIMULATED PARTICIPANTS</small></div>
          <div className="agent-grid">
            {draft.agents.map((agent, index) => <article className="agent" key={agent.id || agent.name}><div className="agent-index">{initials(agent.name)}</div><div><h3>{agent.name || `Agent ${index + 1}`}</h3><p>{agent.role || "Unspecified role"}</p><small>{agent.personality || "PROFILE PENDING"}</small></div></article>)}
          </div>
        </section>
        <aside className="intervention-card">
          <span className="eyebrow">EXPERIMENT CONTROL</span>
          <h2>Intervene</h2>
          <p>Queue a condition change. In the real engine, the next tick will incorporate it into the audit trail and world state.</p>
          <textarea value={intervention} placeholder="Describe an intervention…" onChange={(event) => setIntervention(event.target.value)} disabled={status === "TERMINATED"} />
          <button className="primary button-reset" onClick={applyIntervention} disabled={status === "TERMINATED"}>Queue intervention</button>
          <Link className="secondary live-edit-link" href="/create">Create another Reactor</Link>
        </aside>
      </div>
    </main>
  );
}

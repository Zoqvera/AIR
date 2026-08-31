"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { neon } from "@/lib/neon";

type AgentDraft = {
  id: string;
  name: string;
  role: string;
  personality: string;
  secret: string;
};

type VariableDraft = {
  id: string;
  name: string;
  initialValue: number;
};

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

const steps = ["Scenario", "Agents", "Variables", "Rules & Events", "Duration", "Review"];
const durationOptions = [
  [30, "30 min"],
  [60, "1 hour"],
  [300, "5 hours"],
  [720, "12 hours"],
  [1440, "24 hours"],
  [2880, "48 hours"],
  [10080, "1 week"],
  [40320, "4 weeks"],
] as const;

const initialDraft: ReactorDraft = {
  name: "The Isolation Room",
  scenario:
    "Six strangers are placed inside an underground shelter with limited supplies. They do not know how long they will remain there, and one participant knows something the others do not.",
  mode: "assisted",
  agents: [
    { id: "agent-1", name: "Elena Voss", role: "Physician", personality: "Pragmatic, observant, controlled", secret: "Knows that additional supplies are expected." },
    { id: "agent-2", name: "David Chen", role: "Engineer", personality: "Analytical, skeptical, direct", secret: "None" },
    { id: "agent-3", name: "Marta Silva", role: "Logistics manager", personality: "Organized, assertive, socially perceptive", secret: "None" },
  ],
  variables: [
    { id: "var-1", name: "Group trust", initialValue: 72 },
    { id: "var-2", name: "Conflict", initialValue: 18 },
    { id: "var-3", name: "Stress", initialValue: 31 },
    { id: "var-4", name: "Cohesion", initialValue: 68 },
  ],
  rules: ["Participants cannot leave the shelter unless the experiment ends."],
  events: ["At 12 hours, external communication becomes unavailable."],
  unpredictability: 45,
  durationMinutes: 2880,
  observationIntervalMinutes: 30,
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function durationLabel(minutes: number) {
  return durationOptions.find(([value]) => value === minutes)?.[1] ?? `${minutes} min`;
}

export default function CreateReactorWizard() {
  const router = useRouter();
  const session = neon.auth.useSession();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ReactorDraft>(initialDraft);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const observationCount = useMemo(
    () => Math.floor(draft.durationMinutes / draft.observationIntervalMinutes),
    [draft.durationMinutes, draft.observationIntervalMinutes]
  );

  const patch = <K extends keyof ReactorDraft>(key: K, value: ReactorDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateAgent = (id: string, key: keyof AgentDraft, value: string) => {
    setDraft((current) => ({
      ...current,
      agents: current.agents.map((agent) => (agent.id === id ? { ...agent, [key]: value } : agent)),
    }));
  };

  const updateVariable = (id: string, key: keyof VariableDraft, value: string | number) => {
    setDraft((current) => ({
      ...current,
      variables: current.variables.map((variable) =>
        variable.id === id ? { ...variable, [key]: value } : variable
      ),
    }));
  };

  const validateStep = () => {
    if (step === 0 && (!draft.name.trim() || draft.scenario.trim().length < 30)) return "Give the Reactor a name and describe the scenario in at least 30 characters.";
    if (step === 1 && (draft.agents.length < 2 || draft.agents.some((agent) => !agent.name.trim()))) return "A Reactor needs at least two named agents.";
    if (step === 2 && (draft.variables.length < 1 || draft.variables.some((variable) => !variable.name.trim()))) return "Add at least one named variable to observe.";
    return "";
  };

  const next = () => {
    const nextError = validateStep();
    if (nextError) {
      setError(nextError);
      return;
    }
    setError("");
    setStep((current) => Math.min(5, current + 1));
  };

  const back = () => {
    setError("");
    setStep((current) => Math.max(0, current - 1));
  };

  const launch = async () => {
    localStorage.setItem("air-reactor-draft-v1", JSON.stringify(draft));

    if (!session.data) {
      setError("Sign in before starting a persistent Reactor. Your draft has been kept in this browser.");
      router.push("/login");
      return;
    }

    setSaving(true);
    setError("");
    let reactorId: string | null = null;

    try {
      const code = `AIR-${Date.now().toString(36).slice(-6).toUpperCase()}`;
      const { data: reactor, error: reactorError } = await neon
        .from("reactors")
        .insert({
          code,
          name: draft.name.trim(),
          scenario: draft.scenario.trim(),
          mode: draft.mode,
          status: "running",
          duration_minutes: draft.durationMinutes,
          observation_interval_minutes: draft.observationIntervalMinutes,
          unpredictability: draft.unpredictability,
          config: { rules: draft.rules.filter(Boolean) },
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (reactorError || !reactor) throw new Error(reactorError?.message || "Reactor could not be created.");
      reactorId = (reactor as { id: string }).id;

      const agents = draft.agents.map((agent, index) => ({
        reactor_id: reactorId,
        display_order: index,
        name: agent.name.trim(),
        role: agent.role.trim() || null,
        personality: agent.personality.trim() || null,
        secret: agent.secret.trim() || null,
      }));
      const { error: agentsError } = await neon.from("agents").insert(agents);
      if (agentsError) throw new Error(agentsError.message);

      const variables = draft.variables.map((variable) => ({
        reactor_id: reactorId,
        name: variable.name.trim(),
        current_value: variable.initialValue,
      }));
      const { error: variablesError } = await neon.from("variables").insert(variables);
      if (variablesError) throw new Error(variablesError.message);

      const eventRows = draft.events.filter((event) => event.trim()).map((event) => ({
        reactor_id: reactorId,
        event_type: "scheduled",
        description: event.trim(),
        status: "pending",
      }));
      if (eventRows.length) {
        const { error: eventsError } = await neon.from("events").insert(eventRows);
        if (eventsError) throw new Error(eventsError.message);
      }

      localStorage.setItem("air-reactor-id-v1", reactorId);
      router.push(`/reactors/demo?id=${reactorId}`);
    } catch (caught) {
      if (reactorId) await neon.from("reactors").delete().eq("id", reactorId);
      setError(caught instanceof Error ? caught.message : "Could not persist the Reactor in Neon.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">AIR<span> / CREATE REACTOR</span></Link>
        <nav className="nav-links"><Link href="/dashboard">Cancel</Link></nav>
      </header>

      <div className="wizard-layout">
        <aside className="wizard-steps">
          <p className="eyebrow">NEW EXPERIMENT</p>
          <ol>
            {steps.map((label, index) => (
              <li key={label} className={index === step ? "active" : index < step ? "complete" : ""}>
                <button type="button" className="step-button" onClick={() => index <= step && setStep(index)}>
                  <b>{String(index + 1).padStart(2, "0")}</b><span>{label}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <section className="wizard-main">
          <div className="step-count">STEP {String(step + 1).padStart(2, "0")} / 06</div>

          {step === 0 && <><h1>What do you want to simulate?</h1><p className="lede small">Define the starting conditions. AIR will treat this as the initial state of the synthetic world.</p><label className="field-label" htmlFor="reactor-name">REACTOR NAME</label><input id="reactor-name" className="text-input" value={draft.name} maxLength={80} onChange={(event) => patch("name", event.target.value)} /><label className="field-label" htmlFor="scenario">EXPERIMENT SCENARIO</label><textarea id="scenario" className="scenario-input" value={draft.scenario} maxLength={2000} onChange={(event) => patch("scenario", event.target.value)} /><div className="input-meta"><span>Conditions, constraints, information asymmetries and initial situation.</span><strong>{draft.scenario.length} / 2,000</strong></div><div className="mode-grid"><button type="button" className={`mode-card button-reset ${draft.mode === "assisted" ? "selected" : ""}`} onClick={() => patch("mode", "assisted")}><span>AI-ASSISTED</span><h3>Build with AIR</h3><p>AIR will eventually suggest agents, variables, rules and events from your scenario.</p></button><button type="button" className={`mode-card button-reset ${draft.mode === "manual" ? "selected" : ""}`} onClick={() => patch("mode", "manual")}><span>MANUAL</span><h3>Configure manually</h3><p>Define every major component of the experiment yourself.</p></button></div></>}

          {step === 1 && <><h1>Who exists in this world?</h1><p className="lede small">Create 2–10 simulated agents. Personality and private information will later influence decisions and relationships.</p><div className="builder-toolbar"><span>{draft.agents.length} / 10 AGENTS</span><button type="button" className="secondary button-reset compact" disabled={draft.agents.length >= 10} onClick={() => patch("agents", [...draft.agents, { id: uid("agent"), name: "", role: "", personality: "", secret: "None" }])}>+ Add agent</button></div><div className="builder-list">{draft.agents.map((agent, index) => <article className="builder-card" key={agent.id}><div className="builder-card-head"><span>AGENT {String(index + 1).padStart(2, "0")}</span><button type="button" className="text-action danger-text" disabled={draft.agents.length <= 2} onClick={() => patch("agents", draft.agents.filter((item) => item.id !== agent.id))}>Remove</button></div><div className="field-grid two"><label>Name<input className="text-input" value={agent.name} onChange={(event) => updateAgent(agent.id, "name", event.target.value)} /></label><label>Role / occupation<input className="text-input" value={agent.role} onChange={(event) => updateAgent(agent.id, "role", event.target.value)} /></label></div><label>Personality<input className="text-input" value={agent.personality} placeholder="e.g. skeptical, cooperative, impulsive" onChange={(event) => updateAgent(agent.id, "personality", event.target.value)} /></label><label>Private information / secret<input className="text-input" value={agent.secret} onChange={(event) => updateAgent(agent.id, "secret", event.target.value)} /></label></article>)}</div></>}

          {step === 2 && <><h1>What should AIR measure?</h1><p className="lede small">Variables create a quantitative layer over the narrative. They can represent social, psychological, environmental or resource states.</p><div className="builder-toolbar"><span>{draft.variables.length} / 10 VARIABLES</span><button type="button" className="secondary button-reset compact" disabled={draft.variables.length >= 10} onClick={() => patch("variables", [...draft.variables, { id: uid("var"), name: "", initialValue: 50 }])}>+ Add variable</button></div><div className="variable-builder-grid">{draft.variables.map((variable) => <article className="builder-card variable-builder" key={variable.id}><div className="builder-card-head"><span>SYSTEM VARIABLE</span><button type="button" className="text-action danger-text" disabled={draft.variables.length <= 1} onClick={() => patch("variables", draft.variables.filter((item) => item.id !== variable.id))}>Remove</button></div><input className="text-input" value={variable.name} placeholder="Variable name" onChange={(event) => updateVariable(variable.id, "name", event.target.value)} /><div className="range-row"><input type="range" min="0" max="100" value={variable.initialValue} onChange={(event) => updateVariable(variable.id, "initialValue", Number(event.target.value))} /><strong>{variable.initialValue}</strong></div></article>)}</div></>}

          {step === 3 && <><h1>Define constraints and triggers.</h1><p className="lede small">Rules constrain the simulated world. Events introduce scheduled or external changes during the Reactor.</p><EditableStringList title="RULES" items={draft.rules} placeholder="e.g. No agent can leave the environment." onChange={(rules) => patch("rules", rules)} /><EditableStringList title="SCHEDULED / EXTERNAL EVENTS" items={draft.events} placeholder="e.g. After 12 hours, power drops to 50%." onChange={(events) => patch("events", events)} /><div className="builder-card unpredictability-card"><div className="builder-card-head"><span>EMERGENT UNPREDICTABILITY</span><strong>{draft.unpredictability}%</strong></div><input type="range" min="0" max="100" value={draft.unpredictability} onChange={(event) => patch("unpredictability", Number(event.target.value))} /><p>Higher values permit more unexpected but still scenario-consistent developments.</p></div></>}

          {step === 4 && <><h1>How long should it run?</h1><p className="lede small">Choose the experimental duration and how often AIR should generate an Observation.</p><label className="field-label">REACTOR DURATION</label><div className="duration-grid">{durationOptions.map(([minutes, label]) => <button type="button" key={minutes} className={`duration-option ${draft.durationMinutes === minutes ? "selected" : ""}`} onClick={() => patch("durationMinutes", minutes)}><strong>{label}</strong><span>{Math.floor(minutes / 30)} base ticks</span></button>)}</div><label className="field-label" htmlFor="interval">OBSERVATION INTERVAL</label><select id="interval" className="select-input" value={draft.observationIntervalMinutes} onChange={(event) => patch("observationIntervalMinutes", Number(event.target.value))}><option value={30}>Every 30 minutes — standard</option><option value={60}>Every 60 minutes</option><option value={120}>Every 2 hours</option></select><div className="calculation-card"><span>ESTIMATED OBSERVATIONS</span><strong>{observationCount.toLocaleString("en-US")}</strong><p>Each Observation will summarize the meaningful changes since the previous one.</p></div></>}

          {step === 5 && <><h1>Review the Reactor.</h1><p className="lede small">This configuration will be stored in Neon PostgreSQL under your authenticated account.</p><div className="review-grid"><ReviewBlock label="REACTOR" value={draft.name} detail={draft.scenario} /><ReviewBlock label="TIME" value={durationLabel(draft.durationMinutes)} detail={`${observationCount} observations · every ${draft.observationIntervalMinutes} minutes`} /><ReviewBlock label="AGENTS" value={`${draft.agents.length} simulated participants`} detail={draft.agents.map((agent) => agent.name).join(" · ")} /><ReviewBlock label="VARIABLES" value={`${draft.variables.length} tracked variables`} detail={draft.variables.map((variable) => `${variable.name} ${variable.initialValue}`).join(" · ")} /><ReviewBlock label="RULES & EVENTS" value={`${draft.rules.filter(Boolean).length} rules · ${draft.events.filter(Boolean).length} events`} detail={`Emergent unpredictability: ${draft.unpredictability}%`} /><ReviewBlock label="PERSISTENCE" value={session.data ? "Neon connected" : "Sign-in required"} detail="The Simulation Engine is still mocked; persistence and ownership are now real." /></div><div className="prototype-note"><strong>Current boundary</strong><p>Configuration and status are persisted. AI-generated ticks and Observations will be connected in the next backend milestone.</p></div></>}

          {error && <div className="form-error">{error}</div>}

          <div className="wizard-actions">
            {step === 0 ? <Link className="secondary" href="/dashboard">Back</Link> : <button type="button" className="secondary button-reset" onClick={back}>← Previous</button>}
            {step < 5 ? <button type="button" className="primary button-reset" onClick={next}>Continue →</button> : <button type="button" className="primary button-reset launch-button" onClick={launch} disabled={saving}>{saving ? "Saving to Neon…" : "Start Reactor →"}</button>}
          </div>
        </section>
      </div>
    </main>
  );
}

function EditableStringList({ title, items, placeholder, onChange }: { title: string; items: string[]; placeholder: string; onChange: (items: string[]) => void }) {
  const update = (index: number, value: string) => onChange(items.map((item, itemIndex) => itemIndex === index ? value : item));
  return <div className="string-list"><div className="builder-toolbar"><span>{title}</span><button type="button" className="secondary button-reset compact" onClick={() => onChange([...items, ""])}>+ Add</button></div>{items.length === 0 && <div className="empty-builder">No items configured.</div>}{items.map((item, index) => <div className="string-row" key={`${title}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><input className="text-input" value={item} placeholder={placeholder} onChange={(event) => update(index, event.target.value)} /><button type="button" className="text-action danger-text" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</div>;
}

function ReviewBlock({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="review-block"><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>;
}

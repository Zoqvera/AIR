import Link from "next/link";

const variables = [
  { name: "Group trust", value: 58, trend: "↓" },
  { name: "Conflict", value: 37, trend: "↑" },
  { name: "Stress", value: 64, trend: "↑" },
  { name: "Cohesion", value: 51, trend: "↓" },
];

const agents = [
  ["EL", "Elena Voss", "Physician", "WATCHFUL"],
  ["DA", "David Chen", "Engineer", "ALERT"],
  ["NO", "Noah Reed", "Teacher", "STABLE"],
  ["MA", "Marta Silva", "Logistics", "STRESSED"],
  ["SA", "Samir Khan", "Researcher", "STABLE"],
  ["LI", "Lina Moreau", "Journalist", "WATCHFUL"],
];

export default function DemoReactorPage() {
  return (
    <main className="site-shell reactor-live">
      <header className="topbar">
        <Link className="brand" href="/dashboard">AIR<span> / REACTOR #00421</span></Link>
        <div className="live-actions"><button className="secondary button-reset">Pause</button><button className="danger button-reset">Terminate</button></div>
      </header>

      <section className="reactor-head">
        <div><div className="status-line"><span className="status-live"><i /> RUNNING</span><span>OBSERVATION INTERVAL 30 MIN</span></div><h1>Arctic Isolation</h1><p>Six researchers are isolated in a remote station after communication with the outside world fails. Supplies are finite, and Elena possesses information the others do not.</p></div>
        <div className="clock"><span>ELAPSED</span><strong>07:32:17</strong><small>/ 48:00:00</small></div>
      </section>

      <div className="reactor-grid">
        <section className="panel observation-panel">
          <div className="panel-title"><span>LATEST OBSERVATION</span><b>OBS 015 · 07:30</b></div>
          <div className="observation-copy">David confronts Elena after noticing inconsistencies in the station&apos;s supply inventory. Elena avoids a direct answer and redirects attention toward rationing. Marta interprets the exchange as evidence that information is being withheld. Trust in Elena drops sharply, while David&apos;s influence within the group rises. Two informal alliances are beginning to emerge.</div>
          <div className="observation-footer"><span>NEXT OBSERVATION</span><strong>00:27:43</strong></div>
          <div className="timeline"><span>05:30</span><span>06:00</span><span>06:30</span><span>07:00</span><b>● 07:30</b></div>
        </section>

        <aside className="panel variable-panel">
          <div className="panel-title"><span>SYSTEM VARIABLES</span><b>LIVE STATE</b></div>
          {variables.map((variable) => <div className="variable" key={variable.name}><div><span>{variable.name}</span><strong>{variable.value} {variable.trend}</strong></div><div className="bar"><i style={{ width: `${variable.value}%` }} /></div></div>)}
          <div className="panel-title lower"><span>RESOURCES</span></div>
          <div className="resource"><span>Food</span><strong>71%</strong></div>
          <div className="resource"><span>Water</span><strong>83%</strong></div>
          <div className="resource"><span>Power</span><strong>92%</strong></div>
        </aside>
      </div>

      <div className="reactor-bottom">
        <section>
          <div className="section-heading"><span>AGENTS</span><small>6 SIMULATED PARTICIPANTS</small></div>
          <div className="agent-grid">{agents.map(([initials,name,role,state]) => <article className="agent" key={name}><div className="agent-index">{initials}</div><div><h3>{name}</h3><p>{role}</p><small>{state}</small></div></article>)}</div>
        </section>
        <aside className="intervention-card">
          <span className="eyebrow">EXPERIMENT CONTROL</span>
          <h2>Intervene</h2>
          <p>Change a condition while preserving the experiment&apos;s audit trail.</p>
          <textarea defaultValue="Reduce remaining food supplies by 30%." />
          <button className="primary button-reset">Apply intervention</button>
        </aside>
      </div>
    </main>
  );
}

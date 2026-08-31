import Link from "next/link";

export default function CreateReactorPage() {
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
            <li className="active"><b>01</b><span>Scenario</span></li>
            <li><b>02</b><span>Agents</span></li>
            <li><b>03</b><span>Variables</span></li>
            <li><b>04</b><span>Rules & Events</span></li>
            <li><b>05</b><span>Duration</span></li>
            <li><b>06</b><span>Review</span></li>
          </ol>
        </aside>

        <section className="wizard-main">
          <div className="step-count">STEP 01 / 06</div>
          <h1>What do you want to simulate?</h1>
          <p className="lede small">Describe the initial situation. AIR can generate the environment, participants and suggested variables from your idea, or you can configure everything manually.</p>

          <label className="field-label" htmlFor="scenario">EXPERIMENT SCENARIO</label>
          <textarea id="scenario" className="scenario-input" defaultValue="Six strangers are placed inside an underground shelter with limited supplies. They do not know how long they will remain there, and one participant knows something the others do not." />
          <div className="input-meta"><span>Describe conditions, constraints and asymmetries of information.</span><strong>284 / 2,000</strong></div>

          <div className="mode-grid">
            <article className="mode-card selected"><span>AUTO</span><h3>Build with AIR</h3><p>Generate agents, environment, variables and initial rules from the scenario.</p></article>
            <article className="mode-card"><span>MANUAL</span><h3>Configure manually</h3><p>Choose every agent, variable, event and environmental property yourself.</p></article>
          </div>

          <div className="wizard-actions"><Link className="secondary" href="/dashboard">Back</Link><Link className="primary" href="/reactors/demo">Generate experiment →</Link></div>
        </section>
      </div>
    </main>
  );
}

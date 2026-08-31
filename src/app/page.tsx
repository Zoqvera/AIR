import Link from "next/link";

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">AIR<span> / ARTIFICIAL INTELLIGENCE REACTOR</span></Link>
        <nav className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link className="nav-cta" href="/create">Create Reactor</Link>
        </nav>
      </header>

      <section className="hero hero-grid">
        <div>
          <p className="eyebrow">SYNTHETIC EXPERIMENT ENVIRONMENT</p>
          <h1>Build a world.<br />Set the variables.<br />Start the reactor.</h1>
          <p className="lede">Create persistent AI simulations with configurable agents, environments, rules and variables. Observe what emerges as the experiment unfolds over time.</p>
          <div className="actions">
            <Link className="primary" href="/create">Create your first Reactor</Link>
            <Link className="secondary" href="/reactors/demo">View live demo</Link>
          </div>
        </div>
        <aside className="hero-console">
          <div className="console-head"><span>REACTOR PREVIEW</span><b><i /> LIVE</b></div>
          <div className="console-number">#00421</div>
          <h2>Arctic Isolation</h2>
          <p>Six simulated participants. Limited supplies. One asymmetry of information.</p>
          <div className="console-stats">
            <div><small>ELAPSED</small><strong>07:32:17</strong></div>
            <div><small>NEXT OBS</small><strong>00:27:43</strong></div>
          </div>
          <div className="mini-observation">
            <span>OBSERVATION 015</span>
            <p>David questions Elena after noticing inconsistencies in the supply inventory. Group trust declines as two informal alliances begin to form.</p>
          </div>
        </aside>
      </section>

      <section className="metric-strip">
        <article><span>01</span><strong>Configure agents</strong><p>Profiles, goals, fears, secrets, knowledge and memory.</p></article>
        <article><span>02</span><strong>Define the world</strong><p>Environment, resources, rules, events and tracked variables.</p></article>
        <article><span>03</span><strong>Observe emergence</strong><p>Receive compact observations while state evolves tick by tick.</p></article>
        <article><span>04</span><strong>Intervene</strong><p>Change conditions during the experiment and inspect consequences.</p></article>
      </section>
    </main>
  );
}

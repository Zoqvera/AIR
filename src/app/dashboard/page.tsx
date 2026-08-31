import Link from "next/link";

const reactors = [
  { id: "#00421", name: "Arctic Isolation", status: "RUNNING", elapsed: "07:32 / 48h", agents: 6 },
  { id: "#00403", name: "Boardroom Crisis", status: "PAUSED", elapsed: "03:00 / 12h", agents: 4 },
  { id: "#00398", name: "Island Settlement", status: "COMPLETED", elapsed: "7d / 7d", agents: 12 },
];

export default function DashboardPage() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">AIR<span> / CONTROL ROOM</span></Link>
        <nav className="nav-links"><Link href="/">Home</Link><Link className="nav-cta" href="/create">New Reactor</Link></nav>
      </header>

      <section className="page-head">
        <div><p className="eyebrow">CONTROL ROOM</p><h1>Your Reactors</h1><p>Launch, inspect and resume synthetic experiments from one place.</p></div>
        <div className="head-stat"><small>ACTIVE REACTORS</small><strong>02</strong></div>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card featured-card">
          <div className="card-kicker"><span>CONTINUE EXPERIMENT</span><b><i /> RUNNING</b></div>
          <h2>Arctic Isolation</h2>
          <p>Six researchers are isolated after communication with the outside world fails.</p>
          <div className="feature-values"><div><small>ELAPSED</small><strong>07:32:17</strong></div><div><small>AGENTS</small><strong>06</strong></div><div><small>OBSERVATIONS</small><strong>015</strong></div></div>
          <Link className="primary compact" href="/reactors/demo">Open Reactor</Link>
        </article>
        <Link className="dashboard-card new-card" href="/create"><span>＋</span><h2>Create Reactor</h2><p>Configure a new synthetic experiment.</p></Link>
      </section>

      <section className="reactor-list">
        <div className="section-label">RECENT REACTORS</div>
        {reactors.map((reactor) => (
          <Link className="reactor-row" href={reactor.status === "RUNNING" ? "/reactors/demo" : "#"} key={reactor.id}>
            <span className="mono muted">{reactor.id}</span>
            <strong>{reactor.name}</strong>
            <span className={`pill ${reactor.status.toLowerCase()}`}>{reactor.status}</span>
            <span className="muted">{reactor.agents} agents</span>
            <span className="mono">{reactor.elapsed}</span>
            <span>→</span>
          </Link>
        ))}
      </section>
    </main>
  );
}

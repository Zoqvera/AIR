"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { neon } from "@/lib/neon";

type ReactorRow = {
  id: string;
  code: string | null;
  name: string;
  scenario: string;
  status: string;
  duration_minutes: number;
  elapsed_minutes: number;
  observation_interval_minutes: number;
  created_at: string;
};

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${Math.floor(minutes / 1440)}d`;
}

export default function DashboardClient() {
  const session = neon.auth.useSession();
  const [reactors, setReactors] = useState<ReactorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session.isPending) return;
    if (!session.data) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error: queryError } = await neon
        .from("reactors")
        .select("id,code,name,scenario,status,duration_minutes,elapsed_minutes,observation_interval_minutes,created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (cancelled) return;
      if (queryError) setError(queryError.message);
      else setReactors((data ?? []) as ReactorRow[]);
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [session.data, session.isPending]);

  const active = useMemo(() => reactors.filter((reactor) => ["running", "paused", "scheduled"].includes(reactor.status)).length, [reactors]);
  const featured = reactors[0];

  const signOut = async () => {
    await neon.auth.signOut();
    window.location.href = "../login/";
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">AIR<span> / CONTROL ROOM</span></Link>
        <nav className="nav-links">
          <Link href="/">Home</Link>
          {session.data && <button type="button" className="nav-button" onClick={signOut}>Sign out</button>}
          <Link className="nav-cta" href="/create">New Reactor</Link>
        </nav>
      </header>

      {!session.isPending && !session.data ? (
        <section className="empty-dashboard">
          <p className="eyebrow">AUTHENTICATION REQUIRED</p>
          <h1>Your Reactors live behind Neon Auth.</h1>
          <p>Sign in to create persistent experiments and return to them from any session.</p>
          <Link className="primary" href="/login">Sign in →</Link>
        </section>
      ) : (
        <>
          <section className="page-head">
            <div><p className="eyebrow">CONTROL ROOM</p><h1>Your Reactors</h1><p>{session.data?.user.email ?? "Loading authenticated workspace…"}</p></div>
            <div className="head-stat"><small>ACTIVE REACTORS</small><strong>{String(active).padStart(2, "0")}</strong></div>
          </section>

          {error && <div className="form-error">Data API: {error}</div>}

          <section className="dashboard-grid">
            {loading ? (
              <article className="dashboard-card featured-card"><div className="auth-state">Loading Reactors from Neon…</div></article>
            ) : featured ? (
              <article className="dashboard-card featured-card">
                <div className="card-kicker"><span>LATEST EXPERIMENT</span><b>{featured.status.toUpperCase()}</b></div>
                <h2>{featured.name}</h2>
                <p>{featured.scenario}</p>
                <div className="feature-values"><div><small>ELAPSED</small><strong>{formatMinutes(featured.elapsed_minutes)}</strong></div><div><small>DURATION</small><strong>{formatMinutes(featured.duration_minutes)}</strong></div><div><small>INTERVAL</small><strong>{featured.observation_interval_minutes}m</strong></div></div>
                <Link className="primary compact" href={`/reactors/demo?id=${featured.id}`}>Open Reactor</Link>
              </article>
            ) : (
              <article className="dashboard-card featured-card">
                <div className="card-kicker"><span>DATABASE CONNECTED</span><b>NEON</b></div>
                <h2>No Reactors yet</h2>
                <p>Create your first persistent synthetic experiment. It will be stored in Neon instead of localStorage.</p>
                <Link className="primary compact" href="/create">Create Reactor</Link>
              </article>
            )}
            <Link className="dashboard-card new-card" href="/create"><span>＋</span><h2>Create Reactor</h2><p>Configure a new persistent experiment.</p></Link>
          </section>

          <section className="reactor-list">
            <div className="section-label">PERSISTED REACTORS · NEON POSTGRESQL</div>
            {!loading && reactors.length === 0 && <div className="empty-row">No persisted Reactors.</div>}
            {reactors.map((reactor) => (
              <Link className="reactor-row" href={`/reactors/demo?id=${reactor.id}`} key={reactor.id}>
                <span className="mono muted">{reactor.code || reactor.id.slice(0, 8)}</span>
                <strong>{reactor.name}</strong>
                <span className={`pill ${reactor.status}`}>{reactor.status.toUpperCase()}</span>
                <span className="muted">{formatMinutes(reactor.duration_minutes)}</span>
                <span className="mono">{formatMinutes(reactor.elapsed_minutes)}</span>
                <span>→</span>
              </Link>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

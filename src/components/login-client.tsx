"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { neon } from "@/lib/neon";

export default function LoginClient() {
  const router = useRouter();
  const session = neon.auth.useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = mode === "signin"
        ? await neon.auth.signIn.email({ email, password })
        : await neon.auth.signUp.email({ email, password, name: name.trim() || email.split("@")[0] });

      const authError = (result as { error?: { message?: string } } | undefined)?.error;
      if (authError) {
        setError(authError.message || "Authentication failed.");
        return;
      }

      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await neon.auth.signOut();
    window.location.reload();
  };

  return (
    <main className="site-shell auth-shell">
      <header className="topbar">
        <Link className="brand" href="/">AIR<span> / ACCESS</span></Link>
        <nav className="nav-links"><Link href="/">Home</Link></nav>
      </header>

      <section className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">NEON AUTH</p>
          <h1>Enter the control room.</h1>
          <p className="lede small">Your identity now controls access to persistent Reactors stored in Neon PostgreSQL.</p>
        </div>

        <div className="auth-card">
          {session.isPending ? (
            <div className="auth-state">Checking session…</div>
          ) : session.data ? (
            <>
              <p className="eyebrow">SESSION ACTIVE</p>
              <h2>{session.data.user.name || session.data.user.email}</h2>
              <p className="muted">{session.data.user.email}</p>
              <div className="auth-actions">
                <Link className="primary" href="/dashboard">Open Dashboard</Link>
                <button type="button" className="secondary button-reset" onClick={signOut}>Sign out</button>
              </div>
            </>
          ) : (
            <>
              <div className="auth-tabs">
                <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); }}>Sign in</button>
                <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Create account</button>
              </div>
              <form onSubmit={submit}>
                {mode === "signup" && <label className="auth-field">NAME<input className="text-input" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>}
                <label className="auth-field">EMAIL<input className="text-input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
                <label className="auth-field">PASSWORD<input className="text-input" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>
                {error && <div className="form-error">{error}</div>}
                <button className="primary button-reset auth-submit" type="submit" disabled={busy}>{busy ? "Connecting…" : mode === "signin" ? "Sign in →" : "Create account →"}</button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

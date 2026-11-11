import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useReveal from "../hooks/useReveal.js";
import useMagnetic from "../hooks/useMagnetic.js";

const PHASE_PAGES = {
  2: [["/messages", "Messaging"], ["/logistics", "Logistics"], ["/inputs", "Inputs"], ["/trust", "Trust"]],
  3: [["/payments", "Payments"], ["/insights", "Insights"]],
};

export function NotifyForm({ phase, topic }) {
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const btn = useMagnetic();
  const submit = (e) => {
    e.preventDefault();
    const email = new FormData(e.target).get("email");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Please enter a valid email address.");
    setErr("");
    // TODO: POST /api/notify { email, phase, topic }
    setDone(true);
  };
  if (done) return <p className="callout" role="status">Thank you. We will let you know when {topic} is ready to try.</p>;
  return (
    <form className="notify" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor={`n-${topic}`}>Notify me when Phase {phase} opens</label>
        <input id={`n-${topic}`} name="email" type="email" aria-invalid={!!err} aria-describedby={err ? "n-err" : undefined} placeholder="you@example.com" />
        {err && <span id="n-err" className="err" role="alert">{err}</span>}
      </div>
      <button ref={btn} className="btn" type="submit">Notify me</button>
    </form>
  );
}

// Shared shell for Phase 2 and Phase 3 preview pages.
export default function PhasePreview({ phase = 2, title, lead, features, topic, children }) {
  useReveal();
  const { pathname } = useLocation();
  return (
    <main className={`page-pad preview ph${phase}`}>
      <header className="page-head">
        <span className="phase-badge">Phase {phase} · Coming next</span>
        <h1 className="display">{title}</h1>
        <p className="lead">{lead}</p>
      </header>

      <nav className="subnav" aria-label={`Phase ${phase} previews`}>
        {PHASE_PAGES[phase].map(([to, label]) => <Link key={to} to={to} aria-current={pathname === to ? "page" : undefined}>{label}</Link>)}
      </nav>

      <section className="stage-wrap" data-reveal>
        <div className="lock" data-cursor="Locked">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          Preview only. Planned for Phase {phase}.
        </div>
        <div className="stage">{children}</div>
      </section>

      <section className="features" data-reveal>
        <h2 className="display">What this will do</h2>
        <ul>{features.map((f) => <li key={f}>{f}</li>)}</ul>
      </section>

      <section className="notify-wrap" data-reveal>
        <NotifyForm phase={phase} topic={topic} />
      </section>
    </main>
  );
}

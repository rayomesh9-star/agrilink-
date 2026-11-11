import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, ROLES } from "../context/Auth.jsx";

export default function Auth() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("signup");
  const [role, setRole] = useState("farmer");
  const [err, setErr] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const er = {};
    if (mode === "signup" && !f.name?.trim()) er.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Please enter a valid email address.";
    if ((f.password || "").length < 8) er.password = "Use at least 8 characters.";
    setErr(er);
    if (Object.keys(er).length) return;
    // TODO: POST /api/auth/register or /api/auth/login, then store the returned session or JWT
    login({ name: f.name?.trim() || f.email.split("@")[0], email: f.email, role });
    nav("/dashboard");
  };

  return (
    <main className="page-pad auth">
      <header className="page-head">
        <small>Phase 1 · Account</small>
        <h1 className="display">{mode === "signup" ? "Create your account." : "Welcome back."}</h1>
        <p className="lead">Demo mode: nothing is sent to a server and no password is stored. Choose a role to preview its dashboard.</p>
      </header>

      <div className="tabs" role="tablist">
        {["signup", "login"].map((m) => <button key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setErr({}); }}>{m === "signup" ? "Sign up" : "Log in"}</button>)}
      </div>

      <form onSubmit={submit} noValidate>
        <fieldset>
          <legend>I am a</legend>
          <div className="roles">
            {ROLES.map((r) => (
              <label key={r.id} className={`role ${role === r.id ? "on" : ""}`} data-cursor="Pick">
                <input type="radio" name="role" checked={role === r.id} onChange={() => setRole(r.id)} />
                <b className="display">{r.label}</b><span>{r.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {[mode === "signup" && ["name", "Full name", "text"], ["email", "Email address", "email"], ["password", "Password (8+ characters)", "password"]].filter(Boolean).map(([id, label, type]) => (
          <div className="field" key={id}>
            <label htmlFor={id}>{label}</label>
            <input id={id} name={id} type={type} aria-invalid={!!err[id]} aria-describedby={err[id] ? `${id}-e` : undefined} />
            {err[id] && <span id={`${id}-e`} className="err" role="alert">{err[id]}</span>}
          </div>
        ))}
        <button className="btn big" type="submit">{mode === "signup" ? "Create account" : "Log in"}</button>
      </form>
    </main>
  );
}

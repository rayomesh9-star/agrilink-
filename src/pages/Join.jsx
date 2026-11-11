import { useState } from "react";
import useMagnetic from "../hooks/useMagnetic.js";

const roles = ["Farmer or farmer group", "Buyer or consumer", "Wholesaler or retailer", "Broker or aggregator", "Transporter", "Input supplier", "Partner organisation"];

export default function Join() {
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const btn = useMagnetic();

  const submit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const err = {};
    if (!f.name.trim()) err.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) err.email = "Please enter a valid email address.";
    if (!f.role) err.role = "Please choose the role that fits you best.";
    setErrors(err);
    if (Object.keys(err).length) return;
    // TODO: POST to your backend, e.g. fetch("/api/early-community", { method: "POST", body: JSON.stringify(f) })
    setDone(true);
  };

  return (
    <main className="page-pad join">
      <header className="page-head">
        <small>Join the early community</small>
        <h1 className="display">Help shape AgriLink.</h1>
        <p className="lead">We are researching real needs first. Tell us who you are and we will keep you updated and may invite you to share your experience.</p>
      </header>

      {done ? (
        <p className="callout" role="status">Thank you. We have noted your interest.</p>
      ) : (
        <form onSubmit={submit} noValidate>
          {[["name", "Your name", "text"], ["email", "Email address", "email"]].map(([id, label, type]) => (
            <div className="field" key={id}>
              <label htmlFor={id}>{label}</label>
              <input id={id} name={id} type={type} aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-err` : undefined} />
              {errors[id] && <span id={`${id}-err`} className="err" role="alert">{errors[id]}</span>}
            </div>
          ))}
          <div className="field">
            <label htmlFor="role">I am a</label>
            <select id="role" name="role" defaultValue="" aria-invalid={!!errors.role} aria-describedby={errors.role ? "role-err" : undefined}>
              <option value="" disabled>Select a role</option>
              {roles.map((r) => <option key={r}>{r}</option>)}
            </select>
            {errors.role && <span id="role-err" className="err" role="alert">{errors.role}</span>}
          </div>
          <div className="field">
            <label htmlFor="note">What would make trading easier for you? (optional)</label>
            <textarea id="note" name="note" rows="4" />
          </div>
          <button ref={btn} className="btn big" type="submit">Join early</button>
        </form>
      )}
    </main>
  );
}

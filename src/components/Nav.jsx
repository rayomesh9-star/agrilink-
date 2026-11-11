import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useMagnetic from "../hooks/useMagnetic.js";
import { useAuth } from "../context/Auth.jsx";
import { phaseOf } from "../lib/phase.js";

const groups = [
  { phase: 1, title: "Phase 1 · MVP", items: [["/marketplace", "Marketplace"], ["/prices", "Market prices"], ["/auth", "Sign up or log in"], ["/dashboard", "Dashboard"]] },
  { phase: 2, title: "Phase 2 · Expansion", items: [["/messages", "Messaging"], ["/logistics", "Logistics"], ["/inputs", "Inputs"], ["/trust", "Trust and reviews"]] },
  { phase: 3, title: "Phase 3 · Advanced", items: [["/payments", "Payments"], ["/insights", "Insights"]] },
];
const Lock = () => <svg className="lk" viewBox="0 0 24 24" width="13" height="13" aria-label="Preview, not yet available" role="img"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;

export default function Nav() {
  const { pathname } = useLocation();
  const phase = phaseOf(pathname);
  const { user } = useAuth();
  const cta = useMagnetic();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);

  useEffect(() => { setMega(false); setOpen(false); }, [pathname]);

  // Hide on scroll down, show on scroll up. Close the mega-menu with Escape.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => { setHidden(window.scrollY > last && window.scrollY > 120); last = window.scrollY; };
    const onKey = (e) => e.key === "Escape" && setMega(false);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("keydown", onKey);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("keydown", onKey); };
  }, []);

  return (
    <header className={`nav ${hidden && !mega ? "hide" : ""}`} onMouseLeave={() => setMega(false)}>
      <Link to="/" className="logo display">AgriLink</Link>
      <nav className={open ? "open" : ""} aria-label="Primary">
        <div className="mega-wrap">
          <button className="mega-btn" aria-expanded={mega} aria-controls="mega" onClick={() => setMega(!mega)} onMouseEnter={() => setMega(true)}>Platform</button>
          <div id="mega" className={`mega ${mega ? "show" : ""}`}>
            {groups.map((g) => (
              <div key={g.phase} className={`mgroup p${g.phase}`}>
                <h3><i className={`dot p${g.phase}`} />{g.title}</h3>
                {g.items.map(([to, label]) => <Link key={to} to={to} tabIndex={mega || open ? 0 : -1}>{label}{g.phase > 1 && <Lock />}</Link>)}
              </div>
            ))}
          </div>
        </div>
        <Link to="/roadmap">Roadmap</Link>
        <Link to="/about">About</Link>
        <Link to={user ? "/dashboard" : "/auth"}>{user ? "Dashboard" : "Sign in"}</Link>
        <Link ref={cta} to="/join" className="btn">Join early</Link>
      </nav>
      <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      <div className="phasebar" aria-hidden="true">{[1, 2, 3].map((n) => <span key={n} className={`p${n} ${phase === n ? "on" : ""}`} />)}</div>
    </header>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal.js";

const phases = [
  { n: 1, name: "MVP", to: "/marketplace", items: ["Registration and login", "Role-based profiles", "Farmer produce listings", "Buyer search and filters", "Basic market-price information", "Enquiries and basic order records"] },
  { n: 2, name: "Expansion", to: "/messages", items: ["Integrated messaging", "Transporter profiles and delivery requests", "Input suppliers", "Ratings and reviews", "Stronger verification and moderation"] },
  { n: 3, name: "Advanced", to: "/payments", items: ["M-PESA integration", "Notifications", "Richer analytics", "Location-based matching and demand insights", "Produce traceability where feasible"] },
];

export default function Roadmap() {
  useReveal();
  const track = useRef(null);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(1);

  // Scroll draws the connecting line
  useEffect(() => {
    const onScroll = () => {
      const r = track.current.getBoundingClientRect();
      const p = (innerHeight * 0.6 - r.top) / r.height;
      setProgress(Math.max(0, Math.min(1, p)));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="page-pad roadmap">
      <header className="page-head">
        <small>Roadmap</small>
        <h1 className="display">Three phases, one focused step at a time.</h1>
      </header>

      <div className="callout" data-reveal>
        <b>Payments stay out of the MVP.</b> First we show that people can discover suitable partners, communicate and coordinate an order. Payments add security, reconciliation, compliance and support needs.
      </div>

      <div className="timeline" ref={track}>
        <div className="line"><span style={{ transform: `scaleY(${progress})` }} /></div>
        {phases.map((p) => (
          <article key={p.n} className={`node p${p.n} ${open === p.n ? "open" : ""}`} data-reveal>
            <button aria-expanded={open === p.n} onClick={() => setOpen(open === p.n ? 0 : p.n)}>
              <small>Phase {p.n}</small>
              <h2 className="display">{p.name}</h2>
            </button>
            <div className="node-body">
              <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
              <Link to={p.to} className="btn" data-cursor="Open">Explore Phase {p.n}</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

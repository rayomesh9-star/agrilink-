import { useEffect, useState } from "react";

// First visit only (session flag). Skipped for reduced motion.
export default function Preloader() {
  const skip = sessionStorage.getItem("agrilink-seen") || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [pct, setPct] = useState(skip ? 100 : 0);
  const [gone, setGone] = useState(!!skip);

  useEffect(() => {
    if (skip) return;
    const start = performance.now();
    let id;
    const tick = (t) => {
      const p = Math.min(100, Math.round(((t - start) / 1600) * 100));
      setPct(p);
      if (p < 100) id = requestAnimationFrame(tick);
      else setTimeout(() => { setGone(true); sessionStorage.setItem("agrilink-seen", "1"); }, 350);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [skip]);

  if (skip) return null;
  return (
    <div className={`preloader ${gone ? "done" : ""}`} role="status" aria-label="Loading">
      <div className="seed"><span style={{ height: `${pct}%` }} /></div>
      <p className="display">{pct}%</p>
    </div>
  );
}

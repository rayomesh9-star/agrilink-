import { useEffect, useState } from "react";

// type="asking" -> outlined chip. type="reference" -> filled chip.
export default function PriceChip({ type = "asking", children }) {
  return (
    <span className={`pchip ${type}`}>
      <small>{type === "asking" ? "Asking price" : "Market reference"}</small>
      <b>{children}</b>
    </span>
  );
}

// Animated count-up (re-runs when `to` changes)
export function CountUp({ to, duration = 900 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let id; const s = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - s) / duration);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [to, duration]);
  return <>{v.toLocaleString()}</>;
}

export function Sparkline({ data, w = 110, h = 34 }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - 4 - ((d - min) / span) * (h - 8)}`).join(" ");
  return <svg width={w} height={h} role="img" aria-label="7-day price trend"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

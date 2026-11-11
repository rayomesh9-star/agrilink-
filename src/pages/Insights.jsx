import { useMemo, useState } from "react";
import { getAllListings } from "../data/store.js";
import prices from "../data/prices.json";
import useReveal from "../hooks/useReveal.js";

const demandBase = [["Tomatoes", 82], ["Potatoes", 64], ["Onions", 51], ["Kale", 38], ["Avocados", 30], ["Maize", 44]];
const traceSteps = ["Farm", "Collection point", "Transport", "Market", "Buyer"];

export default function Insights() {
  useReveal();
  const listings = getAllListings();
  const [county, setCounty] = useState("All");
  const [focus, setFocus] = useState("All");

  const counties = ["All", ...new Set(listings.map((l) => l.location))].sort();
  const products = ["All", ...new Set(listings.map((l) => l.product))].sort();
  const filtered = listings.filter((l) => (county === "All" || l.location === county) && (focus === "All" || l.product === focus));

  const demand = useMemo(() => {
    const map = Object.fromEntries(demandBase.map(([k, v]) => [k, v]));
    filtered.forEach((l) => { map[l.product] = (map[l.product] || 30) + 3; });
    const arr = Object.entries(map).filter(([k]) => focus === "All" || k === focus).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(...arr.map((x) => x[1]), 1);
    return arr.map(([n, v]) => [n, Math.round((v / max) * 100), v]);
  }, [filtered, focus]);

  const matches = useMemo(() => {
    const m = listings.slice(0, 6).map((l, i) => ({ label: `${l.location} ${l.product} → ${["Nairobi", "Mombasa", "Nakuru", "Kisumu"][i % 4]} buyers`, score: 92 - i * 7, l }));
    return (focus === "All" ? m : m.filter((x) => x.l.product === focus)).slice(0, 4);
  }, [listings, focus]);

  const supply = useMemo(() => {
    const by = {};
    filtered.forEach((l) => { by[l.product] = (by[l.product] || 0) + l.quantity; });
    return Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filtered]);

  return (
    <main className="p2-page insights-page">
      <header className="p2-hero">
        <div>
          <span className="phase-badge">Phase 3 · Insights</span>
          <h1 className="display">See patterns in supply and demand.</h1>
          <p className="lead">Analytics, demand signals, location-based matching and traceability — planned for when there is enough real activity to learn from. This view uses sample and local marketplace data for illustration.</p>
          <div className="honesty-note"><strong>Sample insights.</strong> Figures are illustrative or derived from current local listings, not live market analytics. {/* TODO: backend analytics over real enquiries/orders */}</div>
        </div>
        <div className="p2-hero-art insight-art" aria-hidden="true"><span /><span /><span /></div>
      </header>

      <section className="insights-controls panel">
        <div className="field"><label htmlFor="i-county">Location</label><select id="i-county" value={county} onChange={(e) => setCounty(e.target.value)}>{counties.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label htmlFor="i-prod">Product focus</label><select id="i-prod" value={focus} onChange={(e) => setFocus(e.target.value)}>{products.map((p) => <option key={p}>{p}</option>)}</select></div>
        <div className="insight-summary"><b>{filtered.length}</b><span>listings in view</span></div>
        <div className="insight-summary"><b>{supply.reduce((a, [, v]) => a + v, 0).toLocaleString()}</b><span>total quantity (mixed units)</span></div>
      </section>

      <section className="insights-grid">
        <div className="panel ipanel">
          <h2 className="display">Demand signals</h2>
          <p className="muted">Illustrative enquiry interest by product.</p>
          <div className="bars">{demand.map(([n, pct, raw], i) => (
            <div className="bar-row" key={n} style={{ "--i": i }}>
              <span className="bl">{n}</span>
              <div className="bar-track"><i style={{ "--w": `${pct}%` }} /></div>
              <b>{raw}</b>
            </div>
          ))}</div>
        </div>

        <div className="panel ipanel">
          <h2 className="display">Suggested matches</h2>
          <p className="muted">Illustrative location-based pairing of supply and demand.</p>
          <div className="match-list">{matches.map((m, i) => (
            <div className="match-card" key={m.label} style={{ "--i": i }}>
              <div><b>{m.label}</b><span className="muted">Fit score (sample)</span></div>
              <div className="meter-wrap"><div className="meter"><i style={{ "--w": `${m.score}%` }} /></div><b>{m.score}%</b></div>
            </div>
          ))}</div>
        </div>

        <div className="panel ipanel">
          <h2 className="display">Local supply snapshot</h2>
          <p className="muted">From current marketplace listings in view.</p>
          {supply.length === 0 ? <p className="muted">No listings match the current filters.</p> : (
            <ul className="supply-list">{supply.map(([name, qty]) => <li key={name}><span>{name}</span><b>{qty.toLocaleString()}</b></li>)}</ul>
          )}
        </div>

        <div className="panel ipanel">
          <h2 className="display">Reference prices (sample)</h2>
          <p className="muted">From the market prices board.</p>
          <ul className="supply-list">{prices.slice(0, 5).map((p) => <li key={p.id}><span>{p.commodity} · {p.market}</span><b>KES {p.price}/{p.unit}</b></li>)}</ul>
        </div>

        <div className="panel ipanel wide">
          <h2 className="display">Traceability trail (where feasible)</h2>
          <p className="muted">A possible chain of custody for a lot of produce — illustrative only.</p>
          <ol className="trace aesthetic-trace">{traceSteps.map((t, i) => <li key={t} style={{ "--i": i }}><span>{i + 1}</span>{t}</li>)}</ol>
        </div>
      </section>

      <section className="panel" style={{ margin: "0 var(--pad) 4rem" }}>
        <h2 className="display">What this becomes with real data</h2>
        <ul className="feature-bullets">
          {["Demand insights from real enquiries and orders", "Location-based matching of supply and demand", "Richer analytics for sellers, buyers and administrators", "Produce traceability where feasible and verifiable"].map((f) => <li key={f}>{f}</li>)}
        </ul>
      </section>
    </main>
  );
}

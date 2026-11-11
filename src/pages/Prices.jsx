import { useMemo, useState } from "react";
import prices from "../data/prices.json";
import { getAllListings } from "../data/store.js";
import PriceChip, { CountUp, Sparkline } from "../components/PriceChip.jsx";

const uniq = (k) => [...new Set(prices.map((p) => p[k]))];

export default function Prices() {
  const [f, setF] = useState({ commodity: "", market: "", unit: "" });
  const chip = (k, v) => (
    <button key={v} className={`fchip ${f[k] === v ? "on" : ""}`} aria-pressed={f[k] === v} onClick={() => setF({ ...f, [k]: f[k] === v ? "" : v })}>{v}</button>
  );
  const rows = useMemo(() => prices.filter((p) => Object.entries(f).every(([k, v]) => !v || p[k] === v)), [f]);

  // Asking range from marketplace listings with the same product and unit
  const asking = (p) => {
    const a = getAllListings().filter((l) => l.product === p.commodity && l.unit === p.unit).map((l) => l.price);
    return a.length ? { min: Math.min(...a), max: Math.max(...a), n: a.length } : null;
  };

  return (
    <main className="page-pad prices">
      <header className="page-head">
        <small>Phase 1 · Market prices</small>
        <h1 className="display">Compare before you commit.</h1>
      </header>

      <div className="explain callout">
        <b>How to read these prices.</b> A <b>market reference</b> price is an observation from a named market on a given date. An <b>asking price</b> is what a seller wants for a specific listing. They can differ, and neither is a guaranteed price. Figures here are sample data. {/* TODO: replace with KAMIS or your own price records */}
      </div>

      <div className="filter-rows">
        <div><span>Commodity</span>{uniq("commodity").map((v) => chip("commodity", v))}</div>
        <div><span>Market</span>{uniq("market").map((v) => chip("market", v))}</div>
        <div><span>Unit</span>{uniq("unit").map((v) => chip("unit", v))}</div>
      </div>

      <div className="price-list">
        {rows.length === 0 && <p className="callout">No price records match these filters.</p>}
        {rows.map((p, i) => {
          const a = asking(p);
          return (
            <article className="prow" key={p.id} style={{ "--i": i }}>
              <h2 className="display">{p.commodity}</h2>
              <div className="pvals">
                <PriceChip type="reference">KES <CountUp to={p.price} />/{p.unit}</PriceChip>
                {a && <PriceChip type="asking">KES {a.min.toLocaleString()}{a.max !== a.min ? `–${a.max.toLocaleString()}` : ""}/{p.unit} · {a.n} listing{a.n > 1 ? "s" : ""}</PriceChip>}
              </div>
              <div className="spark"><Sparkline data={p.trend} /></div>
              <p className="meta">Market: {p.market} · Date: {p.date} · Unit: {p.unit} · Source: sample data</p>
            </article>
          );
        })}
      </div>
    </main>
  );
}

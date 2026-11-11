import { useEffect, useMemo, useState } from "react";
import { getAllListings } from "../data/store.js";
import ListingCard from "../components/ListingCard.jsx";


export default function Marketplace() {
  const listings = getAllListings();
  const products = [...new Set(listings.map((l) => l.product))];
  const locations = [...new Set(listings.map((l) => l.location))].sort();
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ q: "", product: "", location: "", minQty: "", avail: "" });
  const [view, setView] = useState("grid");
  const [drawer, setDrawer] = useState(false);
  const [saved, setSaved] = useState(new Set());
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // Skeleton loader. TODO: replace with fetch("/api/listings?...") from the backend
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  const results = useMemo(() => listings.filter((l) =>
    (!f.q || `${l.product} ${l.location} ${l.seller}`.toLowerCase().includes(f.q.toLowerCase())) &&
    (!f.product || l.product === f.product) &&
    (!f.location || l.location === f.location) &&
    (!f.minQty || l.quantity >= Number(f.minQty)) &&
    (!f.avail || l.availability === f.avail)
  ), [f, listings.length]);

  const toggle = (id) => setSaved((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const key = JSON.stringify(f) + view; // re-triggers the staggered entrance when filters change

  return (
    <main className="page-pad market">
      <header className="page-head">
        <small>Phase 1 · Marketplace</small>
        <h1 className="display">Discover produce.</h1>
        <p className="lead">Sample listings for design purposes. Prices are asking prices set by sellers, not guaranteed.</p>
      </header>

      <div className="market-grid">
        <aside className={`filters ${drawer ? "open" : ""}`} aria-label="Filters">
          <div className="field"><label htmlFor="q">Search</label><input id="q" value={f.q} onChange={set("q")} placeholder="Product, place or seller" /></div>
          <div className="field"><label htmlFor="product">Product</label>
            <select id="product" value={f.product} onChange={set("product")}><option value="">All products</option>{products.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div className="field"><label htmlFor="loc">Location</label>
            <select id="loc" value={f.location} onChange={set("location")}><option value="">All locations</option>{locations.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div className="field"><label htmlFor="qty">Minimum quantity (in the listing's unit)</label><input id="qty" type="number" min="0" value={f.minQty} onChange={set("minQty")} /></div>
          <div className="field"><label htmlFor="av">Availability</label>
            <select id="av" value={f.avail} onChange={set("avail")}><option value="">Any</option><option value="now">Available now</option><option value="soon">Coming soon</option></select></div>
          <button className="btn" onClick={() => { setF({ q: "", product: "", location: "", minQty: "", avail: "" }); setDrawer(false); }}>Clear filters</button>
          <button className="btn drawer-close" onClick={() => setDrawer(false)}>Show {results.length} results</button>
        </aside>

        <section aria-live="polite">
          <div className="toolbar">
            <p>{loading ? "Loading listings…" : `${results.length} listing${results.length === 1 ? "" : "s"}`}</p>
            <div role="group" aria-label="Layout">
              <button aria-pressed={view === "grid"} onClick={() => setView("grid")}>Grid</button>
              <button aria-pressed={view === "list"} onClick={() => setView("list")}>List</button>
            </div>
          </div>
          {loading ? (
            <div className="lgrid">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton" key={i} />)}</div>
          ) : results.length === 0 ? (
            <p className="callout">No listings match these filters. Try clearing one.</p>
          ) : (
            <div className={`lgrid ${view}`} key={key}>
              {results.map((l, i) => <ListingCard key={l.id} l={l} i={i} saved={saved.has(l.id)} onSave={toggle} />)}
            </div>
          )}
        </section>
      </div>

      <button className="filter-bar btn" onClick={() => setDrawer(true)}>Filters</button>
    </main>
  );
}

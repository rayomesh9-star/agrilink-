import { useEffect, useState } from "react";
import { useAuth } from "../context/Auth.jsx";
import { getInputItems, addInputItem, addInputEnquiry, getInputEnquiries } from "../data/store.js";

const cats = ["All", "Seeds", "Fertilizer", "Equipment", "Animal feed", "Other"];
const accents = { Seeds: "#3a7d44", Fertilizer: "#8b5e34", Equipment: "#4a6fa5", "Animal feed": "#b4553a", Other: "#6b6257" };

export default function Inputs() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ cat: "Seeds", name: "", supplier: "", location: "", price: "", unit: "unit", about: "" });
  const [ask, setAsk] = useState(null);
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState("");
  const [mine, setMine] = useState([]);

  const reload = () => { setItems(getInputItems()); setMine(getInputEnquiries()); };
  useEffect(reload, []);

  const list = items.filter((i) => (cat === "All" || i.cat === cat) && (!q || `${i.name} ${i.supplier} ${i.location}`.toLowerCase().includes(q.toLowerCase())));

  const submitItem = (e) => {
    e.preventDefault(); if (!form.name || !form.supplier || !form.price) return;
    addInputItem({ ...form, price: Number(form.price) }); // TODO: POST /api/inputs
    setForm({ cat: "Seeds", name: "", supplier: "", location: "", price: "", unit: "unit", about: "" }); setShowAdd(false); reload();
  };
  const submitEnquiry = (e) => {
    e.preventDefault(); if (!msg.trim() || !ask) return;
    addInputEnquiry({ itemId: ask.id, itemName: ask.name, supplier: ask.supplier, from: user?.name || "Guest", message: msg.trim() }); // TODO: POST /api/inputs/:id/enquiries
    setAsk(null); setMsg(""); setNote("Enquiry sent. The supplier will be able to respond in the live system."); reload();
  };

  return (
    <main className="p2-page inputs-page">
      <header className="p2-hero">
        <div><span className="phase-badge">Phase 2 · Agricultural Inputs</span><h1 className="display">Everything the farm needs, in one place.</h1><p className="lead">Discover seeds, fertilizer, equipment and animal feed from local suppliers. Send enquiries or list your own products. {/* TODO: backend catalog + supplier verification */}</p></div>
        <div className="p2-hero-art seed-art" aria-hidden="true"><span /><span /><span /></div>
      </header>

      {note && <p className="callout page-pad-narrow" role="status">{note}</p>}

      <section className="inputs-controls">
        <div className="search-bar"><input placeholder="Search products, suppliers or locations…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search inputs" /></div>
        <div className="cat-pills" role="tablist" aria-label="Categories">
          {cats.map((c) => <button key={c} role="tab" aria-selected={cat === c} className={`cat-pill ${cat === c ? "on" : ""}`} style={{ "--ac": accents[c] || "var(--p2)" }} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <button className="btn" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Close form" : "List an input"}</button>
      </section>

      {showAdd && (
        <form className="panel inputs-form" onSubmit={submitItem}>
          <h2 className="display">List an agricultural input</h2>
          <div className="grid-form">
            <div className="field"><label>Category</label><select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>{cats.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}</select></div>
            {[["name", "Product name"], ["supplier", "Supplier name"], ["location", "Location"], ["price", "Price (KES)"], ["unit", "Unit (e.g. bag, pack)"]].map(([k, label]) => (
              <div className="field" key={k}><label>{label}</label><input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
          </div>
          <div className="field"><label>Description</label><textarea rows="2" value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} /></div>
          <button className="btn" type="submit">Publish input</button>
        </form>
      )}

      <section className="inputs-grid-aesthetic">
        {list.map((it, i) => (
          <article className="input-card" key={it.id} style={{ "--i": i, "--ac": accents[it.cat] || "var(--p2)" }}>
            <div className="input-top"><span className="input-cat">{it.cat}</span><span className="input-loc">{it.location}</span></div>
            <h3 className="display">{it.name}</h3>
            <p className="muted">{it.supplier}</p>
            {it.about && <p className="input-about">{it.about}</p>}
            <div className="input-foot"><span className="input-price">KES {Number(it.price).toLocaleString()} <small>/ {it.unit}</small></span><button className="btn ghost" onClick={() => { setAsk(it); setMsg(""); }}>Enquire</button></div>
          </article>
        ))}
      </section>
      {list.length === 0 && <div className="p2-empty panel"><h2 className="display">No inputs match</h2><p className="muted">Try a different search or category.</p></div>}

      {ask && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Enquire about input" onClick={(e) => e.target === e.currentTarget && setAsk(null)}>
          <form className="modal aesthetic" onSubmit={submitEnquiry}>
            <span className="phase-badge">Enquiry</span>
            <h2 className="display">{ask.name}</h2>
            <p className="muted">To {ask.supplier} · {ask.location}</p>
            <div className="field"><label htmlFor="ie-msg">Your message</label><textarea id="ie-msg" rows="4" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Ask about availability, pricing, or delivery…" required /></div>
            <div className="wiz-actions"><button type="button" className="btn ghost" onClick={() => setAsk(null)}>Cancel</button><button className="btn" type="submit">Send enquiry</button></div>
          </form>
        </div>
      )}

      {user && mine.filter((e) => e.from === user.name).length > 0 && (
        <section className="panel" style={{ marginTop: "2rem" }}>
          <h2 className="display">Your enquiries</h2>
          <ul className="enquiry-list">{mine.filter((e) => e.from === user.name).map((e) => <li key={e.id}><b>{e.itemName}</b><span>to {e.supplier}</span><p>{e.message}</p></li>)}</ul>
        </section>
      )}
    </main>
  );
}

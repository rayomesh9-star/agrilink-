import { useEffect, useState } from "react";
import { useAuth } from "../context/Auth.jsx";
import { getDeliveryRequests, addDeliveryRequest, addQuote, chooseQuote, setDeliveryStatus } from "../data/store.js";

const stepsTrack = ["open", "assigned", "pickup", "in_transit", "delivered"];
const stepLabel = { open: "Open for quotes", assigned: "Assigned", pickup: "Pickup confirmed", in_transit: "In transit", delivered: "Delivered" };

export default function Logistics() {
  const { user } = useAuth();
  const [reqs, setReqs] = useState([]);
  const [form, setForm] = useState({ produce: "", from: "", to: "", date: "", notes: "" });
  const [qform, setQform] = useState({});
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const name = user?.name || "Guest";

  const reload = () => setReqs(getDeliveryRequests());
  useEffect(reload, []);

  const create = (e) => {
    e.preventDefault();
    if (!form.produce || !form.from || !form.to) return setErr("Produce, pickup and drop-off are required.");
    setErr(""); addDeliveryRequest({ ...form, postedBy: name }); // TODO: POST /api/deliveries
    setForm({ produce: "", from: "", to: "", date: "", notes: "" }); setShowForm(false); reload();
  };
  const quote = (reqId) => {
    const q = qform[reqId] || {}; if (!q.transporter || !q.price) return;
    addQuote(reqId, { transporter: q.transporter, vehicle: q.vehicle || "Vehicle", area: q.area || "", price: q.price }); // TODO: POST /api/deliveries/:id/quotes
    setQform({ ...qform, [reqId]: {} }); reload();
  };
  const advance = (r) => { const i = stepsTrack.indexOf(r.status); setDeliveryStatus(r.id, stepsTrack[Math.min(i + 1, stepsTrack.length - 1)]); reload(); }; // TODO: PATCH

  return (
    <main className="p2-page logi-page">
      <header className="p2-hero">
        <div><span className="phase-badge">Phase 2 · Logistics</span><h1 className="display">Move produce with clarity.</h1><p className="lead">Post delivery requests, compare quotations, and follow each load from pickup to drop-off. {/* TODO: backend logistics API */}</p></div>
        <div className="p2-hero-art route-art" aria-hidden="true"><svg viewBox="0 0 200 120"><path d="M10 100 C 50 10, 150 110, 190 20" /><circle cx="10" cy="100" r="6" /><circle cx="190" cy="20" r="6" /></svg></div>
      </header>

      <section className="logi-top">
        <div className="logi-stats">
          {[["Requests", reqs.length], ["Open", reqs.filter((r) => r.status === "open").length], ["In progress", reqs.filter((r) => ["assigned", "pickup", "in_transit"].includes(r.status)).length], ["Delivered", reqs.filter((r) => r.status === "delivered").length]].map(([l, v], i) => (
            <div className="lstat" key={l} style={{ "--i": i }}><b className="display">{v}</b><span>{l}</span></div>
          ))}
        </div>
        <button className="btn big" onClick={() => setShowForm(!showForm)}>{showForm ? "Close" : "Post a delivery request"}</button>
      </section>

      {showForm && (
        <form className="logi-form panel" onSubmit={create} noValidate>
          <h2 className="display">New delivery request</h2>
          <div className="grid-form">
            {[["produce", "Produce and quantity"], ["from", "Pickup location"], ["to", "Drop-off location"], ["date", "Preferred date"]].map(([k, label]) => (
              <div className="field" key={k}><label htmlFor={`d-${k}`}>{label}</label><input id={`d-${k}`} type={k === "date" ? "date" : "text"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={label} /></div>
            ))}
          </div>
          <div className="field"><label htmlFor="d-notes">Notes (optional)</label><textarea id="d-notes" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn" type="submit">Publish request</button>
        </form>
      )}

      <section>
        {reqs.length === 0 ? (
          <div className="p2-empty panel"><div className="empty-mark route" aria-hidden="true" /><h2 className="display">No delivery requests yet</h2><p className="muted">Post a request to start receiving quotations from transporters.</p></div>
        ) : (
          <div className="req-list">
            {reqs.map((r, idx) => {
              const si = stepsTrack.indexOf(r.status);
              return (
                <article className={`waybill panel ${r.status}`} key={r.id} style={{ "--i": idx }}>
                  <div className="waybill-top">
                    <div><small>Waybill · {r.postedBy}</small><h3 className="display">{r.produce}</h3></div>
                    <span className={`status-pill ${r.status}`}>{stepLabel[r.status]}</span>
                  </div>
                  <div className="route-line"><span className="loc">{r.from}</span><span className="route-track" aria-hidden="true"><i /></span><span className="loc">{r.to}</span></div>
                  {r.date && <p className="muted">Preferred: {r.date}</p>}{r.notes && <p className="muted">{r.notes}</p>}

                  <ol className="status-track" aria-label="Delivery progress">
                    {stepsTrack.map((s, i) => <li key={s} className={i <= si ? "on" : i === si + 1 ? "next" : ""}><span /><b>{stepLabel[s]}</b></li>)}
                  </ol>

                  <div className="quotes-wrap">
                    <h4>Quotations {r.quotes.length ? `(${r.quotes.length})` : ""}</h4>
                    {r.quotes.length === 0 ? <p className="muted">No quotations yet.</p> : (
                      <div className="quotes">{r.quotes.map((q) => (
                        <div key={q.id} className={`quote-card ${r.chosenQuote === q.id ? "chosen" : ""}`}>
                          <div><b>{q.transporter}</b><small>{q.vehicle}{q.area ? ` · ${q.area}` : ""}</small></div>
                          <div className="quote-price">KES {q.price}</div>
                          {r.status === "open" && <button className="btn ghost" onClick={() => { chooseQuote(r.id, q.id); reload(); }}>Accept</button>}
                          {r.chosenQuote === q.id && <span className="chosen-mark">Selected</span>}
                        </div>
                      ))}</div>
                    )}
                  </div>

                  {r.status === "open" && (
                    <details className="quote-form">
                      <summary>Submit a quotation</summary>
                      <div className="grid-form" style={{ marginTop: ".75rem" }}>
                        {[["transporter", "Transporter name"], ["vehicle", "Vehicle"], ["area", "Service area"], ["price", "Price (KES)"]].map(([k, label]) => (
                          <div className="field" key={k}><label>{label}</label><input value={(qform[r.id]?.[k]) || ""} onChange={(e) => setQform({ ...qform, [r.id]: { ...(qform[r.id] || {}), [k]: e.target.value } })} /></div>
                        ))}
                      </div>
                      <button className="btn" style={{ marginTop: ".75rem" }} onClick={() => quote(r.id)}>Send quotation</button>
                    </details>
                  )}

                  {r.status !== "open" && r.status !== "delivered" && <button className="btn" onClick={() => advance(r)}>Mark: {stepLabel[stepsTrack[si + 1]]}</button>}
                  {r.status === "delivered" && <p className="done-banner">Delivery completed.</p>}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Auth.jsx";
import { getOrders, getPayments, createPayment, updatePayment, addPaymentEvent } from "../data/store.js";
import useReveal from "../hooks/useReveal.js";

const steps = ["requested", "pending", "confirmed"];
const labels = { requested: "Request created", pending: "Awaiting confirmation on phone", confirmed: "Payment confirmed" };

export default function Payments() {
  useReveal();
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ product: "", party: "", amount: "", phone: "" });
  const [note, setNote] = useState("");
  const orders = getOrders();

  const reload = () => setPayments(getPayments());
  useEffect(reload, []);

  const stats = useMemo(() => {
    const confirmed = payments.filter((p) => p.status === "confirmed");
    return { total: payments.length, confirmed: confirmed.length, volume: confirmed.reduce((a, p) => a + (Number(p.amount) || 0), 0) };
  }, [payments]);

  const start = (e) => {
    e?.preventDefault();
    if (!form.product || !form.amount) { setNote("Product and amount are required."); return; }
    const rec = createPayment({ ...form, amount: Number(form.amount), by: user?.name || "Guest" }); // TODO: initiate M-PESA STK push via backend
    setForm({ product: "", party: "", amount: "", phone: "" });
    setNote("Simulated payment request created. No real money was sent.");
    reload();
    // simulate phone prompt -> confirmation flow
    setTimeout(() => { updatePayment(rec.id, { status: "pending" }); addPaymentEvent(rec.id, "Prompt sent to buyer phone (simulated)"); reload(); }, 1200);
    setTimeout(() => { updatePayment(rec.id, { status: "confirmed", confirmedAt: Date.now() }); addPaymentEvent(rec.id, "Confirmation received (simulated)"); reload(); }, 3200);
  };

  const fromOrder = (o) => {
    const amt = (o.agreed.match(/[\d,]+/) || ["0"])[0].replace(/,/g, "");
    setForm({ product: `${o.product} (${o.qty})`, party: o.party, amount: amt, phone: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="p2-page pay-page">
      <header className="p2-hero">
        <div>
          <span className="phase-badge">Phase 3 · Payments</span>
          <h1 className="display">Payments, planned with care.</h1>
          <p className="lead">M-PESA integration is planned after the core marketplace is validated. Payments involve security, reconciliation, compliance and support — so they come later by design.</p>
          <div className="honesty-note"><strong>Simulation only.</strong> This page demonstrates the intended flow. It is not connected to M-PESA or any payment service and does not move money.</div>
        </div>
        <div className="p2-hero-art pay-art" aria-hidden="true"><span /><span /><span /></div>
      </header>

      {note && <p className="callout page-pad-narrow" role="status">{note}</p>}

      <section className="pay-stats">
        {[["Simulated requests", stats.total], ["Confirmed (simulated)", stats.confirmed], ["Simulated volume", `KES ${stats.volume.toLocaleString()}`]].map(([l, v], i) => (
          <div className="lstat" key={l} style={{ "--i": i }}><b className="display">{v}</b><span>{l}</span></div>
        ))}
      </section>

      <section className="pay-layout">
        <div className="panel pay-create">
          <h2 className="display">Request a payment</h2>
          <p className="muted">Link a payment to an agreed order. In production this would trigger an M-PESA prompt. {/* TODO: M-PESA STK push via secure backend */}</p>
          <form className="grid-form" onSubmit={start}>
            <div className="field"><label htmlFor="p-prod">Product / order</label><input id="p-prod" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="e.g. Tomatoes, 500 kg" /></div>
            <div className="field"><label htmlFor="p-party">Buyer / seller</label><input id="p-party" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder="Name or business" /></div>
            <div className="field"><label htmlFor="p-amt">Amount (KES)</label><input id="p-amt" type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div className="field"><label htmlFor="p-phone">Phone (for prompt preview)</label><input id="p-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07xx xxx xxx" /></div>
            <button className="btn big" type="submit" style={{ gridColumn: "1 / -1" }}>Simulate payment request</button>
          </form>

          <div className="order-pick">
            <h3>Or start from an order record</h3>
            <ul className="plain">{orders.slice(0, 4).map((o) => (
              <li key={o.id}><button type="button" className="link-btn" onClick={() => fromOrder(o)}>{o.product} · {o.party} · {o.agreed}</button> <span className={`status-pill ${o.status === "completed" ? "delivered" : "open"}`}>{o.status}</span></li>
            ))}</ul>
          </div>
        </div>

        <div className="panel pay-ledger">
          <h2 className="display">Payment records</h2>
          {payments.length === 0 ? <p className="muted">No simulated payments yet. Create one to see the flow and receipt.</p> : (
            <div className="pay-list">
              {payments.map((p) => {
                const si = steps.indexOf(p.status);
                return (
                  <article className={`pay-card ${p.status}`} key={p.id}>
                    <div className="pay-card-top">
                      <div><small>{p.ref} · {new Date(p.createdAt).toLocaleString()}</small><b>{p.product}</b><span className="muted">{p.party || "—"} {p.phone ? `· ${p.phone}` : ""}</span></div>
                      <div className="pay-amount">KES {Number(p.amount).toLocaleString()}</div>
                    </div>
                    <ol className="pay-steps" aria-label="Payment status">
                      {steps.map((s, i) => <li key={s} className={i <= si ? "on" : ""}><span className="dot-step" />{labels[s]}</li>)}
                    </ol>
                    {p.status === "confirmed" && (
                      <div className="receipt">
                        <div className="receipt-mark" aria-hidden="true"><svg viewBox="0 0 52 52" width="36"><circle cx="26" cy="26" r="24" className="c" /><path d="M14 27l8 8 16-17" className="t" /></svg></div>
                        <div><b>Simulated receipt</b><p className="muted">Ref {p.ref} · {new Date(p.confirmedAt || p.createdAt).toLocaleString()} · Not a real transaction</p></div>
                      </div>
                    )}
                    <details><summary>Event log</summary><ul className="plain">{(p.events || []).map((e, i) => <li key={i}>{e.label} <span className="muted">· {new Date(e.at).toLocaleTimeString()}</span></li>)}</ul></details>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="panel" style={{ margin: "0 var(--pad) 4rem" }}>
        <h2 className="display">What real integration will include</h2>
        <ul className="feature-bullets">
          {["M-PESA STK push linked to agreed orders", "Secure confirmation, receipts and reconciliation", "Notifications for both buyer and seller", "Clear records, dispute handling and compliance support"].map((f) => <li key={f}>{f}</li>)}
        </ul>
        <p className="muted" style={{ marginTop: "1rem" }}>Payments stay out of the MVP until the core marketplace is validated. <Link to="/roadmap"><u>See the roadmap</u></Link>.</p>
      </section>
    </main>
  );
}

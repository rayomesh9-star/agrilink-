import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth, isSeller, ROLES } from "../context/Auth.jsx";
import { CountUp } from "../components/PriceChip.jsx";
import { getMine, getOrders, saveOrders, sampleEnquiries, savedSearches } from "../data/store.js";

const FLOW = ["requested", "accepted", "completed"];

function Stepper({ status }) {
  if (status === "rejected") return <span className="status rejected">Rejected</span>;
  const i = FLOW.indexOf(status);
  return <ol className="mini-step" aria-label={`Status: ${status}`}>{FLOW.map((s, j) => <li key={s} className={j <= i ? "on" : ""}>{s}</li>)}</ol>;
}

const Empty = ({ text, to, cta }) => (
  <div className="empty">
    <svg viewBox="0 0 120 80" width="120" aria-hidden="true"><path d="M10 70h100" stroke="currentColor" strokeWidth="2" /><path d="M60 70V35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M60 45c-18 0-24-14-24-22 16 0 24 8 24 22zM60 40c14 0 20-12 20-18-14 0-20 6-20 18z" fill="var(--gold)" /></svg>
    <p>{text}</p>{to && <Link className="btn" to={to}>{cta}</Link>}
  </div>
);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState(getOrders);
  if (!user) return <Navigate to="/auth" replace />;

  const seller = isSeller(user.role);
  const mine = orders.filter((o) => o.side === (seller ? "seller" : "buyer"));
  const listings = getMine();
  const enq = sampleEnquiries[seller ? "seller" : "buyer"];
  const setStatus = (id, status) => { const n = orders.map((o) => (o.id === id ? { ...o, status } : o)); setOrders(n); saveOrders(n); /* TODO: PATCH /api/orders/:id */ };
  const count = (s) => mine.filter((o) => o.status === s).length;

  const stats = seller
    ? [["Your listings", listings.length], ["Enquiries", enq.length], ["Open orders", count("requested") + count("accepted")], ["Completed", count("completed")]]
    : [["Saved searches", savedSearches.length], ["Enquiries sent", enq.length], ["Open orders", count("requested") + count("accepted")], ["Completed", count("completed")]];

  return (
    <main className="page-pad dash">
      <header className="page-head">
        <small>{ROLES.find((r) => r.id === user.role)?.label} dashboard</small>
        <h1 className="display">Hello, {user.name}.</h1>
        <div className="dash-actions">
          {seller ? <Link className="btn" to="/dashboard/new-listing">New listing</Link> : <Link className="btn" to="/marketplace">Browse produce</Link>}
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>
      </header>

      <div className="stats">{stats.map(([k, v], i) => <div className="stat" key={k} style={{ "--i": i }}><b className="display"><CountUp to={v} /></b><span>{k}</span></div>)}</div>

      <section>
        <h2 className="display">{seller ? "Your listings" : "Saved searches"}</h2>
        {seller
          ? (listings.length ? <ul className="plain">{listings.map((l) => <li key={l.id}><Link to={`/marketplace/${l.id}`}>{l.product}, {l.quantity} {l.unit}</Link> · KES {l.price}/{l.unit} · {l.location}</li>)}</ul>
            : <Empty text="You have not listed any produce yet." to="/dashboard/new-listing" cta="Create your first listing" />)
          : <ul className="plain">{savedSearches.map((s) => <li key={s}>{s}</li>)}</ul>}
      </section>

      <section>
        <h2 className="display">Enquiries</h2>
        <ul className="plain">{enq.map((e, i) => <li key={i}><b>{e.from}</b> about {e.about}: {e.msg}</li>)}</ul>
      </section>

      <section>
        <h2 className="display">Order records</h2>
        {mine.length === 0 ? <Empty text="No orders recorded yet." /> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Product</th><th>{seller ? "Buyer" : "Seller"}</th><th>Quantity</th><th>Agreed price</th><th>Status</th>{seller && <th>Actions</th>}</tr></thead>
            <tbody>{mine.map((o) => (
              <tr key={o.id}>
                <td>{o.product}</td><td>{o.party}</td><td>{o.qty}</td><td>{o.agreed}</td><td><Stepper status={o.status} /></td>
                {seller && <td className="acts">
                  {o.status === "requested" && <><button onClick={() => setStatus(o.id, "accepted")}>Accept</button><button onClick={() => setStatus(o.id, "rejected")}>Reject</button></>}
                  {o.status === "accepted" && <button onClick={() => setStatus(o.id, "completed")}>Mark complete</button>}
                </td>}
              </tr>))}</tbody>
          </table></div>
        )}
      </section>
    </main>
  );
}

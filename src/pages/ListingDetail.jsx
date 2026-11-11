import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllListings } from "../data/store.js";
import PriceChip from "../components/PriceChip.jsx";

export default function ListingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const l = getAllListings().find((x) => x.id === id);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  if (!l) return <main className="page-pad page-head"><h1 className="display">Listing not found</h1><Link className="btn" to="/marketplace">Back to marketplace</Link></main>;

  const submit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (!f.contact.trim()) return setErr("Please add a phone number or email so the seller can reply.");
    setErr("");
    // TODO: POST /api/enquiries { listingId: l.id, ...f } (requires login in the real app)
    setSent(true);
  };

  const startChat = () => {
    nav("/messages", { state: { openConversation: { listingId: l.id, listingTitle: `${l.product} · ${l.location}`, withName: l.seller } } });
  };

  return (
    <main className="page-pad detail">
      <Link to="/marketplace" className="back">← All listings</Link>
      <div className="detail-grid">
        {/* TODO: real image gallery */}
        <div className="thumb big" style={{ "--h": l.hue, viewTransitionName: "listing-img" }}><span>{l.product}</span></div>
        <div>
          <small className="muted">{l.category}</small>
          <h1 className="display">{l.product}</h1>
          <p className="lead">{l.about}</p>
          <PriceChip type="asking">KES {l.price.toLocaleString()}/{l.unit}</PriceChip>
          <p className="note">Set by the seller and open to negotiation. See the <Link to="/prices"><u>market reference prices</u></Link> for comparison.</p>
          <dl>
            <dt>Quantity</dt><dd>{l.quantity.toLocaleString()} {l.unit}</dd>
            <dt>Location</dt><dd>{l.location}</dd>
            <dt>Availability</dt><dd>{l.availabilityText}</dd>
            <dt>Seller</dt><dd>{l.seller} ({l.sellerType})</dd>
          </dl>

          {sent ? (
            <div className="callout" role="status">
              <p>Enquiry noted. In the live app the seller would be notified.</p>
              <button className="btn" style={{ marginTop: ".75rem" }} onClick={startChat}>Open chat with seller</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h2 className="display">Send an enquiry</h2>
              <div className="field"><label htmlFor="want">Quantity you need ({l.unit})</label><input id="want" name="want" type="number" min="1" /></div>
              <div className="field"><label htmlFor="contact">Your phone or email</label><input id="contact" name="contact" aria-invalid={!!err} aria-describedby={err ? "c-err" : undefined} />{err && <span id="c-err" className="err" role="alert">{err}</span>}</div>
              <div className="field"><label htmlFor="msg">Message or offer</label><textarea id="msg" name="msg" rows="3" /></div>
              <div className="wiz-actions">
                <button className="btn" type="submit">Send enquiry</button>
                <button className="btn ghost" type="button" onClick={startChat}>Message seller</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "../context/Auth.jsx";
import { getAllListings } from "../data/store.js";
import { getReviews, addReview, addReport, getReports, getVerifications, requestVerification } from "../data/store.js";

const badgeDefs = [
  { type: "Phone confirmed", tip: "A phone number was confirmed." },
  { type: "Identity checked", tip: "Identity details were reviewed by a moderator." },
  { type: "Group member", tip: "Listed by a registered farmer group." },
];
const reasons = ["Description looks inaccurate", "Suspicious price or offer", "Seller not responding", "Spam or misleading content", "Other"];

export default function Trust() {
  const { user } = useAuth();
  const targets = getAllListings().slice(0, 8).map((l) => ({ id: `seller:${l.seller}`, label: l.seller, meta: `${l.location} · ${l.sellerType}`, hue: l.hue }));
  const [sel, setSel] = useState(targets[0]?.id || "");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState({ target: "", reason: reasons[0], detail: "" });
  const [reports, setReports] = useState([]);
  const [verifs, setVerifs] = useState([]);
  const [note, setNote] = useState("");

  const reload = () => { if (sel) setReviews(getReviews(sel)); setReports(getReports()); setVerifs(user ? (getVerifications()[user.email] || []) : []); };
  useEffect(reload, [sel, user]);

  const target = targets.find((t) => t.id === sel);
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : 0;
  const stars = hover || rating;

  const submitReview = (e) => {
    e.preventDefault(); if (!sel || !rating) return;
    addReview({ target: sel, rating, text: text.trim(), by: user?.name || "Anonymous" }); // TODO: POST /api/reviews
    setRating(0); setText(""); setNote("Review submitted. Reviews help others judge who to trade with, but they do not guarantee any trade."); reload();
  };
  const submitReport = (e) => {
    e.preventDefault();
    addReport({ target: report.target || sel, reason: report.reason, detail: report.detail.trim(), by: user?.name || "Anonymous" }); // TODO: POST /api/reports + moderation
    setReportOpen(false); setReport({ target: "", reason: reasons[0], detail: "" }); setNote("Report submitted. Moderators would review it in the live app."); reload();
  };
  const verify = (type) => { if (!user) return; requestVerification(user.email, type); setNote(`Verification request for "${type}" recorded.`); reload(); };

  return (
    <main className="p2-page trust-page">
      <header className="p2-hero">
        <div><span className="phase-badge">Phase 2 · Trust and Verification</span><h1 className="display">Trust, built with care.</h1><p className="lead">Reviews, verification and reporting help people make informed choices. They reduce risk but do not guarantee any trade. {/* TODO: moderated backend services */}</p></div>
        <div className="p2-hero-art seal-art" aria-hidden="true"><span className="seal-ring" /><span className="seal-ring" /></div>
      </header>

      {note && <p className="callout page-pad-narrow" role="status">{note}</p>}

      <section className="trust-layout">
        <div className="trust-main panel">
          <h2 className="display">Seller profiles</h2>
          <div className="field"><label htmlFor="t-sel">Select a profile</label>
            <select id="t-sel" value={sel} onChange={(e) => setSel(e.target.value)}>{targets.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>

          {target && (
            <div className="profile-hero" style={{ "--h": target.hue }}>
              <div className="avatar lg" aria-hidden="true">{target.label[0]}</div>
              <div>
                <b className="display">{target.label}</b>
                <p className="meta">{target.meta}</p>
                <div className="rating-summary">
                  <span className="big-rating">{avg ? avg.toFixed(1) : "—"}</span>
                  <span className="star-row" aria-label={avg ? `${avg.toFixed(1)} out of 5` : "No rating"}>{"★★★★★".split("").map((s, i) => <i key={i} className={i < Math.round(avg) ? "on" : ""}>{s}</i>)}</span>
                  <span className="muted">{reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
                </div>
                <ul className="seal-badges">{badgeDefs.map((b) => <li key={b.type} title={b.tip} tabIndex={0}><span className="seal-dot" />{b.type}</li>)}</ul>
              </div>
            </div>
          )}

          <form className="review-form" onSubmit={submitReview}>
            <h3 className="display">Share your experience</h3>
            <p className="muted">Only review trades you have completed.</p>
            <div className="stars big" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} className={n <= stars ? "on" : ""} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>★</button>)}
            </div>
            <div className="field"><label htmlFor="rv-text">Comment (optional)</label><textarea id="rv-text" rows="3" value={text} onChange={(e) => setText(e.target.value)} placeholder="What went well? What should others know?" /></div>
            <button className="btn" type="submit" disabled={!rating}>Submit review</button>
          </form>

          <div className="review-list">
            {reviews.length === 0 ? <p className="muted">No reviews yet for this profile.</p> : reviews.map((r) => (
              <article className="review-card" key={r.id}>
                <div className="review-head"><span className="avatar sm" aria-hidden="true">{r.by[0]}</span><div><b>{r.by}</b><span className="star-row sm">{"★★★★★".split("").map((s, i) => <i key={i} className={i < r.rating ? "on" : ""}>{s}</i>)}</span></div><time>{new Date(r.at).toLocaleDateString()}</time></div>
                {r.text && <p>{r.text}</p>}
              </article>
            ))}
          </div>
        </div>

        <aside className="trust-side">
          <div className="panel">
            <h2 className="display">Verification</h2>
            <p className="muted">Badges show what was checked — not a guarantee of quality or payment.</p>
            {user ? (
              <>
                <div className="verify-actions">{badgeDefs.map((b) => <button key={b.type} className="verify-btn" onClick={() => verify(b.type)}><span className="seal-dot" />{b.type}<small>Request</small></button>)}</div>
                {verifs.length > 0 && <ul className="plain" style={{ marginTop: "1rem" }}>{verifs.map((v, i) => <li key={i}>{v.type}: <b className="status-pill open" style={{ fontSize: ".75rem" }}>{v.status}</b></li>)}</ul>}
              </>
            ) : <p className="muted" style={{ marginTop: ".5rem" }}>Sign in to request verification.</p>}
          </div>

          <div className="panel">
            <h2 className="display">Report & moderation</h2>
            <p className="muted">Help keep the marketplace safe. Reports are reviewed by moderators.</p>
            <button className="btn ghost" style={{ marginTop: ".75rem" }} onClick={() => setReportOpen(!reportOpen)}>{reportOpen ? "Close" : "Report a listing or account"}</button>
            {reportOpen && (
              <form className="report-form" onSubmit={submitReport}>
                <div className="field"><label>Target</label><select value={report.target || sel} onChange={(e) => setReport({ ...report, target: e.target.value })}>{targets.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
                <fieldset className="reason-group"><legend>Reason</legend>{reasons.map((r) => <label key={r} className={`reason-opt ${report.reason === r ? "on" : ""}`}><input type="radio" name="reason" checked={report.reason === r} onChange={() => setReport({ ...report, reason: r })} /> {r}</label>)}</fieldset>
                <div className="field"><label>Details (optional)</label><textarea rows="3" value={report.detail} onChange={(e) => setReport({ ...report, detail: e.target.value })} /></div>
                <button className="btn" type="submit">Submit report</button>
              </form>
            )}
            {reports.length > 0 && <ul className="plain" style={{ marginTop: "1rem" }}>{reports.slice(0, 5).map((r) => <li key={r.id}><b>{targets.find((t) => t.id === r.target)?.label || "Account"}</b> · {r.reason} <span className="status-pill open" style={{ fontSize: ".7rem" }}>{r.status}</span></li>)}</ul>}
          </div>
        </aside>
      </section>
    </main>
  );
}

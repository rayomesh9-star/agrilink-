import { Link, useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import PriceChip from "./PriceChip.jsx";

export default function ListingCard({ l, i, saved, onSave }) {
  const nav = useNavigate();

  // Shared-element transition: card image morphs into the detail image (View Transitions API, with fallback)
  const open = (e) => {
    if (!document.startViewTransition || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    e.currentTarget.querySelector(".thumb").style.viewTransitionName = "listing-img";
    document.startViewTransition(() => flushSync(() => nav(`/marketplace/${l.id}`)));
  };

  return (
    <article className="lcard" style={{ "--i": i }}>
      <Link to={`/marketplace/${l.id}`} onClick={open} data-cursor="View" aria-label={`${l.product} in ${l.location}`}>
        {/* TODO: replace gradient with <img src={l.image} alt={...} loading="lazy" /> */}
        <div className="thumb" style={{ "--h": l.hue }}><span>{l.product}</span></div>
      </Link>
      <button className={`heart ${saved ? "on" : ""}`} aria-pressed={saved} aria-label={saved ? "Remove from saved" : "Save listing"} onClick={() => onSave(l.id)}>
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6C19 16.4 12 21 12 21z" /></svg>
      </button>
      <div className="lbody">
        <h3 className="display">{l.product}</h3>
        <p className="meta">{l.quantity.toLocaleString()} {l.unit} · {l.location}</p>
        <p className="meta">{l.availabilityText}</p>
        <PriceChip type="asking">KES {l.price.toLocaleString()}/{l.unit}</PriceChip>
      </div>
    </article>
  );
}

import useReveal from "../hooks/useReveal.js";
import useMagnetic from "../hooks/useMagnetic.js";
import { Link } from "react-router-dom";
import Journey from "../components/Journey.jsx";

const stakeholders = ["Farmers", "Buyers", "Wholesalers & Retailers", "Brokers & Aggregators", "Transporters", "Input Suppliers", "Partners & Admins"];
const produce = ["Tomatoes", "Potatoes", "Maize", "Kale", "Avocados", "Onions", "Beans"];
const phases = [
  { n: 1, name: "MVP", text: "Listings, search, prices, enquiries, order records." },
  { n: 2, name: "Expansion", text: "Messaging, logistics, inputs, reviews, verification." },
  { n: 3, name: "Advanced", text: "M-PESA, notifications, analytics, matching." },
];

export default function Home() {
  useReveal();
  const cta = useMagnetic();
  const line = (t, i) => <span className="mask"><span style={{ "--d": `${i * 0.12 + 0.2}s` }}>{t}</span></span>;

  return (
    <main>
      {/* HERO */}
      <section className="hero page-pad">
        <h1 className="display">{line("Where the harvest", 0)}{line("meets the market.", 1)}</h1>
        <p className="lead" data-reveal>Discover trading partners, compare market information and coordinate produce orders across Kenya.</p>
        {/* TODO: replace gradient with a real Kenyan farm image inside .img-inner */}
        <div className="reveal-img hero-img" data-reveal data-cursor="View"><div className="img-inner" /></div>
        {/* TODO: feed from KAMIS or backend /api/prices */}
        <div className="price-chip" data-reveal>
          <b>Tomatoes</b> · Wakulima Market · KES/kg · <em>market reference</em>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem page-pad">
        {["Markets are fragmented.", "Prices are hard to compare.", "Good harvests go unsold."].map((t) => (
          <h2 key={t} className="display" data-reveal>{t}</h2>
        ))}
      </section>

      {/* FARMER JOURNEY: pinned scroll story */}
      <Journey />

      {/* WHO IT'S FOR: draggable rail (scroll-snap, swipe on touch) */}
      <section className="rail-wrap">
        <h2 className="display page-pad" data-reveal>Who it's for</h2>
        <div className="rail" data-cursor="Drag">
          {stakeholders.map((s, i) => (
            <article className="card" key={s} data-reveal style={{ "--d": `${i * 0.08}s` }}>
              <span className="num">0{i + 1}</span><h3 className="display">{s}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* PHASES TEASER */}
      <section className="phases page-pad">
        <h2 className="display" data-reveal>Built in phases</h2>
        <div className="phase-grid">
          {phases.map((p) => (
            <Link to="/roadmap" key={p.n} className={`phase p${p.n}`} data-cursor="Open" data-reveal>
              <small>Phase {p.n}</small><h3 className="display">{p.name}</h3><p>{p.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div>{[...produce, ...produce].map((p, i) => <span key={i}>{p} •</span>)}</div>
      </div>

      {/* CTA */}
      <section className="cta page-pad">
        <h2 className="display" data-reveal>Join the early community</h2>
        <Link ref={cta} to="/join" className="btn big">Get in touch</Link>
      </section>
    </main>
  );
}

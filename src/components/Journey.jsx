import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// Illustrative journey from the project blueprint (a farmer lists 500 kg of tomatoes).
const steps = [
  ["List", "A farmer lists 500 kg of tomatoes with location, asking price and collection date."],
  ["Discover", "A buyer searches by product, location and quantity and finds the listing."],
  ["Enquire", "The buyer sends an enquiry or an offer."],
  ["Negotiate", "Both sides agree on price and terms, or keep talking."],
  ["Arrange", "Collection and transport are arranged."],
  ["Complete", "The order is marked complete after fulfilment."],
];

export default function Journey() {
  const root = useRef(null);
  useEffect(() => {
    // Pinned, scroll-driven story on desktop with motion allowed; a plain vertical list otherwise.
    const mm = gsap.matchMedia();
    mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
      const el = root.current;
      const items = el.querySelectorAll(".jstep");
      gsap.set(items, { opacity: 0.2, x: 60 });
      gsap.set(el.querySelector(".jfill"), { scaleY: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: `+=${steps.length * 70}%`, pin: true, scrub: 0.6 } });
      tl.to(el.querySelector(".jfill"), { scaleY: 1, ease: "none", duration: steps.length });
      items.forEach((it, i) => tl.to(it, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }, i));
    }, root);
    return () => mm.revert();
  }, []);

  return (
    <section className="journey page-pad" ref={root} aria-labelledby="journey-h">
      <div className="jwrap">
        <div>
          <small className="muted">The farmer journey</small>
          <h2 id="journey-h" className="display">From harvest to agreed order.</h2>
          <p className="lead">AgriLink supports the steps in between. It does not guarantee a buyer or a price.</p>
        </div>
        <ol className="jlist">
          <span className="jline" aria-hidden="true"><span className="jfill" /></span>
          {steps.map(([t, d], i) => <li className="jstep" key={t}><small>0{i + 1}</small><b className="display">{t}</b><span>{d}</span></li>)}
        </ol>
      </div>
    </section>
  );
}

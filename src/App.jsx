import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Preloader from "./components/Preloader.jsx";
import Cursor from "./components/Cursor.jsx";
import Nav from "./components/Nav.jsx";
import Home from "./pages/Home.jsx";
import { phaseOf } from "./lib/phase.js";

gsap.registerPlugin(ScrollTrigger);

// Route-level code splitting keeps the first load light for low-bandwidth users
const page = (name) => lazy(() => import(`./pages/${name}.jsx`));
const About = page("About"), Roadmap = page("Roadmap"), Join = page("Join"), Marketplace = page("Marketplace"),
  ListingDetail = page("ListingDetail"), Prices = page("Prices"), Auth = page("Auth"), Dashboard = page("Dashboard"),
  NewListing = page("NewListing"), Messages = page("Messages"), Logistics = page("Logistics"), Inputs = page("Inputs"),
  Trust = page("Trust"), Payments = page("Payments"), Insights = page("Insights");

const NotFound = () => <main className="page-pad page-head"><h1 className="display">Page not found</h1></main>;

export default function App() {
  const { pathname } = useLocation();
  const prev = useRef(pathname);
  const [curtain, setCurtain] = useState(false);
  const phase = phaseOf(pathname);

  // Smooth scroll, synced with ScrollTrigger (skipped for reduced motion)
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    let id;
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);

  // Phase accent for the cursor, and a curtain wipe tinted with the destination's phase colour.
  // Marketplace card to detail uses the shared-element transition instead, so no curtain there.
  useEffect(() => {
    document.body.dataset.phase = phase;
    const fam = (p) => p.startsWith("/marketplace");
    const skip = fam(prev.current) && fam(pathname);
    prev.current = pathname;
    window.scrollTo(0, 0);
    if (skip) return;
    setCurtain(true);
    const t = setTimeout(() => setCurtain(false), 650);
    return () => clearTimeout(t);
  }, [pathname, phase]);

  return (
    <>
      <Preloader />
      <Cursor />
      <Nav />
      <div className={`curtain ${curtain ? "on" : ""}`} style={{ background: `var(--p${phase || 1})` }} aria-hidden="true" />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/join" element={<Join />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ListingDetail />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/new-listing" element={<NewListing />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/inputs" element={<Inputs />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

import { useEffect, useRef, useState } from "react";

// Dot + lerp-lagging ring. Label comes from data-cursor="View|Drag|Open" on any element.
export default function Cursor() {
  const dot = useRef(null), ring = useRef(null);
  const [label, setLabel] = useState("");
  const [mode, setMode] = useState("");

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = 0, y = 0, rx = 0, ry = 0, id;
    const move = (e) => { x = e.clientX; y = e.clientY; };
    const over = (e) => {
      const t = e.target.closest("[data-cursor], a, button, p, h1, h2, h3");
      if (!t) { setLabel(""); setMode(""); return; }
      const d = t.dataset.cursor;
      if (d) { setLabel(d); setMode("label"); }
      else if (t.matches("a, button")) { setLabel(""); setMode("cta"); }
      else { setLabel(""); setMode("text"); }
    };
    const loop = () => {
      rx += (x - rx) * 0.15; ry += (y - ry) * 0.15;
      dot.current.style.transform = `translate(${x}px,${y}px)`;
      ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      id = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    loop();
    document.body.classList.add("has-cursor");
    return () => { cancelAnimationFrame(id); window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); document.body.classList.remove("has-cursor"); };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className={`cursor-ring ${mode}`}><span>{label}</span></div>
    </>
  );
}

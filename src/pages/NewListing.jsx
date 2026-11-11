import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth, ROLES } from "../context/Auth.jsx";
import { addListing } from "../data/store.js";

const steps = ["Product", "Quantity & price", "Location & timing", "Photos", "Review"];
const units = ["kg", "90kg bag", "crate", "tonne"];
const cats = ["Vegetables", "Fruit", "Cereals", "Legumes", "Other"];
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

export default function NewListing() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ product: "", category: "Vegetables", quantity: "", unit: "kg", price: "", location: "", availability: "now", date: "", about: "", images: [] });
  const [err, setErr] = useState("");
  if (!user) return <Navigate to="/auth" replace />;

  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const check = () => {
    if (step === 0 && !d.product.trim()) return "Please enter the product name.";
    if (step === 1 && (!(Number(d.quantity) > 0) || !(Number(d.price) > 0))) return "Enter a quantity and an asking price greater than zero.";
    if (step === 2 && (!d.location.trim() || (d.availability === "soon" && !d.date))) return "Enter the location, and a date if the produce is not available yet.";
    return "";
  };
  const next = () => { const e = check(); setErr(e); if (!e) setStep(step + 1); };
  const onFiles = (e) => setD({ ...d, images: [...e.target.files].slice(0, 4).map((f) => URL.createObjectURL(f)) }); // TODO: upload to Cloudinary and store returned URLs

  const publish = () => {
    const id = `u${Date.now()}`;
    // TODO: POST /api/listings
    addListing({
      id, product: d.product.trim(), category: d.category, quantity: Number(d.quantity), unit: d.unit, price: Number(d.price), location: d.location.trim(),
      availability: d.availability, availabilityText: d.availability === "now" ? "Available now" : `From ${d.date}`,
      seller: user.name, sellerType: ROLES.find((r) => r.id === user.role)?.label || "Seller", hue: hash(d.product), about: d.about || "No description added.",
    });
    nav(`/marketplace/${id}`);
  };

  return (
    <main className="page-pad newl">
      <header className="page-head"><small>Phase 1 · Create listing</small><h1 className="display">List your produce.</h1></header>
      <ol className="stepbar" aria-label="Progress">{steps.map((s, i) => <li key={s} className={i < step ? "done" : i === step ? "cur" : ""} aria-current={i === step ? "step" : undefined}>{s}</li>)}</ol>

      <div className="wizard" key={step}>
        {step === 0 && <>
          <div className="field"><label htmlFor="product">Product name</label><input id="product" value={d.product} onChange={set("product")} list="prods" /><datalist id="prods">{["Tomatoes", "Potatoes", "Maize", "Kale", "Avocados", "Onions"].map((p) => <option key={p} value={p} />)}</datalist></div>
          <div className="field"><label htmlFor="cat">Category</label><select id="cat" value={d.category} onChange={set("category")}>{cats.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label htmlFor="about">Description (optional)</label><textarea id="about" rows="3" value={d.about} onChange={set("about")} /></div>
        </>}
        {step === 1 && <>
          <div className="field"><label htmlFor="qty">Quantity</label><input id="qty" type="number" min="1" value={d.quantity} onChange={set("quantity")} /></div>
          <div className="field"><label htmlFor="unit">Unit</label><select id="unit" value={d.unit} onChange={set("unit")}>{units.map((u) => <option key={u}>{u}</option>)}</select></div>
          <div className="field"><label htmlFor="price">Asking price (KES per {d.unit})</label><input id="price" type="number" min="1" value={d.price} onChange={set("price")} /></div>
          <p className="note">This is your asking price. Buyers may negotiate, and it is not a guaranteed price.</p>
        </>}
        {step === 2 && <>
          <div className="field"><label htmlFor="loc">Location (county or town)</label><input id="loc" value={d.location} onChange={set("location")} /></div>
          <div className="field"><label htmlFor="av">Availability</label><select id="av" value={d.availability} onChange={set("availability")}><option value="now">Available now</option><option value="soon">Available from a date</option></select></div>
          {d.availability === "soon" && <div className="field"><label htmlFor="date">Available from</label><input id="date" type="date" value={d.date} onChange={set("date")} /></div>}
        </>}
        {step === 3 && <>
          <div className="field"><label htmlFor="img">Photos (up to 4, optional)</label><input id="img" type="file" accept="image/*" multiple onChange={onFiles} /></div>
          <div className="previews">{d.images.map((s) => <img key={s} src={s} alt="Selected produce preview" />)}</div>
        </>}
        {step === 4 && <dl className="review">
          {[["Product", d.product], ["Category", d.category], ["Quantity", `${d.quantity} ${d.unit}`], ["Asking price", `KES ${Number(d.price).toLocaleString()}/${d.unit}`], ["Location", d.location], ["Availability", d.availability === "now" ? "Available now" : `From ${d.date}`], ["Photos", `${d.images.length} selected`]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>}
        {err && <p className="err" role="alert">{err}</p>}
        <div className="wiz-actions">
          {step > 0 && <button className="btn ghost" onClick={() => { setErr(""); setStep(step - 1); }}>Back</button>}
          {step < 4 ? <button className="btn" onClick={next}>Continue</button> : <button className="btn big" onClick={publish}>Publish listing</button>}
        </div>
      </div>
    </main>
  );
}

import base from "./listings.json";

// Browser storage stands in for the database during the front-end phase.
// TODO: replace each function with a call to the Node/Express + PostgreSQL API.
const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid = (p = "id") => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const getMine = () => get("agrilink-listings", []);
export const getAllListings = () => [...getMine(), ...base];
export const addListing = (l) => set("agrilink-listings", [l, ...getMine()]);

export const defaultOrders = [
  { id: "o1", side: "seller", product: "Tomatoes", party: "Nairobi Fresh Mart", qty: "300 kg", agreed: "KES 60/kg", status: "requested" },
  { id: "o2", side: "seller", product: "Potatoes", party: "Kilimani Grocers", qty: "500 kg", agreed: "KES 44/kg", status: "accepted" },
  { id: "o3", side: "seller", product: "Kale", party: "Green Plate Restaurant", qty: "60 kg", agreed: "KES 28/kg", status: "completed" },
  { id: "o4", side: "buyer", product: "Maize", party: "Rono Cereals Aggregators", qty: "20 bags", agreed: "KES 3,600/bag", status: "accepted" },
  { id: "o5", side: "buyer", product: "Onions", party: "Olekina Produce", qty: "100 kg", agreed: "KES 70/kg", status: "requested" },
];
export const getOrders = () => get("agrilink-orders", defaultOrders);
export const saveOrders = (o) => set("agrilink-orders", o);

export const sampleEnquiries = {
  seller: [{ from: "Nairobi Fresh Mart", about: "Tomatoes", msg: "Can you deliver 300 kg on Friday?" }, { from: "Mama Mboga Network", about: "Kale", msg: "Is the price negotiable for weekly supply?" }],
  buyer: [{ from: "Mwangi Farmers Group", about: "Tomatoes", msg: "You asked about 200 kg. Awaiting reply." }],
};
export const savedSearches = ["Potatoes in Nyandarua", "Avocados, 500 kg or more"];

/* ---- Messaging (Phase 2, client-side real-time via localStorage + storage events) ---- */
// TODO: replace with WebSocket/SSE + REST API backed by Node/Express + PostgreSQL.
export const getConversations = () => get("agrilink-conversations", []);
export const saveConversations = (c) => set("agrilink-conversations", c);
export const getMessages = (cid) => get(`agrilink-msg-${cid}`, []);
export const saveMessages = (cid, msgs) => set(`agrilink-msg-${cid}`, msgs);

export function ensureConversation({ listingId, listingTitle, withName, startedBy }) {
  const all = getConversations();
  let c = all.find((x) => x.listingId === listingId && x.withName === withName && x.startedBy === startedBy);
  if (!c) {
    c = { id: uid("c"), listingId, listingTitle, withName, startedBy, createdAt: Date.now(), updatedAt: Date.now(), last: "" };
    saveConversations([c, ...all]);
  }
  return c;
}
export function sendMessage(cid, { from, text }) {
  const msg = { id: uid("m"), from, text, at: Date.now() };
  const msgs = [...getMessages(cid), msg];
  saveMessages(cid, msgs);
  const convs = getConversations().map((c) => c.id === cid ? { ...c, updatedAt: msg.at, last: text } : c);
  saveConversations(convs);
  try { new BroadcastChannel("agrilink-chat").postMessage({ type: "msg", cid }); } catch {}
  return msg;
}

/* ---- Logistics (Phase 2) ---- */
// TODO: replace with backend endpoints for transporter profiles, delivery requests, and quotations.
export const getDeliveryRequests = () => get("agrilink-deliveries", []);
export const saveDeliveryRequests = (r) => set("agrilink-deliveries", r);
export const addDeliveryRequest = (r) => { const req = { id: uid("d"), status: "open", quotes: [], createdAt: Date.now(), ...r }; saveDeliveryRequests([req, ...getDeliveryRequests()]); return req; };
export const addQuote = (reqId, q) => saveDeliveryRequests(getDeliveryRequests().map((r) => r.id === reqId ? { ...r, quotes: [...r.quotes, { id: uid("q"), ...q, at: Date.now() }] } : r));
export const chooseQuote = (reqId, qid) => saveDeliveryRequests(getDeliveryRequests().map((r) => r.id === reqId ? { ...r, chosenQuote: qid, status: "assigned" } : r));
export const setDeliveryStatus = (reqId, status) => saveDeliveryRequests(getDeliveryRequests().map((r) => r.id === reqId ? { ...r, status } : r));

/* ---- Inputs marketplace (Phase 2) ---- */
// TODO: replace with backend-backed supplier catalog and enquiry API.
export const defaultInputs = [
  { id: "i1", cat: "Seeds", name: "Tomato seed, 50 g pack", supplier: "GreenSprout Agrovet", location: "Nakuru", price: 450, unit: "pack", about: "Certified hybrid tomato seed." },
  { id: "i2", cat: "Seeds", name: "Maize seed, 2 kg bag", supplier: "Highland Seeds", location: "Eldoret", price: 620, unit: "bag", about: "Drought-tolerant variety." },
  { id: "i3", cat: "Fertilizer", name: "Planting fertilizer, 50 kg", supplier: "FarmCare Inputs", location: "Nyeri", price: 4800, unit: "bag", about: "DAP, suitable for planting." },
  { id: "i4", cat: "Fertilizer", name: "Top-dressing fertilizer, 50 kg", supplier: "FarmCare Inputs", location: "Nyeri", price: 4500, unit: "bag", about: "CAN, for top dressing." },
  { id: "i5", cat: "Equipment", name: "Knapsack sprayer, 16 L", supplier: "AgriTools Thika", location: "Thika", price: 3900, unit: "unit", about: "Manual sprayer with spare nozzles." },
  { id: "i6", cat: "Animal feed", name: "Dairy meal, 70 kg", supplier: "Valley Feeds", location: "Kiambu", price: 3200, unit: "bag", about: "Balanced dairy meal for lactating cows." },
];
export const getInputItems = () => get("agrilink-inputs", defaultInputs);
export const addInputItem = (item) => set("agrilink-inputs", [{ id: uid("i"), ...item }, ...getInputItems()]);
export const getInputEnquiries = () => get("agrilink-input-enquiries", []);
export const addInputEnquiry = (e) => set("agrilink-input-enquiries", [{ id: uid("ie"), at: Date.now(), ...e }, ...getInputEnquiries()]);

/* ---- Trust: reviews, verification, reports (Phase 2) ---- */
// TODO: replace with moderated backend services and admin workflows.
export const getReviews = (target) => get("agrilink-reviews", []).filter((r) => r.target === target);
export const addReview = (r) => set("agrilink-reviews", [{ id: uid("rv"), at: Date.now(), ...r }, ...get("agrilink-reviews", [])]);
export const getReports = () => get("agrilink-reports", []);
export const addReport = (r) => set("agrilink-reports", [{ id: uid("rp"), at: Date.now(), status: "open", ...r }, ...getReports()]);
export const getVerifications = () => get("agrilink-verifications", {});
export const requestVerification = (userEmail, type) => { const v = getVerifications(); const mine = v[userEmail] || []; if (!mine.find((x) => x.type === type)) mine.push({ type, status: "pending", at: Date.now() }); v[userEmail] = mine; set("agrilink-verifications", v); };
/* ---- Payments (Phase 3, simulated - NOT connected to M-PESA) ---- */
// TODO: replace with real M-PESA integration, reconciliation, and secure backend after validation.
export const getPayments = () => get("agrilink-payments", []);
export const savePayments = (p) => set("agrilink-payments", p);
export const createPayment = (p) => { const rec = { id: uid("pay"), status: "requested", ref: `SIM-${Math.floor(100000 + Math.random() * 900000)}`, createdAt: Date.now(), events: [{ label: "Payment request created", at: Date.now() }], ...p }; savePayments([rec, ...getPayments()]); return rec; };
export const updatePayment = (id, patch) => savePayments(getPayments().map((p) => p.id === id ? { ...p, ...patch } : p));
export const addPaymentEvent = (id, label) => savePayments(getPayments().map((p) => p.id === id ? { ...p, events: [...(p.events || []), { label, at: Date.now() }] } : p));

/* ---- Insights (Phase 3, derived from local/sample data) ---- */
// TODO: replace with backend analytics over real enquiries/orders and location data.
export const getInsightsPrefs = () => get("agrilink-insights-prefs", { county: "All", product: "All" });
export const saveInsightsPrefs = (p) => set("agrilink-insights-prefs", p);

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth.jsx";
import { getConversations, getMessages, sendMessage, ensureConversation } from "../data/store.js";
import useReveal from "../hooks/useReveal.js";

function fmt(t) { return new Date(t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
const ini = (n = "") => n.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

export default function Messages() {
  useReveal();
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [convs, setConvs] = useState(getConversations);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [nf, setNf] = useState({ with: "", topic: "" });
  const [demo] = useState([
    { id: "d1", from: "Mwangi Farmers Group", text: "Hello, is the 500 kg of tomatoes still available?", at: Date.now() - 300000 },
    { id: "d2", from: "You", text: "Yes, ready for collection from Friday.", at: Date.now() - 240000 },
    { id: "d3", from: "Mwangi Farmers Group", text: "Could we discuss KES 56/kg for the full amount?", at: Date.now() - 120000 },
  ]);

  const reload = () => { const c = getConversations().sort((a, b) => b.updatedAt - a.updatedAt); setConvs(c); return c; };

  useEffect(() => {
    const s = loc.state?.openConversation;
    if (s) {
      const c = ensureConversation({ listingId: s.listingId || "general", listingTitle: s.listingTitle || "Conversation", withName: s.withName || "Contact", startedBy: me });
      reload(); setActive(c.id); nav(loc.pathname, { replace: true, state: {} });
    }
  }, [loc.state]);

  useEffect(() => {
    const c = reload();
    if (c.length === 0 && user) {
      const seed = ensureConversation({ listingId: "welcome", listingTitle: "Welcome to AgriLink", withName: "AgriLink", startedBy: "AgriLink" });
      if (getMessages(seed.id).length === 0) {
        sendMessage(seed.id, { from: "AgriLink", text: "Welcome! Start by messaging a seller from any listing, or create a new chat here." });
        sendMessage(seed.id, { from: "AgriLink", text: "You can negotiate prices, agree on quantities, and keep a record of your conversations." });
      }
      const all = reload();
      setActive(all[0]?.id || seed.id);
      return;
    }
    if (!active && c[0]) setActive(c[0].id);
  }, [user]);
  useEffect(() => { if (!active) { setMsgs([]); return; } setMsgs(getMessages(active)); }, [active, convs.length]);
  useEffect(() => {
    const onStorage = (e) => { if (e.key?.startsWith("agrilink-msg-") || e.key === "agrilink-conversations") { reload(); if (active) setMsgs(getMessages(active)); } };
    let bc; try { bc = new BroadcastChannel("agrilink-chat"); bc.onmessage = () => { reload(); if (active) setMsgs(getMessages(active)); }; } catch {}
    addEventListener("storage", onStorage);
    return () => { removeEventListener("storage", onStorage); try { bc?.close(); } catch {} };
  }, [active]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const cur = useMemo(() => convs.find((c) => c.id === active), [convs, active]);

  const submit = (e) => {
    e.preventDefault(); const t = text.trim(); if (!t || !active) return;
    sendMessage(active, { from: me, text: t }); setText(""); reload(); setMsgs(getMessages(active));
  };

  const startNew = (e) => {
    e.preventDefault(); if (!nf.with.trim()) return;
    const c = ensureConversation({ listingId: "general-" + Date.now(), listingTitle: nf.topic.trim() || "General", withName: nf.with.trim(), startedBy: me });
    reload(); setActive(c.id); setNf({ with: "", topic: "" }); setNewOpen(false);
  };

  if (!user) {
    return (
      <main className="p2-page chat-page" id="main">
        <header className="p2-hero">
          <div><span className="phase-badge">Phase 2 · Messaging</span><h1 className="display">Conversations that move trade forward.</h1><p className="lead">Negotiate offers, agree on terms, and keep a clear record linked to each listing. Sign in to start chatting.</p><Link className="btn" to="/auth" style={{ marginTop: "1rem", display: "inline-block" }}>Sign in to chat</Link></div>
          <div className="p2-hero-art" aria-hidden="true"><span /><span /><span /></div>
        </header>
        <section className="chat-shell demo-shell" aria-label="Messaging preview">
          <div className="threads" aria-label="Sample inbox">
            <div className="threads-head"><h2 className="display">Inbox</h2></div>
            <ul className="thread-list">
              <li><div className="thread on"><span className="avatar sm" aria-hidden="true">MW</span><span className="thread-body"><b>Tomatoes · Kirinyaga</b><span>with Mwangi Farmers Group</span><small>Could we discuss KES 56/kg…</small></span></div></li>
              <li><div className="thread"><span className="avatar sm" aria-hidden="true">NF</span><span className="thread-body"><b>Potatoes · Nyandarua</b><span>with Nairobi Fresh Mart</span><small>Can you deliver 300 kg Friday?</small></span></div></li>
            </ul>
          </div>
          <div className="thread-view" aria-label="Sample conversation">
            <div className="chat-head"><span className="avatar" aria-hidden="true">MW</span><div><b>Tomatoes · Kirinyaga</b><span>with Mwangi Farmers Group · sample preview</span></div></div>
            <div className="bubbles" role="log" aria-label="Sample messages">
              {demo.map((m) => (
                <div key={m.id} className={`bubble-row ${m.from === "You" ? "me" : "them"}`}>
                  {m.from !== "You" && <span className="avatar sm" aria-hidden="true">MW</span>}
                  <div className={`bubble ${m.from === "You" ? "me" : "them"}`}><small className="bubble-meta">{m.from} · {fmt(m.at)}</small><p>{m.text}</p></div>
                </div>
              ))}
            </div>
            <div className="chat-foot demo-foot"><p>Sign in to send real messages and start new conversations.</p><Link className="btn" to="/auth">Sign in</Link></div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="p2-page chat-page" id="main">
      <header className="p2-hero">
        <div><span className="phase-badge">Phase 2 · Messaging</span><h1 className="display">Conversations that move trade forward.</h1><p className="lead">Negotiate offers, agree on terms, and keep a clear record linked to each listing. {/* TODO: WebSocket + REST API for cross-device delivery */}</p></div>
        <div className="p2-hero-art" aria-hidden="true"><span /><span /><span /></div>
      </header>

      <section className="chat-shell" aria-label="Messaging workspace">
        <div className="threads">
          <div className="threads-head"><h2 className="display" id="inbox-heading">Inbox</h2><button type="button" className="btn" onClick={() => setNewOpen(!newOpen)} aria-expanded={newOpen} aria-controls="new-chat-form">{newOpen ? "Close" : "New chat"}</button></div>
          {newOpen && (
            <form id="new-chat-form" className="new-chat" onSubmit={startNew}>
              <label className="sr-only" htmlFor="nc-with">Person or business</label>
              <input id="nc-with" placeholder="Person or business" value={nf.with} onChange={(e) => setNf({ ...nf, with: e.target.value })} required />
              <label className="sr-only" htmlFor="nc-topic">Topic or listing (optional)</label>
              <input id="nc-topic" placeholder="Topic or listing (optional)" value={nf.topic} onChange={(e) => setNf({ ...nf, topic: e.target.value })} />
              <button className="btn" type="submit">Start conversation</button>
            </form>
          )}
          {convs.length === 0 ? (
            <div className="threads-empty"><p>No conversations yet.</p><p className="muted">Open a listing and tap "Message seller", or start one here.</p></div>
          ) : (
            <ul className="thread-list" aria-labelledby="inbox-heading">
              {convs.map((c) => (
                <li key={c.id}>
                  <button type="button" className={`thread ${c.id === active ? "on" : ""}`} onClick={() => setActive(c.id)} aria-current={c.id === active ? "true" : undefined}>
                    <span className="avatar sm" aria-hidden="true">{ini(c.withName)}</span>
                    <span className="thread-body"><b>{c.listingTitle}</b><span>with {c.withName}</span><small>{c.last ? c.last.slice(0, 42) : "Say hello"} · {fmt(c.updatedAt)}</small></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="thread-view" aria-label={cur ? `Conversation: ${cur.listingTitle}` : "Conversation"}>
          {!cur ? (
            <div className="empty-thread"><div className="empty-mark" aria-hidden="true" /><p className="display">Select a conversation</p><p className="muted">Your messages will appear here.</p></div>
          ) : (
            <>
              <div className="chat-head">
                <span className="avatar" aria-hidden="true">{ini(cur.withName)}</span>
                <div><b>{cur.listingTitle}</b><span>with {cur.withName} · started by {cur.startedBy}</span></div>
              </div>
              <div className="bubbles" role="log" aria-live="polite" aria-relevant="additions" aria-label="Messages">
                {msgs.length === 0 && <div className="day-sep"><span>No messages yet — start the conversation</span></div>}
                {msgs.map((m) => (
                  <div key={m.id} className={`bubble-row ${m.from === me ? "me" : "them"}`}>
                    {m.from !== me && <span className="avatar sm" aria-hidden="true">{ini(m.from)}</span>}
                    <div className={`bubble ${m.from === me ? "me" : "them"}`}><small className="bubble-meta">{m.from} · {fmt(m.at)}</small><p>{m.text}</p></div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form className="chat-foot" onSubmit={submit}>
                <label className="sr-only" htmlFor="msg-input">Write a message</label>
                <input id="msg-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message or offer…" autoComplete="off" />
                <button className="send-btn" type="submit" disabled={!text.trim()}>Send</button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

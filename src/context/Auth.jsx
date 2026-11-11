import { createContext, useContext, useState } from "react";

// MOCK AUTH for the front-end phase. No passwords are stored.
// TODO: replace with real auth (Node/Express + JWT or secure sessions, role-based access control).
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("agrilink-user")); } catch { return null; } });
  const login = (u) => { localStorage.setItem("agrilink-user", JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem("agrilink-user"); setUser(null); };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export const ROLES = [
  { id: "farmer", label: "Farmer", desc: "List produce and respond to buyers." },
  { id: "buyer", label: "Buyer", desc: "Search produce and contact sellers." },
  { id: "wholesaler", label: "Wholesaler or retailer", desc: "Source in quantity and compare offers." },
  { id: "broker", label: "Broker or aggregator", desc: "Connect supply and demand." },
];
export const isSeller = (role) => role === "farmer" || role === "broker";

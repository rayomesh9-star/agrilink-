import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/Auth.jsx";
import "./styles/tokens.css";

if (sessionStorage.getItem("agrilink-seen")) document.body.classList.add("seen");
createRoot(document.getElementById("root")).render(
  <BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>
);

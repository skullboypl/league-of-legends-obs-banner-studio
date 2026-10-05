import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { Widget } from "./Widget";
import "./styles.css";

const isWidget =
  location.pathname === "/widget" || location.pathname.startsWith("/widget/");
document.documentElement.classList.toggle("widget", isWidget);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{isWidget ? <Widget /> : <App />}</React.StrictMode>,
);

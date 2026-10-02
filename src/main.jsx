import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./diana-master.jsx";
import "./diana-master.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

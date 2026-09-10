import { useState } from "react";
import { useBudget } from "../context/BudgetContext.jsx";
import { CloudIcon, ChevronDownIcon } from "./Icons.jsx";
import "./Header.css";

const MONTHS = [
  "Enero 2024", "Febrero 2024", "Marzo 2024", "Abril 2024",
  "Mayo 2024", "Junio 2024", "Julio 2024", "Agosto 2024",
  "Septiembre 2024", "Octubre 2024", "Noviembre 2024", "Diciembre 2024",
  "Enero 2025", "Febrero 2025", "Marzo 2025"
];

export default function Header() {
  const { syncStatus } = useBudget();
  const [selectedMonth, setSelectedMonth] = useState("Octubre 2024");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="dashboard-topbar">
      <div className="topbar-brand">
        <div className="topbar-logo">
          <span>$</span>
        </div>
        <div className="topbar-titles">
          <span className="topbar-subtitle">PLANIFICADOR FINANCIERO</span>
          <h1 className="topbar-title">Control Presupuestario</h1>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Sync Status Badge */}
        <div className={`sync-pill ${syncStatus}`} id="sync-pill">
          <span className="sync-dot" />
          <span className="sync-text">
            {syncStatus === "saving" && "Guardando..."}
            {syncStatus === "saved" && "Sincronizado con la nube"}
            {syncStatus === "error" && "Sin conexión (Local)"}
          </span>
          <CloudIcon size={16} className="sync-cloud-icon" />
        </div>

        {/* Month Selector */}
        <div className="month-selector-wrapper">
          <button
            className="month-selector-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            id="month-selector-btn"
            type="button"
          >
            <span>{selectedMonth}</span>
            <ChevronDownIcon size={14} className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="month-dropdown-menu">
              {MONTHS.map((m) => (
                <button
                  key={m}
                  className={`month-option ${m === selectedMonth ? "active" : ""}`}
                  onClick={() => {
                    setSelectedMonth(m);
                    setIsDropdownOpen(false);
                  }}
                  type="button"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

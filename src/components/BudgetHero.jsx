import { useState } from "react";
import { useBudget } from "../context/BudgetContext.jsx";
import { formatCurrency } from "../utils/formatters.js";
import { CheckIcon, ExportIcon, PlusIcon, MoreIcon } from "./Icons.jsx";
import "./BudgetHero.css";

export default function BudgetHero({ onNewCategory }) {
  const { categories, totalIncome, totalExpenses, remainingBalance, dispatch } = useBudget();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isBalanced = remainingBalance === 0;

  // Exportar presupuesto a CSV
  const handleExportCSV = () => {
    const rows = [
      ["Categoría", "Tipo", "Presupuestado", "Proporción (% Sueldo)", "Diferencia"],
    ];
    categories.forEach((c) => {
      const pct = totalIncome > 0 ? ((c.budgeted / totalIncome) * 100).toFixed(1) + "%" : "0%";
      rows.push([`"${c.name}"`, `"${c.type || "Gasto"}"`, c.budgeted, pct, "-"]);
    });
    rows.push([
      "\"Sueldo Cuadre\"",
      "\"Total Asignado\"",
      totalExpenses,
      "100%",
      remainingBalance,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `presupuesto_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (window.confirm("¿Deseas restablecer los datos al presupuesto base de la plantilla?")) {
      dispatch({ type: "RESET" });
      setShowMoreMenu(false);
    }
  };

  return (
    <div className="budget-hero-section" id="budget-hero">
      <div className="hero-left-block">
        <div className="hero-title-row">
          <h2 className="hero-title">Resumen del Presupuesto</h2>

          {/* Badge Balanceado */}
          {isBalanced ? (
            <span className="balance-pill-badge balanced">
              <CheckIcon size={12} />
              <span>Presupuesto Balanceado (Cuadrado a Cero)</span>
            </span>
          ) : remainingBalance > 0 ? (
            <span className="balance-pill-badge surplus">
              <span>Superávit disponible: {formatCurrency(remainingBalance)}</span>
            </span>
          ) : (
            <span className="balance-pill-badge deficit">
              <span>Déficit: {formatCurrency(remainingBalance)}</span>
            </span>
          )}
        </div>

        <p className="hero-subtitle">
          Cada peso tiene un propósito. Ingresos totales asignados con exactitud a gastos y ahorros.
        </p>
      </div>

      <div className="hero-right-actions">
        {/* Exportar */}
        <button
          className="hero-btn btn-export"
          onClick={handleExportCSV}
          id="btn-export-budget"
          type="button"
        >
          <ExportIcon size={14} />
          <span>Exportar</span>
        </button>

        {/* Nueva Categoría */}
        <button
          className="hero-btn btn-new-category"
          onClick={onNewCategory}
          id="btn-new-category"
          type="button"
        >
          <PlusIcon size={14} />
          <span>Nueva Categoría</span>
        </button>

        {/* Botón Más opciones */}
        <div className="more-menu-wrapper">
          <button
            className="hero-btn btn-more"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            id="btn-hero-more"
            type="button"
            aria-label="Más opciones"
          >
            <MoreIcon size={15} />
          </button>

          {showMoreMenu && (
            <div className="hero-dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  window.print();
                  setShowMoreMenu(false);
                }}
                type="button"
              >
                Imprimir reporte
              </button>
              <button
                className="dropdown-item text-danger"
                onClick={handleReset}
                type="button"
              >
                Restablecer plantilla
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

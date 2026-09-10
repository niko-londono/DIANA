import { useBudget, getCategoryMeta } from "../context/BudgetContext.jsx";
import { formatCurrency } from "../utils/formatters.js";
import { CategoryIcon } from "./Icons.jsx";
import "./MetricCards.css";

export default function MetricCards() {
  const { categories, totalIncome } = useBudget();

  // 1. Sueldo (Ingreso Base)
  const sueldoCat = categories.find((c) => c.id === "sueldo") || {
    id: "sueldo",
    name: "Sueldo",
    budgeted: totalIncome || 17000
  };

  // 2. Categorías principales de gastos
  const expenseCategories = categories.filter(
    (c) => c.parentId === null && c.id !== "sueldo"
  );

  // Seleccionar hasta 3 categorías para las tarjetas 2, 3 y 4
  const displayExpenses = expenseCategories.slice(0, 3);

  const getPercent = (amount) => {
    if (!totalIncome || totalIncome <= 0) return "0%";
    return ((amount / totalIncome) * 100).toFixed(1) + "%";
  };

  return (
    <div className="metric-cards-grid" id="metric-cards">
      {/* Tarjeta 1: Ingreso Base */}
      <div className="metric-card card-income" id="metric-card-income">
        <div className="card-top-row">
          <span className="card-label">INGRESO BASE (SUELDO)</span>
          <div className="card-icon-box bg-emerald-light text-emerald">
            <CategoryIcon name="cash" size={18} />
          </div>
        </div>
        <div className="card-amount">{formatCurrency(sueldoCat.budgeted)}</div>
        <div className="card-subtext">
          <strong className="highlight-emerald">100%</strong>
          <span>Total disponible mensual</span>
        </div>
      </div>

      {/* Tarjetas 2, 3, 4: Principales categorías de gastos */}
      {displayExpenses.map((cat, idx) => {
        const meta = getCategoryMeta(cat);
        const percent = getPercent(cat.budgeted);

        // Subtítulos descriptivos según el tipo
        let subLabel = "del total del sueldo";
        if (cat.name.toLowerCase().includes("viaje")) subLabel = "Fondo de experiencias";
        else if (cat.name.toLowerCase().includes("ahorro")) subLabel = "Inversión y emergencias";
        else if (meta.type === "Gasto Fijo") subLabel = "del total del sueldo";

        // Título en mayúsculas estilo screenshot
        let cardTitle = cat.name.toUpperCase();
        if (cat.id === "gastos-m" || cat.name.toLowerCase() === "gastos m") {
          cardTitle = "GASTOS FIJOS (GASTOS M)";
        } else if (cat.name.toLowerCase().includes("viaje")) {
          cardTitle = "VIAJES & VACACIONES";
        } else if (cat.name.toLowerCase().includes("ahorro")) {
          cardTitle = "FONDO DE AHORRO";
        }

        const colorClasses = [
          { box: "bg-indigo-light text-indigo", highlight: "highlight-indigo" },
          { box: "bg-cyan-light text-cyan", highlight: "highlight-cyan" },
          { box: "bg-purple-light text-purple", highlight: "highlight-purple" },
        ];
        const styleTheme = colorClasses[idx % colorClasses.length];

        return (
          <div key={cat.id} className="metric-card" id={`metric-card-${cat.id}`}>
            <div className="card-top-row">
              <span className="card-label">{cardTitle}</span>
              <div className={`card-icon-box ${styleTheme.box}`}>
                <CategoryIcon name={meta.icon} size={18} />
              </div>
            </div>
            <div className="card-amount">{formatCurrency(cat.budgeted)}</div>
            <div className="card-subtext">
              <strong className={styleTheme.highlight}>{percent}</strong>
              <span>{subLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

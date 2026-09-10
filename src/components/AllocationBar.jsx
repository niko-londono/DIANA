import { useBudget, getCategoryMeta } from "../context/BudgetContext.jsx";
import { formatCurrency } from "../utils/formatters.js";
import "./AllocationBar.css";

export default function AllocationBar() {
  const { categories, totalIncome, totalExpenses } = useBudget();

  const expenseCategories = categories.filter(
    (c) => c.parentId === null && c.id !== "sueldo"
  );

  const totalAllocatedPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const is100 = Math.abs(totalAllocatedPercent - 100) < 0.1;

  // Paleta de colores para los segmentos de la barra
  const COLOR_PALETTE = [
    { color: "#6366f1", label: "Gastos M" },
    { color: "#06b6d4", label: "Viajes" },
    { color: "#a855f7", label: "Ahorro" },
    { color: "#f59e0b", label: "Otros" },
    { color: "#ec4899", label: "Extra" },
  ];

  return (
    <div className="allocation-card" id="allocation-distribution">
      <div className="allocation-header">
        <div className="allocation-title-group">
          <span className="allocation-title">Distribución de Asignación</span>
          <span className="allocation-subtitle">
            ({formatCurrency(totalExpenses)} distribuidos al {totalAllocatedPercent.toFixed(0)}%)
          </span>
        </div>

        {/* Leyenda a la derecha */}
        <div className="allocation-legends">
          {expenseCategories.map((cat, idx) => {
            const pct = totalIncome > 0 ? ((cat.budgeted / totalIncome) * 100).toFixed(1) : "0.0";
            const color = COLOR_PALETTE[idx % COLOR_PALETTE.length].color;
            // Short label
            let shortName = cat.name;
            if (cat.name.toLowerCase().includes("viaje")) shortName = "Viajes";
            else if (cat.name.toLowerCase().includes("ahorro")) shortName = "Ahorro";

            return (
              <div key={cat.id} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: color }} />
                <span className="legend-text">
                  {shortName} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de progreso multisegmento */}
      <div className="multi-progress-bar">
        {expenseCategories.map((cat, idx) => {
          const widthPct = totalIncome > 0 ? (cat.budgeted / totalIncome) * 100 : 0;
          const color = COLOR_PALETTE[idx % COLOR_PALETTE.length].color;

          return (
            <div
              key={cat.id}
              className="progress-segment"
              style={{
                width: `${widthPct}%`,
                backgroundColor: color,
              }}
              title={`${cat.name}: ${widthPct.toFixed(1)}%`}
            />
          );
        })}
      </div>
    </div>
  );
}

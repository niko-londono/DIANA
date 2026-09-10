import { useState } from "react";
import { useBudget } from "../context/BudgetContext.jsx";
import { formatCurrency, parseCurrency } from "../utils/formatters.js";
import AddCategoryModal from "./AddCategoryModal.jsx";
import "./BudgetTable.css";

// Paleta de colores para las categorías (se asignan en orden)
const ROW_COLORS = [
  { bg: "rgba(209, 250, 229, 0.5)", border: "rgba(16, 185, 129, 0.12)" },  // verde
  { bg: "rgba(254, 243, 199, 0.5)", border: "rgba(245, 158, 11, 0.12)" },  // naranja
  { bg: "rgba(237, 233, 254, 0.5)", border: "rgba(139, 92, 246, 0.12)" },  // púrpura
  { bg: "rgba(254, 226, 226, 0.5)", border: "rgba(239, 68, 68, 0.12)" },   // rosa
  { bg: "rgba(219, 234, 254, 0.5)", border: "rgba(59, 130, 246, 0.12)" },  // azul
  { bg: "rgba(252, 231, 243, 0.5)", border: "rgba(236, 72, 153, 0.12)" },  // rosa claro
  { bg: "rgba(240, 253, 244, 0.5)", border: "rgba(34, 197, 94, 0.12)" },   // verde claro
];

export default function BudgetTable() {
  const { categories, totalIncome, totalExpenses, remainingBalance, dispatch, syncStatus } = useBudget();
  const [showModal, setShowModal] = useState(false);

  const parentCategories = categories.filter((c) => c.parentId === null && c.id !== "sueldo");
  const getChildren = (parentId) => categories.filter((c) => c.parentId === parentId);

  const handleBudgetChange = (id, value) => {
    dispatch({ type: "UPDATE_BUDGET", payload: { id, budgeted: parseCurrency(value) } });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar esta categoría?")) {
      dispatch({ type: "DELETE_CATEGORY", payload: { id } });
    }
  };

  const handleToggle = (id) => {
    dispatch({ type: "TOGGLE_EXPAND", payload: { id } });
  };

  // Forzar cast numérico para manejar strings provenientes de Google Sheets
  const getNumeric = (val) => Number(val) || 0;

  const getDiffData = (parent) => {
    const children = getChildren(parent.id);
    if (children.length === 0) return { value: "-", cls: "neutral" };
    const childrenTotal = children.reduce((sum, c) => sum + getNumeric(c.budgeted), 0);
    const diff = getNumeric(parent.budgeted) - childrenTotal;
    const cls = diff === 0 ? "zero" : diff > 0 ? "positive" : "negative";
    return { value: formatCurrency(diff), cls };
  };

  const renderParentRow = (cat, colorIndex) => {
    const children = getChildren(cat.id);
    const hasChildren = children.length > 0;
    const diff = getDiffData(cat);
    const color = ROW_COLORS[colorIndex % ROW_COLORS.length];

    return (
      <tr
        key={cat.id}
        style={hasChildren ? { backgroundColor: color.bg } : {}}
        className="cat-parent-row"
      >
        <td>
          <div className="category-cell">
            {hasChildren ? (
              <button
                className={`expand-toggle ${cat.expanded ? "expanded" : ""}`}
                onClick={() => handleToggle(cat.id)}
                aria-label={cat.expanded ? "Contraer" : "Expandir"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ) : (
              <span style={{ width: 22 }} />
            )}
            <span className={`category-name ${hasChildren ? "is-parent" : ""}`}>{cat.name}</span>
            {cat.canDelete && (
              <button className="delete-btn" onClick={() => handleDelete(cat.id)} aria-label="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </td>
        <td>
          <div className="budget-cell">
            <span className="dollar-sign">$</span>
            <input
              type="number"
              className="budget-input"
              defaultValue={getNumeric(cat.budgeted)}
              key={cat.budgeted} // fuerza re-render si cambia el valor
              onBlur={(e) => handleBudgetChange(cat.id, e.target.value)}
              id={`budget-input-${cat.id}`}
            />
          </div>
        </td>
        <td>
          <span className={`diff-value ${diff.cls}`}>{diff.value}</span>
        </td>
      </tr>
    );
  };

  const renderChildRow = (child, color) => (
    <tr key={child.id} style={{ backgroundColor: color.bg }} className="cat-child-row">
      <td>
        <div className="category-cell is-child">
          <span className="category-name is-child-name">{child.name}</span>
          {child.canDelete && (
            <button className="delete-btn" onClick={() => handleDelete(child.id)} aria-label="Eliminar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </td>
      <td>
        <div className="budget-cell">
          <span className="dollar-sign">$</span>
          <input
            type="number"
            className="budget-input"
            defaultValue={getNumeric(child.budgeted)}
            key={child.budgeted}
            onBlur={(e) => handleBudgetChange(child.id, e.target.value)}
            id={`budget-input-${child.id}`}
          />
        </div>
      </td>
      <td>
        <span className="diff-value neutral">-</span>
      </td>
    </tr>
  );

  // Sueldo row
  const sueldoCat = categories.find((c) => c.id === "sueldo");

  return (
    <section className="budget-section" id="budget-overview">
      <div className="budget-header">
        <h2 className="budget-title">Budget Overview</h2>
        <div className="budget-actions">
          <button className="btn-add-category" onClick={() => setShowModal(true)} id="btn-add-category">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar Categoría
          </button>

          {/* Sync cloud icon — pequeño, en la barra de acciones */}
          <div className={`sync-cloud-btn ${syncStatus}`} id="sync-cloud" title={
            syncStatus === "saving" ? "Guardando..." :
            syncStatus === "saved" ? "Guardado en la nube" :
            "Error al guardar"
          }>
            {syncStatus === "saving" ? (
              <svg className="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.23 3.23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                {syncStatus === "saved" && <polyline points="9 13 11 15 15 11" />}
              </svg>
            )}
          </div>

          <button className="btn-icon" aria-label="Más opciones" id="btn-more">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="12" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      <table className="budget-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Budgeted</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          {/* Sueldo row */}
          {sueldoCat && (
            <tr key="sueldo">
              <td>
                <div className="category-cell">
                  <span style={{ width: 22 }} />
                  <span className="category-name is-parent">{sueldoCat.name}</span>
                </div>
              </td>
              <td>
                <div className="budget-cell">
                  <span className="dollar-sign">$</span>
                  <input
                    type="number"
                    className="budget-input"
                    defaultValue={getNumeric(sueldoCat.budgeted)}
                    key={sueldoCat.budgeted}
                    onBlur={(e) => handleBudgetChange(sueldoCat.id, e.target.value)}
                    id="budget-input-sueldo"
                  />
                </div>
              </td>
              <td>
                <span className="diff-value zero">$0.00</span>
              </td>
            </tr>
          )}

          {/* Parent categories + children con colores */}
          {parentCategories.map((cat, colorIndex) => {
            const children = getChildren(cat.id);
            const color = ROW_COLORS[colorIndex % ROW_COLORS.length];
            return [
              renderParentRow(cat, colorIndex),
              ...(cat.expanded ? children.map((child) => renderChildRow(child, color)) : []),
            ];
          })}

          {/* Sueldo Cuadre */}
          <tr className="summary-row">
            <td>
              <div className="category-cell">
                <span style={{ width: 22 }} />
                <span>Sueldo Cuadre</span>
              </div>
            </td>
            <td>
              <div className="budget-cell">
                <strong>{formatCurrency(totalExpenses)}</strong>
              </div>
            </td>
            <td>
              <span className={`diff-value ${remainingBalance >= 0 ? "positive" : "negative"}`}>
                {formatCurrency(remainingBalance)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <AddCategoryModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </section>
  );
}

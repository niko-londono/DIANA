import { useState } from "react";
import { useBudget } from "../context/BudgetContext.jsx";
import { formatCurrency, parseCurrency } from "../utils/formatters.js";
import AddCategoryModal from "./AddCategoryModal.jsx";
import "./BudgetTable.css";

export default function BudgetTable() {
  const { categories, totalIncome, totalExpenses, remainingBalance, dispatch } = useBudget();
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

  const getDiffClass = (parent) => {
    const children = getChildren(parent.id);
    const childrenTotal = children.reduce((sum, c) => sum + c.budgeted, 0);
    const diff = parent.budgeted - childrenTotal;

    if (children.length === 0) return "neutral";
    if (diff === 0) return "zero";
    if (diff > 0) return "positive";
    return "negative";
  };

  const getDiffValue = (parent) => {
    const children = getChildren(parent.id);
    if (children.length === 0) return "-";
    const childrenTotal = children.reduce((sum, c) => sum + c.budgeted, 0);
    const diff = parent.budgeted - childrenTotal;
    return formatCurrency(diff);
  };

  const renderParentRow = (cat) => {
    const children = getChildren(cat.id);
    const hasChildren = children.length > 0;

    return (
      <tr key={cat.id} className={cat.expanded && hasChildren ? "row-highlighted" : ""}>
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
              <button className="delete-btn" onClick={() => handleDelete(cat.id)} aria-label="Eliminar categoría">
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
              defaultValue={cat.budgeted}
              onBlur={(e) => handleBudgetChange(cat.id, e.target.value)}
              id={`budget-input-${cat.id}`}
            />
          </div>
        </td>
        <td>
          <span className={`diff-value ${getDiffClass(cat)}`}>{getDiffValue(cat)}</span>
        </td>
      </tr>
    );
  };

  const renderChildRow = (child) => (
    <tr key={child.id}>
      <td>
        <div className="category-cell is-child">
          <span className="category-name is-child-name">{child.name}</span>
          {child.canDelete && (
            <button className="delete-btn" onClick={() => handleDelete(child.id)} aria-label="Eliminar subcategoría">
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
            defaultValue={child.budgeted}
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
          <button className="btn-icon" aria-label="Refrescar" id="btn-refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
          <button className="btn-icon" aria-label="Más opciones" id="btn-more">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
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
          {categories
            .filter((c) => c.id === "sueldo")
            .map((cat) => (
              <tr key={cat.id}>
                <td>
                  <div className="category-cell">
                    <span style={{ width: 22 }} />
                    <span className="category-name is-parent">{cat.name}</span>
                  </div>
                </td>
                <td>
                  <div className="budget-cell">
                    <span className="dollar-sign">$</span>
                    <input
                      type="number"
                      className="budget-input"
                      defaultValue={cat.budgeted}
                      onBlur={(e) => handleBudgetChange(cat.id, e.target.value)}
                      id={`budget-input-${cat.id}`}
                    />
                  </div>
                </td>
                <td>
                  <span className="diff-value zero">$0.00</span>
                </td>
              </tr>
            ))}

          {/* Parent categories and their children */}
          {parentCategories.map((cat) => {
            const children = getChildren(cat.id);
            return [
              renderParentRow(cat),
              ...(cat.expanded ? children.map(renderChildRow) : []),
            ];
          })}

          {/* Summary row */}
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

      <AddCategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </section>
  );
}

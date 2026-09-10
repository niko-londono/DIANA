import { useState, useMemo } from "react";
import { useBudget, getCategoryMeta } from "../context/BudgetContext.jsx";
import { formatCurrency } from "../utils/formatters.js";
import { CategoryIcon, EditIcon, TrashIcon, SearchIcon, CheckIcon } from "./Icons.jsx";
import "./BudgetTable.css";

export default function BudgetTable({ onEditCategory }) {
  const { categories, totalIncome, totalExpenses, remainingBalance, dispatch } = useBudget();
  const [searchQuery, setSearchQuery] = useState("");

  const parentCategories = useMemo(
    () => categories.filter((c) => c.parentId === null && c.id !== "sueldo"),
    [categories]
  );

  const getChildren = (parentId) => categories.filter((c) => c.parentId === parentId);

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) {
      dispatch({ type: "DELETE_CATEGORY", payload: { id } });
    }
  };

  const handleToggle = (id) => {
    dispatch({ type: "TOGGLE_EXPAND", payload: { id } });
  };

  // Sueldo
  const sueldoCat = categories.find((c) => c.id === "sueldo") || {
    id: "sueldo",
    name: "Sueldo",
    budgeted: totalIncome || 17000,
    type: "Ingreso Base",
    subtext: "Ingreso recurrente de nómina",
    icon: "cash",
  };

  const getNumeric = (val) => Number(val) || 0;

  const getPercent = (amount) => {
    if (!totalIncome || totalIncome <= 0) return "0.0%";
    return ((getNumeric(amount) / totalIncome) * 100).toFixed(1) + "%";
  };

  const getPercentNum = (amount) => {
    if (!totalIncome || totalIncome <= 0) return 0;
    return Math.min(100, Math.max(0, (getNumeric(amount) / totalIncome) * 100));
  };

  // Filtrado por buscador
  const filteredParents = useMemo(() => {
    if (!searchQuery.trim()) return parentCategories;
    const q = searchQuery.toLowerCase();
    return parentCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        (cat.type && cat.type.toLowerCase().includes(q)) ||
        (cat.subtext && cat.subtext.toLowerCase().includes(q)) ||
        getChildren(cat.id).some((ch) => ch.name.toLowerCase().includes(q))
    );
  }, [parentCategories, searchQuery]);

  const showSueldo = !searchQuery.trim() || sueldoCat.name.toLowerCase().includes(searchQuery.toLowerCase());

  // Diferencia para categorías con hijos
  const getCategoryDiff = (parent) => {
    const children = getChildren(parent.id);
    if (children.length === 0) return { display: "-", isZero: false };
    const childrenTotal = children.reduce((sum, c) => sum + getNumeric(c.budgeted), 0);
    const diff = getNumeric(parent.budgeted) - childrenTotal;
    return {
      display: formatCurrency(diff),
      isZero: diff === 0,
      diff,
    };
  };

  const isBalanced = remainingBalance === 0;
  const activeRecordsCount = categories.length;

  return (
    <div className="budget-table-card" id="budget-table-card">
      {/* Header con buscador */}
      <div className="table-card-header">
        <div className="table-header-titles">
          <h2 className="table-card-title">Desglose de Categorías</h2>
          <p className="table-card-subtitle">
            Revisa la asignación presupuestaria y su balance contra el ingreso principal.
          </p>
        </div>

        <div className="table-search-box">
          <SearchIcon className="search-icon" size={15} />
          <input
            type="text"
            className="table-search-input"
            placeholder="Filtrar categorías..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-categories"
          />
        </div>
      </div>

      {/* Tabla principal */}
      <div className="table-responsive">
        <table className="categories-table">
          <thead>
            <tr>
              <th className="th-category">CATEGORÍA</th>
              <th className="th-type">TIPO</th>
              <th className="th-budgeted">PRESUPUESTADO</th>
              <th className="th-proportion">PROPORCIÓN (% SUELDO)</th>
              <th className="th-difference">DIFERENCIA</th>
              <th className="th-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {/* Fila 1: Sueldo (Ingreso Base) */}
            {showSueldo && (
              <tr className="table-row row-sueldo" id="row-sueldo">
                <td>
                  <div className="category-cell-content">
                    <div className="cat-icon-container bg-emerald-light text-emerald">
                      <CategoryIcon name="cash" size={18} />
                    </div>
                    <div className="cat-text-container">
                      <span className="cat-main-name">{sueldoCat.name}</span>
                      <span className="cat-subtext-desc">{sueldoCat.subtext || "Ingreso recurrente de nómina"}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="type-badge badge-income">Ingreso Base</span>
                </td>
                <td className="cell-budgeted">
                  <strong>{formatCurrency(sueldoCat.budgeted)}</strong>
                </td>
                <td>
                  <div className="proportion-cell">
                    <div className="bar-track">
                      <div className="bar-fill fill-emerald" style={{ width: "100%" }} />
                    </div>
                    <span className="proportion-text">100%</span>
                  </div>
                </td>
                <td className="cell-difference">
                  <span className="diff-pill-badge diff-zero">
                    <CheckIcon size={12} /> $0.00
                  </span>
                </td>
                <td className="cell-actions">
                  <button
                    className="action-btn-icon edit"
                    onClick={() => onEditCategory(sueldoCat)}
                    title="Editar Sueldo"
                    type="button"
                  >
                    <EditIcon size={15} />
                  </button>
                </td>
              </tr>
            )}

            {/* Filas de Categorías de Gastos */}
            {filteredParents.map((cat) => {
              const meta = getCategoryMeta(cat);
              const children = getChildren(cat.id);
              const hasChildren = children.length > 0;
              const diffData = getCategoryDiff(cat);
              const percentStr = getPercent(cat.budgeted);
              const percentNum = getPercentNum(cat.budgeted);

              return (
                <tr key={cat.id} className="table-row" id={`row-${cat.id}`}>
                  <td>
                    <div className="category-cell-content">
                      <div
                        className="cat-icon-container"
                        style={{ backgroundColor: meta.bgColor, color: meta.color }}
                      >
                        <CategoryIcon name={meta.icon} size={18} />
                      </div>
                      <div className="cat-text-container">
                        <div className="cat-name-wrapper">
                          {hasChildren && (
                            <button
                              className={`collapse-toggle-btn ${cat.expanded ? "expanded" : ""}`}
                              onClick={() => handleToggle(cat.id)}
                              type="button"
                              title={cat.expanded ? "Contraer subcategorías" : "Expandir subcategorías"}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          )}
                          <span className="cat-main-name">{cat.name}</span>
                        </div>
                        <span className="cat-subtext-desc">{meta.subtext}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${meta.badgeCls}`}>{meta.type}</span>
                  </td>
                  <td className="cell-budgeted">
                    <strong>{formatCurrency(cat.budgeted)}</strong>
                  </td>
                  <td>
                    <div className="proportion-cell">
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${percentNum}%`,
                            backgroundColor: meta.color,
                          }}
                        />
                      </div>
                      <span className="proportion-text">{percentStr}</span>
                    </div>
                  </td>
                  <td className="cell-difference">
                    {diffData.display === "-" ? (
                      <span className="diff-dash">-</span>
                    ) : (
                      <span className={`diff-pill-badge ${diffData.isZero ? "diff-zero" : "diff-warn"}`}>
                        {diffData.display}
                      </span>
                    )}
                  </td>
                  <td className="cell-actions">
                    <button
                      className="action-btn-icon edit"
                      onClick={() => onEditCategory(cat)}
                      title="Editar categoría"
                      type="button"
                    >
                      <EditIcon size={15} />
                    </button>
                    {cat.canDelete && (
                      <button
                        className="action-btn-icon delete"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        title="Eliminar categoría"
                        type="button"
                      >
                        <TrashIcon size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="table-summary-footer">
            <tr className="summary-dark-row" id="summary-sueldo-cuadre">
              <td>
                <div className="summary-col-category">
                  <div className="summary-check-box">
                    <CheckIcon size={16} />
                  </div>
                  <div className="summary-title-desc">
                    <span className="summary-main-title">Sueldo Cuadre</span>
                    <span className="summary-sub-desc">
                      Balance exacto presupuestado vs ingreso total
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className="cuadre-badge-pill">
                  Cuadre Total {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(0) : 100}%
                </span>
              </td>
              <td className="cell-budgeted">
                <div className="summary-col-budgeted">
                  <span className="summary-total-amount">{formatCurrency(totalExpenses)}</span>
                  <span className="summary-total-label">Total asignado</span>
                </div>
              </td>
              <td>
                <div className="proportion-cell">
                  <div className="bar-track dark-track">
                    <div className="bar-fill fill-emerald" style={{ width: "100%" }} />
                  </div>
                  <span className="proportion-text text-white">100%</span>
                </div>
              </td>
              <td className="cell-difference">
                <div className="summary-col-diff">
                  <span className="diff-zero-amount">
                    {formatCurrency(remainingBalance)}
                  </span>
                  <span className="diff-balance-badge">
                    {isBalanced ? "BALANCE CERO" : remainingBalance > 0 ? "SUPERÁVIT" : "DÉFICIT"}
                  </span>
                </div>
              </td>
              <td className="cell-actions">
                <span className="cuadre-ready-text">
                  <CheckIcon size={14} /> Listo
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pie de tabla con notas metodológicas */}
      <div className="table-footer-bar">
        <div className="footer-left-note">
          <span className="info-icon-circle">ⓘ</span>
          <span>Metodología base cero: la meta es que la diferencia sea siempre $0.00 al inicio de mes.</span>
        </div>
        <div className="footer-right-info">
          <span>{activeRecordsCount} registros activos</span>
          <span className="footer-dot">•</span>
          <a href="#rules" className="footer-rules-link" onClick={(e) => e.preventDefault()}>
            Gestionar reglas de cálculo
          </a>
        </div>
      </div>
    </div>
  );
}

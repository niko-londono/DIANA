/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DIANA — ARCHIVO MAESTRO DE COMPONENTES E INTERFAZ (.JSX)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Este archivo consolida todos los componentes visuales de la aplicación:
 * 1. Íconos SVG vectoriales optimizados
 * 2. Barra Lateral de Navegación (Sidebar) con modo colapsable y drawer móvil
 * 3. Barra Superior (Header) con indicador de sincronización y calendario de mes/año (MonthPicker)
 * 4. Resumen Principal (BudgetHero) con badge dinámico de balance y acciones
 * 5. Cuadrícula de Tarjetas de Métricas (MetricCards)
 * 6. Barra Multisegmento de Distribución (AllocationBar)
 * 7. Tabla Detallada Presupuestaria (BudgetTable) con subcategorías y Sueldo Cuadre
 * 8. Ventana Modal de Creación / Edición (AddCategoryModal)
 * 9. Páginas Auxiliares (PlaceholderPage)
 * 10. Vista Principal (Overview) y Componente Raíz de la Aplicación (DianaApp)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useMemo, useRef, useEffect, Fragment } from "react";
import "./diana-master.css";
import {
  useBudget,
  BudgetProvider,
  getCategoryMeta,
  getCategoryDiff,
  isIncomeCategory,
  formatCurrency,
  getPercent,
  getPercentNum,
  exportBudgetToCSV,
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  MIN_YEAR,
  MAX_YEAR,
  getMonthKey,
  getCurrentMonthKey,
  parseMonthKey,
  CATEGORY_TYPES,
  ICONS_OPTIONS,
  ALLOCATION_COLOR_PALETTE,
  METRIC_CARD_THEMES,
  NAV_ITEMS,
  calculateGoalProjection,
  DEFAULT_GOAL,
  GOAL_STORAGE_KEY
} from "./diana-master.js";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ÍCONOS SVG VECTORIALES
// ─────────────────────────────────────────────────────────────────────────────

export function CashIcon({ className = "", size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

export function HomeIcon({ className = "", size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function PlaneIcon({ className = "", size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function VaultIcon({ className = "", size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

export function EditIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function TrashIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function CheckIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ExportIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function PlusIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function CloudIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

export function SearchIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function MoreIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "", size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function CalendarIcon({ className = "", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function CategoryIcon({ name, className = "", size = 20 }) {
  switch (name) {
    case "home":
      return <HomeIcon className={className} size={size} />;
    case "travel":
      return <PlaneIcon className={className} size={size} />;
    case "savings":
      return <VaultIcon className={className} size={size} />;
    case "cash":
    default:
      return <CashIcon className={className} size={size} />;
  }
}

function NavIcon({ type }) {
  switch (type) {
    case "grid":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case "trending":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "list":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      );
    case "pie":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      );
    case "card":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "notes":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

export function Sidebar({ activePage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
        id="sidebar-toggle"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`} id="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          {!isCollapsed && <span className="sidebar-logo-text">Finanzas</span>}
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => {
                onNavigate(item.id);
                setIsOpen(false);
              }}
              title={isCollapsed ? item.label : undefined}
              id={`nav-${item.id}`}
              type="button"
            >
              <NavIcon type={item.iconType} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-collapse-wrapper">
          <button
            className="sidebar-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
              {isCollapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
            </svg>
            {!isCollapsed && <span>Colapsar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. HEADER
// ─────────────────────────────────────────────────────────────────────────────

export function MonthPicker() {
  const { selectedMonth, setSelectedMonth, monthsWithData } = useBudget();
  const selected = parseMonthKey(selectedMonth);
  const todayKey = getCurrentMonthKey();
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected.year);
  const wrapperRef = useRef(null);

  // Cerrar al hacer clic/tocar fuera o con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) setViewYear(selected.year); // al abrir, mostrar el año del mes activo
    setIsOpen(!isOpen);
  };

  const handleSelect = (key) => {
    setSelectedMonth(key);
    setIsOpen(false);
  };

  return (
    <div className="month-selector-wrapper" ref={wrapperRef}>
      <button
        className="month-selector-btn"
        onClick={handleToggle}
        id="month-selector-btn"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <CalendarIcon size={14} className="month-cal-icon" />
        <span className="month-text-full">{MONTH_NAMES[selected.monthIndex]} {selected.year}</span>
        <span className="month-text-short">{MONTH_NAMES_SHORT[selected.monthIndex]} {selected.year}</span>
        <ChevronDownIcon size={14} className={`dropdown-arrow ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="month-picker-popover" role="dialog" aria-label="Seleccionar mes y año" id="month-picker">
          <div className="month-picker-year-row">
            <button
              className="month-picker-nav"
              onClick={() => setViewYear((y) => Math.max(MIN_YEAR, y - 1))}
              disabled={viewYear <= MIN_YEAR}
              aria-label="Año anterior"
              type="button"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <span className="month-picker-year" aria-live="polite">{viewYear}</span>
            <button
              className="month-picker-nav"
              onClick={() => setViewYear((y) => Math.min(MAX_YEAR, y + 1))}
              disabled={viewYear >= MAX_YEAR}
              aria-label="Año siguiente"
              type="button"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>

          <div className="month-picker-grid">
            {MONTH_NAMES_SHORT.map((label, idx) => {
              const key = getMonthKey(viewYear, idx);
              const isActive = key === selectedMonth;
              const isCurrent = key === todayKey;
              const hasData = monthsWithData.includes(key);

              return (
                <button
                  key={key}
                  className={`month-cell ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}
                  onClick={() => handleSelect(key)}
                  aria-label={`${MONTH_NAMES[idx]} ${viewYear}`}
                  aria-pressed={isActive}
                  type="button"
                >
                  <span>{label}</span>
                  {hasData && <span className="month-cell-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="month-picker-footer">
            <span className="month-picker-legend">
              <span className="month-cell-dot" aria-hidden="true" />
              Con presupuesto
            </span>
            <button
              className="month-picker-today"
              onClick={() => handleSelect(todayKey)}
              disabled={selectedMonth === todayKey}
              type="button"
            >
              Mes actual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { syncStatus } = useBudget();

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

        {/* Calendario de mes y año */}
        <MonthPicker />
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BUDGET HERO
// ─────────────────────────────────────────────────────────────────────────────

export function BudgetHero({ onNewCategory }) {
  const { categories, totalIncome, totalExpenses, remainingBalance, isBalanced, dispatch, selectedMonth, selectedMonthLabel } = useBudget();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleExport = () => {
    exportBudgetToCSV(categories, totalIncome, totalExpenses, remainingBalance, selectedMonth);
  };

  const handleReset = () => {
    if (window.confirm(`¿Deseas restablecer ${selectedMonthLabel} al presupuesto base de la plantilla? Los demás meses no se modifican.`)) {
      dispatch({ type: "RESET" });
      setShowMoreMenu(false);
    }
  };

  return (
    <div className="budget-hero-section" id="budget-hero">
      <div className="hero-left-block">
        <div className="hero-title-row">
          <h2 className="hero-title">Resumen del Presupuesto</h2>

          {isBalanced ? (
            <span className="balance-pill-badge balanced">
              <CheckIcon size={12} />
              <span className="badge-text-full">Presupuesto Balanceado (Cuadrado a Cero)</span>
              <span className="badge-text-short">Balance Cero ($0.00)</span>
            </span>
          ) : remainingBalance > 0 ? (
            <span className="balance-pill-badge surplus">
              <span className="badge-text-full">Superávit disponible: {formatCurrency(remainingBalance)}</span>
              <span className="badge-text-short">Superávit: {formatCurrency(remainingBalance)}</span>
            </span>
          ) : (
            <span className="balance-pill-badge deficit">
              <span className="badge-text-full">Déficit: {formatCurrency(remainingBalance)}</span>
              <span className="badge-text-short">Déficit: {formatCurrency(remainingBalance)}</span>
            </span>
          )}
        </div>

        <p className="hero-subtitle">
          Cada peso tiene un propósito. Ingresos totales asignados con exactitud a gastos y ahorros.
        </p>
      </div>

      <div className="hero-right-actions">
        <button
          className="hero-btn btn-export"
          onClick={handleExport}
          id="btn-export-budget"
          type="button"
        >
          <ExportIcon size={14} />
          <span>Exportar</span>
        </button>

        <button
          className="hero-btn btn-new-category"
          onClick={onNewCategory}
          id="btn-new-category"
          type="button"
        >
          <PlusIcon size={14} />
          <span>Nueva Categoría</span>
        </button>

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

// ─────────────────────────────────────────────────────────────────────────────
// 5. METRIC CARDS
// ─────────────────────────────────────────────────────────────────────────────

export function MetricCards() {
  const { categories, totalIncome } = useBudget();

  const sueldoCat = categories.find((c) => c.id === "sueldo") || {
    id: "sueldo",
    name: "Sueldo",
    budgeted: totalIncome || 17000
  };

  const expenseCategories = categories.filter(
    (c) => c.parentId === null && !isIncomeCategory(c)
  );

  const displayExpenses = expenseCategories.slice(0, 3);

  // Si hay ingresos extra (categorías tipo "Ingreso Base"), la tarjeta muestra el ingreso total
  const hasExtraIncome = categories.some((c) => isIncomeCategory(c) && c.id !== "sueldo");
  const incomeAmount = totalIncome || sueldoCat.budgeted;

  return (
    <div className="metric-cards-grid" id="metric-cards">
      {/* Tarjeta 1: Ingreso Base */}
      <div className="metric-card card-income" id="metric-card-income">
        <div className="card-top-row">
          <span className="card-label">{hasExtraIncome ? "INGRESO TOTAL (SUELDO + EXTRAS)" : "INGRESO BASE (SUELDO)"}</span>
          <div className="card-icon-box bg-emerald-light text-emerald">
            <CategoryIcon name="cash" size={18} />
          </div>
        </div>
        <div className="card-amount">{formatCurrency(incomeAmount)}</div>
        <div className="card-subtext">
          <strong className="highlight-emerald">100%</strong>
          <span>{hasExtraIncome ? "Sueldo + ingresos extra" : "Total disponible mensual"}</span>
        </div>
      </div>

      {/* Tarjetas 2, 3, 4: Gastos */}
      {displayExpenses.map((cat, idx) => {
        const meta = getCategoryMeta(cat);
        const percent = getPercent(cat.budgeted, totalIncome);

        let subLabel = "del total del sueldo";
        if (cat.name.toLowerCase().includes("viaje")) subLabel = "Fondo de experiencias";
        else if (cat.name.toLowerCase().includes("ahorro")) subLabel = "Inversión y emergencias";
        else if (meta.type === "Gasto Fijo") subLabel = "del total del sueldo";

        let cardTitle = cat.name.toUpperCase();
        if (cat.id === "gastos-m" || cat.name.toLowerCase() === "gastos m") {
          cardTitle = "GASTOS FIJOS (GASTOS M)";
        } else if (cat.name.toLowerCase().includes("viaje")) {
          cardTitle = "VIAJES & VACACIONES";
        } else if (cat.name.toLowerCase().includes("ahorro")) {
          cardTitle = "FONDO DE AHORRO";
        }

        const styleTheme = METRIC_CARD_THEMES[idx % METRIC_CARD_THEMES.length];

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

// ─────────────────────────────────────────────────────────────────────────────
// 6. ALLOCATION BAR
// ─────────────────────────────────────────────────────────────────────────────

export function AllocationBar() {
  const { categories, totalIncome, totalExpenses } = useBudget();

  const expenseCategories = categories.filter(
    (c) => c.parentId === null && !isIncomeCategory(c)
  );

  const totalAllocatedPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  return (
    <div className="allocation-card" id="allocation-distribution">
      <div className="allocation-header">
        <div className="allocation-title-group">
          <span className="allocation-title">Distribución de Asignación</span>
          <span className="allocation-subtitle">
            ({formatCurrency(totalExpenses)} distribuidos al {totalAllocatedPercent.toFixed(0)}%)
          </span>
        </div>

        <div className="allocation-legends">
          {expenseCategories.map((cat, idx) => {
            const pct = getPercent(cat.budgeted, totalIncome);
            const color = ALLOCATION_COLOR_PALETTE[idx % ALLOCATION_COLOR_PALETTE.length].color;
            let shortName = cat.name;
            if (cat.name.toLowerCase().includes("viaje")) shortName = "Viajes";
            else if (cat.name.toLowerCase().includes("ahorro")) shortName = "Ahorro";

            return (
              <div key={cat.id} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: color }} />
                <span className="legend-text">
                  {shortName} ({pct})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="multi-progress-bar">
        {expenseCategories.map((cat, idx) => {
          const widthPct = totalIncome > 0 ? (Number(cat.budgeted) / totalIncome) * 100 : 0;
          const color = ALLOCATION_COLOR_PALETTE[idx % ALLOCATION_COLOR_PALETTE.length].color;

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

// ─────────────────────────────────────────────────────────────────────────────
// 7. BUDGET TABLE
// ─────────────────────────────────────────────────────────────────────────────

export function BudgetTable({ onEditCategory }) {
  const { categories, totalIncome, totalExpenses, remainingBalance, isBalanced, dispatch } = useBudget();
  const [searchQuery, setSearchQuery] = useState("");

  // Categorías de ingreso (tipo "Ingreso Base") primero, justo debajo del Sueldo; luego los gastos
  const parentCategories = useMemo(
    () =>
      categories
        .filter((c) => c.parentId === null && c.id !== "sueldo")
        .sort((a, b) => Number(isIncomeCategory(b)) - Number(isIncomeCategory(a))),
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

  const sueldoCat = categories.find((c) => c.id === "sueldo") || {
    id: "sueldo",
    name: "Sueldo",
    budgeted: totalIncome || 17000,
    type: "Ingreso Base",
    subtext: "Ingreso recurrente de nómina",
    icon: "cash",
  };

  const sueldoPctNum = totalIncome > 0 ? getPercentNum(sueldoCat.budgeted, totalIncome) : 100;
  const sueldoPercentStr = `${Number.isInteger(sueldoPctNum) ? sueldoPctNum : sueldoPctNum.toFixed(1)}%`;

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
  }, [parentCategories, searchQuery, categories]);

  const showSueldo = !searchQuery.trim() || sueldoCat.name.toLowerCase().includes(searchQuery.toLowerCase());
  const activeRecordsCount = categories.length;

  return (
    <div className="budget-table-card" id="budget-table-card">
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

      <div className="table-responsive">
        <table className="categories-table">
          <thead>
            <tr>
              <th className="th-category">CATEGORÍA</th>
              <th className="th-type col-desktop-only">TIPO</th>
              <th className="th-budgeted">PRESUPUESTADO</th>
              <th className="th-proportion col-desktop-only">PROPORCIÓN (% INGRESO)</th>
              <th className="th-difference col-desktop-only">DIFERENCIA</th>
              <th className="th-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {/* Fila 1: Sueldo (ahora soporta subcategorías) */}
            {(() => {
              const sueldoChildren = getChildren(sueldoCat.id || "sueldo");
              const sueldoHasChildren = sueldoChildren.length > 0;
              const sueldoDiff = getCategoryDiff(sueldoCat, categories);
              return showSueldo && (
                <Fragment key="sueldo-block">
                  <tr className={`table-row row-sueldo ${sueldoHasChildren ? "has-children" : ""}`} id="row-sueldo">
                    <td>
                      <div className="category-cell-content">
                        <div className="cat-icon-container bg-emerald-light text-emerald">
                          <CategoryIcon name="cash" size={18} />
                        </div>
                        <div className="cat-text-container">
                          <div className="cat-name-wrapper">
                            {sueldoHasChildren && (
                              <button
                                className={`collapse-toggle-btn ${sueldoCat.expanded ? "expanded" : ""}`}
                                onClick={() => handleToggle(sueldoCat.id || "sueldo")}
                                type="button"
                                title={sueldoCat.expanded ? "Contraer subcategorías" : "Desplegar subcategorías"}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                                  <polyline points={sueldoCat.expanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                                </svg>
                              </button>
                            )}
                            <span
                              className={`cat-main-name ${sueldoHasChildren ? "clickable-parent-name" : ""}`}
                              onClick={sueldoHasChildren ? () => handleToggle(sueldoCat.id || "sueldo") : undefined}
                            >
                              {sueldoCat.name}
                            </span>
                          </div>
                          <span className="cat-subtext-desc">{sueldoCat.subtext || "Ingreso recurrente de nómina"}</span>
                          <div className="cat-mobile-meta">
                            <span className="type-badge badge-income">Ingreso Base</span>
                            <span className="cat-mobile-pct">{sueldoPercentStr}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="col-desktop-only">
                      <span className="type-badge badge-income">Ingreso Base</span>
                    </td>
                    <td className="cell-budgeted">
                      <div className="budgeted-cell-inner">
                        <strong>{formatCurrency(sueldoCat.budgeted)}</strong>
                        {sueldoHasChildren ? (
                          <span className={`diff-pill-badge diff-pill-mobile ${sueldoDiff.isZero ? "diff-zero" : "diff-warn"}`}>
                            {sueldoDiff.display}
                          </span>
                        ) : (
                          <span className="diff-pill-badge diff-zero diff-pill-mobile">
                            <CheckIcon size={10} /> $0.00
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="col-desktop-only">
                      <div className="proportion-cell">
                        <div className="bar-track">
                          <div className="bar-fill fill-emerald" style={{ width: `${sueldoPctNum}%` }} />
                        </div>
                        <span className="proportion-text">{sueldoPercentStr}</span>
                      </div>
                    </td>
                    <td className="cell-difference col-desktop-only">
                      {sueldoHasChildren ? (
                        <span className={`diff-pill-badge ${sueldoDiff.isZero ? "diff-zero" : "diff-warn"}`}>
                          {sueldoDiff.display}
                        </span>
                      ) : (
                        <span className="diff-pill-badge diff-zero">
                          <CheckIcon size={12} /> $0.00
                        </span>
                      )}
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

                  {/* Subcategorías de Sueldo (quincenas, ingresos extra, etc.) */}
                  {sueldoCat.expanded && sueldoChildren.map((child) => {
                    const childPercentStr = getPercent(child.budgeted, totalIncome);
                    const childPercentNum = getPercentNum(child.budgeted, totalIncome);
                    return (
                      <tr key={child.id} className="table-row subcategory-row" id={`row-${child.id}`}>
                        <td>
                          <div className="category-cell-content subcat-cell-content">
                            <div className="subcat-indent-space" />
                            <div className="cat-text-container">
                              <span className="subcat-main-name">{child.name}</span>
                              {child.subtext && (
                                <span className="cat-subtext-desc">{child.subtext}</span>
                              )}
                              <div className="cat-mobile-meta">
                                <span className="type-badge badge-subcat">
                                  {child.type || "Ingreso Adicional"}
                                </span>
                                <span className="cat-mobile-pct">{childPercentStr}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="col-desktop-only">
                          <span className="type-badge badge-subcat">
                            {child.type || "Ingreso Adicional"}
                          </span>
                        </td>
                        <td className="cell-budgeted">
                          <div className="budgeted-cell-inner">
                            <span className="subcat-budgeted-amount">
                              {formatCurrency(child.budgeted)}
                            </span>
                          </div>
                        </td>
                        <td className="col-desktop-only">
                          <div className="proportion-cell">
                            <div className="bar-track subcat-track">
                              <div
                                className="bar-fill fill-emerald"
                                style={{ width: `${childPercentNum}%`, opacity: 0.75 }}
                              />
                            </div>
                            <span className="proportion-text subcat-pct">{childPercentStr}</span>
                          </div>
                        </td>
                        <td className="cell-difference col-desktop-only">
                          <span className="diff-dash">-</span>
                        </td>
                        <td className="cell-actions">
                          <button
                            className="action-btn-icon edit"
                            onClick={() => onEditCategory(child)}
                            title="Editar subcategoría"
                            type="button"
                          >
                            <EditIcon size={14} />
                          </button>
                          {child.canDelete !== false && (
                            <button
                              className="action-btn-icon delete"
                              onClick={() => handleDelete(child.id, child.name)}
                              title="Eliminar subcategoría"
                              type="button"
                            >
                              <TrashIcon size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })()}

            {/* Filas de Categorías de Gastos */}
            {filteredParents.map((cat) => {
              const meta = getCategoryMeta(cat);
              const children = getChildren(cat.id);
              const hasChildren = children.length > 0;
              const diffData = getCategoryDiff(cat, categories);
              const percentStr = getPercent(cat.budgeted, totalIncome);
              const percentNum = getPercentNum(cat.budgeted, totalIncome);

              return (
                <Fragment key={cat.id}>
                  <tr className={`table-row parent-row ${hasChildren ? "has-children" : ""}`} id={`row-${cat.id}`}>
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
                                title={cat.expanded ? "Contraer subcategorías" : "Desplegar subcategorías"}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                                  <polyline points={cat.expanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                                </svg>
                              </button>
                            )}
                            <span
                              className={`cat-main-name ${hasChildren ? "clickable-parent-name" : ""}`}
                              onClick={hasChildren ? () => handleToggle(cat.id) : undefined}
                            >
                              {cat.name}
                            </span>
                          </div>
                          <span className="cat-subtext-desc">{meta.subtext}</span>
                          <div className="cat-mobile-meta">
                            <span className={`type-badge ${meta.badgeCls}`}>{meta.type}</span>
                            <span className="cat-mobile-pct">{percentStr}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="col-desktop-only">
                      <span className={`type-badge ${meta.badgeCls}`}>{meta.type}</span>
                    </td>
                    <td className="cell-budgeted">
                      <div className="budgeted-cell-inner">
                        <strong>{formatCurrency(cat.budgeted)}</strong>
                        {diffData.display !== "-" && (
                          <span className={`diff-pill-badge diff-pill-mobile ${diffData.isZero ? "diff-zero" : "diff-warn"}`}>
                            {diffData.display}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="col-desktop-only">
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
                    <td className="cell-difference col-desktop-only">
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

                  {/* Subcategorías: SIN ICONOS, rama └ limpia */}
                  {cat.expanded &&
                    children.map((child) => {
                      const childPercentStr = getPercent(child.budgeted, totalIncome);
                      const childPercentNum = getPercentNum(child.budgeted, totalIncome);

                      return (
                        <tr
                          key={child.id}
                          className="table-row subcategory-row"
                          id={`row-${child.id}`}
                        >
                          <td>
                            <div className="category-cell-content subcat-cell-content">
                              <div className="subcat-indent-space" />
                              <div className="cat-text-container">
                                <span className="subcat-main-name">{child.name}</span>
                                {child.subtext && (
                                  <span className="cat-subtext-desc">{child.subtext}</span>
                                )}
                                <div className="cat-mobile-meta">
                                  <span className="type-badge badge-subcat">
                                    {child.type || "Subcategoría"}
                                  </span>
                                  <span className="cat-mobile-pct">{childPercentStr}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="col-desktop-only">
                            <span className="type-badge badge-subcat">
                              {child.type || "Subcategoría"}
                            </span>
                          </td>
                          <td className="cell-budgeted">
                            <div className="budgeted-cell-inner">
                              <span className="subcat-budgeted-amount">
                                {formatCurrency(child.budgeted)}
                              </span>
                            </div>
                          </td>
                          <td className="col-desktop-only">
                            <div className="proportion-cell">
                              <div className="bar-track subcat-track">
                                <div
                                  className="bar-fill"
                                  style={{
                                    width: `${childPercentNum}%`,
                                    backgroundColor: meta.color,
                                    opacity: 0.8,
                                  }}
                                />
                              </div>
                              <span className="proportion-text subcat-pct">
                                {childPercentStr}
                              </span>
                            </div>
                          </td>
                          <td className="cell-difference col-desktop-only">
                            <span className="diff-dash">-</span>
                          </td>
                          <td className="cell-actions">
                            <button
                              className="action-btn-icon edit"
                              onClick={() => onEditCategory(child)}
                              title="Editar subcategoría"
                              type="button"
                            >
                              <EditIcon size={14} />
                            </button>
                            {child.canDelete !== false && (
                              <button
                                className="action-btn-icon delete"
                                onClick={() => handleDelete(child.id, child.name)}
                                title="Eliminar subcategoría"
                                type="button"
                              >
                                <TrashIcon size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </Fragment>
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
                    <div className="summary-mobile-badges">
                      <span className="cuadre-badge-pill">
                        Cuadre Total {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(0) : 100}%
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="col-desktop-only">
                <span className="cuadre-badge-pill">
                  Cuadre Total {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(0) : 100}%
                </span>
              </td>
              <td className="cell-budgeted">
                <div className="summary-col-budgeted">
                  <span className="summary-total-amount">{formatCurrency(totalExpenses)}</span>
                  <span className="summary-total-label">Total asignado</span>
                  <div className="summary-mobile-diff">
                    <span className="diff-balance-badge">
                      {isBalanced ? "BALANCE CERO" : remainingBalance > 0 ? "SUPERÁVIT" : "DÉFICIT"}
                    </span>
                  </div>
                </div>
              </td>
              <td className="col-desktop-only">
                <div className="proportion-cell">
                  <div className="bar-track dark-track">
                    <div className="bar-fill fill-emerald" style={{ width: "100%" }} />
                  </div>
                  <span className="proportion-text text-white">100%</span>
                </div>
              </td>
              <td className="cell-difference col-desktop-only">
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

// ─────────────────────────────────────────────────────────────────────────────
// 8. ADD CATEGORY MODAL
// ─────────────────────────────────────────────────────────────────────────────

export function AddCategoryModal({ isOpen, onClose, categoryToEdit = null }) {
  const { categories, dispatch } = useBudget();
  const [name, setName] = useState("");
  const [budgeted, setBudgeted] = useState("0");
  const [subtext, setSubtext] = useState("");
  const [type, setType] = useState("Gasto Fijo");
  const [icon, setIcon] = useState("home");
  const [parentId, setParentId] = useState("");
  const nameRef = useRef(null);

  const isEditing = Boolean(categoryToEdit);

  const parentOptions = categories.filter(
    (c) => c.parentId === null && (!categoryToEdit || c.id !== categoryToEdit.id)
  );

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name || "");
        setBudgeted(String(categoryToEdit.budgeted || 0));
        setSubtext(categoryToEdit.subtext || "");
        setType(categoryToEdit.type || "Gasto Fijo");
        setIcon(categoryToEdit.icon || "home");
        setParentId(categoryToEdit.parentId || "");
      } else {
        setName("");
        setBudgeted("0");
        setSubtext("");
        setType("Gasto Fijo");
        setIcon("home");
        setParentId("");
      }
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, categoryToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numBudgeted = parseFloat(budgeted) || 0;

    if (isEditing) {
      dispatch({
        type: "UPDATE_CATEGORY",
        payload: {
          id: categoryToEdit.id,
          name: name.trim(),
          budgeted: numBudgeted,
          subtext: subtext.trim(),
          type,
          icon,
          parentId: parentId || null,
        }
      });
    } else {
      dispatch({
        type: "ADD_CATEGORY",
        payload: {
          name: name.trim(),
          budgeted: numBudgeted,
          subtext: subtext.trim(),
          type,
          icon,
          parentId: parentId || null,
        },
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      id="category-modal"
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>{isEditing ? "Editar Categoría" : "Nueva Categoría"}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="cat-name">Nombre de la Categoría</label>
              <input
                ref={nameRef}
                type="text"
                id="cat-name"
                className="form-input"
                placeholder="Ej. Gastos M, Viajes, Gimnasio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cat-budget">Presupuesto ($)</label>
                <input
                  type="number"
                  id="cat-budget"
                  className="form-input"
                  placeholder="0.00"
                  min="0"
                  step="any"
                  value={budgeted}
                  onChange={(e) => setBudgeted(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cat-type">Tipo de Categoría</label>
                <select
                  id="cat-type"
                  className="form-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {CATEGORY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cat-subtext">Descripción o Subtítulo</label>
              <input
                type="text"
                id="cat-subtext"
                className="form-input"
                placeholder="Ej. Renta, servicios, despensa y compromisos fijos"
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cat-parent">Categoría Padre (Opcional)</label>
                <select
                  id="cat-parent"
                  className="form-input"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">Ninguna (Categoría Principal)</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {!parentId && (
                <div className="form-group">
                  <label htmlFor="cat-icon">Ícono</label>
                  <select
                    id="cat-icon"
                    className="form-input"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  >
                    {ICONS_OPTIONS.map((ic) => (
                      <option key={ic.id} value={ic.id}>{ic.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Guardar Cambios" : "Crear Categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. PÁGINA PLACEHOLDER
// ─────────────────────────────────────────────────────────────────────────────

export function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h1 className="placeholder-title">{title}</h1>
      <p className="placeholder-desc">{description || "Esta sección estará disponible pronto."}</p>
      <div className="placeholder-badge">Próximamente</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. OVERVIEW (DASHBOARD PRINCIPAL)
// ─────────────────────────────────────────────────────────────────────────────

export function Overview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleOpenNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="overview-container">
      <Header />
      <BudgetHero onNewCategory={handleOpenNew} />
      <MetricCards />
      <AllocationBar />
      <BudgetTable onEditCategory={handleEdit} />
      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categoryToEdit={editingCategory}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. PROYECCIÓN DE METAS DE AHORRO (GOALPROJECTIONPAGE)
// ─────────────────────────────────────────────────────────────────────────────

export function GoalProjectionPage() {
  const { categories, totalIncome } = useBudget();

  // Buscar categoría de ahorro en el presupuesto activo
  const ahorroCat = useMemo(() => {
    return categories.find((c) =>
      c.id === "ahorro" ||
      c.name.toLowerCase().includes("ahorro") ||
      (c.type && c.type.toLowerCase().includes("patrimonio"))
    );
  }, [categories]);

  const activeBudgetedSavings = ahorroCat ? Number(ahorroCat.budgeted) || 0 : 1000;

  // Estados del formulario persistidos en localStorage
  const [goalName, setGoalName] = useState(() => {
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).goalName || DEFAULT_GOAL.goalName;
    } catch (e) {}
    return DEFAULT_GOAL.goalName;
  });

  const [targetAmount, setTargetAmount] = useState(() => {
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).targetAmount ?? DEFAULT_GOAL.targetAmount;
    } catch (e) {}
    return DEFAULT_GOAL.targetAmount;
  });

  const [currentSavings, setCurrentSavings] = useState(() => {
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).currentSavings ?? DEFAULT_GOAL.currentSavings;
    } catch (e) {}
    return DEFAULT_GOAL.currentSavings;
  });

  const [termMonths, setTermMonths] = useState(() => {
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).termMonths ?? DEFAULT_GOAL.termMonths;
    } catch (e) {}
    return DEFAULT_GOAL.termMonths;
  });

  const [startDate, setStartDate] = useState(() => {
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).startDate || DEFAULT_GOAL.startDate;
    } catch (e) {}
    return DEFAULT_GOAL.startDate;
  });

  const [annualRate, setAnnualRate] = useState(() => {
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).annualRate ?? DEFAULT_GOAL.annualRate;
    } catch (e) {}
    return DEFAULT_GOAL.annualRate;
  });

  // Guardar en localStorage ante cambios
  useEffect(() => {
    try {
      localStorage.setItem(
        GOAL_STORAGE_KEY,
        JSON.stringify({
          goalName,
          targetAmount,
          currentSavings,
          termMonths,
          startDate,
          annualRate,
        })
      );
    } catch (e) {}
  }, [goalName, targetAmount, currentSavings, termMonths, startDate, annualRate]);

  // Cálculo integral de la proyección
  const projection = useMemo(() => {
    return calculateGoalProjection({
      goalName,
      targetAmount,
      currentSavings,
      termMonths,
      startDate,
      annualRate,
      budgetedSavings: activeBudgetedSavings,
      totalIncome: totalIncome || 17000,
    });
  }, [goalName, targetAmount, currentSavings, termMonths, startDate, annualRate, activeBudgetedSavings, totalIncome]);

  // Presets para facilitar pruebas y uso rápido
  const PRESETS = [
    {
      label: "Ejemplo Excel",
      goalName: "Meta de ahorro",
      targetAmount: 90000,
      currentSavings: 10000,
      termMonths: 6,
      startDate: "2026-09-29",
      annualRate: 0,
    },
    {
      label: "Fondo Emergencia",
      goalName: "Fondo de Emergencia (6 meses)",
      targetAmount: 60000,
      currentSavings: 15000,
      termMonths: 12,
      startDate: "2026-10-01",
      annualRate: 8.5,
    },
    {
      label: "Viaje Europa",
      goalName: "Vacaciones en Europa",
      targetAmount: 45000,
      currentSavings: 5000,
      termMonths: 8,
      startDate: "2026-10-01",
      annualRate: 0,
    },
    {
      label: "Enganche Auto",
      goalName: "Enganche de Automóvil",
      targetAmount: 120000,
      currentSavings: 20000,
      termMonths: 24,
      startDate: "2026-10-01",
      annualRate: 10.0,
    },
  ];

  const handleApplyPreset = (p) => {
    setGoalName(p.goalName);
    setTargetAmount(p.targetAmount);
    setCurrentSavings(p.currentSavings);
    setTermMonths(p.termMonths);
    setStartDate(p.startDate);
    setAnnualRate(p.annualRate);
  };

  const QUICK_MONTHS = [3, 6, 9, 12, 18, 24, 36];

  return (
    <div className="projection-container" id="proyeccion-view">
      <Header />

      {/* Cabecera de la calculadora */}
      <div className="projection-hero-header">
        <div className="projection-hero-top">
          <div className="projection-hero-titles">
            <span className="projection-pill-tag">PLANIFICADOR FINANCIERO</span>
            <h1 className="projection-hero-title">Proyección de Metas</h1>
            <h2 className="projection-hero-subtitle">Calculadora de Metas de Ahorro</h2>
          </div>

          <div className="projection-presets-wrapper">
            <span className="presets-label">Plantillas Rápidas:</span>
            <div className="presets-buttons">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className={`preset-btn ${goalName === p.goalName ? "active" : ""}`}
                  onClick={() => handleApplyPreset(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Banner de alerta de compatibilidad con el presupuesto */}
        {projection.isBudgetDeficit ? (
          <div className="projection-alert alert-deficit" id="alert-deficit">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text-group">
              <strong>Te faltan {formatCurrency(Math.abs(projection.monthlyDiff))} al mes</strong> sobre tu ahorro presupuestado ({formatCurrency(projection.budgetedSavings)}/mes)
            </div>
          </div>
        ) : (
          <div className="projection-alert alert-surplus" id="alert-surplus">
            <span className="alert-icon">✅</span>
            <div className="alert-text-group">
              <strong>¡Meta viable y cubierta!</strong> Tu ahorro presupuestado de {formatCurrency(projection.budgetedSavings)}/mes cubre tu cuota con un superávit de {formatCurrency(projection.monthlyDiff)} al mes.
            </div>
          </div>
        )}

        <p className="projection-hero-desc">
          Define tu meta y el plazo: te decimos cuánto ahorrar cada mes para lograrla.
        </p>
      </div>

      {/* Sección 1: Formulario Datos de tu Meta */}
      <div className="projection-card form-card" id="card-datos-meta">
        <div className="projection-card-header">
          <div className="card-header-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h3 className="projection-card-title">Datos de tu meta</h3>
            <p className="projection-card-subtitle">Ingresa los parámetros clave de tu objetivo de ahorro</p>
          </div>
        </div>

        <div className="goal-form-grid">
          {/* Nombre de la meta */}
          <div className="goal-field">
            <div className="field-label-group">
              <label htmlFor="goal-name">Nombre de la meta</label>
              <span className="field-hint">¿Para qué estás ahorrando?</span>
            </div>
            <input
              type="text"
              id="goal-name"
              className="goal-input"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="Ej. Meta de ahorro"
            />
          </div>

          {/* Monto de la meta */}
          <div className="goal-field">
            <div className="field-label-group">
              <label htmlFor="goal-target">Monto de la meta ($)</label>
              <span className="field-hint">Cuánto dinero quieres juntar en total</span>
            </div>
            <div className="input-currency-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="goal-target"
                className="goal-input currency-input"
                value={targetAmount}
                min="0"
                step="any"
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="90000"
              />
            </div>
          </div>

          {/* Ahorro actual */}
          <div className="goal-field">
            <div className="field-label-group">
              <label htmlFor="goal-current">Ahorro actual ($)</label>
              <span className="field-hint">Lo que ya tienes guardado para esta meta</span>
            </div>
            <div className="input-currency-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="goal-current"
                className="goal-input currency-input"
                value={currentSavings}
                min="0"
                step="any"
                onChange={(e) => setCurrentSavings(e.target.value)}
                placeholder="10000"
              />
            </div>
          </div>

          {/* Plazo en meses */}
          <div className="goal-field">
            <div className="field-label-group">
              <label htmlFor="goal-months">Plazo (meses)</label>
              <span className="field-hint">En cuántos meses quieres lograrla (máximo 36)</span>
            </div>
            <div className="months-input-group">
              <input
                type="number"
                id="goal-months"
                className="goal-input months-input"
                value={termMonths}
                min="1"
                max="60"
                onChange={(e) => setTermMonths(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <div className="quick-chips-wrapper">
                {QUICK_MONTHS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`quick-chip ${termMonths === m ? "active" : ""}`}
                    onClick={() => setTermMonths(m)}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fecha de inicio */}
          <div className="goal-field">
            <div className="field-label-group">
              <label htmlFor="goal-date">Fecha de inicio</label>
              <span className="field-hint">Desde cuándo empiezas a ahorrar</span>
            </div>
            <input
              type="date"
              id="goal-date"
              className="goal-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Rendimiento anual estimado */}
          <div className="goal-field">
            <div className="field-label-group">
              <label htmlFor="goal-rate">Rendimiento anual estimado (%)</label>
              <span className="field-hint">Opcional: interés anual si tu ahorro genera rendimiento (0% = sin interés)</span>
            </div>
            <div className="input-percent-wrapper">
              <input
                type="number"
                id="goal-rate"
                className="goal-input percent-input"
                value={annualRate}
                min="0"
                max="100"
                step="0.1"
                onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                placeholder="0.0"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Resultados (Grid de 6 Tarjetas KPI) */}
      <div className="projection-results-section" id="section-resultados">
        <h3 className="section-title">Resultado</h3>
        <div className="results-kpi-grid">
          {/* 1. Ahorro Mensual Necesario (Destacada) */}
          <div className="result-kpi-card featured-emerald">
            <div className="kpi-top">
              <span className="kpi-label">AHORRO MENSUAL NECESARIO</span>
              <span className="kpi-badge-pill">Prioritario</span>
            </div>
            <div className="kpi-value text-emerald">{formatCurrency(projection.monthlyRequired)}</div>
            <div className="kpi-subtext">durante {projection.termMonths} meses</div>
          </div>

          {/* 2. Por Quincena */}
          <div className="result-kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">POR QUINCENA</span>
            </div>
            <div className="kpi-value">{formatCurrency(projection.biweekly)}</div>
            <div className="kpi-subtext">cada 15 días</div>
          </div>

          {/* 3. Por Semana */}
          <div className="result-kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">POR SEMANA</span>
            </div>
            <div className="kpi-value">{formatCurrency(projection.weekly)}</div>
            <div className="kpi-subtext">cada semana</div>
          </div>

          {/* 4. Por Día */}
          <div className="result-kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">POR DÍA</span>
            </div>
            <div className="kpi-value">{formatCurrency(projection.daily)}</div>
            <div className="kpi-subtext">cada día</div>
          </div>

          {/* 5. Fecha Objetivo */}
          <div className="result-kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">FECHA OBJETIVO</span>
            </div>
            <div className="kpi-value text-indigo">{projection.targetDateFormatted}</div>
            <div className="kpi-subtext">cuando llegas a tu meta</div>
          </div>

          {/* 6. Falta por Ahorrar */}
          <div className="result-kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">FALTA POR AHORRAR</span>
            </div>
            <div className="kpi-value">{formatCurrency(projection.remainingToSave)}</div>
            <div className="kpi-subtext">
              <strong className="text-emerald">{projection.savedPercent.toFixed(0)}%</strong> de la meta ya ahorrado
            </div>
          </div>
        </div>
      </div>

      {/* Sección 3: Compatibilidad con tu Presupuesto */}
      <div className="projection-card compat-card" id="card-compatibilidad">
        <div className="projection-card-header">
          <div className="card-header-icon-box bg-indigo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h3 className="projection-card-title">Compatibilidad con tu presupuesto</h3>
            <p className="projection-card-subtitle">Cruce de tu meta con tu ingreso y ahorro activo en la pestaña Presupuesto</p>
          </div>
        </div>

        <div className="compat-table-wrapper">
          <table className="compat-table">
            <tbody>
              <tr>
                <td className="compat-item-name">Ahorro mensual necesario</td>
                <td className="compat-item-value bold">{formatCurrency(projection.monthlyRequired)}</td>
                <td className="compat-item-desc">Lo que necesitas apartar cada mes</td>
              </tr>
              <tr>
                <td className="compat-item-name">Ahorro presupuestado</td>
                <td className="compat-item-value">{formatCurrency(projection.budgetedSavings)}</td>
                <td className="compat-item-desc">Tu ahorro mensual en la hoja Presupuesto</td>
              </tr>
              <tr className="compat-highlight-row">
                <td className="compat-item-name">Diferencia mensual</td>
                <td className="compat-item-value">
                  <span className={`diff-pill-badge ${projection.monthlyDiff >= 0 ? "diff-zero" : "diff-warn"}`}>
                    {projection.monthlyDiff < 0
                      ? `-${formatCurrency(Math.abs(projection.monthlyDiff))}`
                      : `+${formatCurrency(projection.monthlyDiff)}`}
                  </span>
                </td>
                <td className="compat-item-desc">Positivo = te sobra · Negativo = te falta</td>
              </tr>
              <tr>
                <td className="compat-item-name">% de tu sueldo necesario</td>
                <td className="compat-item-value bold">{projection.incomePercentNeeded.toFixed(1)}%</td>
                <td className="compat-item-desc">Porcentaje de tu ingreso base que debes ahorrar</td>
              </tr>
              <tr>
                <td className="compat-item-name">Meses con tu ahorro presupuestado</td>
                <td className="compat-item-value bold">
                  {isFinite(projection.monthsWithBudgetedSavings) ? `${projection.monthsWithBudgetedSavings} meses` : "N/A"}
                </td>
                <td className="compat-item-desc">En cuántos meses llegarías si ahorras solo lo presupuestado</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 4: Plan Mes a Mes */}
      <div className="projection-card schedule-card" id="card-plan-mes">
        <div className="projection-card-header">
          <div className="card-header-icon-box bg-cyan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <h3 className="projection-card-title">Plan mes a mes</h3>
            <p className="projection-card-subtitle">Cronograma de depósitos acumulados y avance porcentual hacia tu meta</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="th-month">MES</th>
                <th className="th-date">FECHA</th>
                <th className="th-aporte">APORTE</th>
                <th className="th-accum">ACUMULADO</th>
                <th className="th-pct">% DE LA META</th>
                <th className="th-progress">PROGRESO</th>
              </tr>
            </thead>
            <tbody>
              {projection.schedule.map((item, idx) => {
                const isMilestone = idx === projection.schedule.length - 1;

                return (
                  <tr key={item.month} className={`schedule-row ${isMilestone ? "milestone-row" : ""}`}>
                    <td className="cell-month">
                      <span className="month-number">{item.month}</span>
                    </td>
                    <td className="cell-date">{item.date}</td>
                    <td className="cell-aporte">{formatCurrency(item.aporte)}</td>
                    <td className="cell-accum">
                      <strong>{formatCurrency(item.accumulated)}</strong>
                    </td>
                    <td className="cell-pct">
                      <span className={`pct-tag ${isMilestone ? "pct-milestone" : ""}`}>
                        {item.percent}%
                      </span>
                    </td>
                    <td className="cell-progress">
                      <div className="schedule-progress-track">
                        <div
                          className="schedule-progress-bar"
                          style={{ width: `${item.percentExact}%` }}
                        />
                      </div>
                      {isMilestone && <span className="milestone-badge">Meta 🎯</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. COMPONENTE RAÍZ DE LA APLICACIÓN (DIANAAPP)
// ─────────────────────────────────────────────────────────────────────────────

const PAGES = {
  overview: <Overview />,
  proyeccion: <GoalProjectionPage />,
  summary: <GoalProjectionPage />, // retrocompatibilidad con enlaces anteriores
  distribution: <PlaceholderPage title="Distribución" description="Visualiza cómo se distribuye tu presupuesto por categorías." />,
  cards: <PlaceholderPage title="Tarjetas" description="Administra tus tarjetas de crédito y débito." />,
  settings: <PlaceholderPage title="Settings" description="Configura las preferencias de tu presupuesto." />,
  notes: <PlaceholderPage title="Notes" description="Notas y recordatorios financieros personales." />,
};

export default function DianaApp() {
  const [activePage, setActivePage] = useState("overview");

  return (
    <BudgetProvider>
      <div className="app-layout">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="main-content">
          <div className="main-scroll">
            {PAGES[activePage] || <Overview />}
          </div>
        </main>
      </div>
    </BudgetProvider>
  );
}

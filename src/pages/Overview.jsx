import { useBudget } from "../context/BudgetContext.jsx";
import MetricCards from "../components/MetricCards.jsx";
import BudgetTable from "../components/BudgetTable.jsx";
import "./Overview.css";

export default function Overview() {
  const { syncStatus } = useBudget();

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Financial Budget Dashboard</h1>
          <div className="page-header-sub">
            <span className="page-breadcrumb">Overview</span>
            {/* Sync Indicator — pequeño, inline, discreto */}
            <div className={`sync-indicator ${syncStatus}`} id="sync-status">
              {syncStatus === "saving" && (
                <svg className="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.23 3.23" />
                </svg>
              )}
              {syncStatus === "saved" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {syncStatus === "error" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
              <span>
                {syncStatus === "saving"
                  ? "Guardando..."
                  : syncStatus === "saved"
                  ? "Guardado"
                  : "Error al guardar"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <MetricCards />
      <BudgetTable />
    </>
  );
}

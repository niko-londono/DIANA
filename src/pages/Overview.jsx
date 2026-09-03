import { useBudget } from "../context/BudgetContext.jsx";
import MetricCards from "../components/MetricCards.jsx";
import BudgetTable from "../components/BudgetTable.jsx";
import "./Overview.css";

export default function Overview() {
  const { isLoading, syncStatus } = useBudget();

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Financial Budget Dashboard</h1>
          <p className="page-breadcrumb">Overview</p>
        </div>
        
        {/* Sync Indicator */}
        <div className={`sync-indicator ${syncStatus}`}>
          {syncStatus === 'saving' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin-icon">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.23 3.23" />
            </svg>
          )}
          {syncStatus === 'saved' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              <polyline points="9 13 11 15 15 11" />
            </svg>
          )}
          {syncStatus === 'error' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <span>
            {syncStatus === 'saving' ? 'Guardando...' : 
             syncStatus === 'saved' ? 'Guardado en la nube' : 
             'Error al guardar'}
          </span>
        </div>
      </div>
      
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
          Cargando datos desde Google Sheets...
        </div>
      ) : (
        <>
          <MetricCards />
          <BudgetTable />
        </>
      )}
    </>
  );
}

import { useBudget } from "../context/BudgetContext.jsx";
import MetricCards from "../components/MetricCards.jsx";
import BudgetTable from "../components/BudgetTable.jsx";
import "./Overview.css";

export default function Overview() {
  const { isLoading } = useBudget();

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Financial Budget Dashboard</h1>
        <p className="page-breadcrumb">Overview</p>
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

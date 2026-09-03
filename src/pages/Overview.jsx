import MetricCards from "../components/MetricCards.jsx";
import BudgetTable from "../components/BudgetTable.jsx";
import "./Overview.css";

export default function Overview() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Financial Budget Dashboard</h1>
        <p className="page-breadcrumb">Overview</p>
      </div>
      <MetricCards />
      <BudgetTable />
    </>
  );
}

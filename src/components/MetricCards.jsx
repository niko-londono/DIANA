import { useBudget } from "../context/BudgetContext.jsx";
import { formatCurrency } from "../utils/formatters.js";
import "./MetricCards.css";

export default function MetricCards() {
  const { totalIncome, totalExpenses, remainingBalance } = useBudget();

  return (
    <div className="metric-cards-grid" id="metric-cards">
      {/* Total Income */}
      <div className="metric-card" id="metric-income">
        <div className="metric-icon income">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 8 12 16" />
            <polyline points="8 12 12 8 16 12" />
          </svg>
        </div>
        <div className="metric-info">
          <span className="metric-label">Total Income</span>
          <span className="metric-value">{formatCurrency(totalIncome)}</span>
          <span className="metric-sub">Monthly</span>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="metric-card" id="metric-expenses">
        <div className="metric-icon expense">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <div className="metric-info">
          <span className="metric-label">Total Expenses</span>
          <span className="metric-value">{formatCurrency(totalExpenses)}</span>
          <span className="metric-sub">Monthly</span>
        </div>
      </div>

      {/* Remaining Balance */}
      <div className="metric-card" id="metric-balance">
        <div className="metric-icon balance">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </div>
        <div className="metric-info">
          <span className="metric-label">Remaining Balance</span>
          <span className="metric-value">{formatCurrency(remainingBalance)}</span>
          <span className="metric-sub">Monthly</span>
        </div>
      </div>
    </div>
  );
}

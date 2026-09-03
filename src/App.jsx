import { useState } from "react";
import { BudgetProvider } from "./context/BudgetContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Overview from "./pages/Overview.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";

const PAGES = {
  overview: <Overview />,
  summary: <PlaceholderPage title="Summary" description="Resumen detallado de tus finanzas con gráficos y estadísticas." />,
  distribution: <PlaceholderPage title="Distribución" description="Visualiza cómo se distribuye tu presupuesto por categorías." />,
  cards: <PlaceholderPage title="Tarjetas" description="Administra tus tarjetas de crédito y débito." />,
  settings: <PlaceholderPage title="Settings" description="Configura las preferencias de tu presupuesto." />,
  notes: <PlaceholderPage title="Notes" description="Notas y recordatorios financieros personales." />,
};

export default function App() {
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

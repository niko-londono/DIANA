import { useState } from "react";
import Header from "../components/Header.jsx";
import BudgetHero from "../components/BudgetHero.jsx";
import MetricCards from "../components/MetricCards.jsx";
import AllocationBar from "../components/AllocationBar.jsx";
import BudgetTable from "../components/BudgetTable.jsx";
import AddCategoryModal from "../components/AddCategoryModal.jsx";
import "./Overview.css";

export default function Overview() {
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
      {/* Barra superior de navegación / sincronización */}
      <Header />

      {/* Título de la página, badge de estado y botones de acción */}
      <BudgetHero onNewCategory={handleOpenNew} />

      {/* Grid de 4 tarjetas de métricas */}
      <MetricCards />

      {/* Barra de distribución de gastos */}
      <AllocationBar />

      {/* Tabla detallada de categorías y fila de Sueldo Cuadre */}
      <BudgetTable onEditCategory={handleEdit} />

      {/* Modal para Crear y Editar Categorías */}
      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categoryToEdit={editingCategory}
      />
    </div>
  );
}

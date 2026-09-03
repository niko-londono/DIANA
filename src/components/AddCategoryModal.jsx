import { useState, useEffect, useRef } from "react";
import { useBudget } from "../context/BudgetContext.jsx";
import "./Modal.css";

export default function AddCategoryModal({ isOpen, onClose }) {
  const { categories, dispatch } = useBudget();
  const [name, setName] = useState("");
  const [budgeted, setBudgeted] = useState("0");
  const [parentId, setParentId] = useState("");
  const nameRef = useRef(null);

  const parentOptions = categories.filter((c) => c.parentId === null && c.id !== "sueldo");

  useEffect(() => {
    if (isOpen && nameRef.current) {
      setTimeout(() => nameRef.current.focus(), 100);
    }
    if (!isOpen) {
      setName("");
      setBudgeted("0");
      setParentId("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    dispatch({
      type: "ADD_CATEGORY",
      payload: {
        name: name.trim(),
        budgeted: parseFloat(budgeted) || 0,
        parentId: parentId || null,
      },
    });

    onClose();
  };

  return (
    <div
      className={`modal-overlay ${isOpen ? "active" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      id="add-category-modal"
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>Agregar Categoría</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
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
                placeholder="Ej. Comida, Gimnasio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cat-budget">Presupuesto Inicial ($)</label>
              <input
                type="number"
                id="cat-budget"
                className="form-input"
                placeholder="0"
                min="0"
                step="any"
                value={budgeted}
                onChange={(e) => setBudgeted(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cat-parent">Categoría Padre (Opcional)</label>
              <select
                id="cat-parent"
                className="form-input"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">Ninguna (Nivel Superior)</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useBudget } from "../context/BudgetContext.jsx";
import "./Modal.css";

const CATEGORY_TYPES = [
  "Gasto Fijo",
  "Estilo de Vida",
  "Patrimonio",
  "Ingreso Base",
  "Gasto Variable"
];

const ICONS = [
  { id: "home", label: "Casa / Fijo" },
  { id: "travel", label: "Viajes / Ocio" },
  { id: "savings", label: "Ahorro / Inversión" },
  { id: "cash", label: "Efectivo / Sueldo" },
  { id: "default", label: "General" }
];

export default function AddCategoryModal({ isOpen, onClose, categoryToEdit = null }) {
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
    (c) => c.parentId === null && c.id !== "sueldo" && (!categoryToEdit || c.id !== categoryToEdit.id)
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
                <label htmlFor="cat-icon">Ícono</label>
                <select
                  id="cat-icon"
                  className="form-input"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                >
                  {ICONS.map((ic) => (
                    <option key={ic.id} value={ic.id}>{ic.label}</option>
                  ))}
                </select>
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

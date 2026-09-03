import { createContext, useContext, useReducer, useEffect, useState, useRef } from "react";

const BudgetContext = createContext(null);

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2GE95BLK0ATcberMo8zZ4dIwMwcKjPzeHXnrKQA8C5DNE_yjnVgDeW4j0xDSzfmyP/exec";

const DEFAULT_CATEGORIES = [
  { id: "sueldo", name: "Sueldo", budgeted: 96228, parentId: null, canDelete: false, expanded: true },
  { id: "carro", name: "Carro", budgeted: 28000, parentId: null, canDelete: true, expanded: true },
  { id: "viajes", name: "Viajes/Vacaciones", budgeted: 6000, parentId: null, canDelete: true, expanded: false },
  { id: "gastos-m", name: "Gastos M", budgeted: 47000, parentId: null, canDelete: true, expanded: true },
  { id: "casa", name: "Casa(Inversion)", budgeted: 14519, parentId: null, canDelete: true, expanded: false },
];

function budgetReducer(state, action) {
  switch (action.type) {
    case "SET_CATEGORIES": {
      return { ...state, categories: action.payload };
    }
    case "ADD_CATEGORY": {
      const newCat = {
        id: action.payload.name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now(),
        name: action.payload.name,
        budgeted: action.payload.budgeted || 0,
        parentId: action.payload.parentId || null,
        canDelete: true,
        expanded: false,
      };
      return { ...state, categories: [...state.categories, newCat] };
    }
    case "UPDATE_BUDGET": {
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id ? { ...cat, budgeted: action.payload.budgeted } : cat
        ),
      };
    }
    case "UPDATE_NAME": {
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id ? { ...cat, name: action.payload.name } : cat
        ),
      };
    }
    case "DELETE_CATEGORY": {
      return {
        ...state,
        categories: state.categories.filter(
          (cat) => cat.id !== action.payload.id && cat.parentId !== action.payload.id
        ),
      };
    }
    case "TOGGLE_EXPAND": {
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id ? { ...cat, expanded: !cat.expanded } : cat
        ),
      };
    }
    case "RESET": {
      return { categories: DEFAULT_CATEGORIES };
    }
    default:
      return state;
  }
}

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(budgetReducer, { categories: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("saved"); // "saved", "saving", "error"
  const isFirstRender = useRef(true);

  // 1. Cargar datos desde Google Sheets al iniciar
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        if (data && data.categories && data.categories.length > 0) {
          dispatch({ type: "SET_CATEGORIES", payload: data.categories });
        } else {
          // Si la hoja está vacía, cargar las por defecto
          dispatch({ type: "SET_CATEGORIES", payload: DEFAULT_CATEGORIES });
        }
      } catch (e) {
        console.error("Error al cargar desde Google Sheets:", e);
        // Fallback a localStorage si falla la conexión
        const local = localStorage.getItem("finanzas_backup");
        if (local) {
          dispatch({ type: "SET_CATEGORIES", payload: JSON.parse(local) });
        } else {
          dispatch({ type: "SET_CATEGORIES", payload: DEFAULT_CATEGORIES });
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // 2. Guardar datos en Google Sheets cada vez que cambien
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isLoading || state.categories.length === 0) return;

    // Guardar backup local rápido
    localStorage.setItem("finanzas_backup", JSON.stringify(state.categories));

    // Guardar en Google Sheets en segundo plano
    setSyncStatus("saving");
    async function syncData() {
      try {
        await fetch(SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({ categories: state.categories })
        });
        setSyncStatus("saved");
      } catch (e) {
        console.error("Error al sincronizar con Google Sheets:", e);
        setSyncStatus("error");
      }
    }
    
    // Evitar múltiples peticiones seguidas usando un pequeño debounce
    const timeoutId = setTimeout(() => {
      syncData();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state.categories, isLoading]);

  // Valores Computados
  const categories = state.categories;

  const totalIncome = categories
    .filter((c) => c.id === "sueldo")
    .reduce((sum, c) => sum + c.budgeted, 0);

  const totalExpenses = categories
    .filter((c) => c.id !== "sueldo")
    .reduce((sum, c) => sum + c.budgeted, 0);

  const remainingBalance = totalIncome - totalExpenses;

  return (
    <BudgetContext.Provider
      value={{
        categories,
        totalIncome,
        totalExpenses,
        remainingBalance,
        dispatch,
        isLoading,
        syncStatus
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
  return ctx;
}

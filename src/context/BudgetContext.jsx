import { createContext, useContext, useReducer, useEffect } from "react";

const BudgetContext = createContext(null);

const STORAGE_KEY = "finanzas_budget_data";

const DEFAULT_CATEGORIES = [
  { id: "sueldo", name: "Sueldo", budgeted: 96228, parentId: null, canDelete: false, expanded: true },
  { id: "carro", name: "Carro", budgeted: 28000, parentId: null, canDelete: true, expanded: true },
  { id: "viajes", name: "Viajes/Vacaciones", budgeted: 6000, parentId: null, canDelete: true, expanded: false },
  { id: "gastos-m", name: "Gastos M", budgeted: 47000, parentId: null, canDelete: true, expanded: true },
  { id: "casa", name: "Casa(Inversion)", budgeted: 14519, parentId: null, canDelete: true, expanded: false },
];

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load budget data from localStorage:", e);
  }
  return null;
}

function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save budget data:", e);
  }
}

function budgetReducer(state, action) {
  switch (action.type) {
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
  const saved = loadFromStorage();
  const initialState = saved || { categories: DEFAULT_CATEGORIES };

  const [state, dispatch] = useReducer(budgetReducer, initialState);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Computed values
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

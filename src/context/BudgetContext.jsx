import { createContext, useContext, useReducer, useEffect, useState, useRef } from "react";

const BudgetContext = createContext(null);

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2GE95BLK0ATcberMo8zZ4dIwMwcKjPzeHXnrKQA8C5DNE_yjnVgDeW4j0xDSzfmyP/exec";

const DEFAULT_CATEGORIES = [
  {
    id: "sueldo",
    name: "Sueldo",
    budgeted: 17000,
    parentId: null,
    canDelete: false,
    expanded: true,
    type: "Ingreso Base",
    subtext: "Ingreso recurrente de nómina",
    icon: "cash"
  },
  {
    id: "gastos-m",
    name: "Gastos M",
    budgeted: 15000,
    parentId: null,
    canDelete: true,
    expanded: true,
    type: "Gasto Fijo",
    subtext: "Renta, servicios, despensa y compromisos fijos",
    icon: "home"
  },
  {
    id: "viajes",
    name: "Viajes/Vacaciones",
    budgeted: 1000,
    parentId: null,
    canDelete: true,
    expanded: false,
    type: "Estilo de Vida",
    subtext: "Escapadas, boletos y fondo vacacional",
    icon: "travel"
  },
  {
    id: "ahorro",
    name: "AHORRO",
    budgeted: 1000,
    parentId: null,
    canDelete: true,
    expanded: false,
    type: "Patrimonio",
    subtext: "Inversión mensual y fondo de resguardo",
    icon: "savings"
  }
];

export function getCategoryMeta(cat) {
  if (!cat) return { type: "Gasto", subtext: "", icon: "default", badgeCls: "badge-variable", color: "#64748b", bgColor: "#f1f5f9" };
  
  if (cat.id === "sueldo" || (cat.name && cat.name.toLowerCase().includes("sueldo"))) {
    return {
      type: cat.type || "Ingreso Base",
      subtext: cat.subtext || "Ingreso recurrente de nómina",
      icon: cat.icon || "cash",
      badgeCls: "badge-income",
      color: "#10b981",
      bgColor: "#ecfdf5"
    };
  }

  const n = (cat.name || "").toLowerCase();
  const t = (cat.type || "").toLowerCase();

  if (t.includes("fijo") || n.includes("gasto") || n.includes("casa") || n.includes("renta") || n.includes("servicios")) {
    return {
      type: cat.type || "Gasto Fijo",
      subtext: cat.subtext || "Renta, servicios, despensa y compromisos fijos",
      icon: cat.icon || "home",
      badgeCls: "badge-fixed",
      color: "#6366f1",
      bgColor: "#eef2ff"
    };
  }
  if (t.includes("vida") || t.includes("estilo") || n.includes("viaje") || n.includes("vaca") || n.includes("ocio")) {
    return {
      type: cat.type || "Estilo de Vida",
      subtext: cat.subtext || "Escapadas, boletos y fondo vacacional",
      icon: cat.icon || "travel",
      badgeCls: "badge-lifestyle",
      color: "#06b6d4",
      bgColor: "#ecfeff"
    };
  }
  if (t.includes("patrimonio") || t.includes("ahorro") || n.includes("ahorro") || n.includes("invers") || n.includes("fondo")) {
    return {
      type: cat.type || "Patrimonio",
      subtext: cat.subtext || "Inversión mensual y fondo de resguardo",
      icon: cat.icon || "savings",
      badgeCls: "badge-wealth",
      color: "#a855f7",
      bgColor: "#faf5ff"
    };
  }

  return {
    type: cat.type || "Gasto Variable",
    subtext: cat.subtext || "Asignación presupuestaria mensual",
    icon: cat.icon || "default",
    badgeCls: "badge-variable",
    color: "#3b82f6",
    bgColor: "#eff6ff"
  };
}

function budgetReducer(state, action) {
  switch (action.type) {
    case "SET_CATEGORIES": {
      return { ...state, categories: action.payload };
    }
    case "ADD_CATEGORY": {
      const newCat = {
        id: action.payload.id || action.payload.name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now(),
        name: action.payload.name,
        budgeted: Number(action.payload.budgeted) || 0,
        parentId: action.payload.parentId || null,
        canDelete: action.payload.canDelete !== false,
        expanded: false,
        type: action.payload.type || "Gasto Fijo",
        subtext: action.payload.subtext || "",
        icon: action.payload.parentId ? null : (action.payload.icon || "default")
      };
      const updatedCategories = action.payload.parentId
        ? state.categories.map((c) => c.id === action.payload.parentId ? { ...c, expanded: true } : c)
        : state.categories;

      return { ...state, categories: [...updatedCategories, newCat] };
    }
    case "UPDATE_CATEGORY": {
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id
            ? {
                ...cat,
                name: action.payload.name !== undefined ? action.payload.name : cat.name,
                budgeted: action.payload.budgeted !== undefined ? Number(action.payload.budgeted) : cat.budgeted,
                parentId: action.payload.parentId !== undefined ? action.payload.parentId : cat.parentId,
                type: action.payload.type !== undefined ? action.payload.type : cat.type,
                subtext: action.payload.subtext !== undefined ? action.payload.subtext : cat.subtext,
                icon: action.payload.icon !== undefined ? action.payload.icon : cat.icon
              }
            : cat
        )
      };
    }
    case "UPDATE_BUDGET": {
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id ? { ...cat, budgeted: Number(action.payload.budgeted) || 0 } : cat
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
        if (data && Array.isArray(data.categories) && data.categories.length > 0) {
          dispatch({ type: "SET_CATEGORIES", payload: data.categories });
          localStorage.setItem("finanzas_backup", JSON.stringify(data.categories));
        } else if (data && data.error) {
          console.warn("Respuesta de Google Sheets:", data.error);
          const local = localStorage.getItem("finanzas_backup");
          if (local) {
            dispatch({ type: "SET_CATEGORIES", payload: JSON.parse(local) });
          } else {
            dispatch({ type: "SET_CATEGORIES", payload: DEFAULT_CATEGORIES });
          }
        } else {
          // Si la hoja está vacía o sin categorías
          const local = localStorage.getItem("finanzas_backup");
          if (local) {
            dispatch({ type: "SET_CATEGORIES", payload: JSON.parse(local) });
          } else {
            dispatch({ type: "SET_CATEGORIES", payload: DEFAULT_CATEGORIES });
          }
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
          mode: "no-cors",
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

  // Solo sumar categorías top-level (no subcategorías) para evitar doble conteo
  const totalExpenses = categories
    .filter((c) => c.id !== "sueldo" && c.parentId === null)
    .reduce((sum, c) => sum + Number(c.budgeted), 0);

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

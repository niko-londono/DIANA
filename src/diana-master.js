/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DIANA — ARCHIVO MAESTRO DE LÓGICA (.JS)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Este archivo centraliza:
 * 1. Constantes y configuración (API Google Sheets, Categorías base, Temas, Meses)
 * 2. Utilidades y Formateadores numéricos / de moneda
 * 3. Metadatos de Categorías (tipos, badges, colores, íconos)
 * 4. Reducer de Presupuesto (acciones CRUD, toggles, reset)
 * 5. Sincronización en la nube (Google Apps Script) + Respaldo Local (localStorage)
 * 6. React Context y Custom Hook (BudgetContext, BudgetProvider, useBudget)
 * 7. Funciones de exportación (CSV) y cálculos de balance
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { createContext, useContext, useReducer, useEffect, useState, useRef, createElement } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONFIGURACIÓN Y CONSTANTES DEL SISTEMA
// ─────────────────────────────────────────────────────────────────────────────

export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2GE95BLK0ATcberMo8zZ4dIwMwcKjPzeHXnrKQA8C5DNE_yjnVgDeW4j0xDSzfmyP/exec";

export const LOCAL_STORAGE_KEY = "finanzas_backup";

export const MONTHS = [
  "Enero 2024", "Febrero 2024", "Marzo 2024", "Abril 2024",
  "Mayo 2024", "Junio 2024", "Julio 2024", "Agosto 2024",
  "Septiembre 2024", "Octubre 2024", "Noviembre 2024", "Diciembre 2024",
  "Enero 2025", "Febrero 2025", "Marzo 2025"
];

export const CATEGORY_TYPES = [
  "Gasto Fijo",
  "Estilo de Vida",
  "Patrimonio",
  "Ingreso Base",
  "Gasto Variable"
];

export const ICONS_OPTIONS = [
  { id: "home", label: "Casa / Fijo" },
  { id: "travel", label: "Viajes / Ocio" },
  { id: "savings", label: "Ahorro / Inversión" },
  { id: "cash", label: "Efectivo / Sueldo" },
  { id: "default", label: "General" }
];

export const ALLOCATION_COLOR_PALETTE = [
  { color: "#6366f1", label: "Gastos M" },
  { color: "#06b6d4", label: "Viajes" },
  { color: "#a855f7", label: "Ahorro" },
  { color: "#f59e0b", label: "Otros" },
  { color: "#ec4899", label: "Extra" }
];

export const METRIC_CARD_THEMES = [
  { box: "bg-indigo-light text-indigo", highlight: "highlight-indigo" },
  { box: "bg-cyan-light text-cyan", highlight: "highlight-cyan" },
  { box: "bg-purple-light text-purple", highlight: "highlight-purple" }
];

export const NAV_ITEMS = [
  { id: "overview", label: "Overview", iconType: "grid" },
  { id: "proyeccion", label: "Proyección", iconType: "trending" },
  { id: "distribution", label: "Distribución", iconType: "pie" },
  { id: "cards", label: "Tarjetas", iconType: "card" },
  { id: "settings", label: "Settings", iconType: "settings" },
  { id: "notes", label: "Notes", iconType: "notes" }
];

export const DEFAULT_CATEGORIES = [
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

// ─────────────────────────────────────────────────────────────────────────────
// 2. UTILIDADES Y FORMATEADORES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formatea un valor numérico a moneda: $96,228.00
 */
export function formatCurrency(value) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";
  return "$" + num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parsea un string con formato de moneda a número float
 */
export function parseCurrency(str) {
  if (typeof str === "number") return str;
  const cleaned = String(str).replace(/[^0-9.\-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Calcula porcentaje en formato string (ej: "88.2%")
 */
export function getPercent(amount, total) {
  const numericAmount = Number(amount) || 0;
  const numericTotal = Number(total) || 0;
  if (numericTotal <= 0) return "0.0%";
  return ((numericAmount / numericTotal) * 100).toFixed(1) + "%";
}

/**
 * Calcula porcentaje numérico entre 0 y 100
 */
export function getPercentNum(amount, total) {
  const numericAmount = Number(amount) || 0;
  const numericTotal = Number(total) || 0;
  if (numericTotal <= 0) return 0;
  return Math.min(100, Math.max(0, (numericAmount / numericTotal) * 100));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. METADATOS Y CLASIFICACIÓN DE CATEGORÍAS
// ─────────────────────────────────────────────────────────────────────────────

export function getCategoryMeta(cat) {
  if (!cat) {
    return {
      type: "Gasto",
      subtext: "",
      icon: "default",
      badgeCls: "badge-variable",
      color: "#64748b",
      bgColor: "#f1f5f9"
    };
  }

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

/**
 * Calcula la diferencia entre el presupuesto del padre y la suma de sus hijos
 */
export function getCategoryDiff(parent, allCategories) {
  const children = allCategories.filter((c) => c.parentId === parent.id);
  if (children.length === 0) return { display: "-", isZero: false, diff: 0 };
  const childrenTotal = children.reduce((sum, c) => sum + (Number(c.budgeted) || 0), 0);
  const diff = (Number(parent.budgeted) || 0) - childrenTotal;
  return {
    display: formatCurrency(diff),
    isZero: diff === 0,
    diff,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. EXPORTACIÓN A CSV
// ─────────────────────────────────────────────────────────────────────────────

export function exportBudgetToCSV(categories, totalIncome, totalExpenses, remainingBalance) {
  const rows = [
    ["Categoría", "Tipo", "Presupuestado", "Proporción (% Sueldo)", "Diferencia"],
  ];

  categories.forEach((c) => {
    const pct = totalIncome > 0 ? ((Number(c.budgeted) / totalIncome) * 100).toFixed(1) + "%" : "0%";
    rows.push([`"${c.name}"`, `"${c.type || "Gasto"}"`, c.budgeted, pct, "-"]);
  });

  rows.push([
    "\"Sueldo Cuadre\"",
    "\"Total Asignado\"",
    totalExpenses,
    "100%",
    remainingBalance,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `presupuesto_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PROYECCIÓN Y CALCULADORA DE METAS DE AHORRO
// ─────────────────────────────────────────────────────────────────────────────

export const GOAL_STORAGE_KEY = "finanzas_meta_ahorro";

export const DEFAULT_GOAL = {
  goalName: "Meta de ahorro",
  targetAmount: 90000,
  currentSavings: 10000,
  termMonths: 6,
  startDate: "2026-09-29",
  annualRate: 0,
};

/**
 * Suma meses a una fecha respetando el día del mes o ajustando al último día válido
 */
export function addMonthsSafe(baseDate, monthsToAdd) {
  const d = new Date(baseDate.getTime());
  const targetDay = baseDate.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthsToAdd);
  const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(targetDay, maxDays));
  return d;
}

/**
 * Formatea un objeto Date a "DD/MM/YYYY"
 */
export function formatDateDDMMYYYY(date) {
  if (!date || isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Convierte un string "YYYY-MM-DD" a Date de forma segura sin desajuste de zona horaria local
 */
export function parseISODate(isoStr) {
  if (!isoStr) return new Date();
  const parts = String(isoStr).split("-").map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(isoStr);
}

/**
 * Calcula todas las métricas de proyección de ahorro, compatibilidad presupuestaria y cronograma mes a mes
 */
export function calculateGoalProjection({
  goalName = "Meta de ahorro",
  targetAmount = 90000,
  currentSavings = 10000,
  termMonths = 6,
  startDate = "2026-09-29",
  annualRate = 0,
  budgetedSavings = 1000,
  totalIncome = 17000
}) {
  const target = Math.max(0, Number(targetAmount) || 0);
  const current = Math.max(0, Number(currentSavings) || 0);
  const months = Math.max(1, Number(termMonths) || 1);
  const rate = Math.max(0, Number(annualRate) || 0);
  const budgeted = Math.max(0, Number(budgetedSavings) || 0);
  const income = Math.max(0, Number(totalIncome) || 0);

  const remainingToSave = Math.max(0, target - current);
  const savedPercent = target > 0 ? (current / target) * 100 : 0;

  // Cálculo de cuota mensual necesaria (PMT)
  let monthlyRequired = 0;
  if (rate <= 0) {
    monthlyRequired = months > 0 ? remainingToSave / months : 0;
  } else {
    const r = (rate / 100) / 12;
    const fvCurrent = current * Math.pow(1 + r, months);
    const remAtFuture = target - fvCurrent;
    if (remAtFuture <= 0) {
      monthlyRequired = 0;
    } else {
      monthlyRequired = remAtFuture * (r / (Math.pow(1 + r, months) - 1));
    }
  }

  // Desgloses temporales
  const biweekly = monthlyRequired / 2;
  const weekly = (monthlyRequired * 12) / 52;
  const daily = (monthlyRequired * 12) / 365;

  // Fechas
  const baseDateObj = parseISODate(startDate);
  const targetDateObj = addMonthsSafe(baseDateObj, months);
  const targetDateFormatted = formatDateDDMMYYYY(targetDateObj);
  const startDateFormatted = formatDateDDMMYYYY(baseDateObj);

  // Compatibilidad presupuestaria
  const monthlyDiff = budgeted - monthlyRequired;
  const isBudgetDeficit = monthlyDiff < -0.01;
  const isBudgetSurplus = monthlyDiff >= -0.01;
  const incomePercentNeeded = income > 0 ? (monthlyRequired / income) * 100 : 0;
  const monthsWithBudgetedSavings = budgeted > 0 ? Math.ceil(remainingToSave / budgeted) : Infinity;

  // Plan mes a mes
  const r = (rate / 100) / 12;
  const schedule = [];
  let runningBalance = current;

  for (let i = 1; i <= months; i++) {
    const monthDateObj = addMonthsSafe(baseDateObj, i);
    const monthInterest = rate > 0 ? runningBalance * r : 0;
    runningBalance = runningBalance + monthInterest + monthlyRequired;
    const isLastMonth = i === months;
    const displayedAccumulated = isLastMonth ? Math.max(runningBalance, target) : runningBalance;
    const pct = target > 0 ? (displayedAccumulated / target) * 100 : 100;

    schedule.push({
      month: i,
      date: formatDateDDMMYYYY(monthDateObj),
      aporte: monthlyRequired,
      interest: monthInterest,
      accumulated: displayedAccumulated,
      percent: Math.min(100, Math.round(pct)),
      percentExact: Math.min(100, pct)
    });
  }

  return {
    goalName,
    targetAmount: target,
    currentSavings: current,
    termMonths: months,
    startDate,
    startDateFormatted,
    annualRate: rate,
    remainingToSave,
    savedPercent,
    monthlyRequired,
    biweekly,
    weekly,
    daily,
    targetDateFormatted,
    budgetedSavings: budgeted,
    monthlyDiff,
    isBudgetDeficit,
    isBudgetSurplus,
    incomePercentNeeded,
    monthsWithBudgetedSavings,
    schedule
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. REDUCER DEL PRESUPUESTO
// ─────────────────────────────────────────────────────────────────────────────

export function budgetReducer(state, action) {
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

// ─────────────────────────────────────────────────────────────────────────────
// 6. REACT CONTEXT Y PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(budgetReducer, { categories: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("saved"); // "saved", "saving", "error"
  const isFirstRender = useRef(true);

  // 1. Cargar datos desde Google Sheets al iniciar (con fallback a localStorage)
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        if (data && Array.isArray(data.categories) && data.categories.length > 0) {
          dispatch({ type: "SET_CATEGORIES", payload: data.categories });
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.categories));
        } else if (data && data.error) {
          console.warn("Respuesta de Google Sheets:", data.error);
          const local = localStorage.getItem(LOCAL_STORAGE_KEY);
          dispatch({
            type: "SET_CATEGORIES",
            payload: local ? JSON.parse(local) : DEFAULT_CATEGORIES
          });
        } else {
          const local = localStorage.getItem(LOCAL_STORAGE_KEY);
          dispatch({
            type: "SET_CATEGORIES",
            payload: local ? JSON.parse(local) : DEFAULT_CATEGORIES
          });
        }
      } catch (e) {
        console.error("Error al cargar desde Google Sheets:", e);
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        dispatch({
          type: "SET_CATEGORIES",
          payload: local ? JSON.parse(local) : DEFAULT_CATEGORIES
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // 2. Guardar datos en Google Sheets cada vez que cambien (debounced a 1s)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isLoading || state.categories.length === 0) return;

    // Respaldo instantáneo en localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.categories));

    // Sincronización en segundo plano con Google Sheets
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

    const timeoutId = setTimeout(() => {
      syncData();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state.categories, isLoading]);

  // Valores Computados
  const categories = state.categories;

  const totalIncome = categories
    .filter((c) => c.id === "sueldo")
    .reduce((sum, c) => sum + (Number(c.budgeted) || 0), 0);

  // Solo sumar categorías top-level (no subcategorías) para evitar doble conteo
  const totalExpenses = categories
    .filter((c) => c.id !== "sueldo" && c.parentId === null)
    .reduce((sum, c) => sum + (Number(c.budgeted) || 0), 0);

  const remainingBalance = totalIncome - totalExpenses;
  const isBalanced = remainingBalance === 0;

  return createElement(
    BudgetContext.Provider,
    {
      value: {
        categories,
        totalIncome,
        totalExpenses,
        remainingBalance,
        isBalanced,
        dispatch,
        isLoading,
        syncStatus,
      }
    },
    children
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
  return ctx;
}

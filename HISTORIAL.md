# 📜 HISTORIAL & ARQUITECTURA DEL PROYECTO (DIANA / FINANZAS)

> **Instrucción para Modelos de IA en Chats Nuevos:**  
> Lee este archivo completo antes de inspeccionar o modificar código. Contiene la arquitectura completa, el modelo de datos, la lógica de sincronización y el registro de cambios. Modifica **únicamente** los tres archivos maestros según el tipo de cambio requerido:
> - Interfaz / Componentes visuales ➔ [`src/diana-master.jsx`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/diana-master.jsx)
> - Estilos / Animaciones / Responsive ➔ [`src/diana-master.css`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/diana-master.css)
> - Lógica / Context / API / Cálculos ➔ [`src/diana-master.js`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/diana-master.js)

---

## 🏗️ 1. Arquitectura de 3 Archivos Maestros

El núcleo de la aplicación está unificado en tres archivos principales para máxima mantenibilidad y consumo mínimo de tokens:

```
src/
├── diana-master.jsx   # 🎨 MAESTRO UI: Todos los componentes React, iconos SVG y layout
├── diana-master.css   # 🖌️ MAESTRO ESTILOS: Design system, variables, estilos globales y media queries
└── diana-master.js    # ⚙️ MAESTRO LÓGICA: Reducer, Context API, Google Sheets API, localStorage y cálculos
```

### Archivos Complementarios y Puentes
- [`src/main.jsx`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/main.jsx): Punto de entrada que monta `<DianaApp />` e importa `diana-master.css`.
- [`src/App.jsx`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/App.jsx): Archivo puente que re-exporta `DianaApp` desde `diana-master.jsx`.
- [`src/index.css`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/index.css): Archivo puente que importa `diana-master.css`.
- [`src/context/BudgetContext.jsx`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/context/BudgetContext.jsx) y [`src/utils/formatters.js`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/utils/formatters.js): Re-exportan desde `diana-master.js` para compatibilidad retroactiva.
- [`Code.gs`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/Code.gs): Código del backend en Google Apps Script para interactuar con Google Sheets.
- [`vite.config.js`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/vite.config.js): Configuración de Vite con `base: "/DIANA/"` para GitHub Pages.

---

## 💾 2. Flujo de Datos y Sincronización en la Nube

1. **Google Sheets + Google Apps Script Web App**:
   - URL del Script: `https://script.google.com/macros/s/AKfycbz2GE95BLK0ATcberMo8zZ4dIwMwcKjPzeHXnrKQA8C5DNE_yjnVgDeW4j0xDSzfmyP/exec`
   - Hoja de cálculo: Hoja llamada `"Categorias"`.
   - Columnas: `id`, `name`, `budgeted`, `parentId`, `canDelete`, `expanded` (sin cambios; **`Code.gs` no se modificó**).
   - **Datos por mes (v1.8.0)**: el mes viaja dentro del `id` y del `parentId` con el formato `YYYY-MM::<id>` (ej. `2026-10::gastos-m`, padre `2026-10::sueldo`). Las filas antiguas sin prefijo se asignan automáticamente al mes actual la primera vez que se carga y se reescriben ya con prefijo.
2. **Carga Inicial (`fetchData`)**:
   - Lanza petición `GET` a `SCRIPT_URL`.
   - Si la red responde con categorías válidas, las agrupa por mes (`deserializeRows`), actualiza el estado y guarda en `localStorage` (`finanzas_backup`, formato `{ version: 2, byMonth }`; también lee el formato antiguo de arreglo plano).
   - Si falla o la hoja está vacía, realiza fallback automático a `localStorage` y finalmente a `DEFAULT_CATEGORIES`.
- **Tarjetas (v1.11.0)**: se guardan **solo en `localStorage`** (clave `finanzas_tarjetas`, formato `{ version: 1, byMonth }`). No viajan a Google Sheets porque `Code.gs` solo maneja las 6 columnas de categorías; sincronizarlas en la nube requeriría ampliar `Code.gs` (p. ej. una hoja `Tarjetas`).
3. **Persistencia Automática (`syncData`)**:
   - Al mutar cualquier categoría, guarda de inmediato en `localStorage` (cero pérdida de datos).
   - Ejecuta un guardado asíncrono con **debounce de 1000ms** hacia Google Sheets mediante `POST` con `mode: "no-cors"` y `headers: { "Content-Type": "text/plain;charset=utf-8" }`.
   - Estados de sincronización visibles en tiempo real en el Header:
     - `saved`: Sincronizado con la nube (punto verde).
     - `saving`: Guardando... (punto ámbar parpadeante).
     - `error`: Sin conexión / Local (punto rojo).

---

## 📊 3. Reglas de Negocio y Metodología Presupuestaria

- **Metodología Base Cero**:  
  $$\text{Ingresos (Sueldo + Ingresos Extra)} - \text{Total Asignado (Gastos)} = \text{Diferencia ($0.00)}$$
- **Presupuesto Independiente por Mes**:
  El estado es `byMonth = { "2026-10": [...], "2026-11": [...] }`. Todo lo que se edita, crea, elimina o restablece afecta únicamente al mes seleccionado. Al abrir un mes por primera vez (`ENSURE_MONTH`) se crea como **copia independiente** del mes anterior más cercano con datos (si no hay, del siguiente; si no, de `DEFAULT_CATEGORIES`). Después de creado ya no se sincroniza con ningún otro mes.
- **Ingresos Extra (categorías tipo "Ingreso Base")**:
  Una categoría principal (`parentId: null`) con tipo **Ingreso Base** se **suma** al ingreso total en lugar de contarse como gasto (función `isIncomeCategory` en `diana-master.js`). `totalIncome` = Sueldo + esas categorías; `totalExpenses` excluye a todas ellas. Las subcategorías nunca suman. El porcentaje de cada fila se calcula sobre el ingreso total.
- **Prevención de Doble Conteo**:  
  Las categorías principales tienen `parentId: null`. Las subcategorías tienen `parentId: <id_padre>`.  
  El cálculo de gastos totales (`totalExpenses`) únicamente suma categorías principales que no son ingreso (`!parentId && !isIncomeCategory`).
- **Diferencia en Categorías con Hijos**:  
  Para una categoría padre con subcategorías:  
  $$\text{Diferencia} = \text{Presupuesto(Padre)} - \sum \text{Presupuesto(Hijos)}$$  
  Muestra un badge verde `$0.00` si cuadra exacto, o un badge de advertencia si no coinciden.
- **Jerarquía y Visualización en Tabla**:
  - **Sueldo**: Primera fila destacada con badge verde y barra al 100%.
  - **Categorías Padres**: Expandibles mediante botón chevron, con icono temático, tipo y barra proporcional.
  - **Subcategorías**: Con sangría limpia y conector `└`, título en mayúsculas color verde esmeralda y **sin iconos repetidos**.
  - **Sueldo Cuadre (tfoot)**: Fila oscura de cierre que compara el total asignado con el sueldo y verifica el estado de "BALANCE CERO", "SUPERÁVIT" o "DÉFICIT".

---

## 🧩 4. Inventario de Componentes (`diana-master.jsx`)

| Componente | Función |
| :--- | :--- |
| `DianaApp` | Componente raíz, envuelve en `BudgetProvider`, gestiona navegación y sidebar. |
| `Sidebar` | Barra lateral con navegación, botón de colapso de escritorio y menú hamburguesa móvil. |
| `Header` | Barra superior con logo, título, badge de sincronización y `MonthPicker`. |
| `MonthPicker` | Calendario solo de meses y años (cuadrícula 3×4, flechas de año, botón "Mes actual", punto en meses con presupuesto). Cierra con Escape o clic fuera. |
| `BudgetHero` | Cabecera con badge de balance cero/superávit/déficit, exportación CSV y botón "Nueva Categoría". |
| `MetricCards` | Cuadrícula de 4 tarjetas: Ingreso Base, Gastos M, Viajes & Vacaciones y Fondo de Ahorro. |
| `AllocationBar` | Barra multisegmento que visualiza el porcentaje que representa cada categoría sobre el sueldo. |
| `BudgetTable` | Tabla completa con buscador, desglose por categorías, subcategorías y fila de Sueldo Cuadre. |
| `AddCategoryModal` | Modal reutilizable para crear y editar categorías o subcategorías. |
| `PlaceholderPage` | Vistas en construcción para las pestañas de navegación secundaria. |
| `DistributionPage` | Pestaña Distribución: gráfica de barras apiladas por mes (ganancia + reparto por categoría), vista $ / %, KPIs del año, detalle del mes y tabla resumen. |
| `CardsPage` / `CreditCardModal` | Pestaña Tarjetas: tarjetas del mes con fecha de corte, vencimiento, estado de pago (botón pagada / deshacer), editar y eliminar. El modal sirve para crear y editar. |
| `Icons` | Colección completa de iconos vectoriales en SVG (Cash, Home, Plane, Vault, etc.). |

---

## 📝 5. Historial de Cambios y Actualizaciones

### [v1.11.0] — 2026-10-10 (Tarjetas: corte, vencimiento y pago por mes)
- **Nueva pestaña Tarjetas** (`diana-master.jsx`, `CardsPage` + `CreditCardModal`): reemplaza el placeholder "Próximamente".
  - **Agregar / editar tarjeta**: nombre (máx. 40 caracteres), fecha de corte y fecha de vencimiento. El modal reutiliza el estilo de `AddCategoryModal`. Los días se eligen de una lista 1–31 y son obligatorios.
  - **Botón de pago** en cada tarjeta: "Marcar como pagada" ⇄ "Pagada el 10 oct · Deshacer" (guarda la fecha de pago, `aria-pressed`).
  - **Estado automático** según la fecha de vencimiento del mes: Pagada, Vence en N días, Vence hoy (≤ 5 días se resalta en ámbar) o Vencida hace N días. Un mes pasado sin pagar aparece vencido.
  - **Orden**: pendientes primero por vencimiento; las pagadas al final.
  - **Indicadores**: pagadas (con barra de progreso), pendientes (y cuántas vencidas), próximo vencimiento y total de tarjetas.
  - **Eliminar** con confirmación (`window.confirm`) que aclara que los demás meses no se modifican.
- **Por mes, igual que el presupuesto**: `cutDay` y `dueDay` son el día del mes dentro del mes seleccionado (si el mes es más corto se usa su último día; día 31 en abril = 30). Cada mes tiene su propia lista y su propio estado de pago; agregar, editar, eliminar o pagar solo afecta al mes seleccionado. Al abrir por primera vez un mes sin tarjetas se crea como **copia independiente del mes anterior más cercano con todas las tarjetas sin pagar** (no se copia hacia atrás: un mes anterior a todos los registrados queda vacío).
- **Lógica** (`diana-master.js`, sección 6C): `useCards` (hook de la página), `getCardDate`, `getCardStatus`, `sortCards`, `buildCardsForNewMonth`, `formatShortDate`, `daysInMonth`. Los datos leídos de `localStorage` se sanean (nombres vacíos, días fuera de rango, meses inválidos o JSON dañado no rompen la página).
- **Almacenamiento**: solo `localStorage` (ver sección 2); el indicador "Sincronizado con la nube" del encabezado aplica al presupuesto, no a las tarjetas.
- **Estilos** (`diana-master.css`, sección 16): `.credit-*`, más `.form-hint`; reutiliza hero, KPIs (`.dist-kpi-*`) y modal existentes. Responsive: una columna a ≤ 600px y botón de agregar a todo el ancho.
- Verificado con Vite 5 (build sin errores) y 19 pruebas en total (10 nuevas de Tarjetas: estados de pago, ajuste por largo de mes, copia al mes nuevo sin pagar, independencia entre meses, editar/eliminar, persistencia y datos dañados).

### [v1.10.0] — 2026-10-10 (Distribución: ganancia por mes y reparto mensual)
- **Nueva pestaña Distribución** (`diana-master.jsx`, `DistributionPage`): reemplaza el placeholder "Próximamente".
  - **Gráfica de barras apiladas, 12 meses del año**: la altura de cada barra es la ganancia del mes (Sueldo + categorías "Ingreso Base") y cada color es una categoría principal de gasto. Si el mes tiene superávit, la parte sin asignar se dibuja rayada; si tiene déficit, un marcador oscuro indica el nivel de la ganancia.
  - **Interruptor "$ Monto" / "% Distribución"**: en % todas las barras se normalizan al 100% para comparar cómo se repartió cada mes.
  - **Selector de año** (flechas en el hero, 2020–2100). Sigue al año que se elija en el calendario del encabezado.
  - **KPIs del año**: ganancia total, promedio mensual, mejor mes y total asignado.
  - **Panel "Detalle de <mes>"** (se cambia tocando una barra o una fila): ganancia, monto y % por categoría, total asignado y diferencia con badge BALANCE CERO / SUPERÁVIT / DÉFICIT.
  - **Tabla "Resumen por mes"** con monto y % por categoría, fila de total del año y primera columna fija en móvil.
  - **Meses futuros** (posteriores al mes actual) se muestran atenuados como "Proyectado" y **no suman** a totales, promedio ni mejor mes. Motivo: abrir un mes futuro en el calendario crea una copia del mes anterior (`ENSURE_MONTH`) y distorsionaría las ganancias reales.
- **Lógica** (`diana-master.js`, sección 6B): nuevas `getMonthSummary`, `buildYearDistribution`, `formatCompactCurrency` y `DISTRIBUTION_COLORS`. Las categorías se identifican por `id`, así que conservan el mismo color en todos los meses. El contexto ahora también expone `byMonth` (el resto de valores sigue siendo del mes seleccionado).
- **Estilos** (`diana-master.css`, sección 15): clases `.dist-*`, reutilizando el hero y las tarjetas de Proyección (`.projection-hero-header`, `.projection-card`). Responsive a 1100px, 900px y 600px (en móvil el valor sobre la barra solo se muestra en el mes activo) y respeta `prefers-reduced-motion`.
- **Sin cambios** en `Code.gs`, el formato de Google Sheets ni el respaldo local.
- Verificado con Vite 5 (build sin errores) y 9 pruebas (lógica de agrupación, totales, meses futuros, año vacío, clic en barras, modo %, navegación de año).

### [v1.9.0] — 2026-10-03 (Ingresos Extra suman al Ingreso)
- **Lógica** (`diana-master.js`): nueva función `isIncomeCategory`. `totalIncome` ahora suma el Sueldo y toda categoría principal de tipo "Ingreso Base"; `totalExpenses` las excluye. `getCategoryMeta` trata el tipo "Ingreso Base" con estilo de ingreso (badge verde, ícono de efectivo, descripción "Ingreso adicional que se suma al sueldo").
- **Tarjetas** (`diana-master.jsx`): la primera tarjeta muestra el ingreso total ("INGRESO TOTAL (SUELDO + EXTRAS)") cuando existen ingresos extra; sin extras queda igual que antes. Las tarjetas de gasto y la barra de Distribución ya no incluyen categorías de ingreso.
- **Tabla**: las categorías de ingreso se listan justo debajo del Sueldo y antes de los gastos. La fila del Sueldo muestra su porcentaje real del ingreso total (100% si no hay extras). Encabezado renombrado a "PROPORCIÓN (% INGRESO)" (igual en el CSV).
- **Efecto en el balance**: ejemplo Sueldo $17,000 + Ingresos Extra $1,000 contra gastos de $17,000 → ya no es déficit; queda superávit de $1,000 por asignar.
- Pruebas de lógica y UI verificadas (incluye caso con y sin ingresos extra).

### [v1.8.0] — 2026-10-03 (Calendario de Mes/Año y Presupuesto por Mes)
- **Selector de mes** (`diana-master.jsx`): el dropdown con lista fija de meses 2024/2025 fue reemplazado por el componente `MonthPicker`: calendario de solo meses y años (sin días), navegación de año con flechas (2020–2100), mes seleccionado resaltado, borde en el mes actual, punto en los meses que ya tienen presupuesto y botón "Mes actual". Nuevos iconos `ChevronLeftIcon`, `ChevronRightIcon` y `CalendarIcon`.
- **Datos por mes** (`diana-master.js`): el estado pasó de `categories` a `byMonth`. `BudgetProvider` expone `selectedMonth`, `setSelectedMonth`, `selectedMonthLabel` y `monthsWithData`; `categories`, `totalIncome`, `totalExpenses`, etc. siempre corresponden al mes seleccionado, por lo que **ningún componente existente necesitó cambios** (incluida la página Proyección, que usa el ahorro del mes seleccionado). El `dispatch` del contexto agrega `monthKey` a cada acción automáticamente.
- **Reducer**: nuevas acciones `LOAD_ALL` y `ENSURE_MONTH`; `RESET` ahora restablece solo el mes seleccionado (el aviso de confirmación lo indica).
- **Sincronización**: mes codificado en `id`/`parentId` (`YYYY-MM::id`), compatible con el `Code.gs` actual. Migración automática de datos antiguos al mes actual. Respaldo local en formato `{ version: 2, byMonth }` con lectura del formato anterior.
- **Exportación CSV**: el archivo descargado usa el mes seleccionado (`presupuesto_2026-10.csv`).
- **Estilos** (`diana-master.css`): reemplazadas las reglas `.month-dropdown-menu` / `.month-option` por `.month-picker-*` y `.month-cell*` (sección 5); icono de calendario oculto a ≤420px; respeta `prefers-reduced-motion`.
- `MONTHS` se conserva como export obsoleto por compatibilidad; usar `MONTH_NAMES` / `MONTH_NAMES_SHORT`.
- Build verificado (Vite 5) y pruebas de lógica/UI del aislamiento entre meses sin errores.

### [v1.7.0] — 2026-10-03 (Subcategorías para Sueldo)
- **Modal** (`diana-master.jsx`): Eliminada la exclusión de `sueldo` en `parentOptions` — ahora aparece en el dropdown "Categoría Padre (Opcional)".
- **Tabla BudgetTable** (`diana-master.jsx`): La fila de Sueldo fue reemplazada por lógica dinámica que:
  - Muestra botón chevron de expand/collapse si hay subcategorías.
  - Despliega las subcategorías de Sueldo con sangría `└` y badge esmeralda igual que los demás padres.
  - Muestra el badge de diferencia (cuadre/déficit) cuando tiene hijos.
  - Permite editar y eliminar subcategorías de Sueldo individualmente.
- **Lógica preservada**: `totalIncome` sigue usando solo el valor del Sueldo padre; las subcategorías (quincenas, ingresos extra) son solo visuales/organizativas y no afectan el balance cero.
- Build verificado: 837ms, sin errores.

### [v1.6.0] — 2026-10-03 (CSS de la Página Proyección de Metas)
- Añadida la **sección 14** completa de estilos en [`src/diana-master.css`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/diana-master.css) para `GoalProjectionPage`:
  - `.projection-container`, `.projection-hero-header` con gradiente oscuro y radial glow.
  - `.projection-pill-tag`, `.projection-hero-title/subtitle/desc`, `.preset-btn` con estados hover/active.
  - `.projection-alert` con variantes `alert-deficit` (rojo) y `alert-surplus` (verde).
  - `.projection-card`, `.projection-card-header`, `.card-header-icon-box` con variantes `bg-indigo` y `bg-cyan`.
  - Formulario: `.goal-form-grid`, `.goal-input`, `.input-currency-wrapper`, `.quick-chip` con estado active verde.
  - KPI Grid: `.results-kpi-grid`, `.result-kpi-card`, `.featured-emerald` (span 3 destacada oscura).
  - Tabla de compatibilidad: `.compat-table`, `.diff-pill-badge` con variantes `diff-zero` y `diff-warn`.
  - Tabla cronograma: `.schedule-table`, `.schedule-row.milestone-row`, `.schedule-progress-bar`, `.milestone-badge`.
  - Responsive completo: breakpoints `900px` y `600px`.
- Build verificado: 866ms, sin errores.

### [v1.5.0] — 2026-10-01 (Unificación en 3 Archivos Maestros y Creación de HISTORIAL.md)
- **Consolidación de Arquitectura**:
  - Creado [`src/diana-master.jsx`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/diana-master.jsx) conteniendo toda la UI y componentes.
  - Creado [`src/diana-master.css`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/diana-master.css) conteniendo todos los estilos, tokens y responsive design.
  - Creado [`src/diana-master.js`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/diana-master.js) conteniendo toda la lógica, Context, API, reducer y cálculos.
  - Reconfigurado [`src/main.jsx`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/main.jsx) y archivos auxiliares para apuntar directamente a los maestros.
  - Creado [`HISTORIAL.md`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/HISTORIAL.md) para optimizar el contexto y reducir drásticamente el consumo de tokens en nuevos chats.
  - Build de Vite verificado con éxito (818ms) y validación en navegador sin errores.

### [v1.4.0] — 2026-10-01 (Optimización Móvil y Responsive Integral)
- Menú lateral convertido en drawer desplegable con overlay y botón hamburguesa fijo.
- Encabezado sticky con backdrop blur y selector de mes compacto.
- Tabla adaptada a pantallas móviles mediante `table-layout: fixed` y colapso de columnas desktop (`TIPO`, `PROPORCIÓN`, `DIFERENCIA`) hacia metas compactas bajo el nombre.
- Ajuste del grid de tarjetas de métricas a 2 columnas en móvil y 1 columna en pantallas ultraestrechas.
- Barra de asignación con progreso compacto (8px) y badges reducidos.

### [v1.3.0] — 2026-10-01 (Diseño de Subcategorías Limpias)
- Eliminados los iconos duplicados en las filas de subcategorías.
- Añadido espaciador con conector de árbol `└` (`.subcat-indent-space`).
- Texto de subcategorías formateado en mayúsculas con color verde esmeralda suave (`#10b981`) para una jerarquía visual limpia.

### [v1.2.0] — 2026-10-01 (Sueldo Cuadre y Fila Oscura de Cierre)
- Añadida fila de resumen `tfoot` (`.summary-dark-row`) en contraste oscuro (`#0f172a`).
- Indicador visual de estado de cuadre: "BALANCE CERO", "SUPERÁVIT" o "DÉFICIT".
- Botón de exportación a CSV en formato estándar descargable en un clic.

### [v1.1.0] — 2026-10-01 (Integración con Google Apps Script y Sincronización en Nube)
- Conexión con Google Sheets para persistencia remota mediante Web App de Apps Script (`Code.gs`).
- Soporte para operaciones de lectura (`doGet`) y guardado masivo en lote (`doPost`).
- Mecanismo de debounce (1s) para evitar sobrecarga de peticiones y respaldo local instantáneo en `localStorage`.

### [v1.0.0] — 2026-09-03 (Configuración Inicial de la Aplicación)
- Proyecto base en React 18 + Vite 5 + Vanilla CSS.
- Estructura inicial de presupuesto con ingreso y categorías principales.
- Configuración para despliegue automatizado en GitHub Pages.

---

## 💡 Guía Rápida para Futuras Modificaciones

1. **Si quieres cambiar la apariencia, estilos, márgenes, colores o fuentes**:
   Edita únicamente [`src/diana-master.css`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/diana-master.css).
2. **Si quieres cambiar botones, añadir vistas, ventanas modales o componentes**:
   Edita únicamente [`src/diana-master.jsx`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/diana-master.jsx).
3. **Si quieres modificar fórmulas, añadir acciones al reducer, cambiar la URL de Google Sheets o agregar funciones de cálculo**:
   Edita únicamente [`src/diana-master.js`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/src/diana-master.js).
4. **Al finalizar cualquier cambio importante**:
   Actualiza la sección de Historial de Cambios en este archivo [`HISTORIAL.md`](file:///d:/NIKO/PROYECTOS-WEB-APP/REPOS/DIANA/HISTORIAL.md).

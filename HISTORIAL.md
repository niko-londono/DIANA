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
   - Columnas: `id`, `name`, `budgeted`, `parentId`, `canDelete`, `expanded`.
2. **Carga Inicial (`fetchData`)**:
   - Lanza petición `GET` a `SCRIPT_URL`.
   - Si la red responde con categorías válidas, actualiza el estado y guarda en `localStorage` (`finanzas_backup`).
   - Si falla o la hoja está vacía, realiza fallback automático a `localStorage` y finalmente a `DEFAULT_CATEGORIES`.
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
  $$\text{Sueldo Base} - \text{Total Asignado (Gastos)} = \text{Diferencia ($0.00)}$$
- **Prevención de Doble Conteo**:  
  Las categorías principales tienen `parentId: null`. Las subcategorías tienen `parentId: <id_padre>`.  
  El cálculo de gastos totales (`totalExpenses`) únicamente suma categorías donde `parentId === null && id !== "sueldo"`.
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
| `Header` | Barra superior con logo, título, badge de sincronización y selector de mes. |
| `BudgetHero` | Cabecera con badge de balance cero/superávit/déficit, exportación CSV y botón "Nueva Categoría". |
| `MetricCards` | Cuadrícula de 4 tarjetas: Ingreso Base, Gastos M, Viajes & Vacaciones y Fondo de Ahorro. |
| `AllocationBar` | Barra multisegmento que visualiza el porcentaje que representa cada categoría sobre el sueldo. |
| `BudgetTable` | Tabla completa con buscador, desglose por categorías, subcategorías y fila de Sueldo Cuadre. |
| `AddCategoryModal` | Modal reutilizable para crear y editar categorías o subcategorías. |
| `PlaceholderPage` | Vistas en construcción para las pestañas de navegación secundaria. |
| `Icons` | Colección completa de iconos vectoriales en SVG (Cash, Home, Plane, Vault, etc.). |

---

## 📝 5. Historial de Cambios y Actualizaciones

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

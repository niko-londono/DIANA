/**
 * DIANA / Finanzas — backend en Google Apps Script (v2)
 *
 * Hojas que usa (se crean solas si no existen):
 *   - "Categorias": presupuesto por mes. El mes viaja en el id ("2026-10::gastos-m").
 *       id | name | budgeted | parentId | canDelete | expanded | type | subtext | icon
 *     Las 6 primeras columnas son las de siempre; type/subtext/icon son nuevas y opcionales.
 *   - "Plantillas": plantillas rápidas de la página "Proyección de metas".
 *       id | label | goalName | targetAmount | currentSavings | termMonths | startDate | annualRate
 *
 * Reglas de seguridad para no perder datos:
 *   - doPost solo reescribe una hoja si el payload trae esa lista.
 *   - Nunca se borran las categorías con una lista vacía.
 *   - Un candado (LockService) evita que dos guardados simultáneos se mezclen.
 *
 * Para publicar: Implementar > Administrar implementaciones > editar (lápiz) >
 * Versión: "Nueva versión" > Implementar. Así la URL /exec no cambia.
 */

const CATEGORY_SHEET = "Categorias";
const TEMPLATE_SHEET = "Plantillas";

const CATEGORY_HEADERS = ["id", "name", "budgeted", "parentId", "canDelete", "expanded", "type", "subtext", "icon"];
const TEMPLATE_HEADERS = ["id", "label", "goalName", "targetAmount", "currentSavings", "termMonths", "startDate", "annualRate"];

// ── Utilidades ──────────────────────────────────────────────────────────────

function normalizeName_(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/** Busca una hoja ignorando mayúsculas, tildes y espacios ("Categorías", "categorias "). */
function findSheet_(ss, wanted) {
  const target = normalizeName_(wanted);
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (normalizeName_(sheets[i].getName()) === target) return sheets[i];
  }
  return null;
}

function getSheet_(name, headers, create) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = findSheet_(ss, name);
  if (!sheet && create) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function toBool_(value) {
  return value === true || String(value).trim().toLowerCase() === "true";
}

function toText_(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value).trim();
}

function toNumber_(value) {
  const n = Number(value);
  return isFinite(n) ? n : 0;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Reemplaza el contenido de una hoja en una sola escritura (encabezado + filas). */
function writeSheet_(sheet, headers, rows, textColumns) {
  sheet.clearContents();
  const values = [headers].concat(rows);
  const range = sheet.getRange(1, 1, values.length, headers.length);
  // Columnas de texto (ids, fechas): evita que Sheets las convierta en número o fecha
  (textColumns || []).forEach(function (col) {
    sheet.getRange(1, col, values.length, 1).setNumberFormat("@");
  });
  range.setValues(values);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
}

// ── Lectura ─────────────────────────────────────────────────────────────────

function readCategories_() {
  const sheet = getSheet_(CATEGORY_SHEET, CATEGORY_HEADERS, true);
  const data = sheet.getDataRange().getValues();
  const categories = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = toText_(row[0]);
    if (!id) continue; // filas vacías
    const category = {
      id: id,
      name: toText_(row[1]),
      budgeted: toNumber_(row[2]),
      parentId: toText_(row[3]) || null,
      canDelete: row[4] === "" ? true : toBool_(row[4]),
      expanded: toBool_(row[5])
    };
    // Campos nuevos: solo se envían si tienen valor (si no, la app usa sus valores por defecto)
    const type = toText_(row[6]);
    const subtext = toText_(row[7]);
    const icon = toText_(row[8]);
    if (type) category.type = type;
    if (subtext) category.subtext = subtext;
    if (icon) category.icon = icon;
    categories.push(category);
  }
  return categories;
}

/** null = la hoja aún no existe (la app usará su copia local o las de ejemplo). */
function readTemplates_() {
  const sheet = getSheet_(TEMPLATE_SHEET, TEMPLATE_HEADERS, false);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  const templates = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = toText_(row[0]);
    if (!id) continue;
    templates.push({
      id: id,
      label: toText_(row[1]),
      goalName: toText_(row[2]),
      targetAmount: toNumber_(row[3]),
      currentSavings: toNumber_(row[4]),
      termMonths: toNumber_(row[5]),
      startDate: toText_(row[6]),
      annualRate: toNumber_(row[7])
    });
  }
  return templates;
}

function doGet(e) {
  try {
    return json_({
      version: 2,
      categories: readCategories_(),
      templates: readTemplates_()
    });
  } catch (error) {
    return json_({ error: error.message });
  }
}

// ── Escritura ───────────────────────────────────────────────────────────────

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const saved = {};

    if (Array.isArray(payload.categories) && payload.categories.length > 0) {
      const rows = payload.categories.map(function (cat) {
        return [
          toText_(cat.id),
          toText_(cat.name),
          toNumber_(cat.budgeted),
          toText_(cat.parentId),
          cat.canDelete !== false,
          Boolean(cat.expanded),
          toText_(cat.type),
          toText_(cat.subtext),
          toText_(cat.icon)
        ];
      });
      writeSheet_(getSheet_(CATEGORY_SHEET, CATEGORY_HEADERS, true), CATEGORY_HEADERS, rows, [1, 4]);
      saved.categories = rows.length;
    }

    // Las plantillas sí pueden quedar vacías (si se borraron todas)
    if (Array.isArray(payload.templates)) {
      const rows = payload.templates.map(function (t) {
        return [
          toText_(t.id),
          toText_(t.label),
          toText_(t.goalName),
          toNumber_(t.targetAmount),
          toNumber_(t.currentSavings),
          Math.max(1, Math.round(toNumber_(t.termMonths))),
          toText_(t.startDate),
          toNumber_(t.annualRate)
        ];
      });
      writeSheet_(getSheet_(TEMPLATE_SHEET, TEMPLATE_HEADERS, true), TEMPLATE_HEADERS, rows, [1, 7]);
      saved.templates = rows.length;
    }

    return json_({ success: true, version: 2, saved: saved });
  } catch (error) {
    return json_({ error: error.message });
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

function doOptions(e) {
  return json_({ status: "ok" });
}

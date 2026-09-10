function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Categorias");
  if (!sheet) {
    sheet = ss.getSheetByName("Categorías"); // con tilde
  }
  if (!sheet) {
    // Si no existe, buscamos si hay una sola hoja (ej: "Hoja 1" o "Sheet1") y la renombramos, o creamos una nueva
    const sheets = ss.getSheets();
    if (sheets.length === 1 && sheets[0].getLastRow() <= 1) {
      sheet = sheets[0];
      sheet.setName("Categorias");
    } else {
      sheet = ss.insertSheet("Categorias");
    }
  }
  return sheet;
}

function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ categories: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const categories = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[1]) continue;
      const category = {
        id: String(row[0]),
        name: String(row[1]),
        budgeted: Number(row[2]) || 0,
        parentId: row[3] ? String(row[3]) : null,
        canDelete: row[4] === true || String(row[4]).toLowerCase() === "true",
        expanded: row[5] === true || String(row[5]).toLowerCase() === "true"
      };
      categories.push(category);
    }

    return ContentService.createTextOutput(JSON.stringify({ categories: categories }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const payload = JSON.parse(e.postData.contents);
    const newCategories = payload.categories || [];

    // Limpiar contenido previo
    sheet.clearContents();
    
    // Encabezados
    sheet.appendRow(["id", "name", "budgeted", "parentId", "canDelete", "expanded"]);
    
    // Insertar registros en bloque (mucho más rápido y eficiente)
    if (newCategories.length > 0) {
      const rows = newCategories.map(cat => [
        cat.id, 
        cat.name, 
        cat.budgeted, 
        cat.parentId || "", 
        cat.canDelete !== false,
        Boolean(cat.expanded)
      ]);
      sheet.getRange(2, 1, rows.length, 6).setValues(rows);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  const response = ContentService.createTextOutput(JSON.stringify({ status: "ok" }));
  response.setMimeType(ContentService.MimeType.JSON);
  return response;
}

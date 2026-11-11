/**
 * Catálogo público para la tienda Peñafiel & Ruta.
 * Este proyecto debe estar vinculado al Google Sheets original.
 * Publica únicamente campos de catálogo; nunca expone precios, costos,
 * datos de clientes, ventas ni columnas internas.
 */
function doGet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const productos = [];
  const hojas = [];

  book.getSheets().forEach(function(sheet) {
    const values = sheet.getDataRange().getDisplayValues();
    if (!values || values.length < 2) {
      hojas.push({ nombre: sheet.getName(), filas: 0 });
      return;
    }

    const headers = values[0].map(normalizarEncabezado);
    let filasHoja = 0;

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row.every(function(cell) { return String(cell).trim() === ""; })) continue;

      const record = {};
      headers.forEach(function(header, index) {
        if (header) record[header] = row[index];
      });

      const marca = buscar(record, ["marca", "brand"]);
      const sabor = buscar(record, ["sabor", "producto", "nombre", "variedad"]);
      const tamano = buscar(record, ["tamano", "presentacion", "formato", "contenido", "medida"]);
      const activo = buscar(record, ["activo", "disponible", "mostrar", "visible"]);

      if (!marca || !sabor || !tamano || estaDesactivado(activo)) continue;

      productos.push({
        id: buscar(record, ["id", "codigo", "sku"]) || [sheet.getName(), i + 1, marca, sabor, tamano].join("-"),
        marca: marca,
        sabor: sabor,
        tamano: tamano,
        imagen: buscar(record, ["imagen", "foto", "image", "urlimagen"]),
        descripcion: buscar(record, ["descripcion", "detalle", "notas"]),
        orden: buscar(record, ["orden", "prioridad"]) || "",
        categoria: sheet.getName()
      });
      filasHoja++;
    }

    hojas.push({ nombre: sheet.getName(), filas: filasHoja });
  });

  const output = {
    correcto: true,
    actualizado: new Date().toISOString(),
    total: productos.length,
    hojas: hojas,
    productos: productos
  };

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizarEncabezado(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function buscar(record, posibles) {
  for (let i = 0; i < posibles.length; i++) {
    const key = normalizarEncabezado(posibles[i]);
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function estaDesactivado(value) {
  const v = String(value || "").trim().toLowerCase();
  return ["no", "false", "0", "inactivo", "inactiva", "oculto", "oculta"].includes(v);
}

/* ============================================================
   DATOS — lee las dos pestañas de Google Sheets en vivo.
   Si cambias un precio en la hoja, la web lo muestra al recargar.
   ============================================================ */
(function () {
  var C = window.CONFIG;

  function urlHoja(hoja) {
    return "https://docs.google.com/spreadsheets/d/" + C.sheetId +
      "/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent(hoja);
  }

  /* Lector de CSV: respeta comillas, comas y saltos de línea dentro de una celda */
  function parsearCSV(texto) {
    var filas = [], fila = [], celda = "", comillas = false;
    for (var i = 0; i < texto.length; i++) {
      var c = texto[i];
      if (comillas) {
        if (c === '"' && texto[i + 1] === '"') { celda += '"'; i++; }
        else if (c === '"') comillas = false;
        else celda += c;
      } else if (c === '"') comillas = true;
      else if (c === ",") { fila.push(celda); celda = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && texto[i + 1] === "\n") i++;
        fila.push(celda); celda = ""; filas.push(fila); fila = [];
      } else celda += c;
    }
    if (celda !== "" || fila.length) { fila.push(celda); filas.push(fila); }
    return filas;
  }

  function leerHoja(hoja) {
    var control = new AbortController();
    var reloj = setTimeout(function () { control.abort(); }, 15000);
    return fetch(urlHoja(hoja), { signal: control.signal }).then(function (r) {
      clearTimeout(reloj);
      if (!r.ok) throw new Error("No se pudo leer la hoja \"" + hoja + "\" (" + r.status + ")");
      return r.text();
    }).then(function (texto) {
      var filas = parsearCSV(texto);
      var cabecera = filas.shift().map(function (c) { return c.trim(); });
      return filas.map(function (f) {
        var o = {};
        cabecera.forEach(function (c, i) { o[c] = (f[i] || "").trim(); });
        return o;
      });
    });
  }

  var RESPALDO = "datos-hoja-v1";

  function armar(marcas, productos) {
    return window.Agrupar.armar(marcas, productos, {
      carpetaLogos: C.carpetaLogos,
      carpetaCarga: C.carpetaCarga,
      nombreOriginal: C.nombreOriginal
    });
  }

  /* Lee la hoja. Si no hay señal, usa la última copia que se pudo leer en ese teléfono. */
  function cargarDatos() {
    return Promise.all([leerHoja(C.hojaMarcas), leerHoja(C.hojaProductos)]).then(function (r) {
      try { localStorage.setItem(RESPALDO, JSON.stringify({ m: r[0], p: r[1] })); } catch (e) { /* sin almacenamiento */ }
      return armar(r[0], r[1]);
    }).catch(function (error) {
      var copia = null;
      try { copia = JSON.parse(localStorage.getItem(RESPALDO) || "null"); } catch (e) { copia = null; }
      if (copia && copia.m && copia.p) return armar(copia.m, copia.p);
      throw error;
    });
  }

  window.Datos = { cargarDatos: cargarDatos, parsearCSV: parsearCSV };
})();

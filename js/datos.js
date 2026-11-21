/* ============================================================
   DATOS — lee Marcas y Productos de Google Sheets.
   Usa dos rutas de lectura y valida el CSV antes de procesarlo.
   Si Google falla, conserva la última copia válida del teléfono.
   ============================================================ */
(function () {
  var C = window.CONFIG;

  function urlsHoja(hoja) {
    var id = encodeURIComponent(C.sheetId);
    var nombre = encodeURIComponent(hoja);
    return [
      "https://docs.google.com/spreadsheets/d/" + id + "/gviz/tq?tqx=out:csv&sheet=" + nombre,
      "https://docs.google.com/spreadsheets/d/" + id + "/export?format=csv&sheet=" + nombre
    ];
  }

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

  function convertir(texto, hoja) {
    var filas = parsearCSV(String(texto || "").replace(/^\uFEFF/, ""));
    if (!filas.length) throw new Error("La pestaña " + hoja + " llegó vacía.");
    var cabecera = filas.shift().map(function (c) { return c.trim(); });
    if (cabecera.indexOf("Marca") === -1 ||
        (hoja === C.hojaProductos && cabecera.indexOf("Producto") === -1)) {
      throw new Error("Google no entregó el CSV de la pestaña " + hoja + ".");
    }
    var registros = filas.filter(function (f) {
      return f.some(function (v) { return String(v || "").trim() !== ""; });
    }).map(function (f) {
      var o = {};
      cabecera.forEach(function (c, i) { o[c] = (f[i] || "").trim(); });
      return o;
    });
    if (!registros.length) throw new Error("La pestaña " + hoja + " no contiene registros.");
    return registros;
  }

  function pedir(url, hoja) {
    var control = new AbortController();
    var reloj = setTimeout(function () { control.abort(); }, 15000);
    return fetch(url, { signal: control.signal, cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    }).then(function (texto) {
      return convertir(texto, hoja);
    }).finally(function () {
      clearTimeout(reloj);
    });
  }

  function leerHoja(hoja) {
    var urls = urlsHoja(hoja);
    return pedir(urls[0], hoja).catch(function (primero) {
      return pedir(urls[1], hoja).catch(function (segundo) {
        throw new Error("No se pudo leer la pestaña " + hoja +
          ". Primer intento: " + primero.message + ". Segundo intento: " + segundo.message);
      });
    });
  }

  var RESPALDO = "datos-hoja-v1";

  function armar(marcas, productos) {
    var resultado = window.Agrupar.armar(marcas, productos, {
      carpetaLogos: C.carpetaLogos,
      carpetaCarga: C.carpetaCarga,
      carpetaProductos: C.carpetaProductos,
      lineas: C.lineas,
      nombreOriginal: C.nombreOriginal
    });
    if (!resultado.length) throw new Error("Google Sheets respondió, pero no se encontraron productos válidos para mostrar.");
    return resultado;
  }

  function cargarDatos() {
    return Promise.all([
      leerHoja(C.hojaMarcas),
      leerHoja(C.hojaProductos)
    ]).then(function (r) {
      var lista = armar(r[0], r[1]);
      try { localStorage.setItem(RESPALDO, JSON.stringify({ m: r[0], p: r[1] })); } catch (e) {}
      return lista;
    }).catch(function (error) {
      var copia = null;
      try { copia = JSON.parse(localStorage.getItem(RESPALDO) || "null"); } catch (e) { copia = null; }
      if (copia && copia.m && copia.p) {
        try { return armar(copia.m, copia.p); } catch (e) {}
      }
      throw error;
    });
  }

  window.Datos = { cargarDatos: cargarDatos, parsearCSV: parsearCSV };
})();

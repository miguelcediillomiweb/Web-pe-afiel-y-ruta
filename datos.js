/* ════════════════════════════════════════════════════════════
   DATOS — baja los dos CSV del Google Sheets, los limpia y los
   entrega ordenados. Si no hay internet, usa la última copia
   guardada en el equipo.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CLAVE_CACHE = "catalogo-hojas-v1";

  function cfg() { return window.CONFIG || {}; }

  /* Sin acentos, minúsculas y espacios simples (para comparar y buscar) */
  function normalizar(s) {
    return String(s == null ? "" : s)
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/\s+/g, " ").trim();
  }

  /* Nombre de columna sin espacios ni guiones: "Precio_Publico" -> "preciopublico" */
  function claveColumna(s) {
    return normalizar(s).replace(/[^a-z0-9]/g, "");
  }

  /* "PEÑAFIEL TORONJA 600 ML" -> "Peñafiel Toronja 600 ml" */
  function bonito(texto) {
    var siglas = (cfg().siglas || []).map(function (s) { return s.toUpperCase(); });
    var chicas = ["ml", "lt", "l", "litro", "litros", "de", "del", "la", "el", "y"];
    return String(texto == null ? "" : texto)
      .replace(/\s+/g, " ").trim().split(" ").filter(Boolean)
      .map(function (p) {
        var up = p.toUpperCase(), low = p.toLowerCase();
        if (siglas.indexOf(up) !== -1) return up;
        if (/^\d/.test(p)) return low;
        if (chicas.indexOf(low) !== -1) return low;
        return low.charAt(0).toUpperCase() + low.slice(1);
      }).join(" ");
  }

  /* "$220.00" -> 220  |  "" -> null */
  function aNumero(v) {
    if (v == null) return null;
    var n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : null;
  }

  function aMoneda(n) {
    if (n == null || !isFinite(n)) return cfg().textoPrecioFaltante || "Consultar precio";
    return "$" + (Number.isInteger(n) ? String(n) : n.toFixed(2));
  }

  /* Lector de CSV: respeta comillas, comas dentro de comillas y saltos de línea */
  function parsearCSV(texto) {
    var filas = [], fila = [], campo = "", comillas = false;
    if (texto.charCodeAt(0) === 0xFEFF) texto = texto.slice(1);
    for (var i = 0; i < texto.length; i++) {
      var c = texto[i];
      if (comillas) {
        if (c === '"') {
          if (texto[i + 1] === '"') { campo += '"'; i++; } else { comillas = false; }
        } else { campo += c; }
      } else if (c === '"') { comillas = true; }
      else if (c === ",") { fila.push(campo); campo = ""; }
      else if (c === "\n") { fila.push(campo); filas.push(fila); fila = []; campo = ""; }
      else if (c !== "\r") { campo += c; }
    }
    if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
    return filas;
  }

  function aObjetos(filas) {
    if (!filas.length) return [];
    var enc = filas[0].map(claveColumna);
    return filas.slice(1).map(function (f) {
      var o = {};
      enc.forEach(function (h, i) { if (h) o[h] = (f[i] || "").trim(); });
      return o;
    });
  }

  function descargar(url) {
    if (!url) return Promise.reject(new Error("Falta el enlace en config.js"));
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    return fetch(url, { cache: "no-store", signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) {
        clearTimeout(t);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }, function (e) { clearTimeout(t); throw e; });
  }

  function leerCache() {
    try { return JSON.parse(localStorage.getItem(CLAVE_CACHE) || "null"); } catch (e) { return null; }
  }
  function guardarCache(m, p) {
    try { localStorage.setItem(CLAVE_CACHE, JSON.stringify({ m: m, p: p })); } catch (e) { /* sin espacio: no pasa nada */ }
  }

  /* Convierte los dos textos CSV en { marcas, productos } */
  function construir(textoMarcas, textoProductos) {
    var filasM = textoMarcas ? aObjetos(parsearCSV(textoMarcas)) : [];
    var filasP = aObjetos(parsearCSV(textoProductos));
    var marcas = new Map();
    var vistas = {};
    var productos = [];

    filasM.forEach(function (o) {
      var n = (o.marca || "").trim();
      if (!n) return;
      var id = n.toUpperCase();
      if (!marcas.has(id)) {
        marcas.set(id, { id: id, nombre: bonito(n), logo: (o.logo || "").trim(), eslogan: (o.eslogan || "").trim() });
      }
    });

    filasP.forEach(function (o) {
      var nombre = (o.producto || "").trim();
      var marca = (o.marca || "").trim();
      if (!nombre || !marca) return;                 /* filas vacías: se ignoran */
      var id = marca.toUpperCase();
      if (!marcas.has(id)) marcas.set(id, { id: id, nombre: bonito(marca), logo: "", eslogan: "" });

      var presentacion = bonito(o.presentacion || "");
      var clave = id + "|" + nombre.toUpperCase().replace(/\s+/g, " ") + "|" + presentacion.toUpperCase();
      if (vistas[clave]) { vistas[clave]++; clave += "#" + vistas[clave]; } else { vistas[clave] = 1; }

      productos.push({
        clave: clave,
        marca: id,
        nombre: bonito(nombre),
        presentacion: presentacion,
        precio: aNumero(o.preciopublico),
        precioCaja: aNumero(o.preciocaja),
        piezas: aNumero(o.piezascaja),
        busqueda: normalizar(nombre + " " + marca + " " + presentacion)
      });
    });

    /* Solo las marcas que tienen productos, en el orden de la pestaña Marcas */
    var lista = Array.from(marcas.values()).filter(function (m) {
      return productos.some(function (p) { return p.marca === m.id; });
    });
    return { marcas: lista, productos: productos };
  }

  function cargar() {
    var hojas = cfg().hojas || {};
    return Promise.all([
      descargar(hojas.marcas).catch(function () { return null; }),
      descargar(hojas.productos).catch(function () { return null; })
    ]).then(function (r) {
      var m = r[0], p = r[1];
      var cache = leerCache();
      var okP = p && claveColumna(p.split("\n")[0]).indexOf("producto") !== -1;
      var okM = m && claveColumna(m.split("\n")[0]).indexOf("marca") !== -1;

      if (okP) {
        var textoM = okM ? m : (cache && cache.m) || null;
        var datos = construir(textoM, p);
        if (datos.productos.length) guardarCache(textoM, p);
        datos.origen = "red";
        return datos;
      }
      if (cache && cache.p) {
        var delCache = construir(cache.m, cache.p);
        delCache.origen = "cache";
        return delCache;
      }
      throw new Error("No se pudo leer el Sheet");
    });
  }

  window.Datos = {
    cargar: cargar,
    aMoneda: aMoneda,
    normalizar: normalizar,
    formatearTexto: bonito,
    /* expuestas para pruebas */
    _parsearCSV: parsearCSV,
    _construir: construir
  };
})();

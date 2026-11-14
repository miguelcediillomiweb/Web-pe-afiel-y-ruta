/* ============================================================
   AGRUPAR — convierte las filas de la hoja en:
   marca -> sabores (una tarjeta por sabor) -> presentaciones (filas)
   No toca la pantalla; solo ordena datos.
   ============================================================ */
(function (raiz) {
  /* Textos que se quitan del inicio del nombre para quedarnos con el sabor */
  var PREFIJOS = ["ORANGE CRUSH", "CRUSH", "DR PEPPER", "SCHWEPPES", "PEÑAFIEL", "PENAFIEL",
                  "SNAPPLE", "CLAMATO", "AGUAFIEL", "RC COLA"];
  var SUBMARCAS = ["ADAS", "TWIST"];
  var SIGLAS = ["RB", "S&C", "PET", "VR", "VNR"];

  function limpiar(t) { return String(t == null ? "" : t).replace(/\s+/g, " ").trim(); }

  function slug(t) {
    return limpiar(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function dinero(t) {
    var n = parseFloat(String(t || "").replace(/[^0-9.]/g, ""));
    return isNaN(n) ? null : n;
  }

  function entero(t) {
    var n = parseInt(String(t || "").replace(/[^0-9]/g, ""), 10);
    return isNaN(n) ? null : n;
  }

  /* Palabras de la hoja que van con acento (la hoja las trae sin acento) */
  var ACENTOS = { limon: "limón", arandano: "arándano", sandia: "sandía", tonica: "tónica", sangria: "sangría" };

  function titulo(t) {
    return t.toLowerCase().split(" ").map(function (p) {
      if (ACENTOS[p]) p = ACENTOS[p];
      if (SIGLAS.indexOf(p.toUpperCase()) !== -1) return p.toUpperCase();
      return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(" ");
  }

  function textoTamano(ml) {
    if (ml == null) return "";
    if (ml >= 1000) {
      var l = ml / 1000;
      var n = String(Math.round(l * 1000) / 1000).replace(/\.0+$/, "");
      return n + (l === 1 ? " litro" : " litros");
    }
    return ml + " ml";
  }

  function textoPresentacion(pres, retornable) {
    var p = limpiar(pres).toLowerCase();
    if (!p) return "";
    p = p.charAt(0).toUpperCase() + p.slice(1);
    if (p === "Pet") p = "PET";
    if (p === "Vidrio" && retornable === true) p += " retornable";
    if (p === "Vidrio" && retornable === false) p += " no retornable";
    return p;
  }

  /* Separa un nombre de producto en: sabor, tamaño (ml) y notas */
  function analizar(nombre) {
    var t = limpiar(nombre).toUpperCase();
    var retornable = null, nota = "";

    if (/\bVNR\b/.test(t)) { retornable = false; t = t.replace(/\bVNR\b/, " "); }
    else if (/\bVR\b/.test(t)) { retornable = true; t = t.replace(/\bVR\b/, " "); }
    if (/\b12P\b/.test(t)) t = t.replace(/\b12P\b/, " ");
    if (/\bSIFON\b/.test(t)) { nota = "Sifón"; t = t.replace(/\bSIFON\b/, " "); }

    var ml = null;
    var m = t.match(/(\d+(?:\.\d+)?)\s*(ML|LITROS?|LTS?|L)\b/);
    if (m) {
      var n = parseFloat(m[1]);
      ml = /^ML$/.test(m[2]) ? Math.round(n) : Math.round(n * 1000);
      t = t.replace(m[0], " ");
    }

    t = limpiar(t);
    function quitar(lista) {
      for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        if (t === p) { t = ""; return; }
        if (t.indexOf(p + " ") === 0) { t = limpiar(t.slice(p.length)); return; }
      }
    }
    quitar(PREFIJOS);
    quitar(SUBMARCAS);

    return { sabor: t, ml: ml, retornable: retornable, nota: nota };
  }

  /* marcas y productos: arreglos de objetos con los encabezados de la hoja */
  function armar(filasMarcas, filasProductos, opc) {
    opc = opc || {};
    var carpetaLogos = opc.carpetaLogos || "";
    var carpetaCarga = opc.carpetaCarga || "";
    var original = opc.nombreOriginal || "Original";
    var marcas = [], porSlug = {};

    function marca(nombre) {
      var s = slug(nombre);
      if (!porSlug[s]) {
        porSlug[s] = { nombre: limpiar(nombre), slug: s, logo: "", video: "", eslogan: "",
                       cartel: "", sabores: [], _sabores: {} };
        marcas.push(porSlug[s]);
      }
      return porSlug[s];
    }

    filasMarcas.forEach(function (f) {
      if (!limpiar(f.Marca)) return;
      var m = marca(f.Marca);
      m.logo = f.Logo ? carpetaLogos + limpiar(f.Logo) : "";
      m.video = limpiar(f.Video_URL);
      m.eslogan = limpiar(f.Eslogan);
      m.cartel = f.Cartel ? carpetaCarga + limpiar(f.Cartel) : "";
    });

    filasProductos.forEach(function (f) {
      if (!limpiar(f.Marca) || !limpiar(f.Producto)) return;
      var m = marca(f.Marca);
      var a = analizar(f.Producto);
      var nombreSabor = a.sabor ? titulo(a.sabor) : original;
      var clave = slug(nombreSabor);
      if (!m._sabores[clave]) {
        m._sabores[clave] = { id: m.slug + "-" + clave, nombre: nombreSabor, filas: [] };
        m.sabores.push(m._sabores[clave]);
      }
      var presentacion = textoPresentacion(f.Presentacion, a.retornable);
      var precioCaja = dinero(f.Precio_Caja), precioPublico = dinero(f.Precio_Publico);
      m._sabores[clave].filas.push({
        id: m.slug + "-" + clave + "-" + (a.ml || "x") + "-" + slug(presentacion) + (a.nota ? "-" + slug(a.nota) : ""),
        producto: limpiar(f.Producto),
        ml: a.ml,
        tamano: textoTamano(a.ml),
        presentacion: presentacion,
        nota: a.nota,
        piezas: entero(f.Piezas_Caja),
        precioCaja: precioCaja,
        precioPublico: precioPublico,
        sinPrecio: precioCaja == null && precioPublico == null
      });
    });

    marcas.forEach(function (m) {
      delete m._sabores;
      m.sabores.forEach(function (s) {
        s.filas.sort(function (x, y) {
          return (x.ml || 0) - (y.ml || 0) || x.presentacion.localeCompare(y.presentacion);
        });
      });
    });
    return marcas;
  }

  var api = { armar: armar, analizar: analizar, slug: slug };
  raiz.Agrupar = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

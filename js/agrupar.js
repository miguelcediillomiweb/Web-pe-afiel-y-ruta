/* ============================================================
   AGRUPAR — convierte las filas de la hoja en:
   marca -> sabores (una tarjeta por sabor) -> presentaciones (filas)
   No toca la pantalla; solo ordena datos.
   ============================================================ */
(function (raiz) {
  /* Textos que se quitan del inicio del nombre para quedarnos con el sabor */
  var PREFIJOS = ["ORANGE CRUSH", "CRUSH", "DR PEPPER", "SCHWEPPES", "PEÑAFIEL", "PENAFIEL",
                  "SNAPPLE", "CLAMATO", "AGUAFIEL", "RC COLA", "VENOM", "RB"];
  var SUBMARCAS = ["ADAS", "TWIST", "SOFT SELTZER", "MOCKTAILS"];
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

  /* A qué línea de la marca pertenece un producto (según config.lineas) */
  function lineaDe(lineas, producto) {
    var t = limpiar(producto).toUpperCase(), resto = -1;
    for (var i = 0; i < lineas.length; i++) {
      var l = lineas[i], e = l.empieza || [], c = l.contiene || [];
      if (!e.length && !c.length) { resto = i; continue; }
      for (var a = 0; a < e.length; a++) {
        var p = e[a].toUpperCase();
        if (t === p || t.indexOf(p + " ") === 0) return i;
      }
      for (var b = 0; b < c.length; b++) {
        if (t.indexOf(c[b].toUpperCase()) !== -1) return i;
      }
    }
    return resto;
  }

  /* marcas y productos: arreglos de objetos con los encabezados de la hoja */
  function armar(filasMarcas, filasProductos, opc) {
    opc = opc || {};
    var carpetaLogos = opc.carpetaLogos || "";
    var carpetaCarga = opc.carpetaCarga || "";
    var carpetaProductos = opc.carpetaProductos || "";
    var defLineas = opc.lineas || {};
    var original = opc.nombreOriginal || "Original";
    var carpetaSabores = opc.carpetaSabores || "";
    function temaAutomatico(marca, sabor) {
      var m = slug(marca), s = slug(sabor);
      /* Colores definidos por sabor y marca: prioridad sobre la paleta automática. */
      var especiales = [
        [m === "snapple" && /frambuesa|raspberry/.test(s), ["#D94F78", "#FFFFFF", "#8E294D", "#FFF0F4"]],
        [m === "snapple" && /durazno|peach/.test(s), ["#F3A06B", "#4A2415", "#C66C3B", "#FFF1E6"]],
        [m === "clamato" && /vuelve[- ]?a[- ]?la[- ]?vida/.test(s), ["#258447", "#FFFFFF", "#14552D", "#EDF8EF"]],
        [m === "clamato" && /original/.test(s), ["#1557C0", "#FFFFFF", "#082F78", "#EAF2FF"]],
        [m === "dr-pepper" && /(^|-)sc($|-)|s.?c/.test(s), ["#E58AA5", "#482333", "#F4C9D5", "#FFF0F3"]],
        [m === "energetizante" && /black[- ]?mamba/.test(s), ["#D51E2B", "#FFFFFF", "#160B10", "#F9EDEF"]],
        [m === "energetizante" && /berry/.test(s), ["#4169D8", "#FFFFFF", "#203B91", "#EEF2FF"]],
        [m === "energetizante" && /tropical/.test(s), ["#F2C52E", "#392900", "#B88708", "#FFF9DF"]],
        [m === "energetizante" && /sandia/.test(s), ["#D9273F", "#FFFFFF", "#8E1428", "#FFF0F1"]],
        [m === "energetizante" && /sugar[- ]?free|sin[- ]?azucar/.test(s), ["#76D1F2", "#123B58", "#238DBD", "#EAF9FF"]],
        [m === "schweppes" && /aguanquina|tonica/.test(s), ["#EAC43A", "#3E3100", "#B38B12", "#FFFBE5"]],
        [m === "schweppes" && /ginger[- ]?ale/.test(s), ["#359B54", "#FFFFFF", "#176332", "#EDF8EF"]],
        [m === "schweppes" && /gin[- ]?tonic/.test(s), ["#E88BAF", "#4B2033", "#B94C78", "#FFF0F5"]],
        [m === "schweppes" && /mojito/.test(s), ["#35A86B", "#FFFFFF", "#176B43", "#ECFAF1"]],
        [m === "schweppes" && /paloma/.test(s), ["#287BC5", "#FFFFFF", "#164A82", "#EDF6FF"]],
        [m === "orange-crush" && /manzana/.test(s), ["#C9252D", "#FFFFFF", "#79151D", "#FFF0F0"]],
        [m === "rc-cola" && /manzanita|light[- ]?manzanita/.test(s), ["#EBC52F", "#3A2B00", "#B28A0D", "#FFFBE4"]],
        [m === "rc-cola" && /arandano/.test(s), ["#8C263F", "#FFFFFF", "#501326", "#F9EEF1"]],
        [m === "rc-cola" && /sangria/.test(s), ["#7027A8", "#FFFFFF", "#42116C", "#F5EDFC"]],
        [m === "rc-cola" && /manzana[- ]?roja/.test(s), ["#D32932", "#FFFFFF", "#821820", "#FFF0F1"]],
        [m === "rc-cola" && /toronjada/.test(s), ["#E783AE", "#4A2033", "#B94F7B", "#FFF0F5"]],
        [m === "rc-cola" && /mangada/.test(s), ["#F0C21C", "#3E2D00", "#B18A00", "#FFFBE0"]]
      ];
      for (var e = 0; e < especiales.length; e++) {
        if (especiales[e][0]) return { base: especiales[e][1][0], texto: especiales[e][1][1], acento: especiales[e][1][2], superficie: especiales[e][1][3] };
      }
      var reglas = [
        /* Sabores compuestos y variantes específicas primero para evitar colores equivocados */
        [/manzanada|manzana[- ]?canela|apple[- ]?cinnamon/, ["#80502D", "#FFFFFF", "#4A2B18", "#F7EDE3"]],
        [/pepino.*limon|limon.*pepino|cucumber.*lime/, ["#258B78", "#FFFFFF", "#176B82", "#E8F7F5"]],
        [/pepino/, ["#39A879", "#123B32", "#176B62", "#EAF8F1"]],
        [/vainilla|cream|crema/, ["#D8B77A", "#382512", "#A97932", "#FFF5DF"]],
        [/cereza|cherry|rojo|frutos-rojos/, ["#8F172D", "#FFFFFF", "#D33B52", "#FFF0F2"]],
        [/naranja|orange|mandarina/, ["#F47A16", "#FFFFFF", "#B94B08", "#FFF3E7"]],
        [/limon|lima|lime/, ["#83A92B", "#20310B", "#54751A", "#F5F9E9"]],
        [/pina|piña|pineapple/, ["#E7B72F", "#392B08", "#A77B12", "#FFF9E5"]],
        [/uva|grape/, ["#623A91", "#FFFFFF", "#402264", "#F4EDFC"]],
        [/manzana|apple/, ["#4D963E", "#FFFFFF", "#2F6725", "#EFF8EC"]],
        [/toronja|grapefruit|pink-grapefruit/, ["#399447", "#FFFFFF", "#246B32", "#EFF8EC"]],
        [/fresa|strawberry/, ["#D93459", "#FFFFFF", "#A91F3E", "#FFF0F3"]],
        [/mango/, ["#F0A52B", "#39220A", "#B66A0C", "#FFF5E5"]],
        [/original/, [m === "dr-pepper" ? "#641C2B" : "#263B65", "#FFFFFF", "#35101A", "#F8EEF0"]]
      ];
      for (var i = 0; i < reglas.length; i++) if (reglas[i][0].test(s)) {
        return { base: reglas[i][1][0], texto: reglas[i][1][1], acento: reglas[i][1][2], superficie: reglas[i][1][3] };
      }
      if (m === "dr-pepper") return { base: "#641C2B", texto: "#FFFFFF", acento: "#35101A", superficie: "#F8EEF0" };
      if (m === "orange-crush") return { base: "#F47A16", texto: "#FFFFFF", acento: "#B94B08", superficie: "#FFF3E7" };
      if (m === "snapple") return { base: "#28734A", texto: "#FFFFFF", acento: "#174A30", superficie: "#EDF7F0" };
      if (m === "clamato") return { base: "#A92832", texto: "#FFFFFF", acento: "#701B22", superficie: "#FFF0F0" };
      if (m === "rc-cola") return { base: "#C8102E", texto: "#FFFFFF", acento: "#123D8A", superficie: "#EEF3FC" };
      return { base: "#285B87", texto: "#FFFFFF", acento: "#173B5A", superficie: "#EFF5FA" };
    }
    var marcas = [], porSlug = {};

    function marca(nombre) {
      var s = slug(nombre);
      if (!porSlug[s]) {
        porSlug[s] = {
          nombre: limpiar(nombre), slug: s, logo: "", video: "", eslogan: "",
          cartel: "", sabores: [], _sabores: {},
          lineas: (defLineas[s] || []).map(function (l) {
            return { nombre: l.nombre, slug: slug(l.nombre),
                     logo: l.logo ? carpetaLogos + l.logo : "", sabores: [], _sabores: {} };
          })
        };
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
      if (!a.sabor && m.slug === "aguafiel") nombreSabor = "Agua Natural";
      if (!a.sabor && m.slug === "orange-crush") nombreSabor = "Orange Crush";
      var clave = slug(nombreSabor);

      /* Si la marca tiene líneas, el producto va a la suya; si no, a la marca */
      var defs = defLineas[m.slug];
      var idx = defs ? lineaDe(defs, f.Producto) : -1;
      var dest = idx >= 0 ? m.lineas[idx] : m;
      var base = m.slug + (idx >= 0 ? "-" + dest.slug : "");

      if (!dest._sabores[clave]) {
        var llaveVisual = m.slug + "|" + clave;
        dest._sabores[clave] = { id: base + "-" + clave, nombre: nombreSabor,
                                 fondo: "",
                                 tema: temaAutomatico(m.nombre, nombreSabor),
                                 filas: [] };
        dest.sabores.push(dest._sabores[clave]);
      }
      var presentacion = textoPresentacion(f.Presentacion, a.retornable);
      var precioCaja = dinero(f.Precio_Caja), precioPublico = dinero(f.Precio_Publico);
      dest._sabores[clave].filas.push({
        id: base + "-" + clave + "-" + (a.ml || "x") + "-" + slug(presentacion) + (a.nota ? "-" + slug(a.nota) : ""),
        producto: limpiar(f.Producto),
        imagen: f.Imagen ? carpetaProductos + encodeURIComponent(limpiar(f.Imagen)) : "",
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
      m.lineas.concat([m]).forEach(function (g) {
        delete g._sabores;
        g.sabores.forEach(function (s) {
          s.filas.sort(function (x, y) {
            return (x.ml || 0) - (y.ml || 0) || x.presentacion.localeCompare(y.presentacion);
          });
        });
      });
      m.lineas = m.lineas.filter(function (l) { return l.sabores.length; });
    });
    /* Se ignoran las marcas sin productos (filas de la hoja que solo traen un logo) */
    return marcas.filter(function (m) { return m.sabores.length || m.lineas.length; });
  }

  var api = { armar: armar, analizar: analizar, slug: slug };
  raiz.Agrupar = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

/* ============================================================
   PRODUCTOS — vista de una marca: una tarjeta por sabor y, dentro,
   una fila por presentación con su propio botón "Agregar".
   ============================================================ */
(function () {
  var dinero = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function precio(etiqueta, valor, clase) {
    var p = el("span", "precio " + clase);
    p.append(el("span", "precio__etq", etiqueta), el("span", "precio__valor", dinero.format(valor)));
    return p;
  }

  function crearFila(marca, sabor, f) {
    var li = el("li", "pres");
    if (f.imagen) {
      var foto = el("div", "pres__foto");
      var img = document.createElement("img");
      img.src = f.imagen;
      img.alt = (sabor.nombre + " " + (f.tamano || "")).trim();
      img.loading = "lazy";
      img.decoding = "async";
      img.fetchPriority = "low";
      img.addEventListener("error", function () { foto.hidden = true; });
      foto.appendChild(img);
      li.appendChild(foto);
    }

    var info = el("div", "pres__info");
    info.appendChild(el("strong", "pres__tamano", f.tamano || f.producto));
    if (f.presentacion) info.appendChild(el("span", "pres__chip", f.presentacion));
    if (f.nota) info.appendChild(el("span", "pres__chip", f.nota));
    if (f.piezas) info.appendChild(el("span", "pres__piezas", f.piezas + " pzas por caja"));

    var precios = el("div", "pres__precios");
    if (f.sinPrecio) {
      precios.appendChild(el("span", "precio__consulta", "Consultar precio"));
    } else {
      if (f.precioCaja != null) precios.appendChild(precio("Caja", f.precioCaja, "precio--caja"));
      if (f.precioPublico != null) precios.appendChild(precio("Público", f.precioPublico, "precio--publico"));
    }

    li.append(info, precios);
    return li;
  }

  function colorDeMarca(slug) {
    var colores = {
      "aguafiel": "#2A8FD6",
      "snapple": "#28734A",
      "clamato": "#A92832",
      "dr-pepper": "#8B1E3F",
      "energetizante": "#2457A6",
      "schweppes": "#C69A27",
      "orange-crush": "#F28C1C",
      "rc-cola": "#C8102E",
      "penafiel-sabores": "#D9291C",
      "penafiel-twist": "#168F9B",
      "agua-mineral": "#2A8FD6",
      "penafiel-adas": "#D9291C"
    };
    return colores[slug] || "#D9291C";
  }

  function crearTarjeta(marca, sabor) {
    var t = el("article", "sabor sabor--tema");
    t.style.setProperty("--marca-efecto", colorDeMarca(marca.slug));
    var tema = sabor.tema || { base: "#285B87", texto: "#FFFFFF", acento: "#173B5A", superficie: "#EFF5FA" };
    t.style.setProperty("--sabor-base", tema.base);
    t.style.setProperty("--sabor-texto", tema.texto);
    t.style.setProperty("--sabor-acento", tema.acento);
    t.style.setProperty("--sabor-superficie", tema.superficie);
    t.appendChild(el("h3", "sabor__nombre", sabor.nombre));
    var lista = el("ul", "presentaciones");
    sabor.filas.forEach(function (f) { lista.appendChild(crearFila(marca, sabor, f)); });
    t.appendChild(lista);
    return t;
  }

  /* Botón "Todas las marcas": se usa arriba y abajo de la lista */
  function crearVolver(alVolver, abajo) {
    var b = el("button", "vista__volver" + (abajo ? " vista__volver--abajo" : ""));
    b.type = "button";
    var flecha = el("span", "volver__flecha", "←");
    flecha.setAttribute("aria-hidden", "true");
    b.append(flecha, el("span", "", "Volver al inicio"));
    var grupo = el("div", "vista__volver-grupo" + (abajo ? " vista__volver-grupo--abajo" : ""));
    var volcan = document.createElement("img");
    volcan.className = "vista__volcan";
    volcan.src = "img/volcan.png";
    volcan.alt = "";
    volcan.setAttribute("aria-hidden", "true");
    grupo.append(volcan, b);
    grupo.addEventListener("click", function(e) {
      if (e.target === volcan) alVolver();
    });
    b.addEventListener("click", alVolver);
    return grupo;
  }

  function mostrar(marca, alVolver) {
    var vista = document.getElementById("vista-marca");
    vista.textContent = "";

    var cab = el("div", "vista__cabecera");
    var logo = el("div", "vista__logo");
    logo.appendChild(window.Marcas.crearLogo(marca));
    var titulo = el("div", "vista__titulo");
    titulo.appendChild(el("h2", "", marca.nombre));
    if (marca.eslogan) titulo.appendChild(el("p", "vista__lema", marca.eslogan));
    cab.append(logo, titulo);

    function grupo(lista) {
      var g = el("div", "sabores");
      lista.forEach(function (s) { g.appendChild(crearTarjeta(marca, s)); });
      return g;
    }

    var contenido = el("div", "lineas");

    /* Una franja por línea: logo arriba y sus productos abajo */
    marca.lineas.forEach(function (l) {
      var seccion = el("section", "linea");
      var cabL = el("div", "linea__cabecera");
      var nombreL = el("h3", "linea__nombre", l.nombre);
      if (l.logo) {
        var im = document.createElement("img");
        im.className = "linea__logo";
        im.src = encodeURI(l.logo);
        im.alt = l.nombre;
        nombreL.hidden = true;
        im.addEventListener("error", function () { im.remove(); nombreL.hidden = false; });
        cabL.append(im, nombreL);
      } else {
        cabL.appendChild(nombreL);
      }
      seccion.append(cabL, grupo(l.sabores));
      contenido.appendChild(seccion);
    });

    /* Productos de marcas sin líneas (o que no encajaron en ninguna) */
    if (marca.sabores.length) contenido.appendChild(grupo(marca.sabores));
    if (!contenido.children.length) {
      contenido.appendChild(el("p", "vista__vacio", "Pronto agregaremos los productos de esta marca."));
    }

    vista.append(crearVolver(alVolver, false), cab, contenido, crearVolver(alVolver, true));
    vista.hidden = false;
    document.body.classList.add("en-marca");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function ocultar() {
    document.getElementById("vista-marca").hidden = true;
    document.body.classList.remove("en-marca");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  window.Productos = { mostrar: mostrar, ocultar: ocultar };
})();

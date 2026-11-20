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

  function estadoBoton(b, agregado) {
    b.setAttribute("aria-pressed", agregado ? "true" : "false");
    b.querySelector(".pres__tapa").textContent = agregado ? "✓" : "💬";
    b.querySelector(".pres__texto").textContent = agregado ? "Anotado" : "Quiero conocer más";
  }

  function crearFila(marca, sabor, f) {
    var li = el("li", "pres");
    if (f.imagen) {
      var foto = el("div", "pres__foto");
      var img = document.createElement("img");
      img.src = f.imagen;
      img.alt = (sabor.nombre + " " + (f.tamano || "")).trim();
      img.loading = "lazy";
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

    var b = el("button", "pres__agregar");
    b.type = "button";
    b.dataset.id = f.id;
    b.append(el("span", "pres__tapa"), el("span", "pres__texto"));
    estadoBoton(b, window.Pedido.tiene(f.id));
    b.addEventListener("click", function () {
      window.Pedido.alternar({
        id: f.id, marca: marca.nombre, sabor: sabor.nombre, tamano: f.tamano,
        presentacion: f.presentacion, nota: f.nota, piezas: f.piezas,
        precioCaja: f.precioCaja, precioPublico: f.precioPublico
      });
    });

    li.append(info, precios, b);
    return li;
  }

  function crearTarjeta(marca, sabor) {
    var t = el("article", "sabor sabor--tema");
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
    b.append(flecha, el("span", "", "Todas las marcas"));
    b.addEventListener("click", alVolver);
    return b;
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

  /* Si el pedido cambia, los botones visibles se ponen al día */
  window.Pedido.alCambiar(function () {
    document.querySelectorAll(".pres__agregar").forEach(function (b) {
      estadoBoton(b, window.Pedido.tiene(b.dataset.id));
    });
  });

  window.Productos = { mostrar: mostrar, ocultar: ocultar };
})();

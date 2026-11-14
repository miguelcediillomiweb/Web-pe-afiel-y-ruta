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
    b.querySelector(".pres__tapa").textContent = agregado ? "✓" : "+";
    b.querySelector(".pres__texto").textContent = agregado ? "Agregado" : "Agregar";
  }

  function crearFila(marca, sabor, f) {
    var li = el("li", "pres");

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
    var t = el("article", "sabor");
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

    var sabores = el("div", "sabores");
    if (!marca.sabores.length) {
      sabores.appendChild(el("p", "vista__vacio", "Pronto agregaremos los productos de esta marca."));
    }
    marca.sabores.forEach(function (s) { sabores.appendChild(crearTarjeta(marca, s)); });

    vista.append(crearVolver(alVolver, false), cab, sabores, crearVolver(alVolver, true));
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

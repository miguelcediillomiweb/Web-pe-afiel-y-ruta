/* ============================================================
   APP — catálogo de marcas, sabores y presentaciones.
   ============================================================ */
(function () {
  "use strict";
  window.__appListo = true;

  var estado = document.getElementById("estado-datos");
  var vistaLogos = document.getElementById("vista-logos");
  var vistaMarca = document.getElementById("vista-marca");
  var rejillaLogos = document.getElementById("rejilla-logos");
  var rejillaProductos = document.getElementById("rejilla-productos");
  var pedido = [];

  function elemento(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }
  function dinero(n) {
    return n == null ? "Consultar" : n.toLocaleString("es-MX", { style:"currency", currency:"MXN" });
  }
  function mostrarError(e) {
    estado.hidden = false;
    estado.className = "estado estado--error";
    estado.textContent = "No se pudo cargar el catálogo. " + (e && e.message ? e.message : "Error desconocido");
  }
  function volver() {
    vistaMarca.hidden = true;
    vistaLogos.hidden = false;
    rejillaProductos.innerHTML = "";
    window.scrollTo(0, 0);
  }
  function actualizarBarra() {
    var barra = document.getElementById("barra-pedido");
    if (!barra) return;
    barra.hidden = pedido.length === 0;
    barra.innerHTML = "";
    if (!pedido.length) return;
    var resumen = elemento("span", "", pedido.length + (pedido.length === 1 ? " producto seleccionado" : " productos seleccionados"));
    var enviar = elemento("button", "boton boton--whatsapp", "Enviar por WhatsApp");
    enviar.type = "button";
    enviar.addEventListener("click", function () {
      var lineas = pedido.map(function (p) { return "• " + p.marca + " — " + p.producto + " (" + p.presentacion + ")"; });
      var mensaje = (window.CONFIG.mensajeInicio || "Hola, me interesan estos productos:") + "\n\n" + lineas.join("\n");
      window.open("https://wa.me/" + window.CONFIG.whatsapp + "?text=" + encodeURIComponent(mensaje), "_blank", "noopener");
    });
    var limpiar = elemento("button", "boton boton--texto", "Vaciar");
    limpiar.type = "button";
    limpiar.addEventListener("click", function () { pedido = []; actualizarBarra(); document.querySelectorAll(".producto__elegir").forEach(function (x) { x.checked = false; }); });
    barra.append(resumen, limpiar, enviar);
  }
  function abrirMarca(marca) {
    vistaLogos.hidden = true;
    vistaMarca.hidden = false;
    rejillaProductos.innerHTML = "";
    var cab = elemento("div", "marca-cabecera");
    var volverBtn = elemento("button", "boton boton--volver", "← Todas las marcas");
    volverBtn.type = "button";
    volverBtn.addEventListener("click", volver);
    cab.appendChild(volverBtn);
    cab.appendChild(elemento("h1", "", marca.nombre));
    if (marca.eslogan) cab.appendChild(elemento("p", "marca-eslogan", marca.eslogan));
    rejillaProductos.appendChild(cab);

    if (!marca.sabores.length) {
      rejillaProductos.appendChild(elemento("p", "estado", "Todavía no hay productos registrados para esta marca."));
      return;
    }
    marca.sabores.forEach(function (sabor) {
      var grupo = elemento("section", "grupo-sabor");
      grupo.appendChild(elemento("h2", "grupo-sabor__titulo", sabor.nombre));
      var lista = elemento("div", "rejilla-presentaciones");
      sabor.filas.forEach(function (f) {
        var tarjeta = elemento("article", "producto");
        tarjeta.appendChild(elemento("h3", "producto__nombre", f.producto));
        var detalle = [f.tamano, f.presentacion, f.piezas ? f.piezas + " piezas por caja" : "", f.nota].filter(Boolean).join(" · ");
        tarjeta.appendChild(elemento("p", "producto__detalle", detalle || "Presentación disponible"));
        var precios = elemento("div", "producto__precios");
        if (f.precioCaja != null) precios.appendChild(elemento("span", "", "Caja: " + dinero(f.precioCaja)));
        if (f.precioPublico != null) precios.appendChild(elemento("span", "", "Público: " + dinero(f.precioPublico)));
        if (f.precioCaja == null && f.precioPublico == null) precios.appendChild(elemento("span", "", "Precio: consultar"));
        tarjeta.appendChild(precios);
        var elegir = elemento("label", "producto__seleccion");
        var check = document.createElement("input");
        check.type = "checkbox";
        check.className = "producto__elegir";
        check.addEventListener("change", function () {
          var idx = pedido.findIndex(function (p) { return p.id === f.id; });
          if (check.checked && idx < 0) pedido.push({ id:f.id, marca:marca.nombre, producto:f.producto, presentacion:detalle });
          if (!check.checked && idx >= 0) pedido.splice(idx, 1);
          actualizarBarra();
        });
        elegir.append(check, document.createTextNode(" Me interesa"));
        tarjeta.appendChild(elegir);
        lista.appendChild(tarjeta);
      });
      grupo.appendChild(lista);
      rejillaProductos.appendChild(grupo);
    });
    window.scrollTo(0, 0);
  }
  function dibujarMarcas(marcas) {
    rejillaLogos.innerHTML = "";
    if (!marcas.length) throw new Error("La hoja se leyó, pero no se encontraron marcas. Revisa que la pestaña Marcas tenga una columna llamada Marca y que Productos tenga Marca y Producto.");
    marcas.forEach(function (marca) {
      var boton = elemento("button", "tarjeta-marca");
      boton.type = "button";
      if (marca.logo) {
        var img = document.createElement("img");
        img.src = marca.logo;
        img.alt = "Logo " + marca.nombre;
        img.loading = "lazy";
        img.onerror = function () { img.remove(); boton.classList.add("tarjeta-marca--sin-logo"); };
        boton.appendChild(img);
      } else boton.classList.add("tarjeta-marca--sin-logo");
      boton.appendChild(elemento("span", "tarjeta-marca__nombre", marca.nombre));
      boton.appendChild(elemento("small", "tarjeta-marca__cantidad", marca.sabores.length + (marca.sabores.length === 1 ? " categoría" : " categorías")));
      boton.addEventListener("click", function () { abrirMarca(marca); });
      rejillaLogos.appendChild(boton);
    });
  }

  try {
    if (!window.CONFIG || !window.Datos || !window.Agrupar) throw new Error("Falta un archivo de configuración o JavaScript. Comprueba que existan js/config.js, js/agrupar.js y js/datos.js.");
    window.Datos.cargarDatos().then(function (marcas) {
      window.MARCAS = marcas;
      dibujarMarcas(marcas);
      estado.hidden = true;
    }).catch(mostrarError);
  } catch (e) { mostrarError(e); }
})();
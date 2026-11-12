/* ════════════════════════════════════════════════════════════
   APP — dibuja el catálogo, los filtros, la lista y arma el
   mensaje de WhatsApp. No tiene textos de negocio ni enlaces:
   todo eso vive en config.js.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var C = window.CONFIG, D = window.Datos, L = window.Lista;
  var $ = function (id) { return document.getElementById(id); };

  var el = {
    titulo: $("nombre-negocio"),
    controles: $("controles"),
    buscador: $("buscador"),
    marcas: $("marcas"),
    catalogo: $("catalogo"),
    barra: $("barra"),
    barraTexto: $("barra-texto"),
    btnVer: $("btn-ver-lista"),
    panel: $("panel"),
    panelLista: $("panel-lista"),
    panelVacio: $("panel-vacio"),
    panelAcciones: $("panel-acciones"),
    btnEnviar: $("btn-enviar"),
    btnVaciar: $("btn-vaciar"),
    btnCerrar: $("btn-cerrar")
  };

  /* Si falta algún archivo, se avisa en pantalla en lugar de quedar en blanco */
  if (!C || !D || !L) {
    el.catalogo.innerHTML = "";
    var aviso = document.createElement("p");
    aviso.className = "estado";
    aviso.textContent = "No se pudo cargar la página. Revisa que existan los archivos de la carpeta js.";
    el.catalogo.appendChild(aviso);
    return;
  }

  var estado = { datos: null, marca: "todas", texto: "", desdeCache: false };
  var porClave = new Map();

  /* ───────── utilidades ───────── */

  function h(tag, props, hijos) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "dataset") Object.keys(v).forEach(function (d) { n.dataset[d] = v[d]; });
      else n.setAttribute(k, v);
    });
    (hijos || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function colorDe(id) {
    return (C.colores && C.colores[id]) || C.colorBase || "#f2b33d";
  }

  /* Logo de la marca; si el archivo no existe, muestra el nombre en letras */
  function crearLogo(marca, clase) {
    var caja = h("span", { class: "logo " + clase });
    function ponerTexto() {
      caja.textContent = marca.nombre;
      caja.classList.add("logo-texto");
    }
    if (!marca.logo) { ponerTexto(); return caja; }
    var img = h("img", {
      src: (C.carpetaLogos || "logos/") + encodeURI(marca.logo),
      alt: marca.nombre, loading: "lazy", decoding: "async"
    });
    img.addEventListener("error", ponerTexto);
    caja.appendChild(img);
    return caja;
  }

  function textoCaja(p) {
    if (!C.mostrarCaja || p.precioCaja == null) return "";
    return p.piezas ? "Caja de " + p.piezas + ": " + D.aMoneda(p.precioCaja) : "Caja: " + D.aMoneda(p.precioCaja);
  }

  function itemsLista() {
    return L.obtener().map(function (k) { return porClave.get(k); }).filter(Boolean);
  }

  /* ───────── WhatsApp ───────── */

  function numeroWA() {
    var n = String(C.whatsapp || "").replace(/\D/g, "");
    return n.length === 10 ? "52" + n : n;
  }

  function mensaje(items) {
    var lineas = items.map(function (p) {
      var pres = p.presentacion ? " (" + p.presentacion + ")" : "";
      return "• " + p.nombre + pres + " - " + D.aMoneda(p.precio);
    });
    return C.saludo + "\n\n" + lineas.join("\n");
  }

  function urlWhatsApp(items) {
    return "https://wa.me/" + numeroWA() + "?text=" + encodeURIComponent(mensaje(items));
  }

  /* ───────── dibujo ───────── */

  function mostrarEstado(texto, conReintento) {
    el.catalogo.textContent = "";
    var p = h("p", { class: "estado", text: texto });
    el.catalogo.appendChild(p);
    if (conReintento) {
      var b = h("button", { type: "button", class: "btn-secundario", text: "Reintentar" });
      b.addEventListener("click", iniciar);
      el.catalogo.appendChild(b);
    }
  }

  function renderMarcas() {
    el.marcas.textContent = "";
    var todas = h("button", {
      type: "button", class: "chip chip-todas",
      "aria-pressed": String(estado.marca === "todas"), dataset: { marca: "todas" }
    }, [h("span", { class: "logo-texto", text: "Todas" })]);
    el.marcas.appendChild(todas);

    estado.datos.marcas.forEach(function (m) {
      var b = h("button", {
        type: "button", class: "chip", "aria-label": m.nombre,
        "aria-pressed": String(estado.marca === m.id), dataset: { marca: m.id }
      }, [crearLogo(m, "logo-chip")]);
      b.style.setProperty("--acento", colorDe(m.id));
      el.marcas.appendChild(b);
    });
  }

  function crearFila(p) {
    var marcada = L.tiene(p.clave);
    var detalle = h("p", { class: "fila-detalle" }, [
      p.presentacion ? h("span", { class: "tag", text: p.presentacion }) : null,
      textoCaja(p) ? h("span", { class: "caja", text: textoCaja(p) }) : null
    ]);
    var btn = h("button", {
      type: "button", class: "btn-interes", text: "Me interesa",
      "aria-pressed": String(marcada), "aria-label": "Me interesa: " + p.nombre,
      dataset: { clave: p.clave }
    });
    return h("li", { class: "fila" }, [
      h("div", { class: "fila-info" }, [h("p", { class: "fila-nombre", text: p.nombre }), detalle]),
      h("p", { class: "fila-precio" + (p.precio == null ? " sin-precio" : ""), text: D.aMoneda(p.precio) }),
      btn
    ]);
  }

  function crearGrupo(m, items) {
    var lista = h("ul", { class: "productos" });
    items.forEach(function (p) { lista.appendChild(crearFila(p)); });
    var cab = h("header", { class: "grupo-cab" }, [
      h("h2", { class: "grupo-titulo" }, [crearLogo(m, "logo-grupo")]),
      m.eslogan ? h("p", { class: "grupo-eslogan", text: m.eslogan }) : null
    ]);
    var sec = h("section", { class: "grupo" }, [cab, lista]);
    sec.style.setProperty("--acento", colorDe(m.id));
    return sec;
  }

  function renderCatalogo() {
    var q = D.normalizar(estado.texto);
    var frag = document.createDocumentFragment();
    var total = 0;

    estado.datos.marcas.forEach(function (m) {
      if (estado.marca !== "todas" && estado.marca !== m.id) return;
      var items = estado.datos.productos.filter(function (p) {
        return p.marca === m.id && (!q || p.busqueda.indexOf(q) !== -1);
      });
      if (!items.length) return;
      total += items.length;
      frag.appendChild(crearGrupo(m, items));
    });

    el.catalogo.textContent = "";
    if (estado.desdeCache) {
      el.catalogo.appendChild(h("p", {
        class: "aviso", role: "status",
        text: "Sin conexión con el Sheet: se muestra la última lista guardada en este equipo."
      }));
    }
    if (!total) {
      el.catalogo.appendChild(h("p", { class: "estado", text: "No hay productos que coincidan con la búsqueda." }));
      return;
    }
    el.catalogo.appendChild(frag);
  }

  function actualizarBotones() {
    Array.prototype.forEach.call(el.catalogo.querySelectorAll(".btn-interes"), function (b) {
      b.setAttribute("aria-pressed", String(L.tiene(b.dataset.clave)));
    });
  }

  function actualizarBarra() {
    var n = itemsLista().length;
    el.barra.hidden = n === 0;
    el.barraTexto.textContent = n === 1 ? "1 producto en tu lista" : n + " productos en tu lista";
    /* espacio al final de la página para que la barra no tape productos */
    document.body.classList.toggle("con-barra", n > 0);
  }

  function renderPanel() {
    var items = itemsLista();
    el.panelLista.textContent = "";
    items.forEach(function (p) {
      var detalle = [p.presentacion, D.aMoneda(p.precio)].filter(Boolean).join(" – ");
      var quitar = h("button", {
        type: "button", class: "btn-secundario btn-chico", text: "Quitar",
        "aria-label": "Quitar " + p.nombre, dataset: { clave: p.clave }
      });
      el.panelLista.appendChild(h("li", { class: "panel-fila" }, [
        h("div", {}, [h("p", { class: "fila-nombre", text: p.nombre }), h("p", { class: "fila-detalle", text: detalle })]),
        quitar
      ]));
    });
    el.panelVacio.hidden = items.length > 0;
    el.panelAcciones.hidden = items.length === 0;
    if (items.length) el.btnEnviar.href = urlWhatsApp(items);
  }

  function abrirPanel() {
    renderPanel();
    if (typeof el.panel.showModal === "function") el.panel.showModal();
    else el.panel.setAttribute("open", "");
  }

  function cerrarPanel() {
    if (typeof el.panel.close === "function") el.panel.close();
    else el.panel.removeAttribute("open");
  }

  /* ───────── eventos ───────── */

  el.catalogo.addEventListener("click", function (e) {
    var b = e.target.closest(".btn-interes");
    if (b) L.alternar(b.dataset.clave);
  });

  el.marcas.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip || !estado.datos) return;
    estado.marca = chip.dataset.marca;
    Array.prototype.forEach.call(el.marcas.querySelectorAll(".chip"), function (c) {
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderCatalogo();
    var y = el.catalogo.getBoundingClientRect().top + window.scrollY - el.controles.offsetHeight;
    if (window.scrollY > y) window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
  });

  var temporizador = null;
  el.buscador.addEventListener("input", function () {
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      estado.texto = el.buscador.value;
      if (estado.datos) renderCatalogo();
    }, 120);
  });

  el.btnVer.addEventListener("click", abrirPanel);
  el.btnCerrar.addEventListener("click", cerrarPanel);
  el.btnVaciar.addEventListener("click", function () { L.vaciar(); });
  el.panel.addEventListener("click", function (e) { if (e.target === el.panel) cerrarPanel(); });
  el.panelLista.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-clave]");
    if (b) L.quitar(b.dataset.clave);
  });

  L.alCambiar(function () {
    if (!estado.datos) return;
    actualizarBotones();
    actualizarBarra();
    if (el.panel.open) renderPanel();
  });

  /* ───────── arranque ───────── */

  function iniciar() {
    if (C.negocio) {
      el.titulo.textContent = C.negocio;
      document.title = C.negocio + " – Catálogo";
    }
    mostrarEstado("Cargando productos…");
    D.cargar().then(function (r) {
      estado.datos = r;
      estado.desdeCache = r.origen === "cache";
      porClave.clear();
      r.productos.forEach(function (p) { porClave.set(p.clave, p); });
      if (r.productos.length) L.depurar(new Set(porClave.keys()));
      if (!r.productos.length) { mostrarEstado("Todavía no hay productos en el catálogo."); return; }
      renderMarcas();
      renderCatalogo();
      actualizarBarra();
    }).catch(function (err) {
      console.error(err);
      mostrarEstado("No se pudo cargar el catálogo. Revisa tu conexión e inténtalo de nuevo.", true);
    });
  }

  iniciar();
})();

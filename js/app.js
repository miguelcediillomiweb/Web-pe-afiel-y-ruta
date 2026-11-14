/* ============================================================
   APP — arranque: junta todas las piezas.
   ============================================================ */
(function () {
  window.__appListo = true;
  var C = window.CONFIG;

  /* Textos que vienen de config.js (cualquier elemento con data-config) */
  document.querySelectorAll("[data-config]").forEach(function (el) {
    var valor = C[el.dataset.config];
    if (valor != null) el.textContent = valor;
  });

  window.Reloj.iniciar();
  window.Escena.iniciar();
  window.Anuncio.iniciar();

  /* Video de fondo y placa: si el archivo no existe, simplemente no se ven */
  var video = document.getElementById("hero-video");
  video.muted = true;
  video.src = C.videoBanner;
  video.addEventListener("error", function () { video.hidden = true; });
  var intento = video.play();
  if (intento && intento.catch) intento.catch(function () {});

  var placa = document.getElementById("hero-placa");
  placa.addEventListener("load", function () { placa.hidden = false; });
  placa.src = C.imagenPlaca;

  /* ---------- Navegación: inicio <-> marca ---------- */
  var marcas = [], cargando = false;

  function porSlug(slug) {
    for (var i = 0; i < marcas.length; i++) if (marcas[i].slug === slug) return marcas[i];
    return null;
  }

  /* El video del banner se pausa mientras se ven productos (ahorra datos y batería) */
  function mostrarInicio() {
    window.Productos.ocultar();
    var r = video.play();
    if (r && r.catch) r.catch(function () {});
  }

  function irInicio() {
    mostrarInicio();
    history.pushState(null, "", location.pathname + location.search);
  }

  function verMarca(m) {
    video.pause();
    window.Productos.mostrar(m, irInicio);
  }

  function elegir(m) {
    if (cargando) return;
    cargando = true;
    window.Carga.mostrar(m, (C.cargaSegundos || 3.5) * 1000).then(function () {
      history.pushState({ marca: m.slug }, "", "#" + m.slug);
      verMarca(m);
      window.Carga.ocultar();
      cargando = false;
    });
  }

  /* Botón "atrás" del teléfono */
  window.addEventListener("popstate", function (e) {
    var m = e.state && e.state.marca ? porSlug(e.state.marca) : null;
    if (m) verMarca(m); else mostrarInicio();
  });

  /* ---------- Datos de la hoja ---------- */
  window.Datos.cargarDatos().then(function (lista) {
    marcas = window.Marcas.ordenar(lista, C.ordenMarcas || []);
    window.MARCAS = marcas;
    window.Carrusel.iniciar(marcas);
    window.Marcas.dibujar(marcas, elegir);

    /* Si abren el enlace con #marca, entra directo a esa marca */
    var directa = porSlug(location.hash.slice(1));
    if (directa) {
      history.replaceState({ marca: directa.slug }, "", "#" + directa.slug);
      verMarca(directa);
    }
  }).catch(function (e) {
    var estado = document.getElementById("estado-datos");
    estado.hidden = false;
    estado.className = "estado estado--error";
    estado.textContent = "No se pudo leer la hoja. Revisa que esté compartida con " +
      "\"cualquier persona con el enlace\". Detalle: " + e.message;
  });
})();

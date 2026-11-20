/* ============================================================
   CARGA — transición breve al elegir una marca.
   Usa de la hoja (pestaña Marcas): el logo, el Eslogan (la frase)
   y el Cartel (nombre del archivo del póster, en img/carga/).
   La duración está en config.js (cargaSegundos); se evita una espera artificial larga.
   ============================================================ */
(function () {
  var cierre = null;

  function el(tag, clase) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    return e;
  }

  /* Devuelve una promesa que se cumple cuando termina la carga */
  function mostrar(marca, ms) {
    var raiz = document.getElementById("pantalla-carga");
    clearTimeout(cierre);
    raiz.textContent = "";

    var fondo = el("div", "carga__fondo");
    if (marca.cartel) {
      var img = new Image();
      img.onload = function () {
        fondo.style.backgroundImage = 'url("' + marca.cartel + '")';
        fondo.classList.add("carga__fondo--listo");
      };
      img.src = marca.cartel;
    }

    var centro = el("div", "carga__centro");
    var chapa = el("div", "carga__logo");
    chapa.appendChild(window.Marcas.crearLogo(marca));
    centro.appendChild(chapa);

    if (marca.eslogan) {
      var lema = el("p", "carga__lema");
      lema.textContent = marca.eslogan;
      centro.appendChild(lema);
    }

    var loader = el("div", "loader");
    var texto = el("div", "loading-text");
    texto.appendChild(document.createTextNode("Cargando"));
    for (var d = 0; d < 3; d++) {
      var punto = el("span", "dot");
      punto.textContent = ".";
      texto.appendChild(punto);
    }
    var pista = el("div", "loading-bar-background");
    var progreso = el("div", "loading-bar");
    var rayas = el("div", "white-bars-container");
    for (var n = 0; n < 10; n++) rayas.appendChild(el("div", "white-bar"));
    progreso.appendChild(rayas);
    pista.appendChild(progreso);
    loader.append(texto, pista);
    centro.appendChild(loader);

    raiz.append(fondo, centro);
    raiz.hidden = false;
    void raiz.offsetWidth;                       /* para que arranque la animación */
    raiz.classList.add("carga--visible");
    document.body.classList.add("sin-scroll");

    return new Promise(function (listo) { setTimeout(listo, ms); });
  }

  function ocultar() {
    var raiz = document.getElementById("pantalla-carga");
    raiz.classList.remove("carga--visible");
    cierre = setTimeout(function () {
      raiz.hidden = true;
      raiz.textContent = "";
      document.body.classList.remove("sin-scroll");
    }, 500);
  }

  window.Carga = { mostrar: mostrar, ocultar: ocultar };
})();

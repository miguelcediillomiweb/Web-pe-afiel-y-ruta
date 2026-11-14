/* ============================================================
   CARGA — pantalla de 3-4 segundos al elegir una marca.
   Usa de la hoja (pestaña Marcas): el logo, el Eslogan (la frase)
   y el Cartel (nombre del archivo del póster, en img/carga/).
   La duración está en config.js (cargaSegundos).
   ============================================================ */
(function () {
  var cierre = null;

  function el(tag, clase) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    return e;
  }

  function burbujas(contenedor) {
    for (var i = 0; i < 18; i++) {
      var b = el("i", "carga__burbuja");
      var tam = 0.5 + Math.random() * 1.6;
      b.style.width = b.style.height = tam + "rem";
      b.style.left = Math.random() * 100 + "%";
      b.style.animationDuration = (5 + Math.random() * 6) + "s";
      b.style.animationDelay = (-Math.random() * 8) + "s";
      contenedor.appendChild(b);
    }
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

    var bur = el("div", "carga__burbujas");
    burbujas(bur);

    var centro = el("div", "carga__centro");
    var chapa = el("div", "carga__logo");
    chapa.appendChild(window.Marcas.crearLogo(marca));
    centro.appendChild(chapa);

    if (marca.eslogan) {
      var lema = el("p", "carga__lema");
      lema.textContent = marca.eslogan;
      centro.appendChild(lema);
    }

    var barra = el("div", "carga__barra");
    var relleno = el("span");
    relleno.style.animationDuration = ms + "ms";
    barra.appendChild(relleno);
    centro.appendChild(barra);

    raiz.append(fondo, bur, centro);
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

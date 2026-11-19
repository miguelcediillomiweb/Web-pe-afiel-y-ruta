/* ============================================================
   SALIDA — mosaico de imágenes "Tendencia" y apagado tipo televisión antigua.
   Prueba directa: agrega ?salida=1 a la dirección de la web.
   ============================================================ */
(function () {
  var C = window.CONFIG || {};
  var LEMA = "Atrévete a conocer otras marcas de Peñafiel";
  var abierta = false;

  function mezclar(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function precargar(lista) {
    var carpeta = C.carpetaAnuncios || "img/tendencia/";
    return Promise.all(lista.map(function (nombre) {
      return new Promise(function (ok) {
        var src = encodeURI(carpeta + nombre), im = new Image();
        im.onload = function () { ok(src); };
        im.onerror = function () { ok(null); };
        im.src = src;
      });
    })).then(function (r) { return r.filter(Boolean); });
  }

  function trocear(n) {
    var W = window.innerWidth, H = window.innerHeight;
    var celdas = [{ x: 0, y: 0, w: 100, h: 100 }];
    while (celdas.length < n) {
      celdas.sort(function (a, b) { return b.w * b.h - a.w * a.h; });
      var c = celdas.shift(), r = 0.36 + Math.random() * 0.28, a, b;
      if (c.w * W >= c.h * H) {
        a = { x: c.x, y: c.y, w: c.w * r, h: c.h };
        b = { x: c.x + c.w * r, y: c.y, w: c.w * (1 - r), h: c.h };
      } else {
        a = { x: c.x, y: c.y, w: c.w, h: c.h * r };
        b = { x: c.x, y: c.y + c.h * r, w: c.w, h: c.h * (1 - r) };
      }
      celdas.push(a, b);
    }
    return mezclar(celdas);
  }

  function abrir() {
    if (abierta) return;
    abierta = true;

    var raiz = document.createElement("div");
    raiz.className = "salida";
    raiz.setAttribute("role", "dialog");
    raiz.setAttribute("aria-modal", "true");
    raiz.setAttribute("aria-label", LEMA);
    raiz.innerHTML =
      '<div class="salida__pantalla">' +
        '<div class="salida__lema"><span>' + LEMA + '</span></div>' +
        '<div class="salida__mosaico"></div>' +
      '</div><i class="salida__punto"></i>';
    document.body.appendChild(raiz);
    document.body.classList.add("sin-scroll");

    var pantalla = raiz.querySelector(".salida__pantalla");
    var mosaico = raiz.querySelector(".salida__mosaico");
    var paso = (C.salidaPaso || 0.9) * 1000;
    var espera = (C.salidaEspera || 2.5) * 1000;

    function apagar() {
      var listo = false;
      function fin() {
        if (listo) return;
        listo = true;
        pantalla.remove();
        raiz.classList.add("salida--punto");
      }
      pantalla.addEventListener("animationend", function (e) {
        if (e.animationName === "crt-apagar") fin();
      });
      pantalla.classList.add("salida__pantalla--apagar");
      setTimeout(fin, 1300);
    }

    precargar(mezclar((C.anuncios || []).slice())).then(function (fuentes) {
      if (!fuentes.length) { setTimeout(apagar, espera); return; }
      var celdas = trocear(fuentes.length);
      var lados = [[-1, 0], [1, 0], [0, -1], [0, 1]];

      fuentes.forEach(function (src, i) {
        var c = celdas[i], lado = lados[Math.floor(Math.random() * 4)];
        var t = document.createElement("div");
        t.className = "salida__tile";
        t.style.left = c.x + "%"; t.style.top = c.y + "%";
        t.style.width = c.w + "%"; t.style.height = c.h + "%";
        t.style.transform = "translate(" + (lado[0] * 100) + "vw," + (lado[1] * 100) + "vh)";
        var im = document.createElement("img");
        im.src = src; im.alt = "";
        t.appendChild(im);
        mosaico.appendChild(t);
        setTimeout(function () { void t.offsetWidth; t.style.transform = "none"; }, 500 + i * paso);
      });

      setTimeout(apagar, 500 + (fuentes.length - 1) * paso + 950 + espera);
    });
  }

  var boton = document.getElementById("contacto-salir");
  if (boton) boton.addEventListener("click", abrir);
  if (/[?&]salida=1/.test(location.search)) setTimeout(abrir, 600);
  window.Salida = { abrir: abrir };
})();

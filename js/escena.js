/* ESCENA — camión que avanza por el día, con sol, luna, aves, estrellas y faros */
(function () {
  var AMANECER = 6, ATARDECER = 19, LUNA_SALE = 16, LUNA_DURA = 14;

  var CIELO = [
    [0, "#070b1f", "#14234a"], [4.5, "#0d1530", "#223566"], [5.7, "#2c2f66", "#c0607a"],
    [6.5, "#5a6fb0", "#f59a52"], [8, "#5b9bd5", "#f7d3a0"], [10.5, "#3d8be0", "#a9d6f5"],
    [15.5, "#3e8fdc", "#b4dcf7"], [17.8, "#4a7cc4", "#f7c27a"], [18.9, "#6a4a8a", "#ee7a45"],
    [19.8, "#2a2a5c", "#6a3f72"], [21, "#0a1030", "#1b2a5a"], [24, "#070b1f", "#14234a"]
  ];
  var LOMA_DIA = { atras: "#6f9a5c", frente: "#3f7a4f" };
  var LOMA_NOCHE = { atras: "#16294a", frente: "#0b1830" };
  var PAJARO = '<svg viewBox="0 0 24 10" aria-hidden="true"><path d="M1 8 Q6 0 12 6 Q18 0 23 8" ' +
    'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mezclar(a, b, t) {
    var x = rgb(a), y = rgb(b);
    return "rgb(" + Math.round(x[0] + (y[0] - x[0]) * t) + "," + Math.round(x[1] + (y[1] - x[1]) * t) + "," +
      Math.round(x[2] + (y[2] - x[2]) * t) + ")";
  }
  function limitar(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function tramo(h, a, b) { return limitar((h - a) / (b - a), 0, 1); }

  function cielo(h) {
    for (var i = 1; i < CIELO.length; i++) {
      if (h <= CIELO[i][0]) {
        var a = CIELO[i - 1], b = CIELO[i], t = (h - a[0]) / (b[0] - a[0]);
        return { arriba: mezclar(a[1], b[1], t), abajo: mezclar(a[2], b[2], t) };
      }
    }
    return { arriba: CIELO[0][1], abajo: CIELO[0][2] };
  }

  /* Fase real de la luna: 0 = nueva, 0.5 = llena */
  function faseLuna(fecha) {
    var dias = (fecha.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
    return (((dias % 29.530588853) + 29.530588853) % 29.530588853) / 29.530588853;
  }

  function calcular(ahora) {
    var h = ahora.getHours() + ahora.getMinutes() / 60 + ahora.getSeconds() / 3600;
    var ts = (h - AMANECER) / (ATARDECER - AMANECER);
    var sol = { cx: limitar(ts, 0, 1), elev: ts >= 0 && ts <= 1 ? Math.sin(Math.PI * ts) : -0.25 };
    var fl = window.__faseLuna != null ? window.__faseLuna : faseLuna(ahora);
    var sale = (ATARDECER + (fl - 0.5) * 24 + 48) % 24;
    var tl = ((h - sale + 24) % 24) / 12.5;
    var luna = { cx: limitar(tl, 0, 1), elev: tl <= 1 ? Math.sin(Math.PI * tl) : -0.25 };
    var oscuridad = h < 12 ? 1 - tramo(h, 5, 6.8) : tramo(h, 18, 20.5);
    var borde = tramo(h, 5, 6) * tramo(-h, -20, -19);
    return {
      h: h, sol: sol, luna: luna, fl: fl, oscuridad: oscuridad,
      rubor: Math.max(0, 1 - Math.max(0, sol.elev) / 0.4) * borde,
      fase: h >= 6 && h < 12 ? "manana" : (h >= 12 && h < 19 ? "tarde" : "noche"),
      avance: (((h - AMANECER) % 24) + 24) % 24 / 24
    };
  }

  function estrellas(contenedor) {
    var semilla = 7;
    function azar() { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; }
    for (var i = 0; i < 95; i++) {
      var e = document.createElement("i");
      var grande = azar() > 0.82;
      e.className = "estrella" + (grande ? " estrella--brillo" : "");
      e.style.left = (azar() * 98 + 1) + "%";
      e.style.top = (azar() * 62 + 3) + "%";
      e.style.setProperty("--tam", (grande ? 3 : 1.5 + azar()).toFixed(1) + "px");
      e.style.setProperty("--retraso", (azar() * 3).toFixed(2) + "s");
      e.style.setProperty("--ciclo", (2 + azar() * 2.5).toFixed(2) + "s");
      contenedor.appendChild(e);
    }
  }

  /* ---------- Clima ---------- */
  var clima = { tipo: "despejado", cobertura: 0.1, lluvia: 0, niebla: 0 };

  function interpretar(codigo, nubes, precip) {
    var c = { tipo: "despejado", cobertura: nubes * 0.5, lluvia: 0, niebla: 0 };
    if (codigo === 45 || codigo === 48) {
      c.tipo = "niebla"; c.niebla = 0.9; c.cobertura = Math.max(nubes, 0.5);
    } else if ((codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82) || codigo >= 95 || precip > 0.1) {
      c.tipo = "lluvia"; c.cobertura = 0.9;
      c.lluvia = (codigo >= 95 || codigo === 65 || codigo === 82) ? 1 : (codigo >= 51 && codigo <= 57 ? 0.45 : 0.75);
    } else if (codigo >= 2 || nubes >= 0.5) {
      c.tipo = "nublado";
      c.cobertura = Math.max(nubes, codigo === 3 ? 0.85 : (codigo === 2 ? 0.45 : 0));
    }
    return c;
  }

  function pedirClima(alTener) {
    var K = (window.CONFIG && window.CONFIG.clima) || {};
    var forzado = (location.search.match(/[?&]clima=(\w+)/) || [])[1];
    var prueba = { despejado: [0, 0.1, 0], nublado: [3, 0.9, 0], niebla: [45, 0.6, 0], lluvia: [63, 0.9, 1] }[forzado];
    if (prueba) { alTener(interpretar(prueba[0], prueba[1], prueba[2])); return; }
    if (!K.latitud) return;
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + K.latitud + "&longitude=" + K.longitud +
      "&current=weather_code,cloud_cover,precipitation&timezone=auto";
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      var a = j.current;
      if (a) alTener(interpretar(a.weather_code, (a.cloud_cover || 0) / 100, a.precipitation || 0));
    }).catch(function () { /* sin internet: la escena sigue solo con la hora */ });
  }

  function iniciar() {
    var escena = document.getElementById("escena");
    if (!escena) return;
    var cielo_ = escena.querySelector(".escena__cielo");
    var etiquetas = escena.querySelectorAll(".etiqueta");
    var viejo = escena.querySelector(".escena__cuerpo");
    if (viejo) viejo.remove();

    function capa(clase) {
      var e = document.createElement("div");
      e.className = clase;
      cielo_.appendChild(e);
      return e;
    }
    capa("astro astro--sol"); capa("astro astro--luna"); capa("faro"); capa("cola-luz"); capa("sombra");
    /* Siluetas de campo: magueyes, nopales y fauna rural */
    var campo = capa("escena__campo");
    campo.innerHTML =
      '<svg viewBox="0 0 900 180" preserveAspectRatio="none" aria-hidden="true">' +
      '<g class="campo__planta">' +
      '<path d="M28 180 L28 120 Q8 100 15 76 Q28 82 34 110 Q43 76 60 72 Q62 105 40 125 L42 180 Z"/>' +
      '<path d="M96 180 L100 122 L80 96 Q72 76 80 60 Q94 70 106 96 L115 70 Q126 56 136 58 Q133 84 116 112 L118 180 Z"/>' +
      '<path d="M176 180 L174 120 Q145 106 150 78 Q164 86 180 110 Q187 78 206 72 Q204 104 188 124 L192 180 Z"/>' +
      '<path d="M258 180 L258 114 Q236 90 242 62 Q257 75 266 100 Q274 70 291 66 Q290 94 274 120 L278 180 Z"/>' +
      '<path d="M335 180 L348 114 L334 90 L344 60 L355 89 L368 54 L380 89 L365 115 L378 180 Z"/>' +
      '<path d="M420 180 L420 132 Q390 120 395 94 Q411 103 426 125 Q432 93 451 90 Q448 118 435 135 L440 180 Z"/>' +
      '</g><g class="campo__fauna">' +
      '<path d="M530 154 Q534 130 554 132 L572 132 Q584 132 590 145 L603 148 L600 159 L587 159 L583 174 L575 174 L574 158 L548 158 L544 175 L535 175 L536 158 Z"/>' +
      '<path d="M640 151 Q635 139 646 133 Q650 122 663 130 Q671 120 681 132 Q693 128 698 140 Q710 142 707 154 L700 160 L697 174 L689 174 L688 159 L660 159 L656 175 L648 175 L649 158 Z"/>' +
      '</g></svg>';
    var lluviaEl = capa("lluvia"), gotas = [];
    for (var g = 0; g < 70; g++) {
      var go = document.createElement("i");
      go.className = "gota";
      go.style.left = (Math.random() * 100).toFixed(1) + "%";
      go.style.animationDuration = (0.45 + Math.random() * 0.4).toFixed(2) + "s";
      go.style.animationDelay = (-Math.random()).toFixed(2) + "s";
      lluviaEl.appendChild(go); gotas.push(go);
    }
    capa("niebla");
    var contNubes = escena.querySelector(".escena__nubes"), extra = [];
    for (var n = 0; n < 8; n++) {
      var nb = document.createElement("div");
      nb.className = "nube nube--x";
      nb.style.top = (6 + Math.random() * 40).toFixed(0) + "%";
      nb.style.animationDuration = (55 + Math.random() * 60).toFixed(0) + "s";
      nb.style.animationDelay = (-Math.random() * 100).toFixed(0) + "s";
      if (contNubes) contNubes.appendChild(nb);
      extra.push(nb);
    }
    estrellas(document.getElementById("escena-estrellas"));

    var prueba = parseFloat((location.search.match(/[?&]hora=([\d.]+)/) || [])[1]);
    function ahora() {
      var f = new Date();
      if (!isNaN(prueba) && prueba >= 0 && prueba < 24) f.setHours(Math.floor(prueba), Math.round((prueba % 1) * 60), 0, 0);
      return f;
    }

    var qL = (location.search.match(/[?&]luna=([\d.]+)/) || [])[1];
    if (qL != null) window.__faseLuna = parseFloat(qL) % 1;
    var prev = null, estado = calcular(ahora());
    var lunaEl = cielo_.querySelector(".astro--luna");
    function dibujarLuna(fl) {
      var c = Math.cos(2 * Math.PI * fl), rx = (Math.abs(c) * 50).toFixed(2), d;
      if (fl < 0.5) d = "M50 0A50 50 0 0 1 50 100A" + rx + " 50 0 0 " + (c > 0 ? 0 : 1) + " 50 0Z";
      else          d = "M50 0A50 50 0 0 0 50 100A" + rx + " 50 0 0 " + (c > 0 ? 1 : 0) + " 50 0Z";
      lunaEl.innerHTML =
        '<svg viewBox="0 0 100 100" aria-hidden="true"><defs>' +
        '<clipPath id="luna-recorte"><path d="' + d + '"/></clipPath>' +
        '<radialGradient id="luna-brillo" cx="35%" cy="35%"><stop offset="0" stop-color="#fffef2"/>' +
        '<stop offset="0.65" stop-color="#e9e6d2"/><stop offset="1" stop-color="#bfbba4"/></radialGradient></defs>' +
        '<circle cx="50" cy="50" r="50" fill="#1c2340" opacity="0.55"/>' +
        '<g clip-path="url(#luna-recorte)"><circle cx="50" cy="50" r="50" fill="url(#luna-brillo)"/>' +
        '<circle cx="62" cy="62" r="9" fill="#5a5a6e" opacity="0.25"/><circle cx="36" cy="40" r="12" fill="#5a5a6e" opacity="0.2"/>' +
        '<circle cx="66" cy="28" r="6" fill="#5a5a6e" opacity="0.18"/></g></svg>';
      lunaEl.style.setProperty("--luna-ilum", ((1 - c) / 2).toFixed(3));
    }
    dibujarLuna(estado.fl);
    setInterval(function () { dibujarLuna(estado.fl); }, 600000);


    function pintar() {
      var d = estado = calcular(ahora());
      var c = cielo(d.h), s = escena.style;

      if (prev && (Math.abs(d.avance - prev.avance) > 0.5 || Math.abs(d.sol.cx - prev.sol.cx) > 0.5 ||
          Math.abs(d.luna.cx - prev.luna.cx) > 0.5)) {
        escena.classList.add("escena--salto");
        setTimeout(function () { escena.classList.remove("escena--salto"); }, 60);
      }
      prev = d;

      s.setProperty("--avance", d.avance.toFixed(5));
      s.setProperty("--noche", d.oscuridad.toFixed(3));
      s.setProperty("--sx", d.sol.cx.toFixed(4));
      s.setProperty("--se", d.sol.elev.toFixed(4));
      s.setProperty("--lx", d.luna.cx.toFixed(4));
      s.setProperty("--le", d.luna.elev.toFixed(4));
      s.setProperty("--luna-op", limitar(0.3 + 0.7 * d.oscuridad, 0, 1).toFixed(3));
      s.setProperty("--faros", limitar((d.oscuridad - 0.25) * 2, 0, 1).toFixed(3));
      s.setProperty("--cx", d.sol.cx.toFixed(4));
      s.setProperty("--rubor", d.rubor.toFixed(3));
      s.setProperty("--cielo-arriba", c.arriba);
      s.setProperty("--cielo-abajo", c.abajo);
      s.setProperty("--loma-atras", mezclar(LOMA_DIA.atras, LOMA_NOCHE.atras, d.oscuridad));
      s.setProperty("--loma-frente", mezclar(LOMA_DIA.frente, LOMA_NOCHE.frente, d.oscuridad));
      var calor = limitar(d.sol.elev * 2.2, 0, 1);
      s.setProperty("--cuerpo-nucleo", mezclar("#ff6a2a", "#ffe066", calor));
      s.setProperty("--cuerpo-brillo", mezclar("#ff7a30", "#ffd24a", calor));

      var k = clima, base = limitar((d.oscuridad - 0.25) * 2, 0, 1);
      escena.dataset.clima = k.tipo;
      s.setProperty("--cobertura", k.cobertura.toFixed(3));
      s.setProperty("--velo", (k.cobertura * 0.5 + k.niebla * 0.2).toFixed(3));
      s.setProperty("--velo-color", mezclar("#8d98a6", "#202636", d.oscuridad));
      s.setProperty("--nube-color", mezclar("#f2f6fb", "#4a5671", d.oscuridad));
      s.setProperty("--niebla-color", mezclar("#e1e6ec", "#3a4560", d.oscuridad));
      s.setProperty("--niebla", k.niebla.toFixed(3));
      s.setProperty("--lluvia", k.lluvia ? "1" : "0");
      s.setProperty("--faros", Math.max(base, k.lluvia * 0.9, k.niebla * 0.85).toFixed(3));
      var visibles = Math.round(k.lluvia * gotas.length);
      gotas.forEach(function (x, i) { x.hidden = i >= visibles; });
      var activas = Math.round(k.cobertura * extra.length);
      extra.forEach(function (x, i) { x.classList.toggle("activa", i < activas); });

      etiquetas.forEach(function (e) { e.classList.toggle("etiqueta--activa", e.dataset.fase === d.fase); });
    }

    function lanzarAve() {
      var a = document.createElement("div");
      a.className = "ave";
      a.style.top = (10 + Math.random() * 32).toFixed(0) + "%";
      a.style.animationDuration = (16 + Math.random() * 8).toFixed(1) + "s";
      var n = 2 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i++) {
        var b = document.createElement("span");
        b.className = "ave__pajaro";
        b.style.setProperty("--dx", (i * 1.2).toFixed(1) + "rem");
        b.style.setProperty("--dy", ((i % 2) * 0.8 - 0.3).toFixed(1) + "rem");
        b.style.animationDelay = (-Math.random() * 0.5).toFixed(2) + "s";
        b.innerHTML = PAJARO;
        a.appendChild(b);
      }
      a.addEventListener("animationend", function () { a.remove(); });
      cielo_.appendChild(a);
    }

    function lanzarCasa() {
      var casa = document.createElement("div");
      casa.className = "casa-pasa";
      casa.innerHTML = '<svg viewBox="0 0 110 58" aria-hidden="true">' +
        '<path d="M4 28 L55 3 L106 28 Z" fill="currentColor"/><rect x="14" y="27" width="82" height="29" fill="currentColor"/>' +
        '<rect x="28" y="35" width="12" height="12" class="casa__ventana"/><rect x="66" y="32" width="17" height="24" class="casa__puerta"/></svg>';
      casa.style.bottom = (1.15 + Math.random() * 1.5).toFixed(2) + "rem";
      casa.style.animationDuration = (28 + Math.random() * 14).toFixed(0) + "s";
      casa.addEventListener("animationend", function () { casa.remove(); });
      cielo_.appendChild(casa);
    }

    function lanzarFugaz() {
      var f = document.createElement("i");
      f.className = "fugaz";
      f.style.left = (8 + Math.random() * 55).toFixed(0) + "%";
      f.style.top = (4 + Math.random() * 28).toFixed(0) + "%";
      f.addEventListener("animationend", function () { f.remove(); });
      cielo_.appendChild(f);
    }

    function lanzarAvion() {
      var noche = estado.oscuridad > 0.6;
      var izq = Math.random() < 0.5;
      var a = document.createElement("div");
      a.className = "avion" + (noche ? " avion--noche" : "") + (izq ? " avion--izq" : "");
      a.style.top = (8 + Math.random() * 20).toFixed(0) + "%";
      a.style.animationName = izq ? "avion-izq" : "avion-der";
      a.style.animationDuration = (28 + Math.random() * 14).toFixed(0) + "s";
      a.innerHTML = noche
        ? '<span class="avion__cuerpo"><i class="avion__luz avion__luz--roja"></i><i class="avion__luz avion__luz--blanca"></i>' + '<svg viewBox="0 0 30 12" aria-hidden="true"><path d="M1 6 L5 5 L22 5 Q28 5 29 6 Q28 7 22 7 L5 7 Z M12 5 L17 5 L12 .5 L10.5 .5 Z M12 7 L17 7 L12 11.5 L10.5 11.5 Z" fill="currentColor"/></svg></span>'
        : '<span class="avion__cuerpo"><i class="avion__estela"></i>' +
          '<svg viewBox="0 0 30 12" aria-hidden="true"><path d="M1 6 L5 5 L22 5 Q28 5 29 6 Q28 7 22 7 L5 7 Z" fill="currentColor"/>' +
          '<path d="M12 5 L17 5 L12 0.5 L10.5 0.5 Z" fill="currentColor"/><path d="M12 7 L17 7 L12 11.5 L10.5 11.5 Z" fill="currentColor"/>' +
          '<path d="M3 5 L5.5 5 L3.5 1.5 L2 1.5 Z" fill="currentColor"/></svg></span>';
      a.addEventListener("animationend", function () { a.remove(); });
      cielo_.appendChild(a);
    }

    pintar();
    setTimeout(function () { escena.classList.add("escena--lista"); }, 80);
    setInterval(pintar, 1000);

    /* Cada segundo hay una pequeña probabilidad de que cruce un ave o una estrella fugaz */
    setInterval(function () {
      if (document.hidden) return;
      var libre = 1 - clima.cobertura;
      if (estado.oscuridad < 0.35 && clima.lluvia === 0 && clima.niebla < 0.5 &&
          Math.random() < 0.02 + 0.09 * libre && cielo_.querySelectorAll(".ave").length < 2) lanzarAve();
      if (estado.oscuridad > 0.85 && clima.lluvia === 0 && clima.cobertura < 0.7 &&
          Math.random() < 0.07 + 0.24 * libre && !cielo_.querySelector(".fugaz")) lanzarFugaz();
      if (estado.oscuridad < 0.5 && clima.lluvia === 0 && clima.niebla < 0.6 && clima.cobertura < 0.8 &&
          Math.random() < 0.012 && !cielo_.querySelector(".avion")) lanzarAvion();
      if (estado.oscuridad > 0.85 && clima.cobertura < 0.9 && Math.random() < 0.025 &&
          !cielo_.querySelector(".avion")) lanzarAvion();
    }, 1000);

    /* Casa distante cruzando el paisaje de vez en cuando */
    (function casasIntermitentes() {
      var espera = 18000 + Math.random() * 14000;
      setTimeout(function () {
        if (!document.hidden && clima.niebla < 0.85 && !cielo_.querySelector(".casa-pasa")) lanzarCasa();
        casasIntermitentes();
      }, espera);
    })();

    function ponerClima() { pedirClima(function (c) { clima = c; pintar(); }); }
    ponerClima();
    if (/[?&]efectos=1/.test(location.search)) setTimeout(function () { lanzarAve(); lanzarAvion(); }, 1500);
    setInterval(ponerClima, ((window.CONFIG.clima || {}).cadaMinutos || 15) * 60000);
  }

  window.Escena = { iniciar: iniciar, calcular: calcular };
})();
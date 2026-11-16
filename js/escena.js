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

  function calcular(ahora) {
    var h = ahora.getHours() + ahora.getMinutes() / 60 + ahora.getSeconds() / 3600;
    var ts = (h - AMANECER) / (ATARDECER - AMANECER);
    var sol = { cx: limitar(ts, 0, 1), elev: ts >= 0 && ts <= 1 ? Math.sin(Math.PI * ts) : -0.25 };
    var tl = ((h - LUNA_SALE + 24) % 24) / LUNA_DURA;
    var luna = { cx: limitar(tl, 0, 1), elev: tl <= 1 ? Math.sin(Math.PI * tl) : -0.25 };
    var oscuridad = h < 12 ? 1 - tramo(h, 5, 6.8) : tramo(h, 18, 20.5);
    var borde = tramo(h, 5, 6) * tramo(-h, -20, -19);
    return {
      h: h, sol: sol, luna: luna, oscuridad: oscuridad,
      rubor: Math.max(0, 1 - Math.max(0, sol.elev) / 0.4) * borde,
      fase: h >= 6 && h < 12 ? "manana" : (h >= 12 && h < 19 ? "tarde" : "noche"),
      avance: (((h - AMANECER) % 24) + 24) % 24 / 24
    };
  }

  function estrellas(contenedor) {
    var semilla = 7;
    function azar() { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; }
    for (var i = 0; i < 55; i++) {
      var e = document.createElement("i");
      e.className = "estrella";
      e.style.left = (azar() * 98 + 1) + "%";
      e.style.top = (azar() * 60 + 3) + "%";
      e.style.setProperty("--tam", (1 + Math.round(azar() * 1.6)) + "px");
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
    capa("astro astro--sol"); capa("astro astro--luna"); capa("faro"); capa("cola-luz");
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

    var prev = null, estado = calcular(ahora());

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

    function lanzarFugaz() {
      var f = document.createElement("i");
      f.className = "fugaz";
      f.style.left = (8 + Math.random() * 55).toFixed(0) + "%";
      f.style.top = (4 + Math.random() * 28).toFixed(0) + "%";
      f.addEventListener("animationend", function () { f.remove(); });
      cielo_.appendChild(f);
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
          Math.random() < 0.03 + 0.12 * libre && !cielo_.querySelector(".fugaz")) lanzarFugaz();
    }, 1000);

    function ponerClima() { pedirClima(function (c) { clima = c; pintar(); }); }
    ponerClima();
    setInterval(ponerClima, ((window.CONFIG.clima || {}).cadaMinutos || 15) * 60000);
  }

  window.Escena = { iniciar: iniciar, calcular: calcular };
})();
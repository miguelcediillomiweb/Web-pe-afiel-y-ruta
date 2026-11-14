/* ============================================================
   ESCENA — el camión avanza por el día sobre el reloj.
   - Amanece a las 6:00 y atardece a las 19:00 (cámbialo abajo).
   - Avance del camión (de izquierda a derecha): a las 6:00 sale; a las 18:00
     va a la mitad; a las 5:59 está casi llegando para empezar un nuevo día.
   - El sol o la luna van arriba del camión y el cielo cambia de color.
   ============================================================ */
(function () {
  var AMANECER = 6, ATARDECER = 19;

  /* Colores del cielo por hora: [hora, arriba, abajo] */
  var CIELO = [
    [0,    "#070b1f", "#14234a"],
    [4.5,  "#0d1530", "#223566"],
    [5.7,  "#2c2f66", "#c0607a"],
    [6.5,  "#5a6fb0", "#f59a52"],
    [8,    "#5b9bd5", "#f7d3a0"],
    [10.5, "#3d8be0", "#a9d6f5"],
    [15.5, "#3e8fdc", "#b4dcf7"],
    [17.8, "#4a7cc4", "#f7c27a"],
    [18.9, "#6a4a8a", "#ee7a45"],
    [19.8, "#2a2a5c", "#6a3f72"],
    [21,   "#0a1030", "#1b2a5a"],
    [24,   "#070b1f", "#14234a"]
  ];

  var LOMA_DIA   = { atras: "#6f9a5c", frente: "#3f7a4f" };
  var LOMA_NOCHE = { atras: "#16294a", frente: "#0b1830" };

  function rgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mezclar(a, b, t) {
    var x = rgb(a), y = rgb(b);
    return "rgb(" + Math.round(x[0] + (y[0] - x[0]) * t) + "," +
      Math.round(x[1] + (y[1] - x[1]) * t) + "," + Math.round(x[2] + (y[2] - x[2]) * t) + ")";
  }
  function tramo(h, a, b) { return Math.min(1, Math.max(0, (h - a) / (b - a))); }

  function cielo(h) {
    for (var i = 1; i < CIELO.length; i++) {
      if (h <= CIELO[i][0]) {
        var a = CIELO[i - 1], b = CIELO[i];
        var t = (h - a[0]) / (b[0] - a[0]);
        return { arriba: mezclar(a[1], b[1], t), abajo: mezclar(a[2], b[2], t) };
      }
    }
    return { arriba: CIELO[0][1], abajo: CIELO[0][2] };
  }

  function calcular(ahora) {
    var h = ahora.getHours() + ahora.getMinutes() / 60 + ahora.getSeconds() / 3600;
    var esDia = h >= AMANECER && h < ATARDECER;
    var elev, cuerpo;
    if (esDia) {
      elev = Math.sin(Math.PI * (h - AMANECER) / (ATARDECER - AMANECER));
      cuerpo = "sol";
    } else {
      var noche = 24 - ATARDECER + AMANECER;
      var t = h >= ATARDECER ? h - ATARDECER : h + (24 - ATARDECER);
      elev = Math.sin(Math.PI * t / noche);
      cuerpo = "luna";
    }
    var oscuridad = h < 12 ? 1 - tramo(h, 5, 6.8) : tramo(h, 18, 20.5);
    var fase = h >= 6 && h < 12 ? "manana" : (h >= 12 && h < 19 ? "tarde" : "noche");
    return {
      h: h, elev: Math.max(0, elev), cuerpo: cuerpo, oscuridad: oscuridad, fase: fase,
      avance: (((h - AMANECER) % 24) + 24) % 24 / 24
    };
  }

  function estrellas(contenedor) {
    var semilla = 7;
    function azar() { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; }
    for (var i = 0; i < 26; i++) {
      var e = document.createElement("i");
      e.className = "estrella";
      e.style.left = (azar() * 98 + 1) + "%";
      e.style.top = (azar() * 52 + 4) + "%";
      e.style.setProperty("--tam", (1 + Math.round(azar() * 1.5)) + "px");
      e.style.setProperty("--retraso", (azar() * 3).toFixed(2) + "s");
      e.style.setProperty("--ciclo", (2 + azar() * 2.5).toFixed(2) + "s");
      contenedor.appendChild(e);
    }
  }

  function iniciar() {
    var escena = document.getElementById("escena");
    if (!escena) return;
    var etiquetas = escena.querySelectorAll(".etiqueta");
    var anterior = -1;

    estrellas(document.getElementById("escena-estrellas"));

    function pintar() {
      var d = calcular(new Date());
      var c = cielo(d.h);
      var estilo = escena.style;

      /* Al empezar un nuevo día el camión vuelve al inicio sin animarse */
      if (anterior >= 0 && d.avance < anterior - 0.5) {
        escena.classList.add("escena--salto");
        setTimeout(function () { escena.classList.remove("escena--salto"); }, 60);
      }
      anterior = d.avance;

      estilo.setProperty("--avance", d.avance.toFixed(5));
      estilo.setProperty("--elev", d.elev.toFixed(4));
      estilo.setProperty("--noche", d.oscuridad.toFixed(3));
      estilo.setProperty("--cielo-arriba", c.arriba);
      estilo.setProperty("--cielo-abajo", c.abajo);
      estilo.setProperty("--loma-atras", mezclar(LOMA_DIA.atras, LOMA_NOCHE.atras, d.oscuridad));
      estilo.setProperty("--loma-frente", mezclar(LOMA_DIA.frente, LOMA_NOCHE.frente, d.oscuridad));

      /* El sol se pone naranja cerca del horizonte y amarillo cuando sube */
      var calor = Math.min(1, d.elev * 2.2);
      estilo.setProperty("--cuerpo-nucleo", mezclar("#ff6a2a", "#ffe066", calor));
      estilo.setProperty("--cuerpo-brillo", mezclar("#ff7a30", "#ffd24a", calor));
      escena.dataset.cuerpo = d.cuerpo;

      etiquetas.forEach(function (e) {
        e.classList.toggle("etiqueta--activa", e.dataset.fase === d.fase);
      });
    }

    pintar();
    /* Se activan las animaciones después del primer dibujo para que no "viaje" al cargar */
    setTimeout(function () { escena.classList.add("escena--lista"); }, 80);
    setInterval(pintar, 1000);
  }

  window.Escena = { iniciar: iniciar, calcular: calcular };
})();

/* ============================================================
   RELOJ — saludo según la hora y reloj/fecha de números que ruedan.
   Cada dígito es una ventanita: cuando cambia, el número nuevo
   sube y empuja al anterior (modelo del reloj que elegiste).
   ============================================================ */
(function () {
  var ultimoSaludo = "";
  var primeraVez = true;
  var relojDigitos, fechaDigitos;

  function saludoPara(hora) {
    if (hora >= 6 && hora < 12)  return { texto: "Buenos días",   emoji: "☀️",  clase: "saludo__emoji--sol" };
    if (hora >= 12 && hora < 19) return { texto: "Buenas tardes", emoji: "🌤️", clase: "saludo__emoji--tarde" };
    return { texto: "Buenas noches", emoji: "🌙", clase: "saludo__emoji--noche" };
  }

  function dos(n) { return (n < 10 ? "0" : "") + n; }

  function crearDigito() {
    var d = document.createElement("span");
    d.className = "digito";
    var cinta = document.createElement("span");
    cinta.className = "digito__cinta";
    var num = document.createElement("span");
    num.className = "digito__num";
    num.textContent = "0";
    cinta.appendChild(num);
    d.appendChild(cinta);
    return d;
  }

  /* grupos: [{ id: "h", digitos: 2 }, ...] — devuelve { h: [dígito, dígito], ... } */
  function construir(contenedor, grupos, separador) {
    var mapa = {};
    contenedor.textContent = "";
    grupos.forEach(function (g, i) {
      if (i > 0) {
        var s = document.createElement("span");
        s.className = "reloj__sep";
        s.textContent = separador;
        contenedor.appendChild(s);
      }
      var grupo = document.createElement("span");
      grupo.className = "reloj__grupo";
      mapa[g.id] = [];
      for (var j = 0; j < g.digitos; j++) {
        var d = crearDigito();
        grupo.appendChild(d);
        mapa[g.id].push(d);
      }
      contenedor.appendChild(grupo);
    });
    return mapa;
  }

  function poner(digito, valor, animar) {
    var cinta = digito.firstChild;
    var actual = cinta.lastChild;
    if (actual.textContent === valor) return;
    if (!animar || !cinta.animate) { actual.textContent = valor; return; }
    var nuevo = actual.cloneNode(false);
    nuevo.textContent = valor;
    cinta.appendChild(nuevo);
    var anim = cinta.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-50%)" }],
      { duration: 450, easing: "cubic-bezier(0.6, 0, 0.2, 1)" }
    );
    anim.onfinish = function () {
      while (cinta.children.length > 1) cinta.removeChild(cinta.firstChild);
      anim.cancel();
    };
  }

  function ponerGrupo(lista, texto, animar) {
    for (var i = 0; i < lista.length; i++) poner(lista[i], texto.charAt(i), animar);
  }

  function pintar() {
    var ahora = new Date();
    var animar = !primeraVez;

    var s = saludoPara(ahora.getHours());
    if (s.texto !== ultimoSaludo) {
      ultimoSaludo = s.texto;
      document.getElementById("saludo-texto").textContent = s.texto;
      var e = document.getElementById("saludo-emoji");
      e.textContent = s.emoji;
      e.className = "saludo__emoji " + s.clase;
    }

    ponerGrupo(relojDigitos.h, dos(ahora.getHours()), animar);
    ponerGrupo(relojDigitos.m, dos(ahora.getMinutes()), animar);
    ponerGrupo(relojDigitos.s, dos(ahora.getSeconds()), animar);

    ponerGrupo(fechaDigitos.d, dos(ahora.getDate()), animar);
    ponerGrupo(fechaDigitos.m, dos(ahora.getMonth() + 1), animar);
    ponerGrupo(fechaDigitos.a, String(ahora.getFullYear()), animar);

    var dia = ahora.toLocaleDateString("es-MX", { weekday: "long" });
    var mes = ahora.toLocaleDateString("es-MX", { month: "long" });
    document.getElementById("fecha-dia").textContent =
      dia.charAt(0).toUpperCase() + dia.slice(1) + " · " + mes;

    primeraVez = false;
  }

  function iniciar() {
    relojDigitos = construir(document.getElementById("reloj"),
      [{ id: "h", digitos: 2 }, { id: "m", digitos: 2 }, { id: "s", digitos: 2 }], ":");
    fechaDigitos = construir(document.getElementById("fecha"),
      [{ id: "d", digitos: 2 }, { id: "m", digitos: 2 }, { id: "a", digitos: 4 }], "/");
    pintar();
    setInterval(pintar, 250);
  }

  window.Reloj = { iniciar: iniciar };
})();

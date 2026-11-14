/* ============================================================
   ANUNCIO — ventana emergente chica con una imagen de "Tendencia".
   - Cuenta de 5 a 1 y se cierra sola; también tiene botón para cerrar.
   - Sale al entrar a la web y luego cada 2 minutos mientras navegan.
   - Si recargan antes de que pasen los 2 minutos, no vuelve a salir.
   - No se abre encima de la pantalla de carga, de la lista ni si la
     pestaña está en segundo plano: espera y vuelve a intentar.
   Todo se cambia en config.js (imágenes, texto, segundos).
   ============================================================ */
(function () {
  var C = window.CONFIG;
  var ULTIMO = "anuncio-ultimo", TURNO = "anuncio-turno";
  var cuenta = null, temporizador = null, abierto = false, antesFoco = null;

  function leer(clave) {
    try { return parseInt(localStorage.getItem(clave) || "0", 10) || 0; } catch (e) { return 0; }
  }
  function guardar(clave, valor) {
    try { localStorage.setItem(clave, String(valor)); } catch (e) { /* sin almacenamiento */ }
  }

  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function cerrar() {
    if (!abierto) return;
    abierto = false;
    clearInterval(cuenta);
    document.removeEventListener("keydown", alTeclear);
    var raiz = document.getElementById("anuncio");
    raiz.classList.remove("anuncio--visible");
    setTimeout(function () {
      raiz.hidden = true;
      raiz.textContent = "";
      document.body.classList.remove("sin-scroll");
      if (antesFoco && antesFoco.focus) antesFoco.focus();
    }, 350);
    programar((C.anuncioCadaSegundos || 120) * 1000);
  }

  function alTeclear(e) { if (e.key === "Escape") cerrar(); }

  function abrir(imagen) {
    var raiz = document.getElementById("anuncio");
    var segundos = C.anuncioSegundos || 5;
    var restante = segundos;
    antesFoco = document.activeElement;

    raiz.textContent = "";
    var fondo = el("div", "anuncio__fondo");
    fondo.addEventListener("click", cerrar);

    var tarjeta = el("div", "anuncio__tarjeta");
    tarjeta.setAttribute("role", "dialog");
    tarjeta.setAttribute("aria-modal", "true");
    tarjeta.setAttribute("aria-label", "Anuncio");

    var x = el("button", "anuncio__cerrar", "×");
    x.type = "button";
    x.setAttribute("aria-label", "Cerrar anuncio");
    x.addEventListener("click", cerrar);

    var img = el("img", "anuncio__imagen");
    img.alt = "";
    img.src = imagen.src;

    /* Anillo que se va vaciando con el número adentro */
    var reloj = el("span", "anuncio__reloj");
    reloj.innerHTML =
      '<svg viewBox="0 0 40 40" aria-hidden="true">' +
      '<circle class="anuncio__pista" cx="20" cy="20" r="17"/>' +
      '<circle class="anuncio__anillo" cx="20" cy="20" r="17" style="animation-duration:' + segundos + 's"/></svg>';
    var numero = el("b", "anuncio__numero", String(restante));
    reloj.appendChild(numero);

    var pie = el("div", "anuncio__pie");
    pie.append(reloj, el("span", "anuncio__aviso", "El anuncio se cierra solo"));

    tarjeta.append(x, el("p", "anuncio__texto", C.textoAnuncio), img, pie);
    raiz.append(fondo, tarjeta);
    raiz.hidden = false;
    void raiz.offsetWidth;
    raiz.classList.add("anuncio--visible");
    document.body.classList.add("sin-scroll");
    abierto = true;
    x.focus();
    document.addEventListener("keydown", alTeclear);

    cuenta = setInterval(function () {
      restante--;
      numero.textContent = String(Math.max(restante, 0));
      if (restante <= 0) cerrar();
    }, 1000);
  }

  /* Prueba la imagen que toca; si no existe, prueba la siguiente de la lista */
  function buscar(lista, desde, intentos, alEncontrar, alFallar) {
    if (intentos >= lista.length) { alFallar(); return; }
    var i = (desde + intentos) % lista.length;
    var prueba = new Image();
    prueba.onload = function () {
      alEncontrar({ src: C.carpetaAnuncios + lista[i], siguiente: (i + 1) % lista.length });
    };
    prueba.onerror = function () { buscar(lista, desde, intentos + 1, alEncontrar, alFallar); };
    prueba.src = C.carpetaAnuncios + lista[i];
  }

  function intentar() {
    /* Si hay otra cosa en pantalla (carga, lista) o la pestaña no se ve, espera 10 s */
    if (abierto || document.hidden || document.body.classList.contains("sin-scroll")) {
      programar(10000);
      return;
    }
    var lista = C.anuncios || [];
    if (!lista.length) return;
    buscar(lista, leer(TURNO) % lista.length, 0, function (imagen) {
      guardar(ULTIMO, Date.now());
      guardar(TURNO, imagen.siguiente);
      abrir(imagen);
    }, function () { /* no hay imágenes: no se muestra nada */ });
  }

  function programar(ms) {
    clearTimeout(temporizador);
    temporizador = setTimeout(intentar, ms);
  }

  function iniciar() {
    var cada = (C.anuncioCadaSegundos || 120) * 1000;
    var retraso = (C.anuncioRetraso || 0) * 1000;
    var ultimo = leer(ULTIMO);
    /* Si se mostró hace menos de 2 minutos (ej. recargaron), espera lo que falte */
    var falta = ultimo ? ultimo + cada - Date.now() : 0;
    programar(Math.max(retraso, falta));
  }

  window.Anuncio = { iniciar: iniciar, cerrar: cerrar };
})();

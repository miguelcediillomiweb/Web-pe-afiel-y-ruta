/* ROBOT — botón flotante que aparece de vez en cuando y botón de contacto de ventas al final */
(function () {
  var C = window.CONFIG || {};
  var FOTO = "img/robot%20red%20bull.webp";
  var MENSAJE = "¡Hola! 👋😊 Vengo de la web de productos de Grupo Peñafiel 🥤✨ " +
    "Me gustaría que un asesor de ventas me atienda. ¿Me ayudas con precios y pedidos? 🚚 ¡Muchas gracias!";

  function enlace() { return "https://wa.me/" + (C.whatsapp || "") + "?text=" + encodeURIComponent(MENSAJE); }
  function ocupado() {
    var carga = document.getElementById("pantalla-carga");
    return document.hidden || document.body.classList.contains("sin-scroll") || (carga && !carga.hidden);
  }

  /* ---------- Robot flotante ---------- */
  var flota = document.createElement("div");
  flota.className = "robot";
  flota.innerHTML =
    '<div class="robot__panel" hidden>' +
      '<button class="robot__cerrar" type="button" aria-label="Cerrar">×</button>' +
      '<p class="robot__titulo">¡Hola! 👋</p>' +
      '<p class="robot__texto">Con gusto te ayudamos con precios, promociones y pedidos 😊🥤</p>' +
      '<a class="robot__wa" target="_blank" rel="noopener">💬 Habla con tu asesor de ventas</a>' +
    '</div>' +
    '<button class="robot__boton" type="button" aria-label="Contactar a un asesor">' +
      '<span class="robot__nube">¡Hola, contáctame! 👋</span>' +
      '<img src="' + FOTO + '" alt="">' +
    '</button>';
  document.body.appendChild(flota);

  var panel = flota.querySelector(".robot__panel");
  var reloj = null, abierto = false;
  flota.querySelector(".robot__wa").href = enlace();

  function programar(ms) { clearTimeout(reloj); reloj = setTimeout(ciclo, ms); }

  function ocultar() {
    flota.classList.remove("robot--visible", "robot--nube");
    programar(45000);
  }
  function ciclo() {
    if (abierto) return;
    if (ocupado()) { programar(6000); return; }
    flota.classList.add("robot--visible");
    setTimeout(function () { flota.classList.add("robot--nube"); }, 700);
    reloj = setTimeout(function () { if (!abierto) ocultar(); }, 10000);
  }
  function abrir() {
    abierto = true; clearTimeout(reloj);
    panel.hidden = false;
    flota.classList.add("robot--visible", "robot--panel");
    flota.classList.remove("robot--nube");
  }
  function cerrar() {
    abierto = false; panel.hidden = true;
    flota.classList.remove("robot--panel");
    clearTimeout(reloj); reloj = setTimeout(ocultar, 800);
  }

  flota.querySelector(".robot__boton").addEventListener("click", function () { if (abierto) cerrar(); else abrir(); });
  flota.querySelector(".robot__cerrar").addEventListener("click", cerrar);
  flota.querySelector(".robot__wa").addEventListener("click", function () { setTimeout(cerrar, 300); });
  programar(/[?&]robot=1/.test(location.search) ? 800 : 7000);

  /* ---------- Botón del final de la página ---------- */
  var boton = document.getElementById("contacto-boton");
  var nube = document.getElementById("contacto-nube");
  if (boton) boton.href = enlace();
  if (nube) {
    var ver = function () {
      nube.classList.add("contacto__nube--ver");
      setTimeout(function () { nube.classList.remove("contacto__nube--ver"); }, 3500);
    };
    setTimeout(ver, 2000);
    setInterval(ver, 9000);
  }
})();

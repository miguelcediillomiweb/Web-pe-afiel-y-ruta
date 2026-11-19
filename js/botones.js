/* ============================================================
   BOTONES — agrega las capas de estrellas y brillo a los botones principales.
   También detecta botones que se crean después (robot y aviso de instalar).
   ============================================================ */
(function () {
  var PRINCIPALES = ".instalar__boton, .contacto__salir";
  var WHATSAPP = ".robot__wa, .contacto__boton";
  var TODOS = PRINCIPALES + "," + WHATSAPP;

  function mejorar(b) {
    if (b.dataset.esp) return;
    b.dataset.esp = "1";
    b.classList.add("btn-esp", "btn-esp--siempre");
    if (b.matches(WHATSAPP)) b.classList.add("btn-esp--wa");
    var fx = document.createElement("span");
    fx.className = "btn-esp__fx";
    fx.setAttribute("aria-hidden", "true");
    fx.innerHTML = '<span class="btn-esp__brillo"></span><span class="btn-esp__estrellas"></span>';
    b.insertBefore(fx, b.firstChild);
  }

  function revisar(nodo) {
    if (nodo.nodeType !== 1) return;
    if (nodo.matches(TODOS)) mejorar(nodo);
    nodo.querySelectorAll(TODOS).forEach(mejorar);
  }

  revisar(document.body);
  new MutationObserver(function (cambios) {
    cambios.forEach(function (c) {
      c.addedNodes.forEach(revisar);
    });
  }).observe(document.body, { childList: true, subtree: true });
})();

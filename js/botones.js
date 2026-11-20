/* ============================================================
   BOTONES — agrega las capas de estrellas y brillo a los botones de la web.
   Funciona también con los botones que se crean después (robot, tarjetas, aviso de instalar)
   y con cualquier enlace de WhatsApp (wa.me).
   Para sumar otro botón, agrega su selector a una de las listas de abajo.
   (Los botones "Quiero conocer más" de cada presentación no llevan este estilo.)
   ============================================================ */
(function () {
  var PRINCIPALES = [".instalar__boton", ".contacto__salir", ".vista__volver"].join(",");
  var WHATSAPP = [
    ".robot__wa", ".contacto__boton",
    'a[href*="wa.me"]', 'a[href*="api.whatsapp.com"]', 'a[href*="web.whatsapp.com"]',
    'button[class*="whatsapp"]', 'button[class*="enviar"]', 'a[class*="whatsapp"]', 'a[class*="enviar"]'
  ].join(",");
  var TODOS = PRINCIPALES + "," + WHATSAPP;

  function mejorar(b) {
    if (b.dataset.esp) return;
    b.dataset.esp = "1";
    b.classList.add("btn-esp");
    if (b.matches(WHATSAPP)) b.classList.add("btn-esp--wa");
    var fx = document.createElement("span");
    fx.className = "btn-esp__fx";
    fx.setAttribute("aria-hidden", "true");
    fx.innerHTML = '<span class="btn-esp__brillo"></span><span class="btn-esp__estrellas"></span>';
    b.insertBefore(fx, b.firstChild);
  }

  function revisar(nodo) {
    if (!nodo || nodo.nodeType !== 1) return;
    if (nodo.matches(TODOS)) mejorar(nodo);
    nodo.querySelectorAll(TODOS).forEach(mejorar);
  }

  revisar(document.body);
  new MutationObserver(function (cambios) {
    cambios.forEach(function (c) {
      if (c.type === "attributes") revisar(c.target);
      else c.addedNodes.forEach(revisar);
    });
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
})();

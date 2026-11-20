/* Burbujas que suben por toda la pantalla (menos en celulares con "reducir movimiento") */
(function () {
  var capa = document.createElement("div");
  capa.id = "burbujas";
  capa.setAttribute("aria-hidden", "true");
  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var n = reducido ? 0 : (window.innerWidth < 600 ? 26 : 44);
  for (var i = 0; i < n; i++) {
    var b = document.createElement("i"), t = 6 + Math.random() * 22;
    b.style.width = b.style.height = t.toFixed(0) + "px";
    b.style.left = (Math.random() * 100).toFixed(1) + "%";
    b.style.animationDuration = (10 + Math.random() * 14).toFixed(1) + "s";
    b.style.animationDelay = (-Math.random() * 24).toFixed(1) + "s";
    b.style.setProperty("--vaiven", (Math.random() * 60 - 30).toFixed(0) + "px");
    b.style.setProperty("--op", (0.35 + Math.random() * 0.45).toFixed(2));
    capa.appendChild(b);
  }
  document.body.appendChild(capa);

  /* Una segunda capa dentro de la bienvenida deja ver burbujas sobre el video,
     pero siempre detrás del teléfono y sus textos. */
  var bienvenida = document.getElementById("bienvenida-inicial");
  if (bienvenida) {
    var capaBienvenida = capa.cloneNode(true);
    capaBienvenida.id = "burbujas-bienvenida";
    bienvenida.appendChild(capaBienvenida);
  }
})();

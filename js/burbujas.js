/* Burbujas de agua mineral: partículas visibles en web y bienvenida. */
(function () {
  "use strict";
  function crearCapa(id, cantidad) {
    var capa = document.createElement("div");
    capa.id = id;
    capa.setAttribute("aria-hidden", "true");
    for (var i = 0; i < cantidad; i++) {
      var burbuja = document.createElement("i");
      var tamano = 9 + Math.random() * 27;
      var duracion = 13 + Math.random() * 16;
      burbuja.style.width = burbuja.style.height = tamano.toFixed(0) + "px";
      burbuja.style.left = (Math.random() * 100).toFixed(1) + "%";
      burbuja.style.setProperty("--duracion", duracion.toFixed(1) + "s");
      burbuja.style.animationDelay = (-Math.random() * duracion).toFixed(1) + "s";
      burbuja.style.setProperty("--vaiven", (Math.random() * 90 - 45).toFixed(0) + "px");
      burbuja.style.setProperty("--op", (0.48 + Math.random() * 0.42).toFixed(2));
      capa.appendChild(burbuja);
    }
    return capa;
  }
  function iniciar() {
    if (!document.getElementById("burbujas")) document.body.appendChild(crearCapa("burbujas", 48));
    var bienvenida = document.getElementById("bienvenida-inicial");
    if (bienvenida && !document.getElementById("burbujas-bienvenida")) {
      bienvenida.appendChild(crearCapa("burbujas-bienvenida", 26));
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  else iniciar();
})();
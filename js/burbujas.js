/* Burbujas de agua mineral: capa ligera para el fondo y la bienvenida. */
(function () {
  "use strict";
  function crearCapa(id, cantidad, bienvenida) {
    var capa = document.createElement("div");
    capa.id = id;
    capa.setAttribute("aria-hidden", "true");
    for (var i = 0; i < cantidad; i++) {
      var burbuja = document.createElement("i");
      var tamano = 7 + Math.random() * 23;
      var duracion = 17 + Math.random() * 17;
      burbuja.style.width = burbuja.style.height = tamano.toFixed(0) + "px";
      burbuja.style.left = (Math.random() * 100).toFixed(1) + "%";
      burbuja.style.setProperty("--duracion", duracion.toFixed(1) + "s");
      burbuja.style.animationDelay = (-Math.random() * 30).toFixed(1) + "s";
      burbuja.style.setProperty("--vaiven", (Math.random() * 70 - 35).toFixed(0) + "px");
      burbuja.style.setProperty("--op", (0.34 + Math.random() * 0.42).toFixed(2));
      capa.appendChild(burbuja);
    }
    return capa;
  }
  document.body.appendChild(crearCapa("burbujas", 30));
  var bienvenida = document.getElementById("bienvenida-inicial");
  if (bienvenida) bienvenida.appendChild(crearCapa("burbujas-bienvenida", 22, true));
})();
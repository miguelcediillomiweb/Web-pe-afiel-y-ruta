/* ============================================================
   CARRUSEL — los logos avanzan de uno en uno, sin fin.
   El tiempo entre cambios está en CONFIG.carruselSegundos.
   ============================================================ */
(function () {
  function iniciar(marcas) {
    var pista = document.getElementById("carrusel-pista");
    var n = marcas.length;
    if (!n) return;

    /* Copias del inicio al final para que el giro no tenga saltos */
    var lista = marcas.concat(marcas.slice(0, Math.min(n, 5)));
    lista.forEach(function (m) {
      var item = document.createElement("div");
      item.className = "carrusel__item";
      item.appendChild(window.Marcas.crearLogo(m));
      pista.appendChild(item);
    });

    var indice = 0, pausado = false;

    function visibles() {
      return parseInt(getComputedStyle(pista).getPropertyValue("--visibles"), 10) || 2;
    }

    function mover(conAnimacion) {
      pista.style.transition = conAnimacion ? "transform 0.7s cubic-bezier(0.65, 0, 0.35, 1)" : "none";
      pista.style.transform = "translateX(-" + (indice * 100 / visibles()) + "%)";
    }

    function avanzar() {
      if (pausado || document.hidden || n <= visibles()) return;
      indice++;
      mover(true);
      if (indice >= n) {
        setTimeout(function () { indice = 0; mover(false); }, 750);
      }
    }

    var ventana = pista.parentNode;
    ventana.addEventListener("pointerenter", function () { pausado = true; });
    ventana.addEventListener("pointerleave", function () { pausado = false; });
    window.addEventListener("resize", function () { mover(false); });

    setInterval(avanzar, (window.CONFIG.carruselSegundos || 2.5) * 1000);
  }

  window.Carrusel = { iniciar: iniciar };
})();

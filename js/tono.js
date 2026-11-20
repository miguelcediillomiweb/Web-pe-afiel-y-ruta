/* ============================================================
   TONO — iguala el azul del fondo de la página con el azul del video del banner,
   para que el cambio no sea brusco. Lee los colores del borde de abajo del video.
   Si prefieres fijar el color a mano, pon en config.js:  tonoFondo: "#9fd6f2"
   ============================================================ */
(function () {
  var C = window.CONFIG || {};
  var raiz = document.documentElement;
  var actual = null;

  function poner(c) {
    var a = [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];
    var b = [Math.round(a[0] * 0.72), Math.round(a[1] * 0.84), Math.round(Math.min(255, a[2] * 0.97))];
    raiz.style.setProperty("--tono-a", "rgb(" + a.join(",") + ")");
    raiz.style.setProperty("--tono-b", "rgb(" + b.join(",") + ")");
  }

  var fijo = /^#([0-9a-f]{6})$/i.exec(C.tonoFondo || "");
  if (fijo) {
    var n = parseInt(fijo[1], 16);
    poner([(n >> 16) & 255, (n >> 8) & 255, n & 255]);
    return;
  }

  var video = document.getElementById("hero-video");
  if (!video) return;
  var lienzo = document.createElement("canvas");
  lienzo.width = 32; lienzo.height = 18;
  var x = lienzo.getContext("2d", { willReadFrequently: true });

  function muestrear() {
    if (video.hidden || video.readyState < 2 || !video.videoWidth) return;
    try {
      x.drawImage(video, 0, 0, 32, 18);
      var d = x.getImageData(0, 13, 32, 5).data, r = 0, g = 0, b = 0, n = d.length / 4;
      for (var i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      var nuevo = [r / n, g / n, b / n];
      actual = actual ? [actual[0] + (nuevo[0] - actual[0]) * 0.25, actual[1] + (nuevo[1] - actual[1]) * 0.25,
                         actual[2] + (nuevo[2] - actual[2]) * 0.25] : nuevo;
      poner(actual);
    } catch (e) { /* sin permiso para leer el video: se queda el azul claro de respaldo */ }
  }

  video.addEventListener("loadeddata", muestrear);
  video.addEventListener("playing", muestrear);
  setInterval(muestrear, 1500);
})();

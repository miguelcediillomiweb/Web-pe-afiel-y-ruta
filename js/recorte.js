/* Quita el fondo blanco que rodea a los logos de la bienvenida */
(function () {
  function recortar(img) {
    var w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) return;
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    var d;
    try { d = x.getImageData(0, 0, w, h); } catch (e) { return; }
    var p = d.data, visto = new Uint8Array(w * h), pila = [];

    function fondo(i) {
      var o = i * 4;
      return p[o + 3] < 10 || (p[o] > 232 && p[o + 1] > 232 && p[o + 2] > 232);
    }
    function empuja(i) { if (!visto[i] && fondo(i)) { visto[i] = 1; pila.push(i); } }

    for (var a = 0; a < w; a++) { empuja(a); empuja((h - 1) * w + a); }
    for (var b = 0; b < h; b++) { empuja(b * w); empuja(b * w + w - 1); }
    while (pila.length) {
      var i = pila.pop(), cx = i % w, cy = (i / w) | 0;
      if (cx > 0) empuja(i - 1);
      if (cx < w - 1) empuja(i + 1);
      if (cy > 0) empuja(i - w);
      if (cy < h - 1) empuja(i + w);
    }

    /* Suaviza el borde: los pixeles claros pegados al fondo quitado se vuelven medio transparentes */
    for (var k = 0; k < visto.length; k++) {
      if (visto[k]) { p[k * 4 + 3] = 0; continue; }
      var cx2 = k % w, cy2 = (k / w) | 0;
      var junto = (cx2 > 0 && visto[k - 1]) || (cx2 < w - 1 && visto[k + 1]) ||
                  (cy2 > 0 && visto[k - w]) || (cy2 < h - 1 && visto[k + w]);
      if (!junto) continue;
      var m = Math.min(p[k * 4], p[k * 4 + 1], p[k * 4 + 2]);
      if (m > 200) p[k * 4 + 3] = Math.round(p[k * 4 + 3] * (255 - m) / 55);
    }

    x.putImageData(d, 0, 0);
    img.src = c.toDataURL("image/png");
  }

  document.querySelectorAll(".bienvenida__logo").forEach(function (img) {
    function ir() {
      if (img.dataset.recortada) return;
      img.dataset.recortada = "1";
      recortar(img);
    }
    if (img.complete && img.naturalWidth) ir(); else img.addEventListener("load", ir, { once: true });
  });
})();

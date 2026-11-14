/* ============================================================
   WHATSAPP — arma el mensaje con la lista elegida.
   Solo lleva nombre y presentación (sin precios).
   El número y el saludo están en config.js.
   ============================================================ */
(function () {
  /* Agrupa por marca y respeta el orden en que se fue eligiendo */
  function mensaje(lista) {
    var C = window.CONFIG;
    var orden = [], porMarca = {};
    lista.forEach(function (it) {
      if (!porMarca[it.marca]) { porMarca[it.marca] = []; orden.push(it.marca); }
      porMarca[it.marca].push(it);
    });

    var partes = [C.mensajeInicio, ""];
    orden.forEach(function (marca) {
      partes.push("*" + marca + "*");
      porMarca[marca].forEach(function (it) {
        var detalle = [it.tamano, it.presentacion, it.nota].filter(Boolean).join(", ");
        partes.push("• " + it.sabor + (detalle ? " – " + detalle : ""));
      });
      partes.push("");
    });
    return partes.join("\n").trim();
  }

  function url(lista) {
    return "https://wa.me/" + window.CONFIG.whatsapp + "?text=" + encodeURIComponent(mensaje(lista));
  }

  window.Whatsapp = { mensaje: mensaje, url: url };
})();

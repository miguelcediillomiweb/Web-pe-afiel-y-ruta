/* ============================================================
   WHATSAPP — arma el mensaje con la lista elegida.
   Solo lleva nombre y presentación (sin precios).
   El número y el saludo están en config.js (mensajeInicio).
   ============================================================ */
(function () {
  /* Emoji de cada marca (si no hay uno, usa el vasito) */
  function emoji(marca) {
    var m = String(marca || "").toUpperCase();
    if (m.indexOf("AGUA") !== -1) return "💧";
    if (m.indexOf("ENERGETIZANTE") !== -1) return "⚡";
    if (m.indexOf("CLAMATO") !== -1) return "🍅";
    if (m.indexOf("SNAPPLE") !== -1) return "🍎";
    if (m.indexOf("CRUSH") !== -1) return "🍊";
    if (m.indexOf("SCHWEPPES") !== -1) return "🫧";
    if (m.indexOf("ADAS") !== -1) return "🍋";
    if (m.indexOf("SABORES") !== -1 || m.indexOf("TWIST") !== -1) return "🍓";
    return "🥤";
  }

  /* Agrupa por marca y respeta el orden en que se fue eligiendo */
  function mensaje(lista) {
    var C = window.CONFIG;
    var orden = [], porMarca = {};
    lista.forEach(function (it) {
      if (!porMarca[it.marca]) { porMarca[it.marca] = []; orden.push(it.marca); }
      porMarca[it.marca].push(it);
    });

    var partes = [C.mensajeInicio, "", "🛒 *Mi lista de interés:*", ""];
    orden.forEach(function (marca) {
      partes.push(emoji(marca) + " *" + marca + "*");
      porMarca[marca].forEach(function (it) {
        var detalle = [it.tamano, it.presentacion, it.nota].filter(Boolean).join(", ");
        partes.push("✅ " + it.sabor + (detalle ? " – " + detalle : ""));
      });
      partes.push("");
    });
    partes.push("📦 Total: " + lista.length + (lista.length === 1 ? " producto" : " productos"));
    partes.push("");
    partes.push("¡Quedo al pendiente! 🙌 ¡Muchas gracias! 😊✨");
    return partes.join("\n").trim();
  }

  function url(lista) {
    return "https://wa.me/" + window.CONFIG.whatsapp + "?text=" + encodeURIComponent(mensaje(lista));
  }

  window.Whatsapp = { mensaje: mensaje, url: url };
})();

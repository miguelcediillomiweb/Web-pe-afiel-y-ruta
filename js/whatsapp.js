/* ============================================================
   WHATSAPP — arma el mensaje personalizado con la lista elegida.
   Solo lleva nombre y presentación (sin precios).
   ============================================================ */
(function () {
  var KEY_NOMBRE = "ruta1371_nombre_negocio_v1";

  function nombreCliente() {
    try { return (localStorage.getItem(KEY_NOMBRE) || "").trim(); }
    catch (e) { return ""; }
  }

  function saludo() {
    var nombre = nombreCliente();
    return nombre ? "¡Hola, " + nombre + "! 👋😊" : "¡Hola! 👋😊";
  }

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

  function mensaje(lista) {
    var orden = [], porMarca = {};
    lista.forEach(function (it) {
      if (!porMarca[it.marca]) { porMarca[it.marca] = []; orden.push(it.marca); }
      porMarca[it.marca].push(it);
    });

    var partes = [
      saludo(),
      "",
      "Vengo del catálogo web de Grupo Peñafiel 🥤. Me interesa conocer más sobre lo siguiente:",
      "",
      "🛒 *Mi lista de interés:*",
      ""
    ];
    orden.forEach(function (marca) {
      partes.push(emoji(marca) + " *" + marca + "*");
      porMarca[marca].forEach(function (it) {
        var detalle = [it.tamano, it.presentacion, it.nota].filter(Boolean).join(", ");
        partes.push("✅ " + it.sabor + (detalle ? " – " + detalle : ""));
      });
      partes.push("");
    });
    partes.push("¿Me puedes apoyar con información de los productos que acabo de seleccionar? 🙌");
    partes.push("");
    partes.push("¡Muchas gracias! 😊");
    return partes.join("\n").trim();
  }

  function url(lista) {
    var C = window.CONFIG || {};
    return "https://wa.me/" + (C.whatsapp || "") + "?text=" + encodeURIComponent(mensaje(lista));
  }

  window.Whatsapp = { mensaje: mensaje, url: url };
})();

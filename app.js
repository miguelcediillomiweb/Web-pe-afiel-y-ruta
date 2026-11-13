/* ============================================================
   APP — arranque de la web.
   Por ahora solo confirma que la hoja se lee y se agrupa bien.
   ============================================================ */
(function () {
  var aviso = document.getElementById("estado-datos");

  window.Datos.cargarDatos().then(function (marcas) {
    window.MARCAS = marcas;
    var tarjetas = 0, filas = 0;
    marcas.forEach(function (m) {
      tarjetas += m.sabores.length;
      m.sabores.forEach(function (s) { filas += s.filas.length; });
    });
    aviso.textContent = "Hoja leída: " + marcas.length + " marcas, " + tarjetas +
      " tarjetas de sabor, " + filas + " presentaciones.";
    console.table(marcas.map(function (m) {
      return { marca: m.nombre, tarjetas: m.sabores.length };
    }));
  }).catch(function (e) {
    aviso.classList.add("estado--error");
    aviso.textContent = "No se pudo leer la hoja. Revisa que esté compartida con " +
      "\"cualquier persona con el enlace\". Detalle: " + e.message;
  });
})();

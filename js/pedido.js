/* ============================================================
   PEDIDO — la lista de productos que el cliente va eligiendo.
   No es una compra: es la lista que luego se manda por WhatsApp.
   Se guarda en el teléfono para que no se pierda al recargar.
   ============================================================ */
(function () {
  var CLAVE = "pedido-bebidas";
  var items = [];
  var oyentes = [];

  try {
    var guardado = JSON.parse(localStorage.getItem(CLAVE) || "[]");
    if (Array.isArray(guardado)) items = guardado;
  } catch (e) { items = []; }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch (e) { /* sin almacenamiento */ }
    oyentes.forEach(function (f) { f(items); });
  }

  function indice(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return i;
    return -1;
  }

  window.Pedido = {
    tiene: function (id) { return indice(id) !== -1; },
    total: function () { return items.length; },
    lista: function () { return items.slice(); },
    alternar: function (item) {
      var i = indice(item.id);
      if (i === -1) items.push(item); else items.splice(i, 1);
      guardar();
      return i === -1;
    },
    quitar: function (id) {
      var i = indice(id);
      if (i !== -1) { items.splice(i, 1); guardar(); }
    },
    vaciar: function () { items = []; guardar(); },
    alCambiar: function (f) { oyentes.push(f); }
  };
})();

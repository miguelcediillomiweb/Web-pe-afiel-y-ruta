/* ════════════════════════════════════════════════════════════
   LISTA — los productos que el cliente marca con "Me interesa".
   Se guardan en su equipo, así que siguen ahí si cierra la página.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CLAVE = "catalogo-interes-v1";
  var claves = [];
  var oyentes = [];

  try {
    var guardado = JSON.parse(localStorage.getItem(CLAVE) || "[]");
    if (Array.isArray(guardado)) {
      claves = guardado.filter(function (k) { return typeof k === "string"; });
    }
  } catch (e) { /* sin almacenamiento: la lista funciona igual mientras la página esté abierta */ }

  function avisar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(claves)); } catch (e) { /* nada */ }
    oyentes.forEach(function (f) {
      try { f(claves.slice()); } catch (e) { console.error(e); }
    });
  }

  window.Lista = {
    obtener: function () { return claves.slice(); },
    tiene: function (k) { return claves.indexOf(k) !== -1; },
    alternar: function (k) {
      var i = claves.indexOf(k);
      if (i === -1) claves.push(k); else claves.splice(i, 1);
      avisar();
    },
    quitar: function (k) {
      var i = claves.indexOf(k);
      if (i !== -1) { claves.splice(i, 1); avisar(); }
    },
    vaciar: function () {
      if (claves.length) { claves = []; avisar(); }
    },
    /* Quita de la lista lo que ya no existe en el Sheet */
    depurar: function (validas) {
      var antes = claves.length;
      claves = claves.filter(function (k) { return validas.has(k); });
      if (claves.length !== antes) avisar();
    },
    alCambiar: function (f) { oyentes.push(f); }
  };
})();

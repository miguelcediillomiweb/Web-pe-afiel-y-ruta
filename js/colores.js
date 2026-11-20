/* ============================================================
   COLORES — cada tarjeta de sabor toma el color de su producto
   (fresa rojito, fresada rojo fuerte, toronja verde, sangría morado, naranjada amarillo...).
   Se detecta por el nombre del sabor. Para cambiar un color o agregar un sabor,
   edita la lista SABORES de abajo: [palabra que contiene el sabor (sin acentos), color].
   Si un sabor no está en la lista, la tarjeta usa el color de la marca (el del logo).
   ============================================================ */
(function () {
  /* El orden importa: la primera que coincida gana (por eso "fresada" va antes que "fresa") */
  var SABORES = [
    ["fresada", "#d62839"],
    ["fresa", "#f08a95"],
    ["sangria", "#8e4a9e"],
    ["naranjada", "#f5a800"],
    ["naranja", "#f28c1c"],
    ["orange", "#f28c1c"],
    ["mandarina", "#f28c1c"],
    ["limonada", "#6fbf3a"],
    ["lima limon", "#8bc34a"],
    ["pepino", "#7fbf5a"],
    ["limon", "#79c447"],
    ["pinada", "#f2c500"],
    ["pina", "#f2c500"],
    ["paloma", "#f28b82"],
    ["toronjada", "#5aa83c"],
    ["toronja", "#5aa83c"],
    ["manzana roja", "#d62839"],
    ["manzanada", "#7bbf3a"],
    ["manzanita", "#7bbf3a"],
    ["manzana", "#7bbf3a"],
    ["durazno", "#f6a56b"],
    ["frambuesa", "#c2185b"],
    ["arandano", "#4c5bb5"],
    ["mangada", "#f5a623"],
    ["mango", "#f5a623"],
    ["coco", "#c9b28a"],
    ["cherry", "#9c1c2e"],
    ["cream soda", "#d9b36c"],
    ["darkberry", "#5b2a86"],
    ["zero", "#4a4f57"],
    ["sandia", "#e24a6a"],
    ["tropical", "#f2a900"],
    ["black mamba", "#2f8f4e"],
    ["sugar free", "#7f95a8"],
    ["energy", "#2f5fb3"],
    ["almeja", "#d6382d"],
    ["vuelve", "#d6382d"],
    ["cubano", "#d6382d"],
    ["ginger", "#d9a521"],
    ["tonica", "#3fa7b8"],
    ["quina", "#b5a642"],
    ["mojito", "#5cb85c"],
    ["gin", "#7aa5a0"],
    ["frutos rojos", "#b3213f"],
    ["purezza", "#2a8fd6"],
    ["agua mineral", "#2a8fd6"],
    ["surtido", "#8a6bbf"]
  ];
  /* Para los sabores "Original" se usa el color de la marca */
  var MARCAS = [
    ["aguafiel", "#2a8fd6"],
    ["dr pepper", "#8b1e3f"],
    ["rc cola", "#c8102e"],
    ["orange crush", "#f28c1c"]
  ];

  function norm(t) {
    return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
  }
  function elegir(sabor, marca) {
    var s = norm(sabor), m = norm(marca), i;
    for (i = 0; i < SABORES.length; i++) {
      var k = SABORES[i][0];
      if (k.length <= 3 ? (" " + s + " ").indexOf(" " + k + " ") !== -1 : s.indexOf(k) !== -1) return SABORES[i][1];
    }
    for (i = 0; i < MARCAS.length; i++) if (m.indexOf(MARCAS[i][0]) !== -1) return MARCAS[i][1];
    return null;
  }
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }

  function pintar(tarjeta, hex) {
    var c = rgb(hex);
    function a(op) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + op + ")"; }
    var oscuro = "rgb(" + Math.round(c[0] * 0.55) + "," + Math.round(c[1] * 0.55) + "," + Math.round(c[2] * 0.55) + ")";
    tarjeta.style.setProperty("--tapa", hex);
    tarjeta.style.setProperty("--sabor-medio", a(0.34));
    tarjeta.style.setProperty("--sabor-claro", a(0.13));
    tarjeta.style.setProperty("--sabor-oscuro", oscuro);
    tarjeta.classList.add("sabor--color");
  }

  function revisar() {
    var vista = document.getElementById("vista-marca");
    if (!vista) return;
    var h2 = vista.querySelector(".vista__titulo h2");
    var marca = h2 ? h2.textContent : "";
    vista.querySelectorAll(".sabor").forEach(function (t) {
      if (t.dataset.color) return;
      t.dataset.color = "1";
      var n = t.querySelector(".sabor__nombre");
      var hex = elegir(n ? n.textContent : "", marca);
      if (hex) pintar(t, hex);
    });
  }

  var vista = document.getElementById("vista-marca");
  if (vista) new MutationObserver(revisar).observe(vista, { childList: true, subtree: true });
  revisar();
})();

/* ============================================================
   MARCAS — ordena las marcas y dibuja la rejilla.
   También da el "logo" que usa el carrusel.
   ============================================================ */
(function () {
  /* Ordena según CONFIG.ordenMarcas; las que no estén en la lista van al final */
  function ordenar(marcas, orden) {
    var pos = {};
    orden.forEach(function (s, i) { pos[s] = i; });
    function lugar(m) { return pos.hasOwnProperty(m.slug) ? pos[m.slug] : 999; }
    return marcas.slice().sort(function (a, b) { return lugar(a) - lugar(b); });
  }

  /* Logo con respaldo: si no existe el archivo, muestra el nombre en texto */
  function crearLogo(m) {
    var caja = document.createElement("span");
    caja.className = "logo";
    function texto() { caja.textContent = m.nombre; caja.classList.add("logo--texto"); }
    if (!m.logo) { texto(); return caja; }
    var img = new Image();
    img.alt = m.nombre;
    img.decoding = "async";
    img.onerror = texto;
    img.src = m.logo;
    caja.appendChild(img);
    return caja;
  }

  function crearTarjeta(m, alElegir) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "marca revelar";
    b.dataset.slug = m.slug;

    var chapa = document.createElement("span");
    chapa.className = "marca__chapa";
    chapa.textContent = m.sabores.length;
    chapa.setAttribute("aria-hidden", "true");

    var logo = document.createElement("span");
    logo.className = "marca__logo";
    logo.appendChild(crearLogo(m));

    var nombre = document.createElement("h3");
    nombre.className = "marca__nombre";
    nombre.textContent = m.nombre;

    var sabores = document.createElement("p");
    sabores.className = "marca__sabores";
    sabores.textContent = m.sabores.length + (m.sabores.length === 1 ? " sabor" : " sabores");

    b.append(chapa, logo, nombre, sabores);
    b.addEventListener("click", function () { alElegir(m); });
    return b;
  }

  function dibujar(marcas, alElegir) {
    var rejilla = document.getElementById("rejilla-marcas");
    rejilla.textContent = "";
    var tarjetas = marcas.map(function (m) { return crearTarjeta(m, alElegir); });
    tarjetas.forEach(function (t) { rejilla.appendChild(t); });

    if (!("IntersectionObserver" in window)) {
      tarjetas.forEach(function (t) { t.classList.add("visto"); });
      return;
    }
    var vigia = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        t.style.transitionDelay = (tarjetas.indexOf(t) % 4) * 80 + "ms";
        t.classList.add("visto");
        vigia.unobserve(t);
      });
    }, { threshold: 0.15 });
    tarjetas.forEach(function (t) { vigia.observe(t); });
  }

  window.Marcas = { ordenar: ordenar, dibujar: dibujar, crearLogo: crearLogo };
})();

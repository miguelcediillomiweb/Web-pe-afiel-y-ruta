/* ============================================================
   LISTA — hoja que se abre desde la franja de abajo para revisar
   lo elegido, quitar productos o vaciar todo, y enviar por WhatsApp.
   ============================================================ */
(function () {
  var abierta = false, antesFoco = null, vaciarTimer = null;

  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function detalle(it) {
    return [it.tamano, it.presentacion, it.nota].filter(Boolean).join(", ");
  }

  function pintar() {
    var raiz = document.getElementById("lista");
    var lista = window.Pedido.lista();
    if (!lista.length) { cerrar(); return; }

    raiz.textContent = "";
    var fondo = el("div", "lista__fondo");
    fondo.addEventListener("click", cerrar);

    var hoja = el("section", "lista__hoja");
    hoja.setAttribute("role", "dialog");
    hoja.setAttribute("aria-modal", "true");
    hoja.setAttribute("aria-label", "Tu lista de productos");

    var cab = el("header", "lista__cabecera");
    cab.appendChild(el("h2", "", "Tu lista (" + lista.length + ")"));
    var x = el("button", "lista__cerrar", "×");
    x.type = "button";
    x.setAttribute("aria-label", "Cerrar lista");
    x.addEventListener("click", cerrar);
    cab.appendChild(x);

    var cuerpo = el("div", "lista__cuerpo");
    cuerpo.appendChild(el("p", "lista__ayuda", "Revisa tus productos. Al enviar se abre WhatsApp con este listado."));

    /* Agrupado por marca */
    var orden = [], porMarca = {};
    lista.forEach(function (it) {
      if (!porMarca[it.marca]) { porMarca[it.marca] = []; orden.push(it.marca); }
      porMarca[it.marca].push(it);
    });
    orden.forEach(function (marca) {
      cuerpo.appendChild(el("h3", "lista__marca", marca));
      var ul = el("ul", "lista__items");
      porMarca[marca].forEach(function (it) {
        var li = el("li", "lista__item");
        var txt = el("span", "lista__texto");
        txt.append(el("strong", "", it.sabor), el("small", "", detalle(it)));
        var quitar = el("button", "lista__quitar", "Quitar");
        quitar.type = "button";
        quitar.setAttribute("aria-label", "Quitar " + it.sabor + " " + detalle(it));
        quitar.addEventListener("click", function () { window.Pedido.quitar(it.id); });
        li.append(txt, quitar);
        ul.appendChild(li);
      });
      cuerpo.appendChild(ul);
    });

    var pie = el("footer", "lista__pie");
    var vaciar = el("button", "lista__vaciar", "Vaciar lista");
    vaciar.type = "button";
    vaciar.addEventListener("click", function () {
      /* Dos toques para no borrar por error */
      if (vaciar.dataset.seguro) { window.Pedido.vaciar(); return; }
      vaciar.dataset.seguro = "1";
      vaciar.textContent = "¿Seguro? Toca otra vez";
      clearTimeout(vaciarTimer);
      vaciarTimer = setTimeout(function () {
        delete vaciar.dataset.seguro;
        vaciar.textContent = "Vaciar lista";
      }, 3000);
    });
    var enviar = el("a", "lista__enviar", "Enviar por WhatsApp");
    enviar.href = window.Whatsapp.url(lista);
    enviar.target = "_blank";
    enviar.rel = "noopener";
    pie.append(vaciar, enviar);

    hoja.append(cab, cuerpo, pie);
    raiz.append(fondo, hoja);
  }

  function alTeclear(e) { if (e.key === "Escape") cerrar(); }

  function abrir() {
    if (abierta || !window.Pedido.total()) return;
    antesFoco = document.activeElement;
    abierta = true;
    var raiz = document.getElementById("lista");
    pintar();
    raiz.hidden = false;
    void raiz.offsetWidth;
    raiz.classList.add("lista--visible");
    document.body.classList.add("sin-scroll");
    document.addEventListener("keydown", alTeclear);
    var x = raiz.querySelector(".lista__cerrar");
    if (x) x.focus();
  }

  function cerrar() {
    if (!abierta) return;
    abierta = false;
    clearTimeout(vaciarTimer);
    document.removeEventListener("keydown", alTeclear);
    var raiz = document.getElementById("lista");
    raiz.classList.remove("lista--visible");
    setTimeout(function () {
      if (abierta) return;
      raiz.hidden = true;
      raiz.textContent = "";
      document.body.classList.remove("sin-scroll");
      if (antesFoco && antesFoco.focus) antesFoco.focus();
    }, 320);
  }

  /* Si cambia el pedido mientras está abierta, se redibuja */
  window.Pedido.alCambiar(function () { if (abierta) pintar(); });

  window.Lista = { abrir: abrir, cerrar: cerrar };
})();

/* ============================================================
   BARRA — franja de abajo: cuántos productos lleva elegidos
   y el botón para mandar la lista por WhatsApp.
   ============================================================ */
(function () {
  var barra = document.getElementById("barra-pedido");
  var anterior = 0;

  var ICONO = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
    '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8zm-3 4.2c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.2.2 2.1 3.300 5.200 4.500 2.500 1 3 .8 3.500.7.600-.1 1.800-.7 2-1.400.3-.7.3-1.300.2-1.400-.1-.2-.3-.3-.7-.5l-1.800-.9c-.3-.1-.5-.1-.7.1l-.9 1.100c-.2.200-.3.200-.6.100-.9-.4-1.800-.9-2.600-1.700-.7-.6-1.200-1.400-1.400-1.700-.1-.3 0-.4.200-.6l.5-.6.300-.5v-.5l-.9-2.100c-.2-.5-.4-.5-.6-.5z"/></svg>';

  function pintar() {
    var lista = window.Pedido.lista();
    var n = lista.length;
    barra.hidden = n === 0;
    if (!n) { anterior = 0; return; }

    barra.textContent = "";
    var ver = document.createElement("button");
    ver.type = "button";
    ver.className = "barra__ver";
    ver.setAttribute("aria-label", "Ver y revisar mi lista");
    ver.addEventListener("click", function () { window.Lista.abrir(); });

    var chapa = document.createElement("span");
    chapa.className = "barra__chapa";
    chapa.textContent = n;
    if (n !== anterior) chapa.classList.add("barra__chapa--salta");

    var texto = document.createElement("span");
    texto.className = "barra__texto";
    texto.textContent = (n === 1 ? "producto" : "productos") + " · ver";
    ver.append(chapa, texto);

    var enviar = document.createElement("a");
    enviar.className = "barra__enviar";
    enviar.href = window.Whatsapp.url(lista);
    enviar.target = "_blank";
    enviar.rel = "noopener";
    enviar.innerHTML = ICONO + "<span>Enviar por WhatsApp</span>";

    barra.append(ver, enviar);
    anterior = n;
  }

  window.Pedido.alCambiar(pintar);
  pintar();
  window.Barra = { pintar: pintar };
})();

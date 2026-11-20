/* Bienvenida de entrada y saludo local por nombre del negocio */
(function () {
  "use strict";
  var overlay = document.getElementById("bienvenida-inicial");
  if (!overlay) return;

  var KEY = "ruta1371_nombre_negocio_v1";
  var video = document.getElementById("bienvenida-video");
  var pantalla = document.getElementById("bienvenida-pantalla");
  var omitir = document.getElementById("bienvenida-omitir");
  var nombre = "";
  try { nombre = (localStorage.getItem(KEY) || "").trim(); } catch (e) {}

  /* Si entran directamente a una marca, no interrumpimos la navegación. */
  if (location.hash && location.hash.length > 1) {
    overlay.remove();
    return;
  }

  var C = window.CONFIG || {};
  video.src = C.videoBanner || "video/banner.mp4";
  video.muted = true;
  var play = video.play();
  if (play && play.catch) play.catch(function () {});

  function salir() {
    overlay.classList.add("bienvenida-inicial--salir");
    document.body.classList.remove("bienvenida-activa");
    setTimeout(function () { overlay.remove(); }, 600);
  }

  function mostrarRegistro() {
    pantalla.innerHTML =
      '<div class="telefono__icono">🏪</div>' +
      '<h2>¡Queremos atenderte mejor!</h2>' +
      '<form class="telefono__formulario" id="registro-negocio">' +
        '<label for="nombre-negocio">¿Cuál es el nombre de tu negocio? 🏪</label>' +
        '<input id="nombre-negocio" name="nombre" type="text" maxlength="40" autocomplete="organization" placeholder="Escribe aquí el nombre" required>' +
        '<button class="telefono__enviar" type="submit">Enviar ✨</button>' +
      '</form>';
    var form = document.getElementById("registro-negocio");
    var input = document.getElementById("nombre-negocio");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valor = input.value.trim().replace(/\s+/g, " ");
      if (!valor) { input.focus(); return; }
      try { localStorage.setItem(KEY, valor); } catch (err) {}
      mostrarRegreso(valor, true);
    });
    input.focus({ preventScroll: true });
    omitir.textContent = "Continuar sin registrarme";
    omitir.onclick = salir;
  }

  function mostrarRegreso(valor, nuevo) {
    pantalla.innerHTML =
      '<div class="telefono__icono">' + (nuevo ? "🎉" : "👋") + '</div>' +
      '<h2>¡Hola, ' + escapar(valor) + '!</h2>' +
      '<p>' + (nuevo
        ? '¡Gracias por registrarte! Qué gusto tenerte por aquí. 💙'
        : '¡Qué gusto tenerte de vuelta! Nos alegra recibirte nuevamente. 🥤✨') + '</p>' +
      '<button class="telefono__entrar" id="entrar-web" type="button">Entrar a la web 🚀</button>' +
      '<small class="telefono__nota">Grupo Peñafiel · Ruta 1371</small>';
    document.getElementById("entrar-web").addEventListener("click", salir);
    omitir.textContent = "Entrar ahora";
    omitir.onclick = salir;
  }

  function escapar(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  omitir.addEventListener("click", function () {
    if (!nombre) mostrarRegistro();
    else salir();
  });

  document.body.classList.add("bienvenida-activa");
  if (nombre) {
    mostrarRegreso(nombre, false);
    /* En visitas posteriores, dejamos el saludo visible hasta que entren. */
    var barra = pantalla.querySelector(".telefono__progreso");
    if (barra) barra.remove();
    omitir.textContent = "Entrar ahora";
    omitir.onclick = salir;
  } else {
    window.setTimeout(mostrarRegistro, 6000);
  }
})();

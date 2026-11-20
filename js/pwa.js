/* ============================================================
   PWA — instalación discreta desde el pie de la página.
   El botón solo aparece mientras Ruta 1371 no esté instalada.
   ============================================================ */
(function () {
  var C = window.CONFIG || {};
  var base = location.pathname.replace(/[^/]*$/, "");

  /* ---------- 1. Service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js", { scope: base }).catch(function () {});
    });
  }

  /* ---------- 2. Notificaciones con OneSignal ---------- */
  if (C.onesignalAppId) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    var s = document.createElement("script");
    s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    s.defer = true;
    document.head.appendChild(s);
    window.OneSignalDeferred.push(function (OneSignal) {
      OneSignal.init({
        appId: C.onesignalAppId,
        serviceWorkerPath: "sw.js",
        serviceWorkerParam: { scope: base },
        allowLocalhostAsSecureOrigin: true
      }).then(function () {
        setTimeout(function () {
          try { OneSignal.Slidedown.promptPush(); } catch (e) {}
        }, (C.onesignalSegundos || 25) * 1000);
      });
    });
  }

  /* ---------- 3. Botón fijo en el pie para instalar ---------- */
  var CLAVE_INSTALADA = "ruta1371_pwa_instalada_v1";
  var esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  var boton = document.getElementById("instalar-app");
  var ayuda = document.getElementById("instalar-ayuda");
  var confirmar = document.getElementById("instalar-confirmar");
  var evento = null;

  function modoInstalado() {
    return !!((window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) ||
      navigator.standalone === true);
  }

  function marcarInstalada() {
    try { localStorage.setItem(CLAVE_INSTALADA, "1"); } catch (e) {}
    if (boton) boton.hidden = true;
    if (ayuda) ayuda.hidden = true;
    if (confirmar) confirmar.hidden = true;
  }

  function estaInstalada() {
    if (modoInstalado()) {
      marcarInstalada();
      return true;
    }
    try { return localStorage.getItem(CLAVE_INSTALADA) === "1"; }
    catch (e) { return false; }
  }

  function mostrarAyuda() {
    if (!ayuda) return;
    ayuda.innerHTML = esIOS
      ? 'En Safari: toca <b>Compartir</b> ⬆️, elige <b>Agregar a pantalla de inicio</b> y confirma. Después abre Ruta 1371 desde el nuevo icono. 📲'
      : 'En Chrome: abre el menú <b>⋮</b> y selecciona <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>. Después abre Ruta 1371 desde el icono. 📲';
    ayuda.hidden = false;
    if (confirmar) confirmar.hidden = false;
  }

  if (boton) {
    if (estaInstalada()) {
      marcarInstalada();
    } else {
      boton.hidden = false;
      boton.addEventListener("click", function () {
        if (estaInstalada()) return;
        if (evento && !esIOS) {
          evento.prompt();
          evento.userChoice.then(function (resultado) {
            if (resultado && resultado.outcome === "accepted") {
              marcarInstalada();
            } else {
              mostrarAyuda();
            }
            evento = null;
          }).catch(function () {
            evento = null;
            mostrarAyuda();
          });
        } else {
          mostrarAyuda();
        }
      });
    }
  }

  if (confirmar) {
    confirmar.addEventListener("click", function () {
      marcarInstalada();
    });
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    if (estaInstalada()) return;
    e.preventDefault();
    evento = e;
  });

  window.addEventListener("appinstalled", marcarInstalada);

  /* Si el cliente vuelve a abrir la web instalada desde su icono,
     el modo standalone permite ocultar el botón automáticamente. */
  window.addEventListener("pageshow", function () {
    if (modoInstalado()) marcarInstalada();
  });
})();

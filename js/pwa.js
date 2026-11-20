/* Accesos directos superior e inferior para Ruta 1371. */
(function () {
  "use strict";
  var C = window.CONFIG || {};
  var base = location.pathname.replace(/[^/]*$/, "");
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js", { scope: base }).catch(function () {});
    });
  }
  if (C.onesignalAppId) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    var sdk = document.createElement("script");
    sdk.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    sdk.defer = true;
    document.head.appendChild(sdk);
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

  var esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  var botones = Array.prototype.slice.call(document.querySelectorAll(".instalar-app"));
  var ayuda = document.getElementById("instalar-ayuda");
  var confirmar = document.getElementById("instalar-confirmar");
  var evento = null;
  var instaladaEnEstaSesion = false;

  function modoInstalado() {
    return !!((window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) ||
      navigator.standalone === true);
  }
  function ocultarBotones() {
    botones.forEach(function (b) { b.hidden = true; });
    if (ayuda) ayuda.hidden = true;
    if (confirmar) confirmar.hidden = true;
  }
  function mostrarBotones() {
    if (modoInstalado() || instaladaEnEstaSesion) { ocultarBotones(); return; }
    botones.forEach(function (b) { b.hidden = false; });
  }
  function mostrarAyuda() {
    if (!ayuda) return;
    ayuda.innerHTML = esIOS
      ? 'En Safari: toca <b>Compartir</b> ⬆️ y elige <b>Agregar a pantalla de inicio</b>. Después abre Ruta 1371 desde el icono. 📲'
      : 'En Chrome: abre el menú <b>⋮</b> y elige <b>Añadir a pantalla de inicio</b>. Se crea un acceso directo para abrir Ruta 1371 desde tu pantalla principal. 📲';
    ayuda.hidden = false;
    if (confirmar) confirmar.hidden = false;
  }
  function clickAcceso() {
    if (modoInstalado()) { ocultarBotones(); return; }
    if (evento && !esIOS) {
      evento.prompt();
      evento.userChoice.then(function (resultado) {
        if (resultado && resultado.outcome === "accepted") {
          instaladaEnEstaSesion = true;
          ocultarBotones();
        } else mostrarAyuda();
        evento = null;
      }).catch(function () { evento = null; mostrarAyuda(); });
    } else mostrarAyuda();
  }
  botones.forEach(function (b) { b.addEventListener("click", clickAcceso); });
  if (confirmar) confirmar.addEventListener("click", function () {
    instaladaEnEstaSesion = true;
    ocultarBotones();
  });
  window.addEventListener("beforeinstallprompt", function (e) {
    if (modoInstalado()) return;
    e.preventDefault();
    evento = e;
    mostrarBotones();
  });
  window.addEventListener("appinstalled", function () {
    instaladaEnEstaSesion = true;
    ocultarBotones();
  });
  window.addEventListener("pageshow", mostrarBotones);
  mostrarBotones();
})();
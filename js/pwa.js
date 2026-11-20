/* Accesos directos Ruta 1371. Android usa el diálogo nativo de Chrome. */
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
      OneSignal.init({ appId: C.onesignalAppId, serviceWorkerPath: "sw.js",
        serviceWorkerParam: { scope: base }, allowLocalhostAsSecureOrigin: true
      }).then(function () {
        setTimeout(function () { try { OneSignal.Slidedown.promptPush(); } catch (e) {} },
          (C.onesignalSegundos || 25) * 1000);
      });
    });
  }

  var esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  var botones = Array.prototype.slice.call(document.querySelectorAll(".instalar-app"));
  var ayuda = document.getElementById("instalar-ayuda");
  var confirmar = document.getElementById("instalar-confirmar");
  var eventoInstalacion = null;
  var instalada = false;

  function modoInstalado() {
    return !!((window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) ||
      navigator.standalone === true);
  }
  function ocultar() {
    botones.forEach(function (b) { b.hidden = true; });
    if (ayuda) ayuda.hidden = true;
    if (confirmar) confirmar.hidden = true;
  }
  function mostrar() {
    if (modoInstalado() || instalada) { ocultar(); return; }
    botones.forEach(function (b) { b.hidden = false; });
  }
  function mostrarAyuda() {
    if (!ayuda) return;
    ayuda.innerHTML = esIOS
      ? 'En Safari toca <b>Compartir</b> ⬆️ y después <b>Agregar a pantalla de inicio</b>.'
      : 'Chrome no ofreció el cuadro automático en esta visita. Abre el menú <b>⋮</b> y elige <b>Añadir a pantalla de inicio</b>.';
    ayuda.hidden = false;
    if (confirmar) confirmar.hidden = false;
  }
  function pedirInstalacion() {
    if (modoInstalado()) { ocultar(); return; }
    if (!esIOS && eventoInstalacion) {
      var evento = eventoInstalacion;
      eventoInstalacion = null;
      evento.prompt();
      evento.userChoice.then(function (resultado) {
        if (resultado && resultado.outcome === "accepted") { instalada = true; ocultar(); }
        else mostrarAyuda();
      }).catch(function () { mostrarAyuda(); });
      return;
    }
    mostrarAyuda();
  }
  botones.forEach(function (b) { b.addEventListener("click", pedirInstalacion); });
  if (confirmar) confirmar.addEventListener("click", function () { instalada = true; ocultar(); });

  /* Capturar el evento tan pronto como Chrome lo emita; no mostrar instrucciones
     en Android si el diálogo nativo está disponible. */
  window.addEventListener("beforeinstallprompt", function (e) {
    if (modoInstalado()) return;
    e.preventDefault();
    eventoInstalacion = e;
    mostrar();
  });
  window.addEventListener("appinstalled", function () { instalada = true; ocultar(); });
  window.addEventListener("pageshow", mostrar);
  mostrar();
})();
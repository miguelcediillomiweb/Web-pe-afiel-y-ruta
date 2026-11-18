/* ============================================================
   PWA — instalar la web como app, service worker y notificaciones (OneSignal).
   El App ID de OneSignal se pone en config.js (onesignalAppId).
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
          try { OneSignal.Slidedown.promptPush(); } catch (e) { /* ya decidió o no es compatible */ }
        }, (C.onesignalSegundos || 25) * 1000);
      });
    });
  }

  /* ---------- 3. Aviso "Agrega a tu inicio" ---------- */
  var CLAVE = "pwa-aviso";
  var esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  var instalada = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
  var evento = null, aviso = null, mostrado = false;

  function descartado() {
    try { return Date.now() - (parseInt(localStorage.getItem(CLAVE) || "0", 10) || 0) < 7 * 86400000; } catch (e) { return false; }
  }
  function recordar() { try { localStorage.setItem(CLAVE, String(Date.now())); } catch (e) {} }

  function cerrar() {
    if (!aviso) return;
    aviso.classList.remove("instalar--visible");
    var a = aviso; aviso = null;
    setTimeout(function () { a.remove(); }, 450);
  }

  function ocupado() {
    var carga = document.getElementById("pantalla-carga");
    return document.hidden || document.body.classList.contains("sin-scroll") || (carga && !carga.hidden);
  }

  function mostrar() {
    if (mostrado || instalada || descartado()) return;
    if (!evento && !esIOS) return;
    if (ocupado()) { setTimeout(mostrar, 5000); return; }
    mostrado = true;

    aviso = document.createElement("div");
    aviso.className = "instalar";
    aviso.setAttribute("role", "dialog");
    aviso.setAttribute("aria-label", "Agregar a la pantalla de inicio");
    aviso.innerHTML =
      '<img class="instalar__icono" src="img/icon-192.png" alt="">' +
      '<div class="instalar__texto">' +
        '<strong>Agrega Ruta 1371 a tu inicio 📲</strong>' +
        '<span>' + (esIOS
          ? 'Toca <b>Compartir</b> ⬆️ y luego <b>«Agregar a pantalla de inicio»</b>'
          : 'Ábrela como una app, sin buscarla cada vez 😉') + '</span>' +
      '</div>' +
      (esIOS ? '' : '<button class="instalar__boton" type="button">Instalar</button>') +
      '<button class="instalar__cerrar" type="button" aria-label="Cerrar">×</button>';
    document.body.appendChild(aviso);
    void aviso.offsetWidth;
    aviso.classList.add("instalar--visible");

    var boton = aviso.querySelector(".instalar__boton");
    if (boton) boton.addEventListener("click", function () {
      if (!evento) return;
      evento.prompt();
      evento.userChoice.then(function () { evento = null; cerrar(); });
    });
    aviso.querySelector(".instalar__cerrar").addEventListener("click", function () { recordar(); cerrar(); });
    if (esIOS) setTimeout(function () { recordar(); cerrar(); }, 14000);
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    evento = e;
    setTimeout(mostrar, 12000);
  });
  window.addEventListener("appinstalled", function () { evento = null; recordar(); cerrar(); });
  if (esIOS && !instalada) setTimeout(mostrar, 15000);
  if (/[?&]instalar=1/.test(location.search)) { evento = evento || { prompt: function () {}, userChoice: Promise.resolve() }; setTimeout(mostrar, 800); }
})();

/* ============================================================
   PWA — instalar la web como app, service worker y notificaciones.
   El aviso de instalación vuelve a mostrarse en cada visita
   mientras la web no esté instalada.
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

  /* ---------- 3. Aviso de instalación ---------- */
  var esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  var CLAVE_INSTALADA = "ruta1371_pwa_instalada_v1";
  function estaInstalada() {
    var modoApp = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) || navigator.standalone === true;
    if (modoApp) {
      try { localStorage.setItem(CLAVE_INSTALADA, "1"); } catch (e) {}
      return true;
    }
    try { return localStorage.getItem(CLAVE_INSTALADA) === "1"; } catch (e) { return false; }
  }
  var instalada = estaInstalada();
  var evento = null, aviso = null, mostrado = false;

  function cerrar() {
    if (!aviso) return;
    aviso.classList.remove("instalar--visible");
    var anterior = aviso;
    aviso = null;
    setTimeout(function () { anterior.remove(); }, 450);
  }

  function ocupado() {
    var carga = document.getElementById("pantalla-carga");
    var bienvenida = document.getElementById("bienvenida-inicial");
    return document.hidden ||
      document.body.classList.contains("sin-scroll") ||
      (carga && !carga.hidden) ||
      (bienvenida && !bienvenida.classList.contains("bienvenida-inicial--salir"));
  }

  function mostrar() {
    if (mostrado || instalada || estaInstalada()) return;
    if (ocupado()) { setTimeout(mostrar, 2500); return; }
    mostrado = true;

    var ayuda = esIOS
      ? 'Toca <b>Compartir</b> ⬆️ y después <b>«Agregar a pantalla de inicio»</b>.'
      : (evento
        ? 'Instálala para abrir Ruta 1371 como una aplicación.'
        : 'En Chrome, abre el menú ⋮ y busca <b>«Instalar aplicación»</b> o <b>«Añadir a pantalla de inicio»</b>.');

    aviso = document.createElement("div");
    aviso.className = "instalar";
    aviso.setAttribute("role", "dialog");
    aviso.setAttribute("aria-label", "Agregar Ruta 1371 a la pantalla de inicio");
    aviso.innerHTML =
      '<img class="instalar__icono" src="img/icon-192.png" alt="">' +
      '<div class="instalar__texto">' +
        '<strong>Agrega Ruta 1371 a tu inicio 📲</strong>' +
        '<span>' + ayuda + '</span>' +
      '</div>' +
      (evento && !esIOS ? '<button class="instalar__boton" type="button">Instalar</button>' : '') +
      (esIOS ? '<button class="instalar__confirmar" type="button">Ya la agregué</button>' : '') +
      '<button class="instalar__cerrar" type="button" aria-label="Cerrar">×</button>';

    document.body.appendChild(aviso);
    void aviso.offsetWidth;
    aviso.classList.add("instalar--visible");

    var boton = aviso.querySelector(".instalar__boton");
    if (boton) boton.addEventListener("click", function () {
      if (!evento) return;
      evento.prompt();
      evento.userChoice.then(function () {
        evento = null;
        cerrar();
      }).catch(function () {
        evento = null;
        cerrar();
      });
    });

    var confirmar = aviso.querySelector(".instalar__confirmar");
    if (confirmar) confirmar.addEventListener("click", function () {
      try { localStorage.setItem(CLAVE_INSTALADA, "1"); } catch (e) {}
      instalada = true;
      cerrar();
    });

    aviso.querySelector(".instalar__cerrar").addEventListener("click", cerrar);
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    if (estaInstalada()) return;
    evento = e;
    if (!mostrado) setTimeout(mostrar, 12000);
  });

  window.addEventListener("appinstalled", function () {
    instalada = true;
    try { localStorage.setItem(CLAVE_INSTALADA, "1"); } catch (e) {}
    evento = null;
    cerrar();
  });

  /* En iPhone/iPad se muestran instrucciones; en Android hay
     instrucciones manuales si Chrome no ofrece el evento nativo. */
  if (!instalada) {
    if (esIOS) {
      setTimeout(mostrar, 15000);
    } else {
      setTimeout(function () {
        if (!evento) mostrar();
      }, 18000);
    }
  }

  /* Acceso de prueba: ?instalar=1 */
  if (/[?&]instalar=1/.test(location.search) && !instalada) {
    setTimeout(mostrar, 800);
  }
})();
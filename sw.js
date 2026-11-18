/* ============================================================
   SERVICE WORKER — Grupo Peñafiel · Ruta 1371
   - Notificaciones de OneSignal.
   - Caché: la web abre rápido y funciona sin señal con lo último que se vio.
   - Archivos de la web (html, js, css, json): primero internet, y si no hay, la copia.
   - Imágenes y fuentes: primero la copia y se actualiza sola por detrás.
   Para forzar que todos los teléfonos descarguen todo de nuevo, cambia VERSION.
   ============================================================ */
try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (e) { /* sin internet al instalar: se sigue sin OneSignal hasta la próxima actualización */ }

var VERSION = "penafiel-v1";
var BASE = ["./", "index.html", "manifest.json", "img/icon-192.png", "img/icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      return Promise.all(BASE.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.filter(function (k) { return k !== VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function guardar(req, resp) {
  if (resp && resp.ok && resp.type === "basic") {
    var copia = resp.clone();
    caches.open(VERSION).then(function (c) { c.put(req, copia); });
  }
  return resp;
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            /* Google Sheets, fuentes, OneSignal: directo */
  if (/\.(mp4|webm)$/i.test(url.pathname)) return;             /* el video pesado va siempre por internet */

  var esPagina = req.mode === "navigate" || req.destination === "document" ||
                 req.destination === "script" || req.destination === "style" ||
                 /\.(json|webmanifest)$/i.test(url.pathname);

  if (esPagina) {
    e.respondWith(
      fetch(req).then(function (r) { return guardar(req, r); })
        .catch(function () {
          return caches.match(req).then(function (c) {
            return c || (req.mode === "navigate" ? caches.match("index.html") : Response.error());
          });
        })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (c) {
      var red = fetch(req).then(function (r) { return guardar(req, r); }).catch(function () { return c; });
      return c || red;
    })
  );
});

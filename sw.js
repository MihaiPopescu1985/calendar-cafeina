// Service worker pentru Jurnal de cofeină
// Strategie: cache-first pentru shell, cu fallback la retea.
// Bump versiunea (v1 -> v2) cand modifici fisierele, ca sa fortezi reimprospatarea.

const CACHE = "cofeina-v1";

const RESURSE = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone/babel.min.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(RESURSE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((chei) =>
      Promise.all(chei.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((rasp) => {
        // Punem in cache si resursele noi (ex. iconite) pentru offline
        const copie = rasp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie)).catch(() => {});
        return rasp;
      }).catch(() => cached);
    })
  );
});

const CACHE = 'apollinare-v2';

self.addEventListener('install', (event) => {
  // Non pre-caching index.html: nginx lo serve con no-store, deve sempre venire dalla rete
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Elimina tutte le cache vecchie (inclusa apollinare-v1)
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo richieste allo stesso hostname
  if (url.hostname !== self.location.hostname) return;

  // Navigazione → sempre dalla rete (nginx risponde con no-store + Clear-Site-Data)
  // Non fare event.respondWith → il browser fa la richiesta HTTP normalmente
  if (request.mode === 'navigate') return;

  // Asset con hash (js/css/png/svg) → cache-first (nginx li serve immutabili)
  if (/\.(js|css|png|svg|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached || fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
          return res;
        })
      )
    );
  }
});

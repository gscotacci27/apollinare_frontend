// Service Worker disabilitato — la cache è gestita da nginx con header no-store.
// Questo file esiste solo per deregistrare eventuali SW precedenti.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

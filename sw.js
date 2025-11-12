// /Supersystem/sw.js
// SafeShare Service Worker – no-cache pass-through
const SW_VERSION = '7';

// Sofort aktiv werden
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Übernehmen und alle ggf. vorhandenen Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      // Navigation Preload (falls verfügbar) aktivieren
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();
    } catch (e) {
      // still claim
      await self.clients.claim();
    }
  })());
});

// Netz-first, Browser-Cache umgehen
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Nur GET behandeln
  if (req.method !== 'GET') return;

  // Nicht für Extension-/DevTools-URLs
  if (req.url.startsWith('chrome-extension:')) return;

  // Immer Netzwerk, ohne Cache; bei Fehler normaler Fetch-Fallback
  event.respondWith(
    (async () => {
      try {
        // Navigation Preload nutzen, wenn vorhanden
        const preload = await event.preloadResponse;
        if (preload) return preload;

        return await fetch(req, { cache: 'no-store', redirect: 'follow' });
      } catch (err) {
        // Fallback: versucht normalen Fetch (kann aus Browsercache kommen)
        return fetch(req);
      }
    })()
  );
});

// Wartungs-Kommandos von der Seite
self.addEventListener('message', (event) => {
  const msg = event.data;
  if (msg === 'CLEAR_CACHES') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  } else if (msg === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
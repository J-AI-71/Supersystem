// /Supersystem/sw.js
/* SafeShare Service Worker – Navigation mit Offline-Fallback */
const VERSION = '2025-11-15-12';
const ROOT = '/Supersystem/';
const OFFLINE_URL = ROOT + 'offline.html';
const PRECACHE = [OFFLINE_URL];

// Bestimmte Assets nicht abfangen (werden immer direkt geladen)
const BYPASS = [/\/assets\/icons\//, /\/assets\/og\.png$/];

// Cache-Namen
const CNAME = (name) => `ss-${VERSION}-${name}`;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CNAME('pre'));
    await cache.addAll(PRECACHE);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([CNAME('pre'), CNAME('dyn')]);
    for (const key of await caches.keys()) {
      if (!keep.has(key)) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Nur GET behandeln
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Nur gleiche Origin abfangen
  const sameOrigin = url.origin === location.origin;

  // Bestimmte Pfade ignorieren
  if (sameOrigin && BYPASS.some(rx => rx.test(url.pathname))) return;

  // Navigationsanfragen (Seitenaufrufe): Network → Fallback offline.html
  const isHTMLNav =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (sameOrigin && isHTMLNav) {
    event.respondWith((async () => {
      try {
        // Network first
        const fresh = await fetch(req, { cache: 'no-store' });
        return fresh;
      } catch (err) {
        // Offline-Fallback
        const cache = await caches.open(CNAME('pre'));
        const offline = await cache.match(OFFLINE_URL);
        return offline || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // Statische Assets: Stale-While-Revalidate (optional)
  if (sameOrigin && /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|json|webmanifest)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CNAME('dyn'));
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((response) => {
        if (response && response.ok) cache.put(req, response.clone());
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })());
    return;
  }

  // Standard: Netz versuchen, sonst Cache
  event.respondWith((async () => {
    try { return await fetch(req); }
    catch { return (await caches.match(req)) || (await caches.match(OFFLINE_URL)); }
  })());
});

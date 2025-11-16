// /Supersystem/sw.js
const VERSION = '2025-11-15-04';
const CACHE = 'ss-cache-' + VERSION;
const BYPASS_HTML = new Set([
  '/Supersystem/impressum.html',
  '/Supersystem/datenschutz.html'
]);

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE)); // kein Precache nötig
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML = req.destination === 'document' || url.pathname.endsWith('.html');
  const isPDF  = url.pathname.endsWith('.pdf');

  // HTML/PDF: network-first (Legal-Pages nie cachen)
  if (isHTML || isPDF) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        if (!isHTML || !BYPASS_HTML.has(url.pathname)) {
          const c = await caches.open(CACHE);
          c.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        const c = await caches.open(CACHE);
        const hit = await c.match(req);
        return hit || Response.error();
      }
    })());
    return;
  }

  // Sonstige Assets: cache-first
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req);
    if (hit) return hit;
    const fresh = await fetch(req);
    try { c.put(req, fresh.clone()); } catch {}
    return fresh;
  })());
});

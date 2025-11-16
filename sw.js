// /Supersystem/sw.js
// Minimal-SW: HTML immer Netz; Assets stale-while-revalidate; Icons/OG bypass.
const VERSION='2025-11-15-15';
const BYPASS=[/\/assets\/icons\//,/\/assets\/og\.png$/];
const CNAME = n => `ss-${VERSION}-${n}`;

self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const same = u.origin === location.origin;

  if (same && BYPASS.some(rx => rx.test(u.pathname))) return;

  const isHTML = req.mode === 'navigate' || (req.headers.get('accept')||'').includes('text/html');
  if (same && isHTML) {
    e.respondWith(fetch(req, {cache:'no-store'}).catch(()=> new Response('Offline', {status:503})));
    return;
  }

  const isAsset = same && /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|json|webmanifest)$/.test(u.pathname);
  if (isAsset) {
    e.respondWith((async () => {
      const cache = await caches.open(CNAME('dyn'));
      const cached = await cache.match(req);
      const freshP = fetch(req).then(r => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(()=>cached);
      return cached || freshP;
    })());
  }
});

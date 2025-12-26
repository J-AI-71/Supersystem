/* sw.js — SafeShare (NO offline HTML)
   - caches only same-origin static assets (JS/CSS/images/fonts)
   - NEVER caches HTML navigations (prevents “sometimes old index”)
   - supports SKIP_WAITING + GET_VERSION
   - cache is versioned; bump SW_VERSION on every deploy
*/
'use strict';

const SW_VERSION = '2025-12-26-01';
const ASSET_CACHE = `ss-assets-${SW_VERSION}`;

// Treat these as “always network-fresh” to avoid sticky favicons/manifest
function isIconOrManifest(pathname) {
  return (
    pathname.endsWith('/manifest.webmanifest') ||
    pathname.endsWith('/favicon.ico') ||
    pathname.includes('/assets/fav/') ||
    pathname.includes('/assets/icons/') ||
    pathname.includes('apple-touch-icon')
  );
}

self.addEventListener('install', (event) => {
  // No precache (since you don't want offline)
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // delete older caches
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k === ASSET_CACHE) return null;
      if (k.startsWith('ss-assets-') || k.startsWith('ss-precache-') || k.startsWith('ss-runtime-')) {
        return caches.delete(k);
      }
      return null;
    }));

    await self.clients.claim();
    // optional broadcast
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cs) c.postMessage({ type: 'SW_VERSION', value: SW_VERSION });
  })());
});

self.addEventListener('message', (ev) => {
  const data = ev.data;
  if (!data) return;

  if (data.type === 'GET_VERSION') {
    const msg = { type: 'SW_VERSION', value: SW_VERSION };
    if (ev.ports && ev.ports[0]) ev.ports[0].postMessage(msg);
    else if (ev.source && typeof ev.source.postMessage === 'function') ev.source.postMessage(msg);
    return;
  }

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1) HTML navigations: network-only (no HTML cache)
  const accept = req.headers.get('accept') || '';
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith((async () => {
      try {
        // no-store prevents browser/http cache weirdness
        return await fetch(req, { cache: 'no-store' });
      } catch (_) {
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // 2) Only cache same-origin assets
  if (!sameOrigin) return;

  // 3) Icons/manifest: network-fresh (fallback to cache if offline)
  if (isIconOrManifest(url.pathname)) {
    event.respondWith((async () => {
      try {
        return await fetch(req, { cache: 'no-store' });
      } catch (_) {
        return (await caches.match(req)) || new Response('', { status: 504, statusText: 'Icon fetch failed' });
      }
    })());
    return;
  }

  // 4) Static assets: cache-first + background revalidate
  // (works nicely with your ?v= cache busters)
  event.respondWith((async () => {
    const cache = await caches.open(ASSET_CACHE);
    const cached = await cache.match(req);

    const fetchAndUpdate = fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        cache.put(req, res.clone());
      }
      return res;
    }).catch(() => undefined);

    // cache-first
    return cached || (await fetchAndUpdate) || fetch(req);
  })());
});

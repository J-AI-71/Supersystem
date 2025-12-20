/* /Supersystem/sw.js
   SafeShare Service Worker (clean, single fetch handler)
   - GET_VERSION + SKIP_WAITING
   - Network-first for navigations (HTML)
   - Stale-While-Revalidate for same-origin assets
   - Icons/Favicons/Manifest: network-first (no-store) + do NOT SWR-cache (fixes sticky favicon behavior)
   - Precache CORE (robust)
*/
'use strict';

const SW_VERSION = '2025-12-20-01';

const PRECACHE = `ss-precache-${SW_VERSION}`;
const RUNTIME  = `ss-runtime-${SW_VERSION}`;
const OFFLINE_URL = 'offline.html';

const CORE = [
  './', 'index.html',

  // public
  'app.html',
  'bookmarklets.html',
  'education.html',
  'status.html',
  'help.html',
  '404.html',
  OFFLINE_URL,

  // pro public pages (landing/activation)
  'pro.html',

  // optional (only if they exist, otherwise ignored by robust add)
  'publisher.html',
  'partners.html',
  'compliance.html',
  'quickstart.html',

  // JS
  'js/sw-register.js',
  'js/cleaner.js',
  'js/page-status.js',
  'js/bookmarklets.js',
  'js/page-404.js',

  // PWA
  'manifest.webmanifest',

  // Favicons (bei dir vorhanden: assets/fav/*)
  'assets/fav/favicon.svg',
  'assets/fav/favicon-16.png',
  'assets/fav/favicon-32.png',
  'assets/fav/apple-touch-icon.png',

  // PWA / iOS Icons (optional – nur wenn existieren)
  'assets/icons/icon-192-kreis.png',
  'assets/icons/icon-512-kreis.png',
  'assets/icons/icon-maskable-512-kreis.png',
  'assets/icons/apple-touch-icon-180.png',

  // media (optional)
  'assets/og/og-index.jpg',
  'assets/qr/app-qr.svg'
];

/* -------- Install: Precache (robust) -------- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    await Promise.all(CORE.map(async (url) => {
      try {
        await cache.add(new Request(url, { cache: 'reload' }));
      } catch (_) {
        // ignore missing files so SW still installs
      }
    }));
    // do NOT skipWaiting automatically; trigger via status page or manual
  })());
});

/* -------- Activate: Cleanup + claim + optional navigation preload -------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }

    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k === PRECACHE || k === RUNTIME) return null;
      return caches.delete(k);
    }));

    await self.clients.claim();

    // broadcast version to open clients
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cs) c.postMessage({ type: 'SW_VERSION', value: SW_VERSION });
  })());
});

/* -------- Message: GET_VERSION & SKIP_WAITING -------- */
self.addEventListener('message', (ev) => {
  if (!ev.data) return;

  if (ev.data.type === 'GET_VERSION') {
    const msg = { type: 'SW_VERSION', value: SW_VERSION };
    if (ev.ports && ev.ports[0]) ev.ports[0].postMessage(msg);
    else if (ev.source && typeof ev.source.postMessage === 'function') ev.source.postMessage(msg);
    else {
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((cs) => cs.forEach((c) => c.postMessage(msg)));
    }
  }

  if (ev.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* -------- Fetch (single handler) -------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // HTML navigations: network-first
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;

        const net = await fetch(req, { cache: 'no-store' });

        // only cache good HTML responses
        if (net && net.status === 200) {
          const cache = await caches.open(RUNTIME);
          cache.put(req, net.clone());
        }
        return net;
      } catch (_) {
        // fall back to cached page (ignoreSearch so /page?v=... still matches)
        const cached = await caches.match(req, { ignoreSearch: true });
        if (cached) return cached;

        const offline = await caches.match(OFFLINE_URL);
        return offline || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // Only cache same-origin assets
  if (!sameOrigin) return;

  // Icons/Favicons/Manifest: always try network fresh; do NOT SWR-cache these
  const isIconOrManifest =
    url.pathname.endsWith('/manifest.webmanifest') ||
    url.pathname.includes('/assets/icons/') ||
    url.pathname.includes('/assets/fav/') ||
    url.pathname.endsWith('/favicon.ico') ||
    url.pathname.includes('apple-touch-icon');

  if (isIconOrManifest) {
    event.respondWith((async () => {
      try {
        return await fetch(req, { cache: 'no-store' });
      } catch (_) {
        // offline fallback: allow cached icon/manifest if available
        return (await caches.match(req)) ||
               (await caches.match(req, { ignoreSearch: true })) ||
               new Response('', { status: 504, statusText: 'Icon fetch failed' });
      }
    })());
    return;
  }

  // Assets: stale-while-revalidate (IMPORTANT: do NOT ignoreSearch; so ?v=... works)
  event.respondWith((async () => {
    const cached = await caches.match(req);

    const fetchPromise = fetch(req).then(async (res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const cache = await caches.open(RUNTIME);
        cache.put(req, res.clone());
      }
      return res;
    }).catch(() => undefined);

    return cached || fetchPromise || fetch(req);
  })());
});

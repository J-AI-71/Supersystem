/* /Supersystem/sw.js
   SafeShare Service Worker (mit GET_VERSION & SKIP_WAITING)
   -------------------------------------------------------- */
'use strict';

const SW_VERSION = '2025-12-14-01';
const CACHE_NAME = 'ss-cache-' + SW_VERSION;
self.__SW_VERSION__ = SW_VERSION;

const PRECACHE    = `ss-precache-${SW_VERSION}`;
const RUNTIME     = `ss-runtime-${SW_VERSION}`;
const OFFLINE_URL = 'offline.html';

/* Seiten/Assets fürs schnelle Erstladen (robust: einzelne Fehler werden ignoriert) */
const CORE = [
  './', 'index.html',
  'app.html',
  'bookmarklets.html',
  'bulk-clean.html',
  'team-setup.html',
  'redirect-entschachteln.html',
  'publisher.html',
  'education.html',
  'partners.html',
  'compliance.html',
  'press.html',
  'help.html',
  'quickstart.html',
  'pro.html',
  'status.html',
  '404.html',
  OFFLINE_URL,

  // JS
  'js/sw-register.js',
  'js/cleaner.js',
  'js/page-status.js',
  'js/bookmarklets.js',
  'js/page-404.js',

  'pro-activate.html',
  'js/page-pro-activate.js',

  // App-Metadaten & Icons
  'manifest.webmanifest',
  'assets/icons/icon-16-kreis.png',
  'assets/icons/icon-32-kreis.png',
  'assets/icons/icon-192-kreis.png',
  'assets/icons/icon-512-kreis.png',
  'assets/icons/apple-touch-icon-180.png',

  // Medien (falls vorhanden)
  'assets/og/og-index.jpg',
  'assets/qr/app-qr.svg'
];

/* -------- Install: Precache -------- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    await Promise.all(CORE.map(async (url) => {
      try {
        await cache.add(new Request(url, { cache: 'reload' }));
      } catch (_) { /* ignore missing */ }
    }));
    // bewusst KEIN skipWaiting() automatisch
  })());
});

/* -------- Activate: Aufräumen + Claim + Version an Clients -------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }

    const keep = new Set([PRECACHE, RUNTIME]);
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => keep.has(k) ? null : caches.delete(k)));

    await self.clients.claim();

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

/* -------- Fetch: Network-first für Navigation, SWR für Same-Origin Assets -------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // nur GET cachen
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1) NAVIGATION: network-first (damit HTML Updates sofort kommen)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;

        const net = await fetch(req, { cache: 'no-store' });
        const cache = await caches.open(RUNTIME);
        cache.put(req, net.clone());
        return net;
      } catch (_) {
        const cache = await caches.open(PRECACHE);
        const cached = await cache.match(req, { ignoreSearch: true });
        if (cached) return cached;
        const offline = await cache.match(OFFLINE_URL);
        return offline || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // 2) SAME-ORIGIN ASSETS: stale-while-revalidate (+ 404 fallback aus Cache)
  if (sameOrigin) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME);
      const cached = await caches.match(req, { ignoreSearch: true });

      const fetchPromise = fetch(req).then((res) => {
        if (!res) return res;

        // Wenn Server 404 liefert: versuche Cache statt 404 auszuliefern
        if (res.status === 404) return cached || res;

        // Nur erfolgreiche Antworten cachen
        if (res.status === 200 && res.type === 'basic') {
          cache.put(req, res.clone());
        }
        return res;
      }).catch(() => cached);

      return cached || fetchPromise;
    })());
    return;
  }

  // 3) Fremd-Origin: durchreichen
  // (keine respondWith nötig)
});

/* /Supersystem/sw.js
   SafeShare Service Worker (mit GET_VERSION & SKIP_WAITING)
   -------------------------------------------------------- */
'use strict';

const SW_VERSION = '2025-11-24-01';
const CACHE_NAME = 'ss-cache-' + SW_VERSION; // wird in install/activate genutzt
self.__SW_VERSION__ = SW_VERSION;

const PRECACHE   = `ss-precache-${SW_VERSION}`;
const RUNTIME    = `ss-runtime-${SW_VERSION}`;
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

  // JS (Version-Query wird zur Laufzeit ignoriert)
  'js/sw-register.js',
  'js/cleaner.js',
  'js/page-status.js',
  'js/bookmarklets.js',
  'js/page-404.js',

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
    // robustes addAll: fehlende Dateien brechen den Install nicht ab
    await Promise.all(CORE.map(async (url) => {
      try {
        await cache.add(new Request(url, { cache: 'reload' }));
      } catch (_) { /* ignore missing */ }
    }));
    // NICHT automatisch skipWaiting – Aktivierung bewusst via Status-Seite
  })());
});

/* -------- Activate: Aufräumen + Claim + Version an Clients -------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Navigation Preload (falls verfügbar) aktivieren
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }

    // alte Caches löschen
    const keep = new Set([PRECACHE, RUNTIME]);
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => keep.has(k) ? null : caches.delete(k)));

    await self.clients.claim();

    // Alle offenen Clients über aktuelle Version informieren
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cs) {
      c.postMessage({ type: 'SW_VERSION', value: SW_VERSION });
    }
  })());
});

/* -------- Message: GET_VERSION & SKIP_WAITING (beide Fälle) -------- */
self.addEventListener('message', (ev) => {
  if (!ev.data) return;

  // 1) Version abrufen
  if (ev.data.type === 'GET_VERSION') {
    const msg = { type: 'SW_VERSION', value: SW_VERSION };
    // Antwort über MessagePort (bevorzugt), sonst Broadcast an Absender-Client
    if (ev.ports && ev.ports[0]) {
      ev.ports[0].postMessage(msg);
    } else if (ev.source && typeof ev.source.postMessage === 'function') {
      ev.source.postMessage(msg);
    } else {
      // Fallback: an alle Fenster senden
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((cs) => cs.forEach((c) => c.postMessage(msg)));
    }
  }

  // 2) Wartende Version sofort aktivieren
  if (ev.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* -------- Fetch: Network-first für Navigation, Stale-While-Revalidate für Assets -------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Nur GET cachen
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigationen: Netzwerk zuerst, dann Cache, dann Offline-Fallback
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // falls Navigation Preload aktiv ist
        const preload = await event.preloadResponse;
        if (preload) return preload;

        const net = await fetch(req, { cache: 'no-store' });
        // Erfolgreiche Navigation im Runtime-Cache spiegeln
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

  // Gleiche Origin: Stale-While-Revalidate (ignoreSearch für ?v=…)
  if (sameOrigin) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME);
      const cached = await caches.match(req, { ignoreSearch: true });
      const fetchPromise = fetch(req).then((res) => {
        // Nur erfolgreiche Antworten cachen
        if (res && res.status === 200 && res.type === 'basic') {
          cache.put(req, res.clone());
        }
        return res;
      }).catch(() => undefined);

      // Sofort aus Cache, parallel aktualisieren
      return cached || fetchPromise || fetch(req);
    })());
    return;
  }

  // Fremd-Origin: einfach weiterreichen (kein CORS-Caching erzwingen)
  // Optional: könnte per Stale-While-Revalidate ergänzt werden, wenn erlaubt.
});

/* -------- Optional: Offline-Fallback für 404 bei Same-Origin -------- */
self.addEventListener('fetch', (event) => {
  // zusätzlicher Schutz: wenn eine gleiche-Origin-Resource 404 liefert, versuche Cache
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res.status !== 404) return res;
      const cached = await caches.match(req, { ignoreSearch: true });
      return cached || res;
    } catch (_) {
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;
      const offline = await caches.match(OFFLINE_URL);
      return offline || new Response('Offline', { status: 503 });
    }
  })());
});

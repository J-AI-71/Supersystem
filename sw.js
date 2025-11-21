/* sw.js – SafeShare Service Worker
 * Strategie:
 * - HTML (Navigations): network-first mit Offline-Fallback
 * - Assets (JS/CSS/Icons/Images/Manifest): cache-first
 * - Precache definierter Kernseiten/Assets
 * Steuerung:
 * - Message PING / SKIP_WAITING / CLEAR_CACHES / PRECACHE_LIST
 */
const SS_VERSION = 'v35';
const PRECACHE = `ss-precache-${SS_VERSION}`;
const RUNTIME  = `ss-runtime-${SS_VERSION}`;
const OFFLINE_URL = 'offline.html';

/** Precache-Liste – nur eigene, vorhandene Dateien (gleiches Origin) */
const PRECACHE_URLS = [
  './', 'index.html',
  'app.html','pro.html','bookmarklets.html','bulk-clean.html',
  'redirect-entschachteln.html','team-setup.html',
  'help.html','quickstart.html','tests.html','status.html',
  'publisher.html','education.html','partners.html','compliance.html',
  'press.html','impressum.html','datenschutz.html','terms.html','kurz-terms.html',
  // Grundlegende Assets
  'manifest.webmanifest',
  'assets/icons/icon-16-kreis.png',
  'assets/icons/icon-32-kreis.png',
  'assets/icons/icon-192-kreis.png',
  'assets/icons/icon-512-kreis.png',
  'assets/icons/apple-touch-icon-180.png',
  'assets/og/og-index.jpg',
  // QR (falls vorhanden; wenn nicht, wird beim Install still übersprungen)
  'assets/qr/app-qr.svg',
  // JavaScript (sofern vorhanden)
  'js/sw-register.js',
  'js/cleaner.js',
  'js/bookmarklets.js',
  'js/bulk-clean.js',
  'js/page-status.js',
  'js/page-pro.js',
  'js/page-404.js',
  // Fallback-Seiten (optional, aber empfohlen)
  '404.html',
  OFFLINE_URL
];

/* ---------------- Install: Precache ---------------- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    // Robust gegen einzelne 404: einzeln hinzufügen
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      try {
        // Cache-busting beim Install vermeiden; Browser nutzt frische Kopie
        const req = new Request(url, { cache: 'reload' });
        const res = await fetch(req);
        if (res && res.ok) await cache.put(req, res.clone());
      } catch (_) { /* fehlende Datei ignorieren */ }
    }));
    // Keine automatische Übernahme – „wartende Version“ bleibt sichtbar,
    // damit status.html → „Wartende Version aktivieren“ nutzen kann.
    // self.skipWaiting(); // absichtlich NICHT automatisch
  })());
});

/* ---------------- Activate: Aufräumen & Claim ---------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(k => {
        const keep = (k === PRECACHE) || (k === RUNTIME);
        if (!keep && (k.startsWith('ss-precache-') || k.startsWith('ss-runtime-'))) {
          return caches.delete(k);
        }
      })
    );
    await self.clients.claim();
  })());
});

/* ---------------- Fetch: Strategie je Ressourcentyp ---------------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Nur GET abfangen
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Cross-Origin nicht anfassen (lassen wir Netzwerk machen)
  if (url.origin !== self.location.origin) return;

  // Hart neu laden, wenn ?nocache=… vorhanden
  if (url.searchParams.has('nocache')) {
    event.respondWith(fetch(req, { cache: 'reload' }).catch(() => caches.match(req)));
    return;
  }

  // Navigationen (HTML-Seiten): network-first + Offline-Fallback
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }

  // Dateiendung analysieren
  const pathname = url.pathname;
  const ext = pathname.split('.').pop().toLowerCase();

  // Statische Assets: cache-first
  if (['js','css','png','jpg','jpeg','svg','webmanifest','ico','gif','json','map'].includes(ext)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Sonst: network-first (z. B. HTML, ohne navigate-Mode)
  event.respondWith(networkFirst(req));
});

/* ---------------- Message-API: Status & Steuerung ---------------- */
self.addEventListener('message', (event) => {
  const data = event.data || {};
  const port = (event.ports && event.ports[0]) ? event.ports[0] : null;

  if (data.type === 'PING') {
    port && port.postMessage({ type: 'PONG', version: SS_VERSION, note: `precache:${PRECACHE_URLS.length}` });
    return;
  }

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    port && port.postMessage({ type: 'ACK' });
    return;
  }

  if (data.type === 'CLEAR_CACHES') {
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      port && port.postMessage({ type: 'CLEARED' });
    })();
    return;
  }

  if (data.type === 'PRECACHE_LIST') {
    port && port.postMessage({ type: 'PRECACHE_LIST', items: PRECACHE_URLS });
    return;
  }
});

/* ---------------- Strategien ---------------- */
async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    // HTML & JSON etc. nicht zwingend in RUNTIME cachen, aber kann sinnvoll sein:
    const rt = await caches.open(RUNTIME);
    rt.put(request, fresh.clone());
    return fresh;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline-Fallback nur für Navigationen/HTML sinnvoll
    if (request.mode === 'navigate') {
      const off = await caches.match(OFFLINE_URL);
      if (off) return off;
    }
    // Letzte Option: 404-Fallback
    const notFound = await caches.match('404.html');
    return notFound || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    // Nur erfolgreiche Antworten cachen
    if (fresh && fresh.ok) {
      const rt = await caches.open(RUNTIME);
      rt.put(request, fresh.clone());
    }
    return fresh;
  } catch (_) {
    // Fallback: 404-Seite, wenn sinnvoll
    const notFound = await caches.match('404.html');
    return notFound || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

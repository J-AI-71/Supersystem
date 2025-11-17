/* /Supersystem/sw.js — Service Worker SafeShare
   Strategie: HTML = network-first; Assets = stale-while-revalidate;
   Nie cachen: sitemap.xml, robots.txt, Impressum/Datenschutz, Pro-Aktivierung. */
const VER = '24'; // bei Änderungen anheben
const CACHE_HTML    = `ss2-html-${VER}`;
const CACHE_STATIC  = `ss2-static-${VER}`;
const CACHE_RUNTIME = `ss2-runtime-${VER}`;
const SCOPE_PATH    = '/Supersystem/';

const PRECACHE_URLS = [
  // Seiten (nur für schnellen Erstaufruf; Legal-Seiten NICHT hier hinein)
  'index.html','app.html','bookmarklets.html','bulk-clean.html',
  'team-setup.html','redirect-entschachteln.html','pro.html',
  'tests.html','help.html',
  // Assets
  'manifest.webmanifest','css/theme.css',
  'js/sw-register.js','js/core.js','js/app.js','js/bookmarklets.js','js/bulk-clean.js','js/team-setup.js',
  'assets/icons/apple-touch-icon-180.png','assets/icons/icon-192.png','assets/icons/icon-512.png'
];

// nie cachen (immer Netzwerk)
const NETWORK_ONLY_PATHS = new Set([
  `${SCOPE_PATH}sitemap.xml`,
  `${SCOPE_PATH}robots.txt`,
  `${SCOPE_PATH}impressum.html`,
  `${SCOPE_PATH}datenschutz.html`,
  `${SCOPE_PATH}pro-activate.html`
]);

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then((c) => c.addAll(PRECACHE_URLS.map(u => toAbs(u))))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => /^ss2-(html|static|runtime)-/.test(k) && ![CACHE_HTML,CACHE_STATIC,CACHE_RUNTIME].includes(k))
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // nur GET behandeln

  const url = new URL(req.url);

  // nur eigene Origin cachen
  if (url.origin !== location.origin) return;

  // harte Ausnahmen (immer Netzwerk, kein Cache)
  if (NETWORK_ONLY_PATHS.has(url.pathname)) {
    event.respondWith(fetchNoStore(req));
    return;
  }

  // Cache umgehen bei ?nocache / ?sw (manuelle Aktualisierung)
  if (url.searchParams.has('nocache') || url.searchParams.has('sw')) {
    event.respondWith(fetchNoStore(req));
    return;
  }

  // HTML erkennen (Accept-Header oder .html)
  const accept = req.headers.get('accept') || '';
  const isHTML = accept.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === SCOPE_PATH;

  if (isHTML) {
    event.respondWith(networkFirst(req, CACHE_HTML));
    return;
  }

  // statische Assets
  const dest = req.destination; // 'script','style','image','font','worker',…
  if (dest === 'script' || dest === 'style' || dest === 'worker') {
    event.respondWith(staleWhileRevalidate(req, CACHE_STATIC));
    return;
  }
  if (dest === 'image' || dest === 'font' || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg')) {
    event.respondWith(cacheFirst(req, CACHE_STATIC));
    return;
  }

  // Fallback: durchreichen + opportunistisch cachen
  event.respondWith(staleWhileRevalidate(req, CACHE_RUNTIME));
});

/* --- Strategien --- */
async function networkFirst(req, cacheName) {
  try {
    const net = await fetch(req, { cache: 'no-store' });
    const res = net.clone();
    // nur erfolgreiche Antworten cachen
    if (res.ok) {
      const c = await caches.open(cacheName);
      c.put(stripSearch(req), res);
    }
    return net;
  } catch {
    const match = await caches.match(stripSearch(req));
    return match || caches.match(toAbs('index.html'));
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cacheKey = stripSearch(req);
  const cached = await caches.match(cacheKey);
  const netPromise = fetch(req).then(async (res) => {
    if (res && res.ok) {
      const c = await caches.open(cacheName);
      c.put(cacheKey, res.clone());
    }
    return res;
  }).catch(() => undefined);
  return cached || netPromise || fetch(req);
}

async function cacheFirst(req, cacheName) {
  const cacheKey = stripSearch(req);
  const cached = await caches.match(cacheKey);
  if (cached) return cached;
  const res = await fetch(req);
  if (res && res.ok) {
    const c = await caches.open(cacheName);
    c.put(cacheKey, res.clone());
  }
  return res;
}

/* --- Helfer --- */
function toAbs(u) {
  return new URL(u, self.registration.scope).toString();
}
function stripSearch(req) {
  // gleiche Ressource ohne ?nocache/&v etc. als Cache-Key verwenden (nur für eigene Files)
  try {
    const url = new URL(req.url);
    if (url.origin === location.origin && url.pathname.startsWith(SCOPE_PATH)) {
      // nur harmlose Versions-Parameter entfernen
      url.searchParams.delete('v');
      url.searchParams.delete('sw');
      url.searchParams.delete('nocache');
      return url.toString();
    }
  } catch {}
  return req;
}
function fetchNoStore(req) {
  return fetch(req, { cache: 'no-store' });
}

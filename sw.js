/* /Supersystem/sw.js  — SafeShare Service Worker
   Version bump: edit SW_VERSION (and re-deploy), then open /status.html → „Auf Updates prüfen“.
*/
const SW_VERSION = '2025-11-22-03';
const CACHE_PREFIX = 'safeshare';
const PRECACHE_NAME = `${CACHE_PREFIX}-precache-${SW_VERSION}`;
const RUNTIME_NAME  = `${CACHE_PREFIX}-runtime-${SW_VERSION}`;
const BASE = new URL('./', self.location).pathname; // "/Supersystem/"
const OFFLINE_URL = `${BASE}offline.html`;

/** Minimal App-Shell (schnell/offline verfügbar) */
const PRECACHE_URLS = [
  `${BASE}`,                    // Start (index)
  `${BASE}index.html`,
  `${BASE}app.html`,
  `${BASE}help.html`,
  `${BASE}quickstart.html`,
  `${BASE}status.html`,
  `${BASE}bookmarklets.html`,
  `${BASE}bulk-clean.html`,
  `${BASE}team-setup.html`,
  `${BASE}redirect-entschachteln.html`,
  `${BASE}publisher.html`,
  `${BASE}education.html`,
  `${BASE}partners.html`,
  `${BASE}compliance.html`,
  `${BASE}press.html`,
  `${BASE}pro.html`,
  `${BASE}impressum.html`,
  `${BASE}datenschutz.html`,
  `${BASE}terms.html`,
  `${BASE}kurz-terms.html`,
  `${BASE}offline.html`,
  // PWA/Icons/OG
  `${BASE}manifest.webmanifest`,
  `${BASE}assets/icons/icon-16-kreis.png`,
  `${BASE}assets/icons/icon-32-kreis.png`,
  `${BASE}assets/icons/icon-192-kreis.png`,     // falls vorhanden
  `${BASE}assets/icons/icon-512-kreis.png`,
  `${BASE}assets/icons/apple-touch-icon-180.png`,
  `${BASE}assets/og/og-index.jpg`
];

/** Install: Precache App-Shell */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE_NAME);
    await cache.addAll(PRECACHE_URLS.map(u => new Request(u, { cache: 'reload' })));
    // nicht automatisch skipWaiting – Status-Seite hat Button „Wartende Version aktivieren“
  })());
});

/** Activate: alte Caches aufräumen, sofortige Kontrolle */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(n => (n.startsWith(`${CACHE_PREFIX}-precache-`) || n.startsWith(`${CACHE_PREFIX}-runtime-`)) && n !== PRECACHE_NAME && n !== RUNTIME_NAME)
        .map(n => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

/** Nachrichten: Skip Waiting, Ping für Status */
self.addEventListener('message', (event) => {
  const data = event.data;
  if (data === 'SKIP_WAITING' || (data && data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
    return;
  }
  if (data && data.type === 'PING') {
    event.ports?.[0]?.postMessage({ ok: true, version: SW_VERSION });
  }
});

/** Fetch-Strategien:
 *  - Navigationsanfragen: Network-first → Fallback Cache → OFFLINE
 *  - Statische Assets (script/style/worker): Stale-while-revalidate
 *  - Bilder: Cache-first (mit softer Begrenzung)
 *  - Sonst: Network-first (same-origin), sonst passthrough
 */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Nur same-origin handhaben
  if (url.origin !== self.location.origin) return;

  // Navigationsanfragen (Seiten)
  if (req.mode === 'navigate' || (req.destination === '' && req.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(handleNavigation(req));
    return;
  }

  // Statische Assets
  if (['script', 'style', 'worker', 'font'].includes(req.destination)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Bilder: cache-first
  if (req.destination === 'image') {
    event.respondWith(cacheFirst(req, { maxEntries: 80 }));
    return;
  }

  // Default: network-first (nur same-origin)
  event.respondWith(networkFirst(req));
});

/* ---------- Strategien ---------- */

async function handleNavigation(request) {
  try {
    // Network-first mit kleiner Revalidate-Geste
    const fresh = await fetch(request);
    const runtime = await caches.open(RUNTIME_NAME);
    runtime.put(request, fresh.clone());
    return fresh;
  } catch {
    // Fallback: aus Cache oder offline.html
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL, { ignoreSearch: true });
    return offline || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_NAME);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then((res) => {
    // nur erfolgreiche Antworten cachen
    if (res && (res.status === 200 || res.status === 0)) {
      cache.put(request, res.clone()).catch(() => {});
    }
    return res;
  }).catch(() => null);

  // sofort aus Cache, parallel aktualisieren; sonst Netz
  return cached || networkFetch || new Response('', { status: 504 });
}

async function cacheFirst(request, { maxEntries = 120 } = {}) {
  const cache = await caches.open(RUNTIME_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const res = await fetch(request);
    if (res && res.ok) {
      await cache.put(request, res.clone());
      trimCache(cache, maxEntries).catch(() => {});
    }
    return res;
  } catch {
    // Fallback: evtl. ein Platzhalter-Bild? Hier: leer
    return new Response('', { status: 504 });
  }
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone()).catch(() => {});
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Bei HTML auf Offline fallen – hier nicht, da Nicht-Navigation
    return new Response('', { status: 504 });
  }
}

/** weiche Begrenzung der Cache-Einträge */
async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const removeCount = keys.length - maxEntries;
  for (let i = 0; i < removeCount; i++) {
    await cache.delete(keys[i]);
  }
}

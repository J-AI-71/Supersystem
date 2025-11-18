/* sw.js – SafeShare v2
 * Strategie:
 * - Navigation: Network-First (4s Timeout) → Fallback Cache → offline.html
 * - Statische Assets (CSS/JS/Icons/Manifest): Cache-First (Stale-While-Revalidate)
 * - Versionierte Precache-Liste (schnellere Erstladung, offline nutzbar)
 * - Sauberes Cache-Rollover pro Version
 */

const SS_SW_VERSION = '2025-11-18-05';              // ← bei jedem Release erhöhen
const BASE_PATH      = '/Supersystem/';             // GitHub Pages Unterpfad
const OFFLINE_URL    = `${BASE_PATH}offline.html`;

const PRECACHE      = `ss2-precache-${SS_SW_VERSION}`;
const RUNTIME_ASSET = `ss2-runtime-asset-${SS_SW_VERSION}`;
const RUNTIME_PAGE  = `ss2-runtime-page-${SS_SW_VERSION}`;

const SAME_ORIGIN = self.location.origin;

/* -------------------- Precache-Liste --------------------
   Wichtig: exakt so eintragen, wie in HTML verlinkt (inkl. ?v=…),
   sonst passt das URL-Matching offline nicht.
--------------------------------------------------------- */
const precacheList = [
  // Dokumente (HTML)
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}app.html`,
  `${BASE_PATH}help.html`,
  `${BASE_PATH}quickstart.html`,
  `${BASE_PATH}publisher.html`,
  `${BASE_PATH}education.html`,
  `${BASE_PATH}partners.html`,
  `${BASE_PATH}compliance.html`,
  `${BASE_PATH}bookmarklets.html`,
  `${BASE_PATH}bulk-clean.html`,
  `${BASE_PATH}team-setup.html`,
  `${BASE_PATH}redirect-entschachteln.html`,
  `${BASE_PATH}tests.html`,
  `${BASE_PATH}tools.html`,
  `${BASE_PATH}pro.html`,
  `${BASE_PATH}press.html`,
  `${BASE_PATH}impressum.html`,
  `${BASE_PATH}datenschutz.html`,
  `${BASE_PATH}status.html`,
  `${BASE_PATH}offline.html`,             // Fallback-Seite

  // Meta
  `${BASE_PATH}sitemap.xml`,
  `${BASE_PATH}robots.txt`,
  `${BASE_PATH}manifest.webmanifest?v=31`,

// JSON-LD (NEU: für CSP-hardened Landingpages)
  `${BASE_PATH}ld/publisher-faq.jsonld`,
  `${BASE_PATH}ld/education-faq.jsonld`,
   
  // CSS
  `${BASE_PATH}css/theme.css?v=31`,

  // JS Kern
  `${BASE_PATH}js/sw-register.js?v=31`,
  `${BASE_PATH}js/cleaner.js?v=31`,

  // JS Seiten (nur die, die du nutzt)
  `${BASE_PATH}js/app.js?v=31`,
  `${BASE_PATH}js/bookmarklets.js?v=31`,
  `${BASE_PATH}js/bulk-clean.js?v=31`,
  `${BASE_PATH}js/team-setup.js?v=31`,
  `${BASE_PATH}js/page-redirect.js?v=31`,
  `${BASE_PATH}js/page-tests.js?v=31`,
  `${BASE_PATH}js/page-status.js?v=31`,
  `${BASE_PATH}js/page-404.js?v=31`,
  `${BASE_PATH}js/page-quickstart.js?v=31`,
  `${BASE_PATH}js/page-pro-activate.js?v=31`,
  `${BASE_PATH}js/ext-links.js?v=31`,
  `${BASE_PATH}js/telemetry.js?v=31`,

  // Icons/OG (prüfe, dass sie existieren)
  `${BASE_PATH}assets/icons/apple-touch-icon-180.png?v=31`,
  `${BASE_PATH}assets/icons/icon-32-kreis.png?v=31`,
  `${BASE_PATH}assets/icons/icon-16-kreis.png?v=31`,
  `${BASE_PATH}assets/og/og-index.jpg`,
  `${BASE_PATH}assets/qr/app-qr.png`,
];

/* -------------------- Install -------------------- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    // Einzel-add statt addAll, damit eine fehlende Datei nicht alles scheitern lässt
    for (const url of precacheList) {
      try { await cache.add(new Request(url, { cache: 'reload' })); }
      catch (e) { /* optional: console.warn('[SW] Precache fail:', url, e); */ }
    }
    await self.skipWaiting();
  })());
});

/* -------------------- Activate -------------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Alte Caches entfernen
    const names = await caches.keys();
    await Promise.all(names.map((name) => {
      if (![PRECACHE, RUNTIME_ASSET, RUNTIME_PAGE].includes(name)) {
        return caches.delete(name);
      }
    }));
    // Navigation Preload optional aktivieren
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    await self.clients.claim();
  })());
});

/* -------------------- Helpers -------------------- */
const isHTMLNavigate = (request) =>
  request.mode === 'navigate' ||
  (request.destination === 'document') ||
  (request.headers && request.headers.get('Accept')?.includes('text/html'));

const hasNoCacheParam = (url) => {
  const u = new URL(url);
  return u.searchParams.has('nocache');
};

const isSameOrigin = (url) => url.startsWith(SAME_ORIGIN);

/* -------------------- Fetch -------------------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Nur GET cachen
  if (request.method !== 'GET') return;

  // Navigation: Network-First mit Fallback
  if (isHTMLNavigate(request)) {
    event.respondWith((async () => {
      // nocache → direkt Netz (ohne Cache)
      if (hasNoCacheParam(request.url)) {
        try {
          const fresh = await fetch(request, { cache: 'no-store' });
          const cache = await caches.open(RUNTIME_PAGE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          // offline: versuche aus Cache
          const cache = await caches.open(PRECACHE);
          return (await cache.match(request)) ||
                 (await cache.match(url.pathname)) ||
                 (await cache.match(OFFLINE_URL)) ||
                 new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' }});
        }
      }

      // Network-First mit kurzer Timeout, dann Cache → offline
      try {
        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), 4000);
        // Navigation preload nutzen, wenn vorhanden
        const preloadResp = await event.preloadResponse;
        const netResp = preloadResp || await fetch(request, { signal: ctrl.signal });
        clearTimeout(tid);

        // Im Page-Runtime-Cache ablegen
        try {
          const cache = await caches.open(RUNTIME_PAGE);
          cache.put(request, netResp.clone());
        } catch {}
        return netResp;
      } catch {
        // Netzwerkfehler → Cache → offline
        const cache = await caches.open(PRECACHE);
        const matchPre = await cache.match(request);
        if (matchPre) return matchPre;

        const runtimePage = await caches.open(RUNTIME_PAGE);
        const matchRun = await runtimePage.match(request);
        if (matchRun) return matchRun;

        const offline = await cache.match(OFFLINE_URL);
        return offline || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' }});
      }
    })());
    return;
  }

  // Nur gleiche Origin cachen (Assets)
  if (!isSameOrigin(request.url)) return;

  // Statische Assets: Cache-First, dann Netz (SWR)
  const dest = request.destination;
  const isAsset = ['script','style','font','image','manifest'].includes(dest);

  if (isAsset) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_ASSET);

      // nocache → Netzwerk
      if (hasNoCacheParam(request.url)) {
        try {
          const fresh = await fetch(request, { cache: 'no-store' });
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return cached || new Response('', { status: 504 });
        }
      }

      const cached = await caches.match(request);
      const networkFetch = fetch(request).then((resp) => {
        if (resp && resp.ok) cache.put(request, resp.clone());
        return resp;
      }).catch(() => null);

      // Sofort Cache, nebenbei aktualisieren
      return cached || (await networkFetch) || new Response('', { status: 504 });
    })());
    return;
  }

  // Alle anderen GETs: Pass-Through mit leichter Absicherung
  event.respondWith((async () => {
    try {
      return await fetch(request);
    } catch {
      const cached = await caches.match(request);
      return cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' }});
    }
  })());
});

/* -------------------- Messages (optional) --------------------
   sw-register.js kann hiermit interagieren:
   - {type:'GET_VERSION'}   → sendet Version zurück
   - {type:'SKIP_WAITING'}  → sofort aktivieren
   - {type:'CLEAR_CACHES'}  → alle alten Caches löschen
-------------------------------------------------------------- */
self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg && msg.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'SW_VERSION', version: SS_SW_VERSION });
  }
  if (msg && msg.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (msg && msg.type === 'CLEAR_CACHES') {
    event.waitUntil((async () => {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    })());
  }
});

// SafeShare SW v4 – leichte Offline-Unterstützung, Cache-Bust via ?v=
const CACHE = 'ss-v4';
const CORE = [
  'index.html','app.html','app-classic.html','bookmarklets.html',
  'tests.html','tools.html','partner.html','danke.html',
  'faq.html','changelog.html','manifest.webmanifest',
  'favicon-32.png','favicon.svg','safeshare-og-v3b.png'
].map(p => new URL(p, self.registration.scope).toString());

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())
  );
});
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if (req.method!=='GET') return;
  const url = new URL(req.url);

  // Cache-Bust: bei ?v= immer Netzwerk
  if (url.searchParams.has('v')) {
    e.respondWith(fetch(req).catch(()=>caches.match(req)));
    return;
  }

  // HTML: network-first
  const isHTML = req.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === new URL(self.registration.scope).pathname;
  if (isHTML) {
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=>caches.match(req))
    );
    return;
  }

  // Sonst: cache-first
  e.respondWith(
    caches.match(req).then(hit=> hit || fetch(req).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
      return res;
    }))
  );
});
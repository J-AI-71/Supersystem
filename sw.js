/* SafeShare SW v4 */
const VER = 'v4::ss';
const ASSETS = [
  './', './index.html', './app.html', './app-classic.html',
  './bookmarklets.html', './tools.html', './tests.html',
  './faq.html', './changelog.html', './partner.html', './danke.html',
  './impressum.html', './datenschutz.html',
  './manifest.webmanifest', './robots.txt', './sitemap.xml',
  './favicon-32.png', './safeshare-og-v3b.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(VER).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==VER?caches.delete(k):null)))
      .then(()=>self.clients.claim())
  );
});

/* HTML: network-first, Fallback Cache. Sonst: cache-first. */
self.addEventListener('fetch', e=>{
  const req = e.request;
  const url = new URL(req.url);

  if (req.method!=='GET' || url.origin!==location.origin) return;

  const isHTML = req.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || req.mode==='navigate';

  if (isHTML) {
    e.respondWith(
      fetch(req).then(r=>{
        const cc = r.clone();
        caches.open(VER).then(c=>c.put(req, cc)).catch(()=>{});
        return r;
      }).catch(()=>caches.match(req).then(r=>r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached=>{
      if (cached) return cached;
      return fetch(req).then(r=>{
        const cc = r.clone();
        caches.open(VER).then(c=>c.put(req, cc)).catch(()=>{});
        return r;
      });
    })
  );
});
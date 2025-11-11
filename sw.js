// SPDX-License-Identifier: MIT
// sw.js v2
const VER = 'v3::ss';
const ASSETS = [
  './',
  './index.html',
  './app.html',
  './app-classic.html',
  './bookmarklets.html',
  './partner.html',
  './danke.html',
  './impressum.html',
  './datenschutz.html',
  './faq.html',
  './changelog.html',
  './tools.html',
  './tests.html',
  './404.html',
  './safeshare-og-v3b.png',
  './favicon-32.png',
  './manifest.webmanifest'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(VER).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VER).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

// App-Seiten: network-first, sonst cache-first
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  const isApp = /\/(app|app-classic)\.html$/i.test(url.pathname);
  if (isApp) {
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy = res.clone();
        caches.open(VER).then(c=>c.put(e.request, copy));
        return res;
      }).catch(()=>caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(hit=> hit || fetch(e.request).then(res=>{
        if (res.ok && e.request.method==='GET') {
          const copy = res.clone();
          caches.open(VER).then(c=>c.put(e.request, copy));
        }
        return res;
      }))
    );
  }
});
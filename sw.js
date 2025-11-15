// SafeShare SW – bump bei jedem Release
<script src="js/sw-register.js?v=2025-11-14-02"></script>

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Kein fetch-Intercept (Privacy). Optional: später addEventListener('fetch', ...) für Offline-Assets.
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

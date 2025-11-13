// Service Worker – Version bei jedem Deploy erhöhen
const SW_VERSION = "2025-11-13-07";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
// kein fetch-Handler -> kein aggressives Caching

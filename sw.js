// /Supersystem/sw.js
const SW_VERSION = "2025-11-12";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
// kein fetch-Handler
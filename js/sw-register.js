// /Supersystem/js/sw-register.js
(function () {
  'use strict';

  // Nur hier die Versionskennung erhöhen (gleiche Kennung auch beim <script src="...sw-register.js?v=..."> verwenden)
  const VER = '2025-11-13-12';

  if (!('serviceWorker' in navigator)) return;

  // Reload-Schleifen verhindern: pro Version nur 1× neu laden
  const url = new URL(location.href);
  const alreadyTagged = url.searchParams.get('sw') === VER;
  let refreshed = sessionStorage.getItem('ss_sw_refreshed') === VER;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshed || alreadyTagged) return; // nichts tun, wenn schon markiert
    refreshed = true;
    sessionStorage.setItem('ss_sw_refreshed', VER);
    const u = new URL(location.href);
    u.searchParams.set('sw', VER);          // markiert diese Version im URL-Query
    location.replace(u.toString());         // ersetzt den Eintrag in der History
  });

  (async () => {
    try {
      // SW registrieren (mit Version-Query für sauberes Ausrollen)
      const reg = await navigator.serviceWorker.register('./sw.js?v=' + encodeURIComponent(VER));

      // Falls bereits eine neue, wartende SW existiert → sofort aktivieren
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Bei künftig gefundenen Updates die neue SW nach Installation sofort aktivieren
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            nw.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    } catch (e) {
      // Optional: console.warn('SW registration failed:', e);
    }
  })();
})();

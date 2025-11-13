// /Supersystem/js/sw-register.js
(function(){
  'use strict';

  // Nur hier die Version erhöhen
  const VER = '2025-11-13-12';
  if (!('serviceWorker' in navigator)) return;

  // Bereits neu geladen? (pro Version nur 1x)
  const url = new URL(location.href);
  const already = url.searchParams.get('sw') === VER;
  let refreshed = sessionStorage.getItem('ss_sw_refreshed') === VER;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshed || already) return;           // verhindert Reload-Schleife
    refreshed = true;
    sessionStorage.setItem('ss_sw_refreshed', VER);
    const u = new URL(location.href);
    u.searchParams.set('sw', VER);
    location.replace(u.toString());
  });

  (async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js?v='+encodeURIComponent(VER));

      // Neue, wartende SW sofort aktivieren
      if (reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});

      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            nw.postMessage({type:'SKIP_WAITING'});
          }
        });
      });
    } catch(e) { /* optional: console.warn(e) */ }
  })();
})();

// /Supersystem/js/sw-register.js
(function(){
  'use strict';

  // Einzige Stelle, an der du die Version erhöhst
  const VER = '2025-11-13-12';

  if (!('serviceWorker' in navigator)) return;

  // Einmalige Auto-Reload-Logik nach Aktivierung der neuen SW
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    const u = new URL(location.href);
    u.searchParams.set('sw', VER);
    location.replace(u.toString());
  });

  async function registerSW(){
    try{
      const reg = await navigator.serviceWorker.register('./sw.js?v='+encodeURIComponent(VER));

      // Falls bereits eine neue (waiting) SW vorhanden ist → sofort aktivieren
      if (reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});

      // Während der Installation auf "installed" warten und dann aktivieren
      if (reg.installing){
        reg.installing.addEventListener('statechange', () => {
          if (reg.installing && reg.installing.state === 'installed' && navigator.serviceWorker.controller){
            reg.installing.postMessage({type:'SKIP_WAITING'});
          }
        });
      }

      // Zukunft: wenn später Updates gefunden werden
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller){
            nw.postMessage({type:'SKIP_WAITING'});
          }
        });
      });
    }catch(e){
      // optional: console.warn('SW register failed', e);
    }
  }

  registerSW();
})();

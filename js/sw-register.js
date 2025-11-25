/* /Supersystem/js/sw-register.js
   Registriert den Service Worker mit Versions-Query, meldet Status-Events
   und stellt eine kleine API bereit: window.SW.checkForUpdate(), .activateWaiting(), .info()
*/
(() => {
  'use strict';

  // === Version anpassen (gleich wie in sw.js) ===============================
  const SW_VERSION = '2025-11-24-06';
  const SW_URL     = 'sw.js?sw=' + encodeURIComponent(SW_VERSION);
  const SCOPE      = './'; // GitHub Pages: relativ lassen

  // === internes State-Objekt / API ==========================================
  const api = {
    version: SW_VERSION,
    registration: null,
    installing: null,
    waiting: null,
    controller: null,
    _reloadOnControllerChange: false,

    async checkForUpdate() {
      if (!('serviceWorker' in navigator)) return false;
      if (!api.registration) api.registration = await navigator.serviceWorker.getRegistration();
      if (!api.registration) return false;
      dispatch({ type: 'checking' });
      try {
        await api.registration.update(); // löst ggf. updatefound aus
        return true;
      } catch (e) {
        dispatch({ type: 'error', error: String(e) });
        return false;
      }
    },

    activateWaiting(opts = {}) {
      const reload = opts.reload !== false; // default: true
      const w = api.registration?.waiting || api.waiting;
      if (!w) { dispatch({ type: 'no-waiting' }); return false; }
      api._reloadOnControllerChange = reload;
      try { w.postMessage({ type: 'SKIP_WAITING' }); } catch {}
      // Fallback-Reload, falls controllerchange nicht feuert
      if (reload) setTimeout(() => { if (navigator.serviceWorker.controller) location.reload(); }, 1200);
      dispatch({ type: 'activating' });
      return true;
    },

    async info() {
      const reg = api.registration || await navigator.serviceWorker.getRegistration();
      const active = reg?.active;
      return {
        page: location.href,
        sw_version: SW_VERSION,
        active_script: active?.scriptURL || null,
        active_state: active?.state || null
      };
    }
  };

  function dispatch(detail) {
    try { window.dispatchEvent(new CustomEvent('sw-status', { detail })); } catch {}
  }

  // === Registrierung ========================================================
  function register() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register(SW_URL, { scope: SCOPE });
        api.registration = reg;
        api.controller = navigator.serviceWorker.controller || null;
        window.SW = api; // API global verfügbar machen
        dispatch({
          type: 'registered',
          version: SW_VERSION,
          active: reg.active?.scriptURL || null
        });

        // vorhandenes waiting?
        if (reg.waiting) {
          api.waiting = reg.waiting;
          dispatch({ type: 'waiting', version: SW_VERSION });
        }

        // Updatefluss überwachen
        reg.addEventListener('updatefound', () => {
          api.installing = reg.installing || null;
          dispatch({ type: 'updatefound' });
          if (!api.installing) return;
          api.installing.addEventListener('statechange', () => {
            dispatch({ type: 'state', state: api.installing.state });
            if (api.installing.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                api.waiting = reg.waiting || null;
                if (api.waiting) dispatch({ type: 'waiting', version: SW_VERSION });
              } else {
                // Erster Install ohne vorherigen Controller
                dispatch({ type: 'cached-first-install', version: SW_VERSION });
              }
            }
          });
        });

        // Controllerwechsel (neue SW übernimmt)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          api.controller = navigator.serviceWorker.controller;
          dispatch({ type: 'controllerchange' });
          if (api._reloadOnControllerChange) location.reload();
        });
      } catch (e) {
        dispatch({ type: 'error', error: String(e) });
      }
    });
  }

  register();
})();

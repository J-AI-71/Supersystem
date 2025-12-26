/* /js/sw-register.js (Cloudflare Pages, site-wide) */
(() => {
  'use strict';

  // Muss IDENTISCH zu sw.js sein
  const SW_VERSION = '2025-12-26-01';

  // Absolut + Site-weit
  const SW_URL = '/sw.js?sw=' + encodeURIComponent(SW_VERSION);
  const SCOPE  = '/';

  function dispatch(detail) {
    try { window.dispatchEvent(new CustomEvent('sw-status', { detail })); } catch {}
  }

  async function register() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register(SW_URL, {
          scope: SCOPE,
          updateViaCache: 'none'
        });

        dispatch({ type: 'registered', version: SW_VERSION, active: reg.active?.scriptURL || null });

        // Wenn ein Update wartet: automatisch aktivieren + reload
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          dispatch({ type: 'updatefound' });
          installing.addEventListener('statechange', () => {
            dispatch({ type: 'state', state: installing.state });
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              // neues SW wartet -> aktivieren
              reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          dispatch({ type: 'controllerchange' });
          location.reload();
        });
      } catch (e) {
        dispatch({ type: 'error', error: String(e) });
      }
    });
  }

  register();
})();

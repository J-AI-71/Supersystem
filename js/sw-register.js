// js/sw-register.js
(() => {
  const BASE = '/Supersystem/';
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(`${BASE}sw.js`, { scope: BASE });
      // optional: Update-Check im Hintergrund
      if (reg) { try { await reg.update(); } catch {} }
    } catch (e) {
      // optional: console.warn('SW register failed', e);
    }
  });
})();

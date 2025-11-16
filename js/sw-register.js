// /Supersystem/js/sw-register.js
const VER = '2025-11-15-12';
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js?v=' + VER)
      .catch(()=>{});
  });
}
  (async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js?v=' + encodeURIComponent(VER));
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            nw.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    } catch (e) {}
  })();
})();

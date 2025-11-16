// /Supersystem/js/sw-register.js
const VER   = '2025-11-15-14';
const SCOPE = '/Supersystem/';

function log(m){ try{ console.log('[SW]', m); }catch(_){} }

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SCOPE + 'sw.js?v=' + VER, { scope: SCOPE })
      .then(r => { log('registered ' + (r.scope||SCOPE)); return r.update(); })
      .catch(e => log('register FAIL: ' + (e && e.message)));
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

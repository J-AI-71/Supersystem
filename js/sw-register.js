// /Supersystem/js/sw-register.js
const VER   = '2025-11-15-17';
const SCOPE = '/Supersystem/';

(function () {
  if (!('serviceWorker' in navigator)) return;

  // einmalig neu laden, sobald ein Controller vorhanden ist
  function armOneReload() {
    if (navigator.serviceWorker.controller) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      try {
        if (sessionStorage.getItem('sw_ctrl_once') !== '1') {
          sessionStorage.setItem('sw_ctrl_once', '1');
          location.reload();
        }
      } catch (_) { location.reload(); }
    }, { once: true });
  }

  navigator.serviceWorker
    .register(SCOPE + 'sw.js?v=' + VER, { scope: SCOPE })
    .then(reg => { try { reg.update(); } catch(_){} armOneReload(); })
    .catch(()=>{});
})();

// /Supersystem/js/sw-register.js
const VER   = '2025-11-15-15';
const SCOPE = '/Supersystem/';

(function(){
  if (!('serviceWorker' in navigator)) return;

  // sofort registrieren (nicht auf 'load' warten)
  navigator.serviceWorker.register(SCOPE + 'sw.js?v=' + VER, { scope: SCOPE })
    .then(reg => {
      try { console.log('[SW] registered', reg.scope); reg.update(); } catch (_) {}
    })
    .catch(err => {
      try { console.log('[SW] register FAIL:', err && err.message); } catch (_) {}
    });
})();

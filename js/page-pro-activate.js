/* /Supersystem/js/page-pro-activate.js */
/* Aktiviert Pro lokal (localStorage) und leitet danach weiter. */

(function () {
  'use strict';

  const qs = new URLSearchParams(location.search);

  // Debug-Helper
  const DEBUG = qs.get('debug') === '1';
  const log = (...args) => { if (DEBUG) console.log('[pro-activate]', ...args); };

  // Params lesen
  const proParam   = qs.get('pro');            // "1" erwartet
  const planParam  = (qs.get('plan') || '').toLowerCase(); // "personal" | "team"
  const retParam   = (qs.get('return') || '').toLowerCase(); // "pro" | "app" | ""
  const noCache    = qs.get('nocache') || '';

  log('params', { proParam, planParam, retParam, noCache });

  // Gültige Pläne normalisieren
  const PLAN = (planParam === 'team' ? 'team' : 'personal');

  // Aktivierung nur, wenn ?pro=1 da ist
  const shouldActivate = proParam === '1';

  try {
    if (shouldActivate) {
      // Keys setzen
      localStorage.setItem('ss_pro', '1');
      localStorage.setItem('ss_plan', PLAN);
      // Optional: Zeitstempel für Debug
      localStorage.setItem('ss_activated_at', String(Date.now()));
      log('activated', { ss_pro: '1', ss_plan: PLAN });
    } else {
      log('no activation (missing ?pro=1)');
    }
  } catch (e) {
    log('localStorage error', e);
  }

  // Ziel bestimmen – Standard: pro.html (nicht app)
  let target = 'pro.html';
  if (retParam === 'app')  target = 'app.html';
  else if (retParam === 'pro') target = 'pro.html';

  // nocache ggf. anhängen, damit SW/Cache sicher umgangen wird
  if (noCache) {
    target += (target.includes('?') ? '&' : '?') + 'nocache=' + encodeURIComponent(noCache);
  }

  log('redirect ->', target);

  // Mini-Delay, damit UI bei Debug sichtbar bleibt
  setTimeout(() => {
    // replace = kein „Zurück“-Pingpong
    location.replace(target);
  }, DEBUG ? 600 : 80);
})();

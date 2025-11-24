// /Supersystem/js/page-pro-activate.js
(function () {
  'use strict';

  const log = (...a) => { try { console.log('[pro-activate]', ...a); } catch(_){} };

  // Kleines Debug-Overlay, wenn ?debug=1 in der URL steht
  const debugOverlay = (data) => {
    const qp = new URLSearchParams(location.search);
    if (!qp.get('debug')) return;
    const pre = document.createElement('pre');
    pre.style.cssText =
      'position:fixed;bottom:8px;left:8px;right:8px;max-height:50vh;overflow:auto;' +
      'background:#111;color:#0f0;padding:12px;border:1px solid #0f0;' +
      'font:12px/1.35 monospace;z-index:2147483647';
    pre.textContent = '[DEBUG pro-activate]\n' + JSON.stringify(data, null, 2);
    document.body.appendChild(pre);
  };

  try {
    const qp = new URLSearchParams(location.search);

    const hasProParam = qp.has('pro');                 // nur aktiv werden, wenn explizit gesetzt
    const doActivate  = qp.get('pro') !== '0';         // ?pro=1 (oder alles außer 0) -> aktivieren; ?pro=0 -> deaktivieren
    const plan        = (qp.get('plan') || 'personal').toLowerCase();   // personal|team
    const ret         = (qp.get('return') || 'pro').toLowerCase();      // pro|app|index

    // Ziel bestimmen relativ zur Seite (respektiert <base href="/Supersystem/">)
    const target =
      ret === 'app'   ? new URL('app.html',   document.baseURI).href :
      ret === 'index' ? new URL('index.html', document.baseURI).href :
                        new URL('pro.html',   document.baseURI).href;

    const info = { href: location.href, hasProParam, doActivate, plan, ret, target };

    // Wenn kein ?pro=… vorhanden ist: nichts tun (nur Debug anzeigen)
    if (!hasProParam) {
      debugOverlay({ ...info, note: 'Kein ?pro= Parameter – keine Aktion.' });
      return;
    }

    // LocalStorage setzen (lokale Aktivierung)
    localStorage.setItem('ss_pro', doActivate ? '1' : '0');
    localStorage.setItem('ss_pro_plan', plan);
    sessionStorage.setItem('ss_pro_activated_ts', String(Date.now()));
    log('Aktualisiert:', { pro: doActivate, plan });

    debugOverlay({ ...info, set_localStorage: true });

    // Mehrstufige Weiterleitung (falls irgendetwas blockt)
    const go = () => { try { location.replace(target); } catch (_) { location.href = target; } };
    setTimeout(go, 50);
    setTimeout(go, 350);
    setTimeout(go, 1200);
  } catch (e) {
    log('Fehler:', e);
    debugOverlay({ error: String(e) });
  }
})();

/* /Supersystem/js/page-pro-activate.js
   Aktiviert SafeShare Pro anhand der Query (?pro=1&plan=personal|team&return=pro|app|index)
   und leitet zuverlässig weiter. Robust gegen Cache/Timing. Optionales Debug via ?debug=1.
*/
(() => {
  'use strict';

  const qs  = new URLSearchParams(location.search);
  const DBG = qs.has('debug');

  const log = (...a) => { if (DBG) try { console.log('[pro-activate]', ...a); } catch{} };

  // Parameter lesen
  const hasProParam = qs.has('pro');
  const doActivate  = qs.get('pro') !== '0'; // ?pro=1 (oder alles außer 0) => aktivieren, ?pro=0 => deaktivieren
  const planParam   = (qs.get('plan') || 'personal').toLowerCase();
  const retParam    = (qs.get('return') || 'pro').toLowerCase(); // Standard: pro

  // Ziel bestimmen (respektiert <base href="/Supersystem/">)
  function resolveTarget(ret) {
    // Session-Präferenz (z. B. von pro.html-Kauf) hat Vorrang, falls gesetzt
    let after = null;
    try { after = sessionStorage.getItem('ss_after_activate') || null; } catch {}
    if (after) return new URL(after, document.baseURI).href;

    const file =
      ret === 'app'   ? 'app.html'   :
      ret === 'index' ? 'index.html' :
                        'pro.html';
    return new URL(file, document.baseURI).href;
  }
  const target = resolveTarget(retParam);

  // Keys setzen (inkl. Backcompat)
  function setProKeys(active, plan) {
    try {
      if (active) {
        localStorage.setItem('ss_pro', '1');
        localStorage.setItem('ss_pro_active', '1');            // kompatibel zu älteren Versionen
        localStorage.setItem('ss_pro_plan', plan);             // neu
        localStorage.setItem('ss_plan', plan);                 // alt (Fallback)
        localStorage.setItem('ss_pro_activated_at', new Date().toISOString());
        localStorage.setItem('ss_pro_at', String(Date.now())); // ms-Timestamp
      } else {
        // Deaktivieren (nur für Tests, via ?pro=0)
        ['ss_pro','ss_pro_active','ss_pro_plan','ss_plan','ss_pro_activated_at','ss_pro_at']
          .forEach(k => { try { localStorage.removeItem(k); } catch{} });
      }
      return true;
    } catch (e) {
      console.error('[pro-activate] localStorage', e);
      return false;
    }
  }

  // Manuelle Aktivierungsbuttons (falls vorhanden)
  function wireManualButtons() {
    document.querySelectorAll('[data-activate]').forEach(el => {
      el.addEventListener('click', ev => {
        ev.preventDefault();
        const p = (el.getAttribute('data-plan') || 'personal').toLowerCase();
        log('manual activate', p);
        setProKeys(true, p);
        redirect('pro'); // nach manueller Aktivierung immer zur Pro-Seite
      });
    });
  }

  // Mehrstufige, robuste Weiterleitung (ersetzt vs. href, mehrfach versucht)
  function redirect(ret) {
    const url = resolveTarget(ret);
    log('redirect ->', url);
    const jump = () => { try { location.replace(url); } catch { location.href = url; } };
    setTimeout(jump, 60);
    setTimeout(jump, 360);
    setTimeout(jump, 1200);
  }

  // Hauptlauf
  try {
    wireManualButtons();

    if (!hasProParam) {
      log('kein ?pro= Parameter – keine Auto-Aktion');
      return;
    }

    const ok = setProKeys(doActivate, planParam);
    log('set keys:', { ok, active: doActivate, plan: planParam, target });

    // Bei Aktivierung sofort weiter
    if (doActivate) {
      redirect(retParam);
    }
  } catch (e) {
    console.error('[pro-activate] Fehler', e);
  }
})();

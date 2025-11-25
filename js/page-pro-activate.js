/* /Supersystem/js/page-pro-activate.js
   Aktiviert SafeShare Pro lokal anhand der URL-Parameter und leitet weiter.
   Robust gegen SW/Cache, kein Inline-JS nötig, optionales Debug via ?debug=1.

   Beispiele:
   - …/pro-activate.html?pro=1&plan=personal&return=pro
   - …/pro-activate.html?pro=1&plan=team&return=app&nocache=20251124
*/
(() => {
  'use strict';

  const qs  = new URLSearchParams(location.search);
  const dbg = qs.has('debug');
  const log = (...a) => { if (dbg) try { console.log('[pro-activate]', ...a); } catch {} };

  // Eventuelle alte Kauf-Overrides entfernen (könnten App erzwingen)
  try { sessionStorage.removeItem('ss_after_activate'); } catch {}

  // Parameter lesen
  const shouldActivate = qs.get('pro') === '1';                          // '1' = aktivieren
  const planParam      = (qs.get('plan') || 'personal').toLowerCase();   // 'personal' | 'team'
  const retParam       = (qs.get('return') || 'pro').toLowerCase();      // 'pro' | 'app' | 'index'|'start'
  const nocache        = qs.get('nocache') || '';

  const PLAN = (planParam === 'team') ? 'team' : 'personal';

  // Pro-Status setzen (inkl. Backcompat-Keys)
  function setPro(active, plan) {
    try {
      if (active) {
        localStorage.setItem('ss_pro', '1');               // neu verwendet
        localStorage.setItem('ss_pro_active', '1');        // kompatibel
        localStorage.setItem('ss_pro_plan', plan);
        localStorage.setItem('ss_plan', plan);             // alt
        localStorage.setItem('ss_pro_activated_at', new Date().toISOString());
        localStorage.setItem('ss_pro_at', String(Date.now()));
      } else {
        ['ss_pro','ss_pro_active','ss_pro_plan','ss_plan','ss_pro_activated_at','ss_pro_at']
          .forEach(k => { try { localStorage.removeItem(k); } catch {} });
      }
      return true;
    } catch (e) {
      log('localStorage error', e);
      return false;
    }
  }

  // Ziel bestimmen (Fallback = pro.html)
  function resolveTarget(ret) {
    let file = 'pro.html';
    if (ret === 'app') file = 'app.html';
    if (ret === 'index' || ret === 'start') file = 'index.html';
    let url = new URL(file, document.baseURI).href;
    if (nocache) url += (url.includes('?') ? '&' : '?') + 'nocache=' + encodeURIComponent(nocache);
    return url;
  }

  function redirect(ret) {
    const url = resolveTarget(ret);
    log('redirect ->', url);
    const jump = () => { try { location.replace(url); } catch { location.href = url; } };
    // kleiner Puffer, damit Storage sicher geschrieben ist
    setTimeout(jump, dbg ? 600 : 80);
  }

  // Optionales Debug-Overlay (auf iOS/iPad sichtbar)
  function debugOverlay(payload) {
    if (!dbg) return;
    const pre = document.createElement('pre');
    pre.style.cssText = 'position:fixed;bottom:8px;left:8px;right:8px;max-height:50vh;overflow:auto;background:#111;color:#0f0;padding:12px;border:1px solid #0f0;font:12px/1.3 monospace;z-index:999999';
    pre.textContent = JSON.stringify({
      payload,
      sw: (navigator.serviceWorker && navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : null)
    }, null, 2);
    document.body.appendChild(pre);
  }

  // Manuelle Aktivierung (Buttons/Links auf der Seite)
  function wireManual() {
    // a[data-activate data-plan="personal|team"] ODER Links mit plan=…
    const nodes = document.querySelectorAll('[data-activate], a[href*="plan=personal"], a[href*="plan=team"]');
    nodes.forEach(el => {
      el.addEventListener('click', ev => {
        ev.preventDefault();
        const pAttr = (el.getAttribute('data-plan') || '').toLowerCase();
        const href  = el.getAttribute('href') || '';
        const fromHref = href.includes('plan=team') ? 'team' : (href.includes('plan=personal') ? 'personal' : '');
        const p = (pAttr === 'team' || pAttr === 'personal') ? pAttr : (fromHref || 'personal');
        setPro(true, p);
        redirect('pro');
      });
    });
  }

  // Hauptablauf: sofort ausführen (kein DOMContentLoaded nötig)
  try {
    wireManual();

    const payload = { shouldActivate, PLAN, retParam, nocache, href: location.href };
    debugOverlay(payload);
    log('params', payload);

    if (shouldActivate) {
      const ok = setPro(true, PLAN);
      log('activated', { ok, PLAN });
      redirect(retParam); // Standard: pro
    } else {
      log('kein ?pro=1 – warte auf manuelle Aktivierung');
    }
  } catch (e) {
    log('fatal', e);
  }
})();

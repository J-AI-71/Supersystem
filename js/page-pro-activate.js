/* /Supersystem/js/page-pro-activate.js — Hotfix:
   • führt sofort aus (kein DOMContentLoaded)
   • entfernt evtl. Session-Override
   • setzt Pro-Keys
   • leitet standardmäßig zu pro.html (return=pro|app|index) */
(() => {
  'use strict';

  const qs  = new URLSearchParams(location.search);
  const dbg = qs.has('debug');
  const log = (...a)=>{ if(dbg) try{console.log('[pro-activate]',...a);}catch{} };

  // 1) evtl. alter Override entfernen (kann App erzwingen)
  try { sessionStorage.removeItem('ss_after_activate'); } catch {}

  // 2) Parameter lesen
  const should = qs.get('pro') === '1';
  const plan   = (qs.get('plan') || 'personal').toLowerCase();
  const ret    = (qs.get('return') || 'pro').toLowerCase(); // Standard: pro
  const noc    = qs.get('nocache') || '';

  // 3) Pro lokal setzen
  if (should) {
    try {
      localStorage.setItem('ss_pro', '1');
      localStorage.setItem('ss_pro_plan', (plan === 'team' ? 'team' : 'personal'));
      localStorage.setItem('ss_pro_activated_at', new Date().toISOString());
    } catch (e) {
      log('localStorage error', e);
    }
  } else {
    log('kein ?pro=1 – keine Auto-Aktivierung');
  }

  // 4) Ziel bestimmen (Fallback = pro.html)
  let target = 'pro.html';
  if (ret === 'app')   target = 'app.html';
  if (ret === 'index' || ret === 'start') target = 'index.html';
  if (noc) target += (target.includes('?') ? '&' : '?') + 'nocache=' + encodeURIComponent(noc);

  // 5) Debug-Overlay (sichtbar auf iPad), dann Redirect
  if (dbg) {
    const pre = document.createElement('pre');
    pre.style.cssText = 'position:fixed;bottom:8px;left:8px;right:8px;max-height:50vh;overflow:auto;background:#111;color:#0f0;padding:12px;border:1px solid #0f0;font:12px/1.3 monospace;z-index:999999';
    pre.textContent = JSON.stringify({
      should, plan, ret, target,
      sw: (navigator.serviceWorker && navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : null)
    }, null, 2);
    document.body.appendChild(pre);
    setTimeout(() => { try { location.replace(target); } catch { location.href = target; } }, 600);
  } else {
    try { location.replace(target); } catch { location.href = target; }
  }
})();

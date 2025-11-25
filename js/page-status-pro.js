/* /js/page-status-pro.js – Diagnose ohne Dev-Tools */
(() => {
  const $ = (s, r=document)=>r.querySelector(s);
  function ui() {
    let box = document.getElementById('pro-diag');
    if (box) return box;
    box = document.createElement('section');
    box.id = 'pro-diag';
    box.innerHTML = `
      <h2>Pro / SW Diagnose</h2>
      <div id="pro-out" style="white-space:pre-wrap;font:12px/1.5 ui-monospace,monospace"></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button id="d-refresh" class="btn">Aktualisieren</button>
        <button id="d-pro-personal" class="btn">Pro=Personal setzen</button>
        <button id="d-pro-team" class="btn">Pro=Team setzen</button>
        <button id="d-pro-reset" class="btn">Pro zurücksetzen</button>
        <button id="d-sw-check" class="btn">Auf Updates prüfen</button>
        <button id="d-sw-activate" class="btn">Wartende Version aktivieren</button>
      </div>`;
    (document.getElementById('main') || document.body).appendChild(box);
    return box;
  }
  function read() {
    const g = k => localStorage.getItem(k);
    return {
      page: location.href,
      ss_pro: g('ss_pro') ?? g('SS_PRO'),
      ss_pro_plan: g('ss_pro_plan') ?? g('SS_PRO_PLAN') ?? g('ss_plan'),
      ss_pro_activated_at: g('ss_pro_activated_at') ?? g('ss_pro_at'),
    };
  }
  async function swInfo() {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      return {
        active_script: reg?.active?.scriptURL || null,
        active_state: reg?.active?.state || null,
        controller: navigator.serviceWorker.controller ? 'yes' : 'no'
      };
    } catch { return { active_script:null, active_state:null, controller:'n/a' }; }
  }
  async function render() {
    const out = $('#pro-out') || ui().querySelector('#pro-out');
    const info = read();
    const swi = await swInfo();
    out.textContent =
      `Pro: ${info.ss_pro || ''}\n` +
      `Plan: ${info.ss_pro_plan || ''}\n` +
      `Aktiviert: ${info.ss_pro_activated_at || ''}\n` +
      `SW active: ${swi.active_script || ''}\n` +
      `SW state: ${swi.active_state || ''}\n` +
      `SW controller: ${swi.controller}`;
  }
  function setPro(plan) {
    try {
      localStorage.setItem('ss_pro','1');
      localStorage.setItem('ss_pro_plan', plan);
      localStorage.setItem('ss_pro_activated_at', new Date().toISOString());
    } catch {}
  }
  function resetPro() {
    ['ss_pro','ss_pro_plan','ss_plan','ss_pro_activated_at','ss_pro_at']
      .forEach(k => { try { localStorage.removeItem(k); } catch {} });
  }
  function bind() {
    ui();
    $('#d-refresh').addEventListener('click', render);
    $('#d-pro-personal').addEventListener('click', ()=>{ setPro('personal'); render(); });
    $('#d-pro-team').addEventListener('click', ()=>{ setPro('team'); render(); });
    $('#d-pro-reset').addEventListener('click', ()=>{ resetPro(); render(); });
    $('#d-sw-check').addEventListener('click', ()=>{ window.SW?.checkForUpdate(); });
    $('#d-sw-activate').addEventListener('click', ()=>{ window.SW?.activateWaiting(); });
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>{ bind(); render(); });
  else { bind(); render(); }
})();

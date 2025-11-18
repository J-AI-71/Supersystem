/* page-status.js – Statusseite ohne Inline-Handler */
document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  $('#loc') && ($('#loc').textContent = 'URL: ' + location.href);

  const bNc = document.querySelector('[onclick*="reloadWithNoCache"]') || $('#btnNoCache');
  const bRef= document.querySelector('[onclick*="refreshAll"]')       || $('#btnRefresh');
  const bUpd= document.querySelector('[onclick*="swUpdate"]')         || $('#btnSwUpd');

  bNc && bNc.addEventListener('click', reloadWithNoCache);
  bRef && bRef.addEventListener('click', refreshAll);
  bUpd && bUpd.addEventListener('click', swUpdate);

  refreshAll();

  async function refreshAll(){ renderRuntime(); await renderSW(); await renderCaches(); await renderLS(); await renderManifest(); }

  function renderRuntime(){
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = typeof navigator.standalone === 'boolean' ? navigator.standalone : false;
    const online = navigator.onLine;
    const conn = navigator.connection || {};
    const ua = navigator.userAgent;
    const rows = [
      ['PWA (display-mode: standalone)', String(isStandalone)],
      ['PWA (iOS navigator.standalone)', String(isIOSStandalone)],
      ['Online', String(online)],
      ['Netz (effectiveType)', conn.effectiveType || '–'],
      ['RTT (ms, geschätzt)', conn.rtt || '–'],
      ['SW Controller vorhanden', String(!!(navigator.serviceWorker && navigator.serviceWorker.controller))],
      ['Zeit (lokal)', new Date().toString()],
      ['User-Agent', ua]
    ];
    const host = document.getElementById('runtime');
    if (host) host.innerHTML = rows.map(r=>`<div>${r[0]}</div><div>${Cleaner.escapeHtml(r[1])}</div>`).join('');
  }

  async function renderSW(){
    const out = $('#sw');
    if (!('serviceWorker' in navigator)) { out && (out.textContent = 'Kein Service-Worker-Support.'); return; }
    const regs = await navigator.serviceWorker.getRegistrations();
    if (!regs.length) { out && (out.textContent = 'Keine Registrierung gefunden.'); return; }
    const parts = [];
    for (const r of regs){
      const scope = r.scope || '–';
      const active = r.active ? r.active.scriptURL : '–';
      const state  = r.active ? r.active.state : (r.installing ? 'installing' : (r.waiting ? 'waiting' : '–'));
      const installing = r.installing ? r.installing.scriptURL : '';
      const waiting    = r.waiting ? r.waiting.scriptURL : '';
      let swVersion = '–';
      try {
        const txt = await fetch('sw.js?nocache=' + Date.now(), {cache:'no-store'}).then(r=>r.ok?r.text():'').catch(()=> '');
        const m = txt && txt.match(/SS_SW_VERSION\s*=\s*['"]([^'"]+)['"]/);
        if (m) swVersion = m[1];
      } catch(e){}
      parts.push(
        `<div class="card" style="margin-top:10px">
           <div>Scope: <code>${Cleaner.escapeHtml(scope)}</code></div>
           <div>Aktiv: <code>${Cleaner.escapeHtml(active)}</code></div>
           <div>Zustand: <code>${Cleaner.escapeHtml(String(state))}</code></div>
           ${installing ? `<div>Installing: <code>${Cleaner.escapeHtml(installing)}</code></div>` : ''}
           ${waiting ? `<div>Waiting: <code>${Cleaner.escapeHtml(waiting)}</code></div>` : ''}
           <div>SW-Version: <code>${Cleaner.escapeHtml(swVersion)}</code></div>
         </div>`
      );
    }
    out && (out.innerHTML = parts.join('') || '–');
  }
  async function swUpdate(){
    try{
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.update()));
      await renderSW();
    }catch(e){}
  }
  async function renderCaches(){
    const host = $('#caches');
    if (!('caches' in window)) { host && (host.textContent = 'Cache API nicht verfügbar.'); return; }
    const keys = await caches.keys();
    if (!keys.length) { host && (host.textContent = 'Keine Caches vorhanden.'); return; }
    const list = await Promise.all(keys.map(async name => {
      let count = '–';
      try { const c = await caches.open(name); const reqs = await c.keys(); count = String(reqs.length); } catch(e){}
      return `<div><span class="pill">${Cleaner.escapeHtml(name)}</span> · Einträge: ${count}</div>`;
    }));
    host && (host.innerHTML = list.join(''));
  }
  async function renderLS(){
    const host = $('#ls');
    try{
      const keys = [];
      for (let i=0; i<localStorage.length; i++){ const k = localStorage.key(i); keys.push([k, localStorage.getItem(k)]); }
      if (!keys.length){ host && (host.textContent = '–'); return;

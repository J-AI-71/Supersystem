/* /js/page-status-pro.js – zeigt/verwaltet Pro-Keys im LocalStorage */
(() => {
  const $ = (s, r=document)=>r.querySelector(s);

  function ensurePanel() {
    let box = document.getElementById('pro-diag');
    if (box) return box;
    box = document.createElement('section');
    box.id = 'pro-diag';
    box.style.cssText = 'margin-top:16px;border:1px solid #2c2c2c;border-radius:12px;padding:12px;background:#121212';
    box.innerHTML = `
      <h2 style="margin:0 0 8px">Pro-Diagnose</h2>
      <div id="pro-out" style="white-space:pre-wrap;font-family:ui-monospace,monospace"></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button id="pro-refresh" class="btn">Aktualisieren</button>
        <button id="pro-force-personal" class="btn">Pro = Personal setzen</button>
        <button id="pro-force-team" class="btn">Pro = Team setzen</button>
        <button id="pro-reset" class="btn">Pro zurücksetzen</button>
        <a class="btn" href="pro.html" target="_blank" rel="noopener">pro.html öffnen</a>
        <a class="btn" href="app.html" target="_blank" rel="noopener">app.html öffnen</a>
      </div>`;
    (document.getElementById('main') || document.body).appendChild(box);
    return box;
  }

  function readAll() {
    const pick = k => localStorage.getItem(k);
    const obj = {
      ss_pro: pick('ss_pro'),
      ss_pro_active: pick('ss_pro_active'),
      ss_pro_plan: pick('ss_pro_plan'),
      ss_plan: pick('ss_plan'),
      ss_pro_activated_at: pick('ss_pro_activated_at'),
      ss_pro_at: pick('ss_pro_at')
    };
    return obj;
  }

  function render() {
    const out = $('#pro-out') || ensurePanel().querySelector('#pro-out');
    const o = readAll();
    out.textContent =
      `ss_pro: ${o.ss_pro}\n` +
      `ss_pro_active: ${o.ss_pro_active}\n` +
      `ss_pro_plan: ${o.ss_pro_plan}\n` +
      `ss_plan (alt): ${o.ss_plan}\n` +
      `ss_pro_activated_at: ${o.ss_pro_activated_at}\n` +
      `ss_pro_at: ${o.ss_pro_at}`;
  }

  function setPro(plan) {
    try {
      // neue und alte Keys befüllen (Kompatibilität)
      localStorage.setItem('ss_pro', '1');
      localStorage.setItem('ss_pro_active', '1');
      localStorage.setItem('ss_pro_plan', plan);
      localStorage.setItem('ss_plan', plan);
      localStorage.setItem('ss_pro_activated_at', new Date().toISOString());
      localStorage.setItem('ss_pro_at', String(Date.now()));
    } catch {}
  }

  function resetPro() {
    ['ss_pro','ss_pro_active','ss_pro_plan','ss_plan','ss_pro_activated_at','ss_pro_at']
      .forEach(k => { try { localStorage.removeItem(k); } catch {} });
  }

  function init() {
    const panel = ensurePanel();
    panel.querySelector('#pro-refresh').addEventListener('click', render);
    panel.querySelector('#pro-force-personal').addEventListener('click', () => { setPro('personal'); render(); });
    panel.querySelector('#pro-force-team').addEventListener('click', () => { setPro('team'); render(); });
    panel.querySelector('#pro-reset').addEventListener('click', () => { resetPro(); render(); });
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

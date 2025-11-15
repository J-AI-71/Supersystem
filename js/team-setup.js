// /Supersystem/js/team-setup.js  (optional; für eine Team-Setup-Seite mit Formularfeldern)
(function(){
  'use strict';
  // Erwartete Elemente: #modePublisher (checkbox), #wl (textarea), #save, #reset, #state (badge)
  function update(){
    const on = localStorage.getItem('ss_mode')==='publisher';
    const wl = localStorage.getItem('ss_wl')||'';
    const $m = document.getElementById('modePublisher');
    const $w = document.getElementById('wl');
    const $s = document.getElementById('state');
    if($m) $m.checked = on;
    if($w) $w.value = wl;
    if($s) $s.textContent = on ? 'Publisher aktiv' : 'Publisher aus';
  }
  document.getElementById('save')?.addEventListener('click',()=>{
    const on = !!document.getElementById('modePublisher')?.checked;
    const wl = document.getElementById('wl')?.value || '';
    if(on) localStorage.setItem('ss_mode','publisher'); else localStorage.removeItem('ss_mode');
    localStorage.setItem('ss_wl', wl.split(',').map(s=>s.trim()).filter(Boolean).join(','));
    update();
  });
  document.getElementById('reset')?.addEventListener('click',()=>{
    ['ss_mode','ss_wl'].forEach(k=>localStorage.removeItem(k));
    update();
  });
  update();
})();

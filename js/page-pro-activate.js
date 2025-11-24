// /Supersystem/js/page-pro-activate.js
(function activate() {
  try {
    const p = new URLSearchParams(location.search);
    const doActivate = p.has('pro') ? (p.get('pro') !== '0') : false;
    const plan = (p.get('plan') || 'personal').toLowerCase();
    const back = (p.get('return') || 'pro').toLowerCase();

    if (doActivate) {
      // setzen
      localStorage.setItem('ss_pro', '1');
      localStorage.setItem('ss_pro_plan', plan);
      sessionStorage.setItem('ss_pro_activated_ts', String(Date.now()));

      // kurze Verzögerung, dann redirect (standard: pro.html)
      setTimeout(() => {
        let target = 'pro.html';
        if (back === 'app') target = 'app.html';
        else if (back === 'index' || back === 'start' || back === 'home') target = 'index.html';
        location.replace(target);
      }, 50);
    }
  } catch (e) {
    console.error('[pro-activate] Fehler:', e);
  }
})();

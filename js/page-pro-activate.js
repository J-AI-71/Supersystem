/* /js/page-pro-activate.js */
(() => {
  const qs = new URLSearchParams(location.search);
  const DBG = qs.has('debug');
  const log = (...a) => { if (DBG) console.log('[pro-activate]', ...a); };

  const param = (k, d='') => (qs.get(k) || d).trim();
  const wantPro = param('pro') === '1';
  const plan    = (param('plan','personal') || 'personal').toLowerCase();
  const ret = (param('return','pro')    || 'pro').toLowerCase(); // 'pro'|'app'

  function setPro(flag, p) {
    try {
      localStorage.setItem('ss_pro_active', flag ? '1' : '');
      if (p) localStorage.setItem('ss_pro_plan', p);
      localStorage.setItem('ss_pro_at', String(Date.now()));
      log('stored', { active: localStorage.getItem('ss_pro_active'),
                      plan:   localStorage.getItem('ss_pro_plan') });
      return true;
    } catch (e) {
      console.error('[pro-activate] localStorage failed', e);
      return false;
    }
  }

  function go(where) {
    const target = where === 'pro' ? 'pro.html' : 'app.html';
    log('redirect ->', target);
    // kleine Verzögerung, damit Storage sicher geschrieben ist
    setTimeout(() => location.replace(target), 250);
  }

  function wireManual() {
    document.querySelectorAll('[data-activate]').forEach(el => {
      el.addEventListener('click', ev => {
        ev.preventDefault();
        const p = el.getAttribute('data-plan') || 'personal';
        log('manual activate', p);
        setPro(true, p);
        go('pro');
      });
    });
  }

  function run() {
    wireManual();

    if (wantPro) {
      log('auto activate', { plan, ret });
      setPro(true, plan);
      go(ret);
    } else {
      log('no ?pro=1 – waiting for manual click');
    }
  }

  document.addEventListener('DOMContentLoaded', run);
})();

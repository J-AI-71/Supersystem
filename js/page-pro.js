/* /Supersystem/js/page-pro.js (v35) – Pro-Status & lokale Steuerung */
(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);

  function isProActive() {
    // kompatibel zu beiden Keys
    return (
      localStorage.getItem('ss_pro') === '1' ||
      localStorage.getItem('safeshare.pro') === '1'
    );
  }

  function setPro(val) {
    if (val) {
      localStorage.setItem('ss_pro', '1');
      localStorage.setItem('safeshare.pro', '1');
    } else {
      localStorage.removeItem('ss_pro');
      localStorage.removeItem('safeshare.pro');
    }
  }

  function render() {
    const active = isProActive();
    const badge = $('#pro-badge');
    const state = $('#pro-state');
    if (badge) badge.style.display = active ? 'inline-block' : 'none';
    if (state) state.textContent = active ? 'Pro aktiv' : 'Nicht aktiv';
    // Kauf/Aktivierungskarte bleibt sichtbar (auch für Re-Aktivierung)
  }

  function bind() {
    $('#pro-recheck')?.addEventListener('click', render);
    $('#pro-reset')?.addEventListener('click', () => {
      setPro(false);
      render();
      alert('Pro-Flag lokal zurückgesetzt. Bei Bedarf erneut aktivieren: /pro-activate.html?pro=1');
    });

    render();
    console.log('[SafeShare] page-pro bereit');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }
})();

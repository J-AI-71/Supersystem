// /Supersystem/js/page-pro-activate.js
// Liest ?pro=1&plan=personal|team und setzt lokale Keys, dann sanfter Redirect.
(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const pro = params.get('pro');
  const plan = (params.get('plan') || 'personal').toLowerCase();
  const next = (params.get('next') || '').toLowerCase(); // optional: 'pro'|'app'

  function show(id) { const el = $(id); if (el) el.hidden = false; }
  function hide(id) { const el = $(id); if (el) el.hidden = true; }

  try {
    if (pro === '1') {
      localStorage.setItem('ss_pro', '1');
      // neuer Key
      localStorage.setItem('ss_pro_plan', (plan === 'team' ? 'team' : 'personal'));
      // Fallback-Kompatibilität (alt)
      localStorage.setItem('ss_plan', (plan === 'team' ? 'team' : 'personal'));
      localStorage.setItem('ss_pro_activated_at', new Date().toISOString());

      hide('msg-pending'); show('msg-ok');
      const mp = $('msg-plan'); if (mp) mp.textContent = plan === 'team' ? '· Plan: Team' : '· Plan: Personal';
      // Ziel wählen
      const target = next === 'pro' ? 'pro.html' : (next === 'app' ? 'app.html' : 'app.html');
      // Rücksprung aus pro.html-Kauf: merken respektieren
      const after = sessionStorage.getItem('ss_after_activate');
      setTimeout(() => { location.href = after || target; }, 1200);
    } else {
      hide('msg-pending'); show('msg-err');
    }
  } catch (e) {
    console.error('Pro-Aktivierung fehlgeschlagen:', e);
    hide('msg-pending'); show('msg-err');
  }
})();

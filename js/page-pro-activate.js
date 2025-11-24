// Pro-Aktivierung: liest ?pro=1&plan=personal|team, setzt lokale Keys und leitet weiter.
(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const pro = params.get('pro');
  const plan = (params.get('plan') || 'personal').toLowerCase();

  // kleine UI-Helfer
  function show(id) { const el = $(id); if (el) el.hidden = false; }
  function hide(id) { const el = $(id); if (el) el.hidden = true; }

  try {
    if (pro === '1') {
      // schreiben
      localStorage.setItem('ss_pro', '1');
      localStorage.setItem('ss_pro_plan', (plan === 'team' ? 'team' : 'personal'));
      localStorage.setItem('ss_pro_activated_at', new Date().toISOString());

      // UI
      hide('msg-pending');
      show('msg-ok');
      const mp = $('msg-plan');
      if (mp) mp.textContent = plan === 'team' ? '· Plan: Team' : '· Plan: Personal';

      // sanfter Auto-Redirect zur App
      setTimeout(() => { location.href = 'app.html'; }, 1500);
    } else {
      // keine/inkorrekte Parameter
      hide('msg-pending');
      show('msg-err');
      // Falls aus Versehen ohne Query geöffnet wurde, keine Redirect-Schleife.
    }
  } catch (e) {
    console.error('Pro-Aktivierung fehlgeschlagen:', e);
    hide('msg-pending');
    show('msg-err');
  }
})();

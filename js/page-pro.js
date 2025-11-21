/* Pro-Status steuern: liest/setzt localStorage('ss_pro') und aktualisiert die UI */
(function () {
  const $ = (sel) => document.querySelector(sel);

  const BADGE = $('#pro-badge');            // <span id="pro-badge">Status: …</span>
  const WRAP  = document.body;              // bekommt Klasse is-pro / not-pro
  const BTN_ACT = $('#btn-activate');       // „Kauf abgeschlossen? Aktivieren“
  const BTN_APP = $('#btn-app');            // „Zur App“
  const BTN_BUY = $('#btn-buy');            // „Pro kaufen“ (Link ist im HTML)

  // Helper
  const isPro = () => localStorage.getItem('ss_pro') === '1';
  const setPro = (on) => {
    if (on) localStorage.setItem('ss_pro', '1');
    else localStorage.removeItem('ss_pro');
  };

  function render() {
    const pro = isPro();
    WRAP.classList.toggle('is-pro', pro);
    WRAP.classList.toggle('not-pro', !pro);
    if (BADGE) BADGE.textContent = pro ? 'Status: aktiviert' : 'Status: nicht aktiviert';
  }

  // Button: Manuel aktivieren (führt zur Aktivierungsseite)
  if (BTN_ACT) {
    BTN_ACT.addEventListener('click', (e) => {
      e.preventDefault();
      // Diese Seite setzt den Status und bringt den Nutzer zurück zur App
      location.href = 'pro-activate.html?pro=1';
    });
  }

  // Button: Zur App
  if (BTN_APP) {
    BTN_APP.addEventListener('click', (e) => {
      e.preventDefault();
      location.href = 'app.html';
    });
  }

  // Optional: Debug-URL ?pro=force / ?pro=off
  const p = new URLSearchParams(location.search);
  if (p.get('pro') === 'force') setPro(true);
  if (p.get('pro') === 'off') setPro(false);

  render();

  // Exponiere Mini-API in der Konsole
  window.ssPro = {
    isPro, set: setPro, clear: () => setPro(false), render
  };
})();

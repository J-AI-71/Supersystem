// /Supersystem/js/page-pro.js
(function () {
  const pill = document.getElementById('pro-pill');
  const isPro = (localStorage.getItem('ss_pro') === '1');
  if (pill) {
    if (isPro) {
      pill.textContent = 'Status: aktiv';
      pill.classList.remove('warn');
    } else {
      pill.textContent = 'Status: nicht aktiviert';
      pill.classList.add('warn');
    }
  }
})();

// page-pro.js – Pro-Status anzeigen und Buttons steuern
(function(){
  const $ = s => document.querySelector(s);
  const badge = $('#pro-badge');
  const btnBuy = $('#btn-buy');
  const btnAct = $('#btn-activate');
  const btnDeact = $('#btn-deactivate');

  function isPro(){
    try { return localStorage.getItem('ss_pro') === '1'; } catch { return false; }
  }
  function render(){
    const pro = isPro();
    if (pro){
      badge.textContent = 'Status: aktiv';
      badge.classList.remove('warn'); badge.classList.add('ok');
      btnBuy?.classList.add('hide');
      btnAct?.classList.add('hide');
      btnDeact?.classList.remove('hide');
    }else{
      badge.textContent = 'Status: nicht aktiviert';
      badge.classList.remove('ok'); badge.classList.add('warn');
      btnBuy?.classList.remove('hide');
      btnAct?.classList.remove('hide');
      btnDeact?.classList.add('hide');
    }
  }

  // Aktualisieren, falls ein anderer Tab pro-activate aufruft
  window.addEventListener('storage', e=>{
    if (e.key === 'ss_pro') render();
  });

  // Erste Darstellung
  render();
})();

(() => {
  const out = document.getElementById('out');
  try {
    localStorage.removeItem('ss_pro');
    localStorage.removeItem('ss_pro_activated_at');
    out.textContent = '✓ Pro wurde zurückgesetzt. Um Pro wieder zu nutzen: Payhip-Download öffnen → 01-START.html.';
  } catch (e) {
    out.textContent = 'Speicher konnte nicht geändert werden (Storage blockiert?).';
  }
})();

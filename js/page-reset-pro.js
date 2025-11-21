(() => {
  const out = document.getElementById('out');
  try {
    localStorage.removeItem('ss_pro');
    localStorage.removeItem('ss_pro_activated_at');
    out.textContent = '✔ Pro wurde zurückgesetzt. Öffne die Aktivierungsseite erneut, um Pro wieder zu schalten.';
  } catch (e) {
    out.textContent = 'Speicher konnte nicht geändert werden (Storage blockiert?).';
  }
})();

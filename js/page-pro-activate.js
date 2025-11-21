/* SafeShare · Pro-Aktivierung */
(function () {
  const qs = new URLSearchParams(location.search);
  const proParam = qs.get('pro');
  const statusEl = document.getElementById('status');
  const storageNote = document.getElementById('storage-note');

  // Test: localStorage verfügbar?
  let storageOK = true;
  try {
    const k = '__ss_probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
  } catch (e) {
    storageOK = false;
  }
  if (!storageOK && storageNote) storageNote.style.display = 'block';

  // Pro schalten, wenn ?pro=1 dabei ist
  if (storageOK && proParam === '1') {
    try {
      localStorage.setItem('ss_pro', '1');
      localStorage.setItem('ss_pro_activated_at', new Date().toISOString());
      if (statusEl) statusEl.innerHTML = '✔ <strong>Pro ist jetzt aktiv</strong> (in diesem Browser).';
    } catch (e) {
      if (statusEl) statusEl.textContent = 'Pro konnte nicht gespeichert werden (Speicher blockiert?).

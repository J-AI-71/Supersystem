/* page-redirect.js – Redirect entschachteln UI (ohne Inline-Handler) */
document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  const QS = { in: $('#inUrl'), out: $('#outUrl'), steps: $('#steps'), changes: $('#changes'), opt: $('#optClean') };

  const bUnwrap = document.querySelector('[onclick*="UI.unwrap"]') || $('#btnUnwrap');
  const bCopy   = document.querySelector('[onclick*="UI.copy"]')   || $('#btnCopy');
  const bOpen   = document.querySelector('[onclick*="UI.open"]')   || $('#btnOpen');

  if (QS.in) QS.in.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doUnwrap(); } });
  if (bUnwrap) bUnwrap.addEventListener('click', doUnwrap);
  if (bCopy)   bCopy.addEventListener('click', () => copy(QS.out?.value||''));
  if (bOpen)   bOpen.addEventListener('click', () => openUrl(QS.out?.value||''));

  function doUnwrap(){
    const src = (QS.in?.value||'').trim();
    if (!src) return;
    const res = Cleaner.cleanUrl(src, {doStrip: !!(QS.opt && QS.opt.checked)});
    if (QS.out) QS.out.value = res.url;

    // Schritte/Änderungen
    QS.steps && (QS.steps.innerHTML = res.unwrapped
      ? `<ol><li>${Cleaner.escapeHtml(res.unwrapped.via)} → <code>${Cleaner.escapeHtml(res.unwrapped.to)}</code></li></ol>`
      : '<p>Keine eingebettete Ziel-URL gefunden.</p>');

    const removed = res.removed.length ? res.removed.map(k=>`<span class="pill">${Cleaner.escapeHtml(k)}</span>`).join(' ') : '–';
    const kept    = res.kept.length    ? res.kept.map(k=>`<span class="pill">${Cleaner.escapeHtml(k)}</span>`).join(' ')    : '–';
    QS.changes && (QS.changes.innerHTML = `
      <div>Entfernte Parameter: ${removed}</div>
      <div>Behalten (Whitelist): ${kept}</div>
      <div>Normalisierung: ${Cleaner.escapeHtml(res.normalized || '–')}</div>
    `);
  }

  async function copy(text){ try{ await navigator.clipboard.writeText(text); }catch{} }
  function openUrl(u){ if (!u) return; try{ window.open(u,'_blank','noopener,noreferrer'); }catch{ location.href = u; } }
});

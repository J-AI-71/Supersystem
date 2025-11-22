/* /Supersystem/js/redirect-unpack.js (v35) – Redirect-Ketten offline entpacken */
(() => {
  'use strict';

  // Wrapper-Muster: reine Parameter-Extraktion ohne Netz
  const WRAPPERS = [
    {host:/(^|\.)google\.[^/]+$/i, path:/^\/url$/i, key:'q'},
    {host:/^l\.facebook\.com$/i,   path:/^\/l\.php$/i, key:'u'},
    {host:/(^|\.)reddit\.com$/i,   path:/^\/(r|out)/i, key:'url'},
    {host:/(^|\.)vk\.com$/i,       path:/^\/away\.php$/i, key:'to'},
    {host:/^safelinks\.protection\.outlook\.com$/i,     key:'url'},
    // häufige Newsletter-Tracker (Beispiel)
    {host:/(^|\.)newsletter\./i, key:'url'}
  ];

  // Tracking-Blacklist
  const BLACK = new Set([
    'gclid','dclid','gbraid','wbraid','fbclid','msclkid',
    'vero_id','_hsenc','_hsmi','mkt_tok','igshid','mc_eid','mc_cid'
  ]);

  const $ = (s) => document.querySelector(s);
  const outLink  = $('#out-link');
  const outHost  = $('#out-host');
  const outHops  = $('#out-hops');
  const outRem   = $('#out-removed');
  const outMsg   = $('#out-msg');
  const diagWrap = $('#diag');
  const diagPre  = $('#diag-pre');

  function setText(el, txt){ if (el) el.textContent = txt; }

  function ensureUrl(str) {
    str = (str||'').trim();
    if (!str) throw new Error('Leere Eingabe');
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(str)) str = 'https://' + str;
    return new URL(str);
  }

  function unwrapOnce(u) {
    for (const w of WRAPPERS) {
      if (w.host && !w.host.test(u.hostname)) continue;
      if (w.path && !w.path.test(u.pathname)) continue;
      if (!w.key) continue;
      const v = u.searchParams.get(w.key);
      if (v) {
        try { return new URL(decodeURIComponent(v)); } catch { /* ignore */ }
      }
    }
    return u;
  }

  function stripParams(u, doClean) {
    if (!doClean) return {removed:0, url:u};
    let removed = 0;

    // utm_* weg
    for (const [k] of u.searchParams) {
      if (k.toLowerCase().startsWith('utm_')) {
        u.searchParams.delete(k);
        removed++;
      }
    }
    // Blacklist weg
    for (const key of Array.from(u.searchParams.keys())) {
      if (BLACK.has(key)) {
        u.searchParams.delete(key);
        removed++;
      }
    }
    // Fragment-Tracker
    if (u.hash && /utm_|fbclid|gclid|msclkid/i.test(u.hash)) {
      u.hash = '';
      removed++;
    }
    // Aufräumen
    if (!u.search || u.search === '?') u.search = '';
    if (u.hash === '#') u.hash = '';
    return {removed, url:u};
  }

  function run() {
    const raw = $('#ru-in')?.value || '';
    const doClean = $('#opt-clean')?.checked ?? true;

    try {
      const hops = [];
      let u = ensureUrl(raw);
      let prev = u.toString();
      for (let i=0;i<5;i++) {
        const next = unwrapOnce(u);
        if (next.toString() === u.toString()) break;
        hops.push(next.toString());
        u = next;
      }
      const {removed, url} = stripParams(u, doClean);
      const final = url.toString();

      setText(outLink, final);
      setText(outHost, url.hostname || '—');
      setText(outHops, `Hops: ${hops.length}`);
      setText(outRem, `Entfernt: ${removed}`);
      setText(outMsg, final === prev && hops.length===0 && removed===0 ? 'Keine Weiterleitung erkannt' : 'Fertig.');

      // Diagnose-Block
      diagWrap.hidden = false;
      diagPre.textContent = JSON.stringify({
        input: raw,
        hops,
        output: final,
        removed
      }, null, 2);

      return final;
    } catch(e) {
      setText(outLink, '—');
      setText(outHost, '—');
      setText(outHops, 'Hops: 0');
      setText(outRem, 'Entfernt: 0');
      setText(outMsg, `Fehler: ${e.message || e}`);
      diagWrap.hidden = false;
      diagPre.textContent = String(e.stack || e);
      return '';
    }
  }

  async function copyOut() {
    const val = outLink?.textContent || '';
    if (!val || val === '—') return;
    try { await navigator.clipboard.writeText(val); setText(outMsg, 'Kopiert.'); }
    catch { setText(outMsg, 'Kopieren nicht möglich.'); }
  }

  function openOut() {
    const val = outLink?.textContent || '';
    if (!val || val === '—') return;
    try { window.open(val, '_blank', 'noopener'); }
    catch {/* ignore */}
  }

  // Bindings
  $('#btn-unpack')?.addEventListener('click', run);
  $('#btn-copy')?.addEventListener('click', copyOut);
  $('#btn-open')?.addEventListener('click', openOut);
  $('#btn-check')?.addEventListener('click', () => { diagWrap.hidden = false; });

  // Enter-Key
  $('#ru-in')?.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); run(); }
  });

  console.log('[SafeShare] redirect-unpack bereit');
})();

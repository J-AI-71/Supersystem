/* /Supersystem/js/bulk-clean.js (v35) – Pro-Gate + Bulk-Reiniger + Export */
(() => {
  'use strict';

  // --- Pro-Gate / Badge (kompatibel zu zwei Keys) ---
  function isProActive() {
    return (
      localStorage.getItem('ss_pro') === '1' ||
      localStorage.getItem('safeshare.pro') === '1'
    );
  }
  function applyProGate() {
    const isPro = isProActive();
    const pay = document.getElementById('paywall');
    const ui  = document.getElementById('bc-ui');
    const badge = document.getElementById('pro-badge');
    if (isPro) {
      if (pay) pay.remove();
      if (ui)  ui.hidden = false;
      if (badge) badge.style.display = 'inline-block';
    } else {
      if (ui)  ui.hidden = true;
      if (badge) badge.style.display = 'none';
    }
  }

  // --- Whitelist aus Team-Setup (comma-separated) ---
  function getWhitelist() {
    const raw = localStorage.getItem('ss_whitelist') || '';
    return new Set(raw.split(',').map(s => s.trim()).filter(Boolean));
  }

  // --- Blacklist (erweiterbar) ---
  const BLACK = new Set([
    'gclid','dclid','gbraid','wbraid','fbclid','msclkid',
    'vero_id','_hsenc','_hsmi','mkt_tok','igshid','mc_eid','mc_cid'
  ]);

  // --- Wrapper-Domains (parameterbasiertes Entpacken ohne Netz) ---
  const WRAPPERS = [
    {host:/(^|\.)google\.[^/]+$/i, path:/^\/url$/i, key:'q'},
    {host:/^l\.facebook\.com$/i,   path:/^\/l\.php$/i, key:'u'},
    {host:/(^|\.)reddit\.com$/i,   path:/^\/(r|out)/i, key:'url'},
    {host:/(^|\.)vk\.com$/i,       path:/^\/away\.php$/i, key:'to'},
    {host:/(^|\.)safelinks\.protection\.outlook\.com$/i, key:'url'}
    // t.co: echtes Auflösen bräuchte Netz – wird nicht erzwungen
  ];

  function ensureUrl(str) {
    str = (str || '').trim();
    if (!str) throw new Error('Leere Zeile');
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(str)) str = 'https://' + str;
    return new URL(str);
  }

  function unwrapOnce(u) {
    for (const w of WRAPPERS) {
      if (w.host && !w.host.test(u.hostname)) continue;
      if (w.path && !w.path.test(u.pathname)) continue;
      if (!w.key) return u;
      const val = u.searchParams.get(w.key);
      if (val) {
        try { return new URL(decodeURIComponent(val)); } catch { return u; }
      }
    }
    return u;
  }

  function stripParams(u, whitelist) {
    // 1) utm_* weg (außer Whitelist)
    for (const [k] of u.searchParams) {
      if (k.toLowerCase().startsWith('utm_') && !whitelist.has(k)) u.searchParams.delete(k);
    }
    // 2) Blacklist weg (außer Whitelist)
    for (const key of Array.from(u.searchParams.keys())) {
      if (BLACK.has(key) && !whitelist.has(key)) u.searchParams.delete(key);
    }
    // 3) übliche Tracker im Fragment
    if (u.hash && /utm_|fbclid|gclid|msclkid/i.test(u.hash)) u.hash = '';
    // 4) Aufräumen
    if (!u.search || u.search === '?') u.search = '';
    if (u.hash === '#') u.hash = '';
    return u;
  }

  function cleanOne(input) {
    let u = ensureUrl(input);
    for (let i=0;i<2;i++) {
      const next = unwrapOnce(u);
      if (next.href === u.href) break;
      u = next;
    }
    return stripParams(u, getWhitelist()).toString();
  }

  // --- UI / Handlers ---
  const $ = (s) => document.querySelector(s);
  function setText(el, txt){ if (el) el.textContent = txt; }

  function runBulk() {
    const raw = $('#bc-input')?.value || '';
    const src = raw.split(/\r?\n/);
    const out = [];
    let errors = 0;
    let dupes  = 0;
    const seen = new Set();
    let inCount = 0;

    for (let line of src) {
      line = (line || '').trim();
      if (!line || line.startsWith('#')) continue;
      inCount++;
      try {
        const cleaned = cleanOne(line);
        if (seen.has(cleaned)) { dupes++; continue; }
        seen.add(cleaned);
        out.push(cleaned);
      } catch(e) {
        errors++;
      }
    }

    const outEl = $('#bc-output');
    if (outEl) outEl.value = out.join('\n');

    setText($('#stat-in'),  `Eingaben: ${inCount}`);
    setText($('#stat-out'), `Ergebnisse: ${out.length}`);
    setText($('#stat-dupes'), `Duplikate: ${dupes}`);
    setText($('#stat-errors'), `Fehler: ${errors}`);

    setText($('#bc-msg'), errors ? `Fertig, ${errors} Fehler.` : 'Fertig.');
    return out.join('\n');
  }

  async function copyOut() {
    const out = $('#bc-output')?.value || '';
    try { await navigator.clipboard.writeText(out); setText($('#bc-msg'), 'Kopiert.'); }
    catch { setText($('#bc-msg'), 'Kopieren nicht möglich.'); }
  }

  function exportFile() {
    const content = $('#bc-output')?.value || '';
    const nameInp = $('#bc-filename')?.value.trim();
    const ts = new Date();
    const pad = (n)=> String(n).padStart(2,'0');
    const defName = `safeshare-cleaned-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}.txt`;
    const fname = nameInp || defName;

    const blob = new Blob([content], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    setText($('#bc-msg'), `Exportiert: ${fname}`);
  }

  function bind() {
    applyProGate();

    $('#bc-run')?.addEventListener('click', runBulk);
    $('#bc-copy')?.addEventListener('click', copyOut);
    $('#bc-export')?.addEventListener('click', exportFile);

    // Diagnose
    console.log('[SafeShare] bulk-clean.js bereit');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }
})();

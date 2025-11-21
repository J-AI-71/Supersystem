/* js/app.js – App-UI + Cleaning-Logik (fallback integriert) */
(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $in  = $('#in-url');
  const $out = $('#out-url');
  const $msg = $('#msg');

  // --- Whitelist (comma-separated) ---
  function getWhitelist() {
    const raw = localStorage.getItem('ss_whitelist') || '';
    return new Set(raw.split(',').map(s => s.trim()).filter(Boolean));
  }

  // --- Basic blacklist ---
  const BLACK = new Set([
    'gclid','dclid','gbraid','wbraid','fbclid','msclkid','vero_id',
    '_hsenc','_hsmi','mkt_tok','igshid','mc_eid','mc_cid'
  ]);

  // --- Wrapper-Domains (parameterbasiertes Entpacken ohne Netz) ---
  const WRAPPERS = [
    {host:/(^|\.)google\.[^/]+$/i, path:/^\/url$/i, key:'q'},
    {host:/^l\.facebook\.com$/i, path:/^\/l\.php$/i, key:'u'},
    {host:/(^|\.)reddit\.com$/i,  path:/^\/(r|out)/i, key:'url'},
    {host:/(^|\.)vk\.com$/i,      path:/^\/away\.php$/i, key:'to'},
    {host:/(^|\.)safelinks\.protection\.outlook\.com$/i, key:'url'}
    // t.co: echtes Auflösen braucht Netz – wir lassen es wie es ist
  ];

  function ensureUrl(str) {
    str = (str || '').trim();
    if (!str) throw new Error('Leere Eingabe');
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
    // utm_* entfernen (außer Whitelist)
    for (const [k] of u.searchParams) {
      if (k.toLowerCase().startsWith('utm_') && !whitelist.has(k)) u.searchParams.delete(k);
    }
    // Blacklist entfernen (außer Whitelist)
    for (const key of Array.from(u.searchParams.keys())) {
      if (BLACK.has(key) && !whitelist.has(key)) u.searchParams.delete(key);
    }
    // Häufige Tracker im Fragment
    if (u.hash && /utm_|fbclid|gclid|msclkid/i.test(u.hash)) u.hash = '';
    // Aufräumen
    if (!u.search || u.search === '?') u.search = '';
    if (u.hash === '#') u.hash = '';
    return u;
  }

  // Haupt-Cleaner: nutze ggf. globalen Cleaner (falls vorhanden), sonst Fallback
  function cleanUrl(input) {
    if (window.SS && typeof window.SS.cleanUrl === 'function') {
      return window.SS.cleanUrl(input);
    }
    let u = ensureUrl(input);
    // bis zu zwei Entpack-Runden
    for (let i=0;i<2;i++) {
      const next = unwrapOnce(u);
      if (next.href === u.href) break;
      u = next;
    }
    return stripParams(u, getWhitelist()).toString();
  }

  function setOut(s) { $out.textContent = s || ''; }
  function setMsg(s) { $msg.textContent = s || ''; }

  async function runClean() {
    try {
      const raw = $in.value.trim();
      const cleaned = cleanUrl(raw);
      setOut(cleaned);
      setMsg('Bereinigt.');
      return cleaned;
    } catch (e) {
      setMsg('Fehler: ' + (e && e.message ? e.message : String(e)));
      return null;
    }
  }

  // Button-Events
  function bind() {
    $('#btn-clean-open')?.addEventListener('click', async () => {
      const url = await runClean(); if (!url) return;
      try { window.open(url, '_blank', 'noopener'); } catch {}
    });

    $('#btn-open')?.addEventListener('click', async () => {
      const url = await runClean(); if (!url) return;
      window.location.href = url;
    });

    $('#btn-copy')?.addEventListener('click', async () => {
      const url = await runClean(); if (!url) return;
      try { await navigator.clipboard.writeText(url); setMsg('Kopiert.'); }
      catch { setMsg('Kopieren nicht möglich.'); }
    });

    $('#btn-share')?.addEventListener('click', async () => {
      const url = await runClean(); if (!url) return;
      if (navigator.share) {
        try { await navigator.share({ title:'SafeShare', url }); setMsg('Geteilt.'); return; } catch {}
      }
      try { await navigator.clipboard.writeText(url); setMsg('Link kopiert.'); }
      catch { setMsg('Teilen nicht verfügbar.'); }
    });

    $('#btn-clear')?.addEventListener('click', () => {
      $in.value = ''; setOut(''); setMsg(''); $in.focus();
    });

    // Prefill via ?url=
    try {
      const u = new URL(location.href).searchParams.get('url');
      if (u) { $in.value = u; runClean(); }
    } catch {}
    // Diagnose
    console.log('[SafeShare] app.js initialisiert');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }
})();

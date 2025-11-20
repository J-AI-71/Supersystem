/* page-unwrap.js – Redirects entpacken & optional säubern */

(function(){
  const $ = s => document.querySelector(s);
  const inUrl = $('#in-url');
  const out = $('#out-url');

  const optUnwrap = $('#opt-unwrap');
  const optClean  = $('#opt-clean');
  const optKeep   = $('#opt-keep');

  const bIn = $('#b-in');
  const bTarget = $('#b-target');
  const bClean = $('#b-clean');

  $('#btn-check').addEventListener('click', process);
  $('#btn-open').addEventListener('click', openTarget);
  $('#btn-copy').addEventListener('click', copyOut);
  $('#btn-reset').addEventListener('click', resetAll);

  // Autofill via ?u=...
  try {
    const u = new URL(location.href);
    const q = u.searchParams.get('u');
    if (q) {
      inUrl.value = q;
      process();
    }
  } catch {}

  function process(){
    const src = (inUrl.value || '').trim();
    if (!/^https?:\/\//i.test(src)) return renderMsg('Bitte eine gültige http(s)-URL einfügen.');
    bIn.textContent = src;

    // Schritt 1: entpacken
    let target = src;
    if (optUnwrap.checked) {
      target = unwrap(src) || src;
    }
    bTarget.textContent = target;

    // Schritt 2: tracking säubern
    let cleaned = target;
    if (optClean.checked) {
      cleaned = cleanTracking(target, { whitelist: optKeep.checked ? loadWhitelist() : new Set() }) || target;
    }
    bClean.textContent = cleaned;

    // Ausgabe
    renderURL(cleaned);
  }

  function openTarget(){
    process();
    const a = out.querySelector('a[data-final="1"]');
    if (a && a.href) {
      window.open(a.href, '_blank', 'noopener,noreferrer');
    }
  }

  async function copyOut(){
    process();
    const a = out.querySelector('a[data-final="1"]');
    const href = a ? a.href : '';
    if (!href) return;
    try {
      await navigator.clipboard.writeText(href);
      toast('Kopiert.');
    } catch { toast('Kopieren fehlgeschlagen.'); }
  }

  function resetAll(){
    inUrl.value = '';
    bIn.textContent = '–';
    bTarget.textContent = '–';
    bClean.textContent = '–';
    out.textContent = 'Noch kein Ergebnis.';
  }

  function renderURL(url){
    out.innerHTML = '';
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = url;
    a.textContent = url;
    a.rel = 'noopener nofollow';
    a.target = '_blank';
    a.dataset.final = '1';
    p.appendChild(a);
    out.appendChild(p);
  }

  function renderMsg(msg){
    out.textContent = msg;
  }

  // ---- Helper: Whitelist laden ----
  function loadWhitelist(){
    try{
      const raw = localStorage.getItem('ss_whitelist')
               || localStorage.getItem('ss_team_whitelist')
               || '[]';
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? new Set(arr.map(s=>String(s).toLowerCase())) : new Set();
    }catch{ return new Set(); }
  }

  // ---- Unwrap-Logik ----
  function unwrap(urlStr){
    try{
      let u = new URL(urlStr);
      const host = u.hostname.replace(/^www\./,'').toLowerCase();

      // klassische Muster
      if (host === 'google.com' || host.endsWith('.google.com')) {
        if (u.pathname === '/url') {
          const q = u.searchParams.get('q') || u.searchParams.get('url') || u.searchParams.get('u') || '';
          if (q && /^https?:/i.test(q)) return safeURL(q);
        }
      }
      if (host === 't.co') {
        // t.co oft direkt Weiterleitung; hier best effort nur anzeigen
        // Browser folgt ohnehin – kein Query-Param mit Ziel
        return u.toString();
      }
      if (host.endsWith('facebook.com')) {
        const q = u.searchParams.get('u') || u.searchParams.get('url');
        if (q && /^https?:/i.test(q)) return safeURL(q);
      }
      if (host === 'lnkd.in' || host.endsWith('.linkedin.com')) {
        const q = u.searchParams.get('url') || u.searchParams.get('u');
        if (q && /^https?:/i.test(q)) return safeURL(q);
      }
      if (host === 'medium.com' && u.pathname.startsWith('/r/')) {
        const q = u.pathname.slice(3);
        if (q && /^https?:/i.test(q)) return safeURL(q);
      }
      if (host === 'out.reddit.com' || host === 'reddit.com') {
        const q = u.searchParams.get('url') || u.searchParams.get('out');
        if (q && /^https?:/i.test(q)) return safeURL(q);
      }
      if (host.endsWith('pinterest.com')) {
        const q = u.searchParams.get('url') || u.searchParams.get('u');
        if (q && /^https?:/i.test(q)) return safeURL(q);
      }
      if (host === 'go.microsoft.com') {
        const q = u.searchParams.get('linkid') || u.searchParams.get('target') || u.searchParams.get('to');
        if (q && /^https?:/i.test(q)) return safeURL(q);
      }

      // generischer Kandidaten-Scan
      for (const key of ['url','u','q','target','dest','destination','to','redirect','r','link','href','l']){
        const v = u.searchParams.get(key);
        if (v && /^https?:/i.test(v)) {
          const cand = safeURL(v);
          if (cand) return cand;
        }
      }
      return u.toString();
    }catch{ return urlStr; }
  }

  function safeURL(s){
    try{
      // doppelt encodierte Ziele robust dekodieren
      let once = s;
      try { once = decodeURIComponent(s); } catch {}
      return new URL(once).toString();
    }catch{ return null; }
  }

  // ---- Tracking-Parameter entfernen (Fallback, wenn cleaner.js fehlt) ----
  function cleanTracking(urlStr, {whitelist = new Set()} = {}){
    // Wenn die zentrale Logik vorhanden ist, nutze sie
    if (window.CleanURL && typeof window.CleanURL.clean === 'function') {
      try { return window.CleanURL.clean(urlStr, { unwrap:false, whitelist }); } catch {}
    }
    try{
      const u = new URL(urlStr);
      const sp = u.searchParams;

      const del = new Set([
        // Ads/Analytics
        'utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','utm_name','utm_reader',
        'gclid','gclsrc','fbclid','msclkid','dclid','yclid','gbraid','wbraid',
        // Email/CRM
        'mc_eid','mc_cid','mkt_tok','hsCtaTracking','_hsmi','_hsenc',
        // Divers
        'vero_conv','vero_id','icid','spm','pk_campaign','pk_kwd','pk_source'
      ]);

      [...sp.keys()].forEach(k=>{
        const key = k.toLowerCase();
        if (whitelist.has(key)) return;
        if (del.has(key) || key.startsWith('utm_')) sp.delete(k);
      });

      u.search = sp.toString();
      return u.toString();
    }catch{ return urlStr; }
  }

  function toast(msg){
    const div = document.createElement('div');
    div.textContent = msg;
    Object.assign(div.style,{
      position:'fixed',left:'50%',bottom:'18px',transform:'translateX(-50%)',
      background:'#101010',color:'#eaeaea',border:'1px solid #2b2b2b',borderRadius:'10px',
      padding:'8px 12px',zIndex:99999,font:'14px/1.2 system-ui,-apple-system,Segoe UI,Roboto'
    });
    document.body.appendChild(div);
    setTimeout(()=>div.remove(),1600);
  }
})();

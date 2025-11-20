/* bulk-clean.js – SafeShare Bulk-Clean (Pro) */

(function(){
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const elSrc = $('#src');
  const elDst = $('#dst');
  const elBody = $('#table-body');

  const elIn = $('#cnt-in');
  const elValid = $('#cnt-valid');
  const elClean = $('#cnt-clean');
  const elSame = $('#cnt-same');

  const optUnwrap = $('#opt-unwrap');
  const optKeep = $('#opt-keep');
  const optDedupe = $('#opt-dedupe');

  $('#btn-clean').addEventListener('click', run);
  $('#btn-copy').addEventListener('click', copyOut);
  $('#btn-csv').addEventListener('click', exportCSV);
  $('#btn-clear').addEventListener('click', resetAll);

  // --- Whitelist (aus Team-Setup) ---
  function loadWhitelist(){
    try {
      // kompatibel zu früheren Keys
      const raw = localStorage.getItem('ss_whitelist')
               || localStorage.getItem('ss_team_whitelist')
               || '[]';
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? new Set(arr.map(s => String(s).toLowerCase())) : new Set();
    } catch { return new Set(); }
  }

  // --- Fallback Cleaner, falls js/cleaner.js nicht vorhanden ist ---
  function fallbackClean(url, opts){
    try {
      const u0 = String(url).trim();
      if (!/^https?:\/\//i.test(u0)) return null;
      let u = new URL(u0);

      if (opts.unwrap) {
        u = unwrap(u);
      }

      const wl = opts.whitelist || new Set();
      const del = new Set([
        // Kampagnen / Ads
        'utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','utm_name','utm_reader',
        'gclid','gclsrc','fbclid','msclkid','dclid','yclid','gbraid','wbraid',
        // E-Mail / CRM
        'mc_eid','mc_cid','mkt_tok','hsCtaTracking','_hsmi','_hsenc',
        // Divers
        'vero_conv','vero_id','icid','spm','pk_campaign','pk_kwd','pk_source'
      ]);

      const sp = u.searchParams;
      [...sp.keys()].forEach(k=>{
        const key = k.toLowerCase();
        if (wl.has(key)) return;          // behalten
        if (del.has(key) || key.startsWith('utm_')) sp.delete(k);
      });

      // Leeres ? entfernen
      u.search = sp.toString();
      return u.toString();
    } catch { return null; }
  }

  function unwrap(u){
    const host = u.hostname.replace(/^www\./,'');
    const candidates = ['url','u','q','target','dest','destination','to','redirect','r','link','href','l'];
    // google.com/url, t.co, l.facebook.com, lnkd.in, medium.com/r, reddit.com/out, pinterest.com/offsite
    const known = new Set(['google.com','t.co','l.facebook.com','lm.facebook.com','l.messenger.com','facebook.com',
                           'lnkd.in','medium.com','reddit.com','out.reddit.com','news.ycombinator.com',
                           'pinterest.com','go.microsoft.com']);

    if (known.has(host) || host.endsWith('.facebook.com') || (host==='google.com' && u.pathname==='/url')) {
      for (const key of candidates) {
        const v = u.searchParams.get(key);
        if (v && /^https?:/i.test(v)) {
          try { return new URL(decodeURIComponent(v)); } catch {}
          try { return new URL(v); } catch {}
        }
      }
    }
    return u;
  }

  function extractLines(text){
    const lines = String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    // einfache Link-Extraktion aus Fließtext
    const urls = [];
    for (const line of lines) {
      const m = line.match(/https?:\/\/[^\s"')<>]+/g);
      if (m) urls.push(...m);
      else urls.push(line);
    }
    return urls;
  }

  function uniq(arr){ return Array.from(new Set(arr)); }

  function run(){
    const whitelist = optKeep.checked ? loadWhitelist() : new Set();
    let inputs = extractLines(elSrc.value);

    elIn.textContent = String(inputs.length);

    if (optDedupe.checked) inputs = uniq(inputs);

    const results = [];
    let nValid = 0, nClean = 0, nSame = 0;

    for (const raw of inputs) {
      let cleaned = null;

      // vorhandene zentrale Logik bevorzugen
      if (window.CleanURL && typeof window.CleanURL.clean === 'function') {
        try {
          cleaned = window.CleanURL.clean(raw, { unwrap: optUnwrap.checked, whitelist });
        } catch { cleaned = null; }
      } else {
        cleaned = fallbackClean(raw, { unwrap: optUnwrap.checked, whitelist });
      }

      if (cleaned) {
        nValid++;
        const changed = cleaned !== raw;
        if (changed) nClean++; else nSame++;
        results.push({ original: raw, cleaned, changed });
      }
    }

    elValid.textContent = String(nValid);
    elClean.textContent = String(nClean);
    elSame.textContent = String(nSame);

    // Ausgabe
    const out = results.map(r=>r.cleaned).join('\n');
    elDst.value = out || '';

    // Tabelle
    if (results.length === 0) {
      elBody.innerHTML = `<tr><td colspan="2" class="mut">Keine gültigen URLs gefunden.</td></tr>`;
    } else {
      elBody.innerHTML = results.map(r=>{
        const mark = r.changed ? '' : ' style="color:#9aa3ad"';
        return `<tr><td>${escapeHtml(r.original)}</td><td${mark}>${escapeHtml(r.cleaned)}</td></tr>`;
      }).join('');
    }
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  async function copyOut(){
    try {
      await navigator.clipboard.writeText($('#dst').value);
      toast('Kopiert.');
    } catch { toast('Kopieren fehlgeschlagen.'); }
  }

  function exportCSV(){
    // CSV: original,cleaned,changed
    const rows = [];
    const trs = Array.from(elBody.querySelectorAll('tr'));
    if (!trs.length || trs[0].children.length < 2) return toast('Nichts zu exportieren.');
    rows.push(['original','cleaned','changed']);
    trs.forEach(tr=>{
      const tds = tr.querySelectorAll('td');
      if (tds.length >= 2) {
        const o = tds[0].textContent || '';
        const c = tds[1].textContent || '';
        const changed = (o !== c);
        rows.push([o,c,String(changed)]);
      }
    });
    const csv = rows.map(r=>r.map(cell=>{
      const v = String(cell).replace(/"/g,'""');
      return `"${v}"`;
    }).join(',')).join('\n');

    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'safeshare-bulk-clean.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function resetAll(){
    elSrc.value = '';
    elDst.value = '';
    elBody.innerHTML = `<tr><td colspan="2" class="mut">Noch keine Verarbeitung.</td></tr>`;
    elIn.textContent = '0'; elValid.textContent = '0'; elClean.textContent = '0'; elSame.textContent = '0';
  }

  function toast(msg){
    // kleine unobtrusive Meldung
    const div = document.createElement('div');
    div.textContent = msg;
    Object.assign(div.style, {
      position:'fixed',left:'50%',bottom:'18px',transform:'translateX(-50%)',
      background:'#101010',color:'#eaeaea',border:'1px solid #2b2b2b',borderRadius:'10px',
      padding:'8px 12px',zIndex:'99999',font:'14px/1.2 system-ui,-apple-system,Segoe UI,Roboto'
    });
    document.body.appendChild(div);
    setTimeout(()=>div.remove(), 1600);
  }
})();

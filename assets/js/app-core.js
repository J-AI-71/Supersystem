// SafeShare App Core (Cleaner + Impact, session-only, de-duped)
// No URLs/domains stored. Impact stored in sessionStorage only.

(function(){
  // ---- Helpers ----
  const $ = (s)=>document.querySelector(s);

  // ---- DOM refs (must exist in both pages) ----
  const input = $('#urlInput');
  const msg = $('#msg');
  const resultCard = $('#resultCard');
  const outUrl = $('#outUrl');
  const auditRow = $('#auditRow');
  const btnOpen = $('#btnOpen');

  // Buttons
  const btnClean = $('#btnClean');
  const btnPaste = $('#btnPaste');
  const btnClear = $('#btnClear');
  const btnCopy  = $('#btnCopy');
  const btnShare = $('#btnShare');

  // Impact UI
  const impactCard = document.getElementById('ssImpactCard');
  const impactResetBtn = document.getElementById('ssImpactReset');

  // Locale from page <html lang="..">
  const LANG = (document.documentElement.getAttribute('lang') || 'de').toLowerCase();
  const LOCALE = (LANG.startsWith('en') ? 'en-US' : 'de-DE');

  // ---- Copy strings (only few, rest stays in HTML) ----
  const STR = {
    pastePlease: LANG.startsWith('en') ? 'Please paste a link.' : 'Bitte einen Link einfügen.',
    noLinkFound: LANG.startsWith('en') ? 'No valid link found (only text detected).' : 'Kein gültiger Link gefunden (nur Text erkannt).',
    invalidUrl:  LANG.startsWith('en') ? 'That does not look like a valid URL.' : 'Das sieht nicht wie eine gültige URL aus.',
    cleanError:  LANG.startsWith('en') ? 'Error while cleaning.' : 'Fehler beim Bereinigen.',
    copied:      LANG.startsWith('en') ? 'Copied ✓' : 'Kopiert ✓',
    shareFallback: LANG.startsWith('en')
      ? 'Sharing is not available (or was canceled) — the link was copied.'
      : 'Teilen ist nicht verfügbar (oder abgebrochen) — Link wurde kopiert.',
    pasteHint: LANG.startsWith('en')
      ? 'iPad/Safari: tap the field and use “Paste”. The browser may block clipboard access sometimes.'
      : 'iPad/Safari: Tippe ins Feld und nutze „Einfügen“. Der Browser blockiert Zwischenablage manchmal.'
  };

  // ---- Tracking keys ----
  const TRACKING_KEYS = new Set([
    'gclid','dclid','gbraid','wbraid',
    'fbclid','msclkid','igshid',
    'twclid','ttclid','li_fat_id',
    'yclid',
    'mc_cid','mc_eid','mkt_tok',
    '_hsenc','_hsmi',
    'srsltid',
    '_ga','_gid','_gac',
    '_fbp','_fbc',
    'obclid','tblci'
  ]);

  // Impact categories
  const AD_ID_KEYS = new Set([
    "gclid","dclid","gbraid","wbraid",
    "fbclid","msclkid","ttclid","twclid","li_fat_id",
    "igshid","yclid",
    "mc_cid","mc_eid","mkt_tok",
    "srsltid"
  ]);

  // ---- UI message ----
  function showMsg(type, text){
    if (!msg) return;
    msg.hidden = !text;
    msg.className = type ? type : 'warn';
    msg.textContent = text || '';
  }

  // ---- URL normalize/extract ----
  function normalizeUrl(s){
    s = (s || '').trim();
    if (!s) return '';
    if (!/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(s)) {
      if (s.startsWith('//')) s = 'https:' + s;
      else s = 'https://' + s;
    }
    return s;
  }

  // Extract first URL from "text + url"
  function extractFirstUrl(text){
    const s = String(text || "").trim();
    if (!s) return "";

    try { return new URL(normalizeUrl(s)).toString(); } catch(e) {}

    const m = s.match(/https?:\/\/[^\s<>"']+/i) || s.match(/www\.[^\s<>"']+/i);
    if (!m) return "";

    let candidate = m[0].replace(/[)\]\}.,;:!?]+$/g, "");
    try { return new URL(normalizeUrl(candidate)).toString(); } catch(e) { return ""; }
  }

  // ---- Cleaner ----
  function cleanUrl(raw){
    const original = (raw || '').trim();
    if (!original) throw new Error(STR.pastePlease);

    const extracted = extractFirstUrl(original);
    if (!extracted) throw new Error(STR.noLinkFound);

    let url;
    try{ url = new URL(extracted); }
    catch(e){ throw new Error(STR.invalidUrl); }

    const removed = [];
    const kept = [];

    const keys = [];
    url.searchParams.forEach((_, k)=>keys.push(k));

    keys.forEach((k)=>{
      const low = (k || '').toLowerCase();
      const isUtm = low.startsWith('utm_');
      const isTracking = TRACKING_KEYS.has(low);

      if (isUtm || isTracking){
        url.searchParams.delete(k);
        removed.push(k);
      } else {
        kept.push(k);
      }
    });

    return { cleaned: url.toString(), removed, kept };
  }

  // ---- Clipboard copy fallback ----
  async function copyText(text){
    try{
      await navigator.clipboard.writeText(text);
      return true;
    }catch(e){
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly','');
      ta.style.position='fixed';
      ta.style.left='-9999px';
      ta.style.top='0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try{ document.execCommand('copy'); }catch(_){}
      document.body.removeChild(ta);
      return true;
    }
  }

  // ---- Render result ----
  function renderResult(res){
    if (resultCard) resultCard.hidden = false;
    if (outUrl) outUrl.textContent = res.cleaned;
    if (btnOpen) btnOpen.href = res.cleaned;

    if (!auditRow) return;
    auditRow.innerHTML = '';
    const r = Array.from(new Set(res.removed));
    const k = Array.from(new Set(res.kept));

    if (r.length || k.length){
      auditRow.hidden = false;

      if (r.length){
        const el = document.createElement('span');
        el.innerHTML = (LANG.startsWith('en') ? 'Removed: ' : 'Entfernt: ')
          + '<span class="mono">' + r.join(', ') + '</span>';
        auditRow.appendChild(el);
      }
      if (k.length){
        const el2 = document.createElement('span');
        el2.innerHTML = (LANG.startsWith('en') ? 'Kept: ' : 'Behalten: ')
          + '<span class="mono">' + k.join(', ') + '</span>';
        auditRow.appendChild(el2);
      }
    } else {
      auditRow.hidden = true;
    }
  }

  // ===== Impact (SESSION-ONLY, de-duped) =====
  const IMPACT_LS_KEY = "ss_impact_v1";
  const IMPACT_SEEN_KEY = "ss_impact_seen_v1";
  const IMPACT_STORE = sessionStorage;

  async function sha256Hex(str){
    const data = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function impactLoad(){
    try{
      const raw = IMPACT_STORE.getItem(IMPACT_LS_KEY);
      const d = raw ? JSON.parse(raw) : null;
      return Object.assign({
        linksCleaned: 0,
        paramsRemoved: 0,
        utmRemoved: 0,
        adIdsRemoved: 0,
        lastUpdatedISO: ""
      }, d || {});
    }catch(e){
      return { linksCleaned:0, paramsRemoved:0, utmRemoved:0, adIdsRemoved:0, lastUpdatedISO:"" };
    }
  }

  function impactSave(state){
    try{ IMPACT_STORE.setItem(IMPACT_LS_KEY, JSON.stringify(state)); }catch(e){}
  }

  function seenLoad(){
    try{
      const raw = IMPACT_STORE.getItem(IMPACT_SEEN_KEY);
      const d = raw ? JSON.parse(raw) : null;
      return (d && Array.isArray(d.hashes)) ? d : { hashes: [] };
    }catch(e){
      return { hashes: [] };
    }
  }

  function seenSave(s){
    try{ IMPACT_STORE.setItem(IMPACT_SEEN_KEY, JSON.stringify(s)); }catch(e){}
  }

  function impactFormat(n){
    try{ return new Intl.NumberFormat(LOCALE).format(n); }catch(e){ return String(n); }
  }

  function impactSetText(id, text){
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function impactSetVisible(id, visible){
    const el = document.getElementById(id);
    if (el) el.hidden = !visible;
  }

  function impactUpdateUI(state, removedKeys){
    impactSetText("ssImpactLinks", impactFormat(state.linksCleaned));
    impactSetText("ssImpactParams", impactFormat(state.paramsRemoved));
    impactSetText("ssImpactUTM", impactFormat(state.utmRemoved));
    impactSetText("ssImpactAdIds", impactFormat(state.adIdsRemoved));
    impactSetText("ssImpactUpdated", state.lastUpdatedISO ? new Date(state.lastUpdatedISO).toLocaleString(LOCALE) : "—");

    if (Array.isArray(removedKeys) && removedKeys.length){
      const keys = removedKeys.map(k => String(k || "").trim()).filter(Boolean);
      const removedCount = keys.length;
      const utm = keys.filter(k => k.toLowerCase().startsWith("utm_")).length;
      const ad = keys.filter(k => AD_ID_KEYS.has(k.toLowerCase())).length;

      const line = LANG.startsWith('en')
        ? `Removed: ${removedCount} parameters (${ad} ad IDs), including ${utm} UTM`
        : `Entfernt: ${removedCount} Parameter (${ad} Ad-IDs), davon ${utm} UTM`;

      impactSetText("ssImpactLastLine", line);
      impactSetVisible("ssImpactLastLineWrap", true);
    } else {
      impactSetVisible("ssImpactLastLineWrap", false);
    }
  }

  async function impactMaybeAdd(cleanedUrl, removedKeys){
    const keys = Array.isArray(removedKeys) ? removedKeys.map(k => String(k||"").trim()).filter(Boolean) : [];
    if (keys.length === 0) return;

    const h = await sha256Hex(String(cleanedUrl || ""));
    const seen = seenLoad();
    if (seen.hashes.includes(h)) return;

    seen.hashes.push(h);
    if (seen.hashes.length > 200) seen.hashes = seen.hashes.slice(-200);
    seenSave(seen);

    const state = impactLoad();
    state.linksCleaned += 1;
    state.paramsRemoved += keys.length;
    state.utmRemoved += keys.filter(k => k.toLowerCase().startsWith("utm_")).length;
    state.adIdsRemoved += keys.filter(k => AD_ID_KEYS.has(k.toLowerCase())).length;
    state.lastUpdatedISO = new Date().toISOString();

    impactSave(state);

    if (impactCard) impactCard.hidden = false;
    impactUpdateUI(state, keys);
  }

  function impactReset(){
    const state = { linksCleaned:0, paramsRemoved:0, utmRemoved:0, adIdsRemoved:0, lastUpdatedISO:"" };
    try{ IMPACT_STORE.removeItem(IMPACT_LS_KEY); }catch(e){}
    try{ IMPACT_STORE.removeItem(IMPACT_SEEN_KEY); }catch(e){}
    impactUpdateUI(state, []);
    if (impactCard) impactCard.hidden = true;
  }

  function impactInit(){
    const state = impactLoad();
    impactUpdateUI(state, []);
    if (impactResetBtn) impactResetBtn.addEventListener("click", impactReset);

    if (impactCard){
      const hasAny = (state.linksCleaned || state.paramsRemoved || state.adIdsRemoved || state.utmRemoved);
      impactCard.hidden = !hasAny;
    }
  }

  // ---- Main action ----
  async function doClean(){
    showMsg('', '');
    if (resultCard) resultCard.hidden = true;

    try{
      const res = cleanUrl(input ? input.value : '');
      renderResult(res);

      await impactMaybeAdd(res.cleaned, res.removed);

      setTimeout(()=>{
        const rc = document.getElementById('resultCard');
        if (rc) rc.scrollIntoView({behavior:'smooth', block:'start'});
      }, 40);
    }catch(e){
      showMsg('warn', e.message || STR.cleanError);
    }
  }

  // ---- Wire UI ----
  if (input){
    input.addEventListener('input', ()=>{
      if (resultCard) resultCard.hidden = true;
      showMsg('', '');
    });
  }
  if (btnClean) btnClean.addEventListener('click', doClean);

  if (btnClear){
    btnClear.addEventListener('click', ()=>{
      if (input) input.value = '';
      if (resultCard) resultCard.hidden = true;
      showMsg('', '');
      if (input) input.focus();
    });
  }

  if (btnPaste){
    btnPaste.addEventListener('click', async ()=>{
      showMsg('', '');
      try{
        if (navigator.clipboard && navigator.clipboard.readText){
          const t = await navigator.clipboard.readText();
          if (t && t.trim()){
            if (input) input.value = t.trim();
            if (input) input.focus();
            // optional: auto clean after paste (keeps UX fast; impact is deduped)
            doClean();
            return;
          }
        }
        showMsg('note', STR.pasteHint);
        if (input) input.focus();
      }catch(e){
        showMsg('note', STR.pasteHint);
        if (input) input.focus();
      }
    });
  }

  if (btnCopy){
    btnCopy.addEventListener('click', async ()=>{
      const text = (outUrl && outUrl.textContent ? outUrl.textContent : '').trim();
      if(!text) return;
      await copyText(text);
      const old = btnCopy.textContent;
      btnCopy.textContent = STR.copied;
      setTimeout(()=>btnCopy.textContent=old, 1200);
    });
  }

  if (btnShare){
    btnShare.addEventListener('click', async ()=>{
      const text = (outUrl && outUrl.textContent ? outUrl.textContent : '').trim();
      if(!text) return;

      if (navigator.share){
        try{
          await navigator.share({ url: text });
          return;
        }catch(e){}
      }
      await copyText(text);
      showMsg('note', STR.shareFallback);
    });
  }

  // Optional: Prefill via ?u=...&run=1
  (function(){
    const sp = new URLSearchParams(location.search);
    const u = sp.get('u');
    const run = sp.get('run');
    if (u && input){
      try{ input.value = decodeURIComponent(u); }
      catch(e){ input.value = u; }
    }
    if (u && run === '1'){
      setTimeout(doClean, 120);
    }
  })();

  // Init
  impactInit();
})();

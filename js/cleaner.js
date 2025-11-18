/* cleaner.js – gemeinsame Reinigungs-/Unwrap-Logik (ohne DOM) */
(function (global) {
  "use strict";

  function isHttp(s){ return typeof s === 'string' && /^https?:\/\//i.test(s); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function decodeLoop(s){
    if (typeof s !== 'string') return s;
    let prev = s, cur = s;
    for (let i=0;i<5;i++){
      try{ cur = decodeURIComponent(prev.replace(/\+/g,'%20')); }catch{ cur = prev; }
      if (cur === prev) break;
      prev = cur;
    }
    return cur.replace(/^['"]|['"]$/g,'');
  }

  function unwrapOne(u){
    const host = u.hostname.replace(/^www\./,'').toLowerCase();
    const path = u.pathname || '/';

    if ((host === 'google.com' || host.endsWith('.google.com')) && path === '/url') {
      const tgt = u.searchParams.get('q') || u.searchParams.get('url') || u.searchParams.get('qurl');
      const t = decodeLoop(tgt);
      if (isHttp(t)) return { from: u.toString(), to: t, via: 'google:url' };
    }
    if (host.endsWith('facebook.com') || host === 'l.facebook.com' || host === 'lm.facebook.com') {
      const tgt = u.searchParams.get('u') || u.searchParams.get('l') || u.searchParams.get('href');
      const t = decodeLoop(tgt);
      if (isHttp(t)) return { from: u.toString(), to: t, via: 'facebook:linkshim' };
    }
    if (host === 'out.reddit.com') {
      const t = decodeLoop(u.searchParams.get('url'));
      if (isHttp(t)) return { from: u.toString(), to: t, via: 'reddit:out' };
    }
    for (const [,v] of u.searchParams) {
      const t = decodeLoop(v);
      if (isHttp(t)) return { from: u.toString(), to: t, via: 'generic:param' };
    }
    const fullDec = decodeLoop(u.toString());
    const m = fullDec.match(/https?:\/\/[^\s"'<>]+/i);
    if (m && isHttp(m[0]) && m[0] !== u.toString()) {
      return { from: u.toString(), to: m[0], via: 'generic:embedded' };
    }
    return null;
  }

  function stripTracking(u){
    const info = { removed:[], kept:[], normalized:'', urlObj: u };
    try{
      const allowRaw = localStorage.getItem('ss2_allow') || '';
      const allow = new Set(allowRaw.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean));

      const toRemove = [];
      for (const [k] of u.searchParams) {
        const key = k.toLowerCase();
        const rm =
          key.startsWith('utm_') ||
          key === 'gclid' || key === 'fbclid' || key === 'yclid' ||
          key === 'mc_eid' || key === 'mc_cid' || key === 'mkt_tok' ||
          key === 'igshid' || key === 'spm' ||
          key === 'vero_conv' || key === 'vero_id' || key === 'vero_campaign' ||
          key === 'ref' || key === 'ref_src' || key === 'ref_url';
        if (rm && !allow.has(key)) toRemove.push(k);
      }
      toRemove.forEach(k=>{ info.removed.push(k); u.searchParams.delete(k); });

      for (const [k,v] of Array.from(u.searchParams.entries())) {
        const kl = k.toLowerCase();
        if (v === '' && !allow.has(kl)) { u.searchParams.delete(k); info.removed.push(k); }
      }
      if ((u.protocol==='http:' && u.port==='80') || (u.protocol==='https:' && u.port==='443')) { u.port=''; info.normalized='Standard-Port entfernt'; }
      if (u.pathname === '') u.pathname = '/';

      info.kept = allow.size ? Array.from(allow) : [];
    }catch{}
    return info;
  }

  const Cleaner = {
    cleanUrl(input, {doStrip=true} = {}){
      let url = String(input||'').trim();
      const info = { url:'', removed:[], kept:[], normalized:'', unwrapped:null };
      if (!url) return info;

      if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url)) url = 'https://' + url;

      let u; try { u = new URL(url); } catch { return { ...info, url: String(input) }; }

      // bis zu 10x unwrap
      for (let i=0;i<10;i++){
        const step = unwrapOne(u);
        if (!step) break;
        info.unwrapped = step;
        u = new URL(step.to);
      }

      if (doStrip){
        const st = stripTracking(u);
        info.removed = st.removed; info.kept = st.kept; info.normalized = st.normalized;
        u = st.urlObj;
      }
      info.url = u.toString();
      return info;
    },
    escapeHtml, decodeLoop, unwrapOne, stripTracking
  };

  global.Cleaner = Cleaner;
})(window);

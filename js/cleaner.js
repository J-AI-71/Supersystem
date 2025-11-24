/* /js/cleaner.js
   SafeShare – Kernlogik: Redirects entpacken + Tracking-Params entfernen
   CSP-kompatibel (keine Inline-Exec), keine externen Requests
*/
'use strict';

(function () {

  const VERSION = '1.7.0';
  const LS_KEYS = {
    PRO: 'ss_pro',                // {active:true, plan:'personal'|'team'}
    WHITELIST: 'ss_team_whitelist'// CSV: "tag,ref,partner,aff_id"
  };

  // --- Public API container -------------------------------------------------
  const SafeShare = {
    VERSION,
    // Status / Storage
    isPro() { try { return !!(JSON.parse(localStorage.getItem(LS_KEYS.PRO) || 'null')?.active); } catch { return false; } },
    getPlan() { try { return (JSON.parse(localStorage.getItem(LS_KEYS.PRO) || 'null')?.plan) || null; } catch { return null; } },
    setPro(plan = 'personal') { localStorage.setItem(LS_KEYS.PRO, JSON.stringify({ active: true, plan: String(plan) })); },
    clearPro() { localStorage.removeItem(LS_KEYS.PRO); },

    loadWhitelist() {
      const raw = (localStorage.getItem(LS_KEYS.WHITELIST) || '').trim();
      return new Set(raw ? raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : []);
    },
    saveWhitelist(listLike) {
      const arr = Array.from(listLike || []);
      localStorage.setItem(LS_KEYS.WHITELIST, arr.join(','));
    },

    // Core
    cleanURL,
    unwrapRedirect,
    analyze,
    bulkClean(list) { return list.map(url => cleanURL(url).url); }
  };

  // --- Tracking-Parameter Heuristics ---------------------------------------
  const EXACT = new Set([
    'fbclid','gclid','dclid','gbraid','wbraid','yclid','twclid','msclkid','mc_eid','mc_cid',
    'igshid','si','spm','zanpid','vero_id','oly_anon_id','oly_enc_id','wickedid',
    'sc_campaign','sc_channel','sc_content','sc_medium','sc_outcome','sc_geo',
    'utm_id' // wird i. d. R. wie utm_* behandelt
  ]);

  const PREFIXES = ['utm_', 'pk_', 'oly_', 'vero_', 'ga_']; // Matomo/Google/Marketo u. a.

  const REDIRECT_PARAM_CANDIDATES = [
    'url','q','u','to','target','dest','destination','redir','redirect','redirect_url',
    'redirect_uri','forward','link','r'
  ];

  const REDIRECT_HOST_RULES = [
    // [hostTest, pathPrefixTest(optional)]
    [(h) => /(^|\.)google\./i.test(h), (p) => p === '/url' || p.startsWith('/interstitial')],
    [(h) => /^l\.facebook\.com$/i.test(h), (p) => p === '/l.php'],
    [(h) => /^lm\.facebook\.com$/i.test(h), null],
    [(h) => /^t\.co$/i.test(h), null],
    [(h) => /(^|\.)x\.com$/i.test(h), (p) => p.startsWith('/i/redirect')],
    [(h) => /^out\.reddit\.com$/i.test(h), null],
    [(h) => /^lnkd\.in$/i.test(h), null],
    [(h) => /^mail\.google\.com$/i.test(h), (p) => p.startsWith('/mail/u/') && p.includes('/?extsrc=')],
    [(h) => /(^|\.)youtube\.com$/i.test(h), (p) => p === '/redirect']
  ];

  function isTrackingKey(key) {
    const k = (key || '').toLowerCase();
    if (EXACT.has(k)) return true;
    for (const pref of PREFIXES) if (k.startsWith(pref)) return true;
    // häufige „ref“-Varianten nur entfernen, wenn NICHT whitelisted
    if (k === 'ref_src' || k === 'ref_url' || k === 'referrer') return true;
    return false;
  }

  // --- URL Helfer -----------------------------------------------------------
  function safeURL(input) {
    try {
      // Akzeptiert auch relative URLs, falls Nutzer z. B. nur Pfade einfügt
      return new URL(input, location.href);
    } catch {
      return null;
    }
  }

  function stripParams(urlObj, whitelistSet, removedKeys) {
    const params = urlObj.searchParams;
    // Query
    for (const [k] of Array.from(params.entries())) {
      const key = k.toLowerCase();
      const isWhite = whitelistSet.has(key);
      if (!isWhite && isTrackingKey(key)) {
        removedKeys.add(key);
        params.delete(k);
      }
      // Generische Partner-Schlüssel bleiben erhalten, wenn whitelisted
      if (!isWhite && (key === 'ref' || key === 'tag')) {
        removedKeys.add(key);
        params.delete(k);
      }
    }
    // Hash-Query (#…?a=b)
    if (urlObj.hash && urlObj.hash.includes('?')) {
      const [hashPath, hashQuery] = urlObj.hash.split('?', 2);
      const hp = new URLSearchParams(hashQuery || '');
      let changed = false;
      for (const [k] of Array.from(hp.entries())) {
        const key = k.toLowerCase();
        const isWhite = whitelistSet.has(key);
        if (!isWhite && (isTrackingKey(key) || key === 'ref' || key === 'tag')) {
          removedKeys.add(key);
          hp.delete(k);
          changed = true;
        }
      }
      if (changed) {
        const qs = hp.toString();
        urlObj.hash = qs ? `${hashPath}?${qs}` : hashPath;
      }
    }
  }

  function unwrapOnce(urlObj) {
    const host = urlObj.hostname;
    const path = urlObj.pathname;
    let hostMatch = false;

    for (const [hTest, pTest] of REDIRECT_HOST_RULES) {
      if (hTest(host) && (!pTest || pTest(path))) { hostMatch = true; break; }
    }
    if (!hostMatch) return null;

    // Kandidaten durchprobieren
    for (const key of REDIRECT_PARAM_CANDIDATES) {
      const val = urlObj.searchParams.get(key);
      if (val) {
        const target = safeURL(val);
        if (target && target.origin) return target;
        try {
          const decoded = decodeURIComponent(val);
          const t2 = safeURL(decoded);
          if (t2 && t2.origin) return t2;
        } catch {}
      }
    }
    return null;
  }

  // --- Hauptoperationen -----------------------------------------------------
  function unwrapRedirect(inputURL, maxHops = 3) {
    let u = typeof inputURL === 'string' ? safeURL(inputURL) : inputURL;
    if (!u) return { url: inputURL, unwrapped: false, hops: 0 };

    let hops = 0;
    let changed = false;
    while (hops < maxHops) {
      const next = unwrapOnce(u);
      if (!next) break;
      u = next;
      hops++;
      changed = true;
    }
    return { url: u.toString(), unwrapped: changed, hops };
  }

  function cleanURL(input, options = {}) {
    const { keepWhitelist = true, unwrap = true } = options;
    const removed = new Set();

    let u0 = typeof input === 'string' ? safeURL(input) : input;
    if (!u0) return { url: input, removed: [], unwrapped: false, changed: false };

    // optional: Redirect-Ketten entpacken
    let unwrappedInfo = { url: u0.toString(), unwrapped: false, hops: 0 };
    if (unwrap) unwrappedInfo = unwrapRedirect(u0);
    let u = safeURL(unwrappedInfo.url) || u0;

    // Whitelist laden
    const wl = keepWhitelist ? SafeShare.loadWhitelist() : new Set();

    // Parameter entfernen
    const before = u.toString();
    stripParams(u, wl, removed);
    const after = u.toString();

    return {
      url: after,
      removed: Array.from(removed.values()).sort(),
      unwrapped: unwrappedInfo.unwrapped,
      hops: unwrappedInfo.hops,
      changed: before !== after || unwrappedInfo.unwrapped
    };
  }

  function analyze(input) {
    const u = safeURL(input);
    if (!u) return { ok: false, reason: 'invalid_url' };
    const wl = SafeShare.loadWhitelist();
    const present = [];
    for (const [k, v] of u.searchParams.entries()) {
      const key = k.toLowerCase();
      present.push({
        key: k,
        value: v,
        tracking: isTrackingKey(key),
        whitelisted: wl.has(key) || (key === 'ref' || key === 'tag') && wl.has(key)
      });
    }
    return { ok: true, url: u.toString(), params: present };
  }

  // Expose
  window.SafeShare = SafeShare;
})();

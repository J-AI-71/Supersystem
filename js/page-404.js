/* js/page-404.js – SafeShare 404-Hilfen (Quicklinks, Vorschläge, Auto-Fix) */
(() => {
  const BASE = '/Supersystem/';

  /* ---- Seiteninventar (für Quicklinks & Vorschläge) ---- */
  const PAGES = [
    { path: 'index.html',                   title: 'Startseite',                tags: ['start','home','root'] },
    { path: 'app.html',                     title: 'App',                       tags: ['app','clean','säubern'] },
    { path: 'bookmarklets.html',            title: 'Bookmarklet',               tags: ['bookmarklet','bookmark','lesezeichen'] },
    { path: 'bulk-clean.html',              title: 'Bulk-Clean',                tags: ['bulk','batch','liste','csv'] },
    { path: 'team-setup.html',              title: 'Team-Setup',                tags: ['team','whitelist','publisher-modus'] },
    { path: 'redirect-entschachteln.html',  title: 'Redirect entschachteln',    tags: ['redirect','entschachteln','entpacken'] },
    { path: 'help.html',                    title: 'Hilfe',                     tags: ['hilfe','faq','support','anleitung'] },
    { path: 'quickstart.html',              title: 'Quickstart',                tags: ['quickstart','qr','pdf'] },
    { path: 'publisher.html',               title: 'Publisher',                 tags: ['publisher','affiliate','blogger','deal'] },
    { path: 'education.html',               title: 'Education',                 tags: ['bildung','schule','ngo','hochschule'] },
    { path: 'partners.html',                title: 'Partner (B2B)',             tags: ['partner','unternehmen','b2b'] },
    { path: 'compliance.html',              title: 'Compliance',                tags: ['compliance','richtlinien','it'] },
    { path: 'tests.html',                   title: 'Tests',                     tags: ['tests','suite','probe'] },
    { path: 'tools.html',                   title: 'Tools',                     tags: ['tools','werkzeuge'] },
    { path: 'pro.html',                     title: 'Pro',                       tags: ['pro','features'] },
    { path: 'press.html',                   title: 'Presse',                    tags: ['press','presse','media','kit'] },
    { path: 'impressum.html',               title: 'Impressum',                 tags: ['impressum','legal'] },
    { path: 'datenschutz.html',             title: 'Datenschutz',               tags: ['datenschutz','privacy'] },
    { path: 'status.html',                  title: 'Status',                    tags: ['status','diagnose'] },
    // Hilfsseiten (normal nicht in Sitemap, dennoch nützlich für Auto-Fix-Vorschläge):
    { path: 'pro-activate.html',            title: 'Pro aktivieren',            tags: ['activate','pro-activate'] },
    { path: 'offline.html',                 title: 'Offline',                   tags: ['offline'] },
  ];

  const QUICK = [
    'index.html','app.html','bookmarklets.html','bulk-clean.html','team-setup.html',
    'redirect-entschachteln.html','help.html','quickstart.html',
    'publisher.html','education.html','partners.html','compliance.html','press.html'
  ];

  /* ---- Alias/Heuristiken für häufige Tippfehler ---- */
  const ALIAS = new Map(Object.entries({
    '': 'index.html',
    '/': 'index.html',
    'index': 'index.html',
    'home': 'index.html',
    'start': 'index.html',

    'app': 'app.html',

    'bookmarklet': 'bookmarklets.html',
    'bookmarks': 'bookmarklets.html',
    'lesezeichen': 'bookmarklets.html',

    'bulk': 'bulk-clean.html',
    'bulkclean': 'bulk-clean.html',
    'bulk-clean': 'bulk-clean.html',

    'team': 'team-setup.html',
    'setup': 'team-setup.html',
    'publisher-modus': 'team-setup.html',

    'redirect': 'redirect-entschachteln.html',
    'entschachteln': 'redirect-entschachteln.html',
    'entpacken': 'redirect-entschachteln.html',

    'hilfe': 'help.html',
    'faq': 'help.html',

    'quickstart': 'quickstart.html',
    'qr': 'quickstart.html',

    'publisher': 'publisher.html',
    'affiliate': 'publisher.html',
    'blogger': 'publisher.html',
    'deal': 'publisher.html',
    'deals': 'publisher.html',

    'education': 'education.html',
    'schule': 'education.html',
    'hochschule': 'education.html',
    'ngo': 'education.html',
    'ngos': 'education.html',

    'partner': 'partners.html',
    'partners': 'partners.html',
    'b2b': 'partners.html',
    'unternehmen': 'partners.html',

    'compliance': 'compliance.html',
    'richtlinien': 'compliance.html',

    'presse': 'press.html',
    'press': 'press.html',

    'impressum': 'impressum.html',
    'legal': 'impressum.html',

    'datenschutz': 'datenschutz.html',
    'privacy': 'datenschutz.html',

    'status': 'status.html',
    'tests': 'tests.html',
    'tools': 'tools.html',
    'pro': 'pro.html',
  }));

  /* ---- Utilities ---- */
  const $ = (sel) => document.querySelector(sel);

  function decode(str) {
    try { return decodeURIComponent(str); } catch { return str; }
  }

  function norm(s) {
    return s.toLowerCase()
            .replace(/\+/g, ' ')
            .replace(/%20/g, ' ')
            .replace(/[_\s]+/g, '-')
            .replace(/\.html?$/,'')
            .replace(/[^a-z0-9\-]/g,'')
            .replace(/-+/g,'-')
            .replace(/^-|-$/g,'');
  }

  function levenshtein(a, b) {
    a = norm(a); b = norm(b);
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0], tmp;
      dp[0] = i;
      for (let j = 1; j <= n; j++) {
        tmp = dp[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[j] = Math.min(
          dp[j] + 1,
          dp[j - 1] + 1,
          prev + cost
        );
        prev = tmp;
      }
    }
    return dp[n];
  }

  function similarity(q, cand) {
    const qs = norm(q);
    const cs = norm(cand);
    if (!qs || !cs) return 0;

    if (qs === cs) return 1.0;
    if (cs.startsWith(qs)) return 0.92;
    if (qs.startsWith(cs)) return 0.9;
    if (cs.includes(qs)) return 0.85;

    const dist = levenshtein(qs, cs);
    const maxlen = Math.max(qs.length, cs.length);
    const sim = 1 - dist / Math.max(1, maxlen);
    return Math.max(0, sim * 0.9); // leicht dämpfen
  }

  function extractQueryFromLocation() {
    const href = String(window.location.href);
    const idx = href.indexOf(BASE);
    let tail = idx >= 0 ? href.slice(idx + BASE.length) : href;

    // Query/Hash entfernen
    tail = tail.split('#')[0].split('?')[0];

    // Häufige Störmuster
    tail = decode(tail)
      .replace(/\s+/g, '-')          // Leerzeichen
      .replace(/\/+$/, '')           // trailing slash
      .replace(/^\/+/, '')           // leading slash
      .replace(/\.htm$/i, '.html')   // .htm → .html
      .replace(/\.html\.html$/i, '.html') // doppelt
      .replace(/index\/?$/i, 'index.html')
      .replace(/^$/, 'index.html');

    return tail;
  }

  function rankCandidates(q) {
    const qslug = norm(q);
    // Direkter Alias-Treffer?
    if (ALIAS.has(qslug)) {
      const p = ALIAS.get(qslug);
      return [{ path: p, title: titleOf(p), score: 1 }];
    }

    // Score berechnen
    const ranked = PAGES.map(p => {
      let score = similarity(q, p.path);
      // Bonus: Titel/Tags
      score = Math.max(score, similarity(q, p.title));
      if (p.tags) {
        for (const t of p.tags) {
          score = Math.max(score, similarity(q, t));
        }
      }
      // Bonus wenn .html weggelassen wurde
      if (norm(p.path.replace(/\.html$/,'')) === qslug) score = Math.max(score, 0.95);
      return { ...p, score };
    }).sort((a,b) => b.score - a.score);

    return ranked;
  }

  function titleOf(path) {
    const f = PAGES.find(p => p.path === path);
    return f ? f.title : path;
  }

  function buildQuicklinks() {
    const grid = $('#quicklinks');
    if (!grid) return;
    grid.innerHTML = '';
    const list = QUICK
      .map(p => PAGES.find(x => x.path === p))
      .filter(Boolean);
    for (const p of list) {
      const a = document.createElement('a');
      a.href = p.path;
      a.className = 'btn';
      a.textContent = p.title;
      grid.appendChild(a);
    }
  }

  function showSuggestions(ranked, q) {
    const el = $('#suggest');
    if (!el) return;
    const top = ranked.filter(x => x.score >= 0.35).slice(0, 8);
    if (!top.length) {
      el.textContent = 'Keine passenden Vorschläge gefunden.';
      return;
    }
    const ul = document.createElement('ul');
    ul.className = 'tight';
    for (const p of top) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = p.path;
      a.textContent = `${p.title} (${p.path})`;
      li.appendChild(a);
      const s = document.createElement('span');
      s.className = 'mut';
      s.style.marginLeft = '6px';
      s.textContent = `· Trefferquote ${(p.score*100|0)}%`;
      li.appendChild(s);
      ul.appendChild(li);
    }
    el.innerHTML = '';
    el.appendChild(ul);
  }

  function tryAutoFix(ranked, q) {
    const info = $('#info');
    const best = ranked[0];
    if (!best) {
      if (info) info.textContent = 'Kein Treffer.';
      return;
    }
    // pragmatischer Schwellwert
    const threshold = 0.6;
    if (best.score >= threshold) {
      if (info) info.textContent = `Weiterleitung auf: ${best.title} (${best.path}) …`;
      // kurze Verzögerung für Screenreader
      setTimeout(() => { window.location.assign(BASE + best.path); }, 120);
    } else {
      if (info) info.textContent = 'Kein eindeutiger Treffer – bitte einen Vorschlag wählen.';
    }
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', () => {
    const badUrl = $('#badUrl');
    const btnFix = $('#btnTryFix');
    const info = $('#info');

    if (badUrl) badUrl.value = decode(window.location.href);
    buildQuicklinks();

    const q = extractQueryFromLocation();
    const ranked = rankCandidates(q);
    showSuggestions(ranked, q);

    if (info) {
      const best = ranked[0];
      if (best) info.textContent = `Vermuteter Treffer: ${best.title} (${best.path}) · ${(best.score*100|0)}%`;
    }

    if (btnFix) {
      btnFix.addEventListener('click', () => {
        tryAutoFix(ranked, q);
      });
    }
  });
})();

/* /js/ss-shell.js */
/* SafeShare Shell v2026-01-25-02 (EN under /en/<slug>/) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}) => {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      if (k === "text") n.textContent = String(v);
      else n.setAttribute(k, String(v));
    });
    return n;
  };

  // 1) Locale: EN if path starts with /en/ OR html[lang=en]
  const pathRaw = location.pathname || "/";
  const path = pathRaw.replace(/\/+$/, "/"); // normalize trailing slash
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.startsWith("/en/") || path.includes("/en/") || htmlLang.startsWith("en");

  // 2) Link targets (DE + EN schema: EN lives under /en/<slug>/)
  const LINKS = isEN
    ? {
        home: "/en/",
        app: "/en/app/",
        school: "/en/school/",
        pro: "/en/pro/",
        help: "/en/help/",
        privacy: "/en/privacy/",
        imprint: "/en/imprint/",
        terms: "/en/terms/",
        support: "mailto:listings@safesharepro.com",
      }
    : {
        home: "/",
        app: "/app/",
        school: "/schule/",
        pro: "/pro/",
        help: "/hilfe/",
        privacy: "/datenschutz/",
        imprint: "/impressum/",
        terms: "/nutzungsbedingungen/",
        support: "mailto:listings@safesharepro.com",
      };

  // 3) Labels
  const T = isEN
    ? {
        start: "Start",
        app: "App",
        school: "School",
        pro: "Pro",
        help: "Help",
        more: "More",
        close: "Close",
        support: "Support / Contact",
        privacy: "Privacy",
        imprint: "Imprint",
        terms: "Terms",
        langSwitch: "Deutsch",
      }
    : {
        start: "Start",
        app: "App",
        school: "Schule",
        pro: "Pro",
        help: "Hilfe",
        more: "Mehr",
        close: "Schließen",
        support: "Support / Kontakt",
        privacy: "Datenschutz",
        imprint: "Impressum",
        terms: "Nutzungsbedingungen",
        langSwitch: "English",
      };

  // 4) Brand (your real logo file)
  const BRAND_SRC = "/assets/fav/favicon.svg?v=2026-01-25-02";
  const brandMarkHTML = `
<img class="ss-brand__img"
     src="${BRAND_SRC}"
     alt=""
     width="18" height="18"
     loading="eager" decoding="async" />`.trim();

  // 5) Cross-lang mapping (for optional language switch)
  // Known primary pages
  const PAIRS = [
    { de: "/", en: "/en/", key: "home" },
    { de: "/app/", en: "/en/app/", key: "app" },
    { de: "/schule/", en: "/en/school/", key: "school" },
    { de: "/pro/", en: "/en/pro/", key: "pro" },
    { de: "/hilfe/", en: "/en/help/", key: "help" },
    { de: "/datenschutz/", en: "/en/privacy/", key: "privacy" },
    { de: "/impressum/", en: "/en/imprint/", key: "imprint" },
    { de: "/nutzungsbedingungen/", en: "/en/terms/", key: "terms" },
  ];

  function normalize(p) {
    return (p || "/").replace(/\/+$/, "/");
  }

  function getPairForCurrentPath() {
    const p = normalize(path);
    // strict match first, then startsWith for deeper subpaths
    for (const pair of PAIRS) {
      if (p === normalize(pair.de) || p === normalize(pair.en)) return pair;
    }
    for (const pair of PAIRS) {
      if (p.startsWith(normalize(pair.de)) || p.startsWith(normalize(pair.en))) return pair;
    }
    return null;
  }

  function getLangSwitchHref() {
    const pair = getPairForCurrentPath();
    if (!pair) return isEN ? "/" : "/en/";
    return isEN ? pair.de : pair.en;
  }

  // 6) Inject/ensure canonical + hreflang in <head>
  // Note: best is still to have these tags in HTML. This is a safety net so you don't forget.
  function upsertLink(selector, attrs) {
    let node = document.head.querySelector(selector);
    if (!node) {
      node = el("link", attrs);
      document.head.appendChild(node);
      return;
    }
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  }

  function ensureSeoLinks() {
    const origin = location.origin;
    const p = normalize(location.pathname);

    const pair = getPairForCurrentPath();
    const dePath = pair ? normalize(pair.de) : (isEN ? "/" : p);
    const enPath = pair ? normalize(pair.en) : (isEN ? p : "/en/");

    const canonicalPath = isEN ? enPath : dePath;

    upsertLink('link[rel="canonical"][data-ss="1"]', {
      rel: "canonical",
      href: origin + canonicalPath,
      "data-ss": "1",
    });

    upsertLink('link[rel="alternate"][hreflang="de"][data-ss="1"]', {
      rel: "alternate",
      hreflang: "de",
      href: origin + dePath,
      "data-ss": "1",
    });

    upsertLink('link[rel="alternate"][hreflang="en"][data-ss="1"]', {
      rel: "alternate",
      hreflang: "en",
      href: origin + enPath,
      "data-ss": "1",
    });

    upsertLink('link[rel="alternate"][hreflang="x-default"][data-ss="1"]', {
      rel: "alternate",
      hreflang: "x-default",
      href: origin + enPath,
      "data-ss": "1",
    });
  }

  // 7) Shell markup
  const langSwitchHref = getLangSwitchHref();

  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
    <span class="ss-brand__mark">${brandMarkHTML}</span>
    <span class="ss-brand__name">SafeShare</span>
  </a>

  <nav class="ss-nav" aria-label="Primary">
    <a class="ss-nav__link" data-ss-nav="home" href="${LINKS.home}">${T.start}</a>
    <a class="ss-nav__link" data-ss-nav="app" href="${LINKS.app}">${T.app}</a>
    <a class="ss-nav__link" data-ss-nav="school" href="${LINKS.school}">${T.school}</a>
    <a class="ss-nav__link" data-ss-nav="pro" href="${LINKS.pro}">${T.pro}</a>
    <a class="ss-nav__link" data-ss-nav="help" href="${LINKS.help}">${T.help}</a>
  </nav>

  <button class="ss-moreBtn" type="button" id="ssMoreBtn"
          aria-haspopup="dialog" aria-expanded="false" aria-controls="ssMoreOverlay">
    ${T.more}
  </button>
</header>

<div class="ss-moreOverlay" id="ssMoreOverlay" hidden>
  <div class="ss-moreBackdrop" data-ss-close></div>

  <div class="ss-moreMenu" id="ssMoreMenu" role="dialog" aria-modal="true" aria-label="${T.more}">
    <div class="ss-moreTop">
      <div class="ss-moreTitle">${T.more}</div>
      <button class="ss-moreClose" type="button" data-ss-close aria-label="${T.close}">×</button>
    </div>

    <div class="ss-moreList" role="navigation" aria-label="${T.more}">
      <a class="ss-moreLink" href="${LINKS.support}">${T.support}</a>
      <a class="ss-moreLink" href="${LINKS.privacy}">${T.privacy}</a>
      <a class="ss-moreLink" href="${LINKS.imprint}">${T.imprint}</a>
      <a class="ss-moreLink" href="${LINKS.terms}">${T.terms}</a>

      <!-- optional language link -->
      <a class="ss-moreLink ss-moreLink--lang" href="${langSwitchHref}">${T.langSwitch}</a>
    </div>
  </div>
</div>
`.trim();

  // 8) Mount
  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // 9) Active state
  function setActive() {
    const p = normalize(location.pathname);

    const map = [
      { key: "home", match: [LINKS.home] },
      { key: "app", match: [LINKS.app] },
      { key: "school", match: [LINKS.school] },
      { key: "pro", match: [LINKS.pro] },
      { key: "help", match: [LINKS.help] },
    ];

    let activeKey = "home";
    for (const item of map) {
      if (item.match.some((m) => p.startsWith(normalize(m)))) activeKey = item.key;
    }

    document.querySelectorAll("[data-ss-nav]").forEach((a) => {
      const on = a.getAttribute("data-ss-nav") === activeKey;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  setActive();

  // 10) More menu open/close (and force safe initial state to avoid blur)
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");

  // hard reset (prevents "blurred page" if something got stuck)
  if (overlay) overlay.hidden = true;
  if (btn) btn.setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("ss-noScroll");

  function openMenu() {
    if (!overlay || !btn) return;
    overlay.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("ss-noScroll");
    const closeBtn = overlay.querySelector("[data-ss-close].ss-moreClose") || overlay.querySelector(".ss-moreClose");
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    if (!overlay || !btn) return;
    overlay.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("ss-noScroll");
    btn.focus();
  }

  if (btn && overlay) {
    btn.addEventListener("click", () => (overlay.hidden ? openMenu() : closeMenu()));

    overlay.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.closest && t.closest("[data-ss-close]")) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay && !overlay.hidden) closeMenu();
    });

    // close when clicking a link in the menu
    overlay.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closeMenu());
    });
  }

  // 11) SEO safety net
  ensureSeoLinks();
})();

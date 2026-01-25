/*! SafeShare Shell v2026-01-25-01 (Schema B: EN under /en/<slug>/) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // --- Language detection: EN if path starts with /en or html[lang] starts with en
  const path = (location.pathname || "/");
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path === "/en/" || path.startsWith("/en/") || htmlLang.startsWith("en");

  // --- Route map (DE base slugs)
  const DE = {
    home: "/",
    app: "/app/",
    school: "/schule/",
    pro: "/pro/",
    help: "/hilfe/",
    privacy: "/datenschutz/",
    imprint: "/impressum/",
    terms: "/nutzungsbedingungen/",
  };

  // --- EN schema: /en/<slug>/
  const EN = {
    home: "/en/",
    app: "/en/app/",
    school: "/en/school/",
    pro: "/en/pro/",
    help: "/en/help/",
    privacy: "/en/privacy/",
    imprint: "/en/imprint/",
    terms: "/en/terms/",
  };

  const LINKS = isEN ? EN : DE;

  // --- Optional UI language switch (in More menu)
  // Map current page to its opposite language URL
  function getLangSwitchHref() {
    const p = normalizePath(path);

    // EN -> DE
    if (isEN) {
      if (p === normalizePath(EN.home)) return DE.home;
      if (p.startsWith(normalizePath(EN.app))) return DE.app;
      if (p.startsWith(normalizePath(EN.school))) return DE.school;
      if (p.startsWith(normalizePath(EN.pro))) return DE.pro;
      if (p.startsWith(normalizePath(EN.help))) return DE.help;
      if (p.startsWith(normalizePath(EN.privacy))) return DE.privacy;
      if (p.startsWith(normalizePath(EN.imprint))) return DE.imprint;
      if (p.startsWith(normalizePath(EN.terms))) return DE.terms;
      return DE.home;
    }

    // DE -> EN
    if (p === normalizePath(DE.home)) return EN.home;
    if (p.startsWith(normalizePath(DE.app))) return EN.app;
    if (p.startsWith(normalizePath(DE.school))) return EN.school;
    if (p.startsWith(normalizePath(DE.pro))) return EN.pro;
    if (p.startsWith(normalizePath(DE.help))) return EN.help;
    if (p.startsWith(normalizePath(DE.privacy))) return EN.privacy;
    if (p.startsWith(normalizePath(DE.imprint))) return EN.imprint;
    if (p.startsWith(normalizePath(DE.terms))) return EN.terms;
    return EN.home;
  }

  const SUPPORT_MAIL = "listings@safesharepro.com"; // korrekt (dein Listing/Support-Kontakt)

  const T = isEN
    ? {
        start: "Home",
        app: "App",
        school: "School",
        pro: "Pro",
        help: "Help",
        more: "More",
        support: "Support",
        privacy: "Privacy",
        imprint: "Imprint",
        terms: "Terms",
        close: "Close",
        lang: "Deutsch",
      }
    : {
        start: "Start",
        app: "App",
        school: "Schule",
        pro: "Pro",
        help: "Hilfe",
        more: "Mehr",
        support: "Support",
        privacy: "Datenschutz",
        imprint: "Impressum",
        terms: "Nutzungsbedingungen",
        close: "Schließen",
        lang: "English",
      };

  // --- Inline mark (no emoji, no external file)
  const markSVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M12 2.6c3.1 2.6 6.3 3.3 8.4 3.6v7.1c0 5.2-3.6 9-8.4 10.9C7.2 22.3 3.6 18.5 3.6 13.3V6.2C5.7 5.9 8.9 5.2 12 2.6Z"
        stroke="currentColor" stroke-width="1.6" opacity=".95"/>
  <path d="M8.4 12.2l2.3 2.4 4.9-5.1"
        stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
</svg>`.trim();

  const closeSVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>`.trim();

  function normalizePath(p) {
    return String(p || "/").replace(/\/+$/, "/");
  }

  // --- Build shell
  const langSwitchHref = getLangSwitchHref();

  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
    <span class="ss-brand__mark">${markSVG}</span>
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
      <button class="ss-moreClose" type="button" data-ss-close aria-label="${T.close}">
        ${closeSVG}
      </button>
    </div>

    <div class="ss-moreList" role="navigation" aria-label="${T.more}">
      <a class="ss-moreLink" href="mailto:${SUPPORT_MAIL}">${T.support}</a>
      <a class="ss-moreLink" href="${LINKS.privacy}">${T.privacy}</a>
      <a class="ss-moreLink" href="${LINKS.imprint}">${T.imprint}</a>
      <a class="ss-moreLink" href="${LINKS.terms}">${T.terms}</a>
      <a class="ss-moreLink" href="${langSwitchHref}" rel="alternate" hreflang="${isEN ? "de" : "en"}">${T.lang}</a>
    </div>
  </div>
</div>
`.trim();

  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // --- Active state
  function setActive() {
    const p = normalizePath(location.pathname || "/");
    const map = [
      { key: "home", match: [normalizePath(LINKS.home)] },
      { key: "app", match: [normalizePath(LINKS.app)] },
      { key: "school", match: [normalizePath(LINKS.school)] },
      { key: "pro", match: [normalizePath(LINKS.pro)] },
      { key: "help", match: [normalizePath(LINKS.help)] },
    ];

    let activeKey = "home";
    for (const item of map) {
      if (item.match.some((m) => p.startsWith(m))) activeKey = item.key;
    }

    document.querySelectorAll("[data-ss-nav]").forEach((a) => {
      const isActive = a.getAttribute("data-ss-nav") === activeKey;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  setActive();

  // --- Menu open/close (robust, incl. Safari bfcache)
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");

  function hardClose(silent) {
    if (overlay) overlay.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("ss-noScroll");
    if (!silent && btn) btn.focus();
  }

  function openMenu() {
    if (!overlay || !btn) return;
    overlay.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("ss-noScroll");
    const closeBtn = overlay.querySelector(".ss-moreClose");
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu(silent) {
    hardClose(!!silent);
  }

  // Force closed on init (prevents “blur stays”)
  hardClose(true);

  if (btn && overlay) {
    btn.addEventListener("click", () => {
      if (overlay.hidden) openMenu();
      else closeMenu(false);
    });

    overlay.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.closest && t.closest("[data-ss-close]")) closeMenu(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay && !overlay.hidden) closeMenu(false);
    });

    // Safari back/forward cache: ensure closed when returning to page
    window.addEventListener("pageshow", () => closeMenu(true));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") closeMenu(true);
    });
  }
})();

/*! SafeShare Shell v2026-01-25-02
    - Schema A: EN under /en/<slug>/
    - injects header/nav/more into #ss-shell
    - sets active tab
    - optional language switch link in More menu (auto sister URL)
    - NOTE: hreflang tags are NOT injectable via JS (must be in <head> per page)
*/
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ====== CONFIG ======
  // Turn language link in "More" menu on/off
  const ENABLE_LANG_LINK = true;

  // Support/contact
  const SUPPORT_EMAIL = "listings@safesharepro.com";

  // ====== 1) Locale detection ======
  const path = location.pathname || "/";
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.startsWith("/en/") || path.includes("/en/") || htmlLang.startsWith("en");

  // ====== 2) Link targets (Schema A) ======
  // DE slugs: /hilfe/ /schule/ /pro/ /datenschutz/ /impressum/ /nutzungsbedingungen/
  // EN slugs: /en/help/ /en/school/ /en/pro/ /en/privacy/ /en/imprint/ /en/terms/
  const LINKS = isEN
    ? {
        home: "/en/",
        app: "/en/app/",
        school: "/en/school/",
        pro: "/en/pro/",
        help: "/en/help/",
        support: `mailto:${SUPPORT_EMAIL}`,
        privacy: "/en/privacy/",
        imprint: "/en/imprint/",
        terms: "/en/terms/",
      }
    : {
        home: "/",
        app: "/app/",
        school: "/schule/",
        pro: "/pro/",
        help: "/hilfe/",
        support: `mailto:${SUPPORT_EMAIL}`,
        privacy: "/datenschutz/",
        imprint: "/impressum/",
        terms: "/nutzungsbedingungen/",
      };

  // ====== 3) Texts ======
  const T = isEN
    ? {
        start: "Start",
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
        langSwitch: "Deutsch",
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
        langSwitch: "English",
      };

  // ====== 4) Brand mark (inline SVG, no emoji, no external file) ======
  const markSVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
  <path d="M12 2.6c3.1 2.6 6.3 3.3 8.4 3.6v7.1c0 5.2-3.6 9-8.4 10.9C7.2 22.3 3.6 18.5 3.6 13.3V6.2C5.7 5.9 8.9 5.2 12 2.6Z" stroke="currentColor" stroke-width="1.6" opacity=".95"/>
  <path d="M8.4 12.2l2.3 2.4 4.9-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
</svg>`.trim();

  // ====== 5) Sister URL (for optional language link) ======
  function normalizeSlash(p) {
    return (p || "/").replace(/\/+$/, "/").replace(/^([^/])/, "/$1");
  }

  // Mapping between DE and EN pages
  const MAP_DE_TO_EN = {
    "/": "/en/",
    "/app/": "/en/app/",
    "/hilfe/": "/en/help/",
    "/schule/": "/en/school/",
    "/pro/": "/en/pro/",
    "/datenschutz/": "/en/privacy/",
    "/impressum/": "/en/imprint/",
    "/nutzungsbedingungen/": "/en/terms/",
  };

  const MAP_EN_TO_DE = {
    "/en/": "/",
    "/en/app/": "/app/",
    "/en/help/": "/hilfe/",
    "/en/school/": "/schule/",
    "/en/pro/": "/pro/",
    "/en/privacy/": "/datenschutz/",
    "/en/imprint/": "/impressum/",
    "/en/terms/": "/nutzungsbedingungen/",
  };

  function sisterUrl() {
    const p = normalizeSlash(location.pathname || "/");
    if (isEN) return MAP_EN_TO_DE[p] || "/"; // fallback to DE home
    return MAP_DE_TO_EN[p] || "/en/";        // fallback to EN home
  }

  // ====== 6) Shell markup ======
  function buildShellHTML() {
    const langLinkHTML = ENABLE_LANG_LINK
      ? `<a class="ss-moreLink" href="${sisterUrl()}">${T.langSwitch}</a>`
      : "";

    return `
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
          aria-haspopup="dialog" aria-expanded="false" aria-controls="ssMoreMenu">
    ${T.more}
  </button>
</header>

<div class="ss-moreOverlay" id="ssMoreOverlay" hidden>
  <div class="ss-moreBackdrop" data-ss-close></div>

  <div class="ss-moreMenu" id="ssMoreMenu" role="dialog" aria-modal="true" aria-label="${T.more}">
    <div class="ss-moreTop">
      <div class="ss-moreTitle">${T.more}</div>
      <button class="ss-moreClose" type="button" data-ss-close aria-label="${T.close}">✕</button>
    </div>

    <div class="ss-moreList" role="navigation" aria-label="${T.more}">
      ${langLinkHTML}
      <a class="ss-moreLink" href="${LINKS.support}">${T.support}</a>
      <a class="ss-moreLink" href="${LINKS.privacy}">${T.privacy}</a>
      <a class="ss-moreLink" href="${LINKS.imprint}">${T.imprint}</a>
      <a class="ss-moreLink" href="${LINKS.terms}">${T.terms}</a>
    </div>
  </div>
</div>
    `.trim();
  }

  // ====== 7) Mount ======
  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = buildShellHTML();

  // ====== 8) Active tab ======
  function setActive() {
    const p = normalizeSlash(location.pathname || "/");

    const map = [
      { key: "home", match: [LINKS.home] },
      { key: "app", match: [LINKS.app] },
      { key: "school", match: [LINKS.school] },
      { key: "pro", match: [LINKS.pro] },
      { key: "help", match: [LINKS.help] },
    ];

    let activeKey = "home";
    for (const item of map) {
      if (item.match.some((m) => p.startsWith(normalizeSlash(m)))) activeKey = item.key;
    }

    $$("[data-ss-nav]").forEach((a) => {
      const isActive = a.getAttribute("data-ss-nav") === activeKey;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  setActive();

  // ====== 9) More menu open/close ======
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");

  function forceClosedState() {
    if (overlay) overlay.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("ss-noScroll");
  }

  function openMenu() {
    if (!overlay || !btn) return;
    overlay.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("ss-noScroll");
    const closeBtn = overlay.querySelector(".ss-moreClose");
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    if (!overlay || !btn) return;
    overlay.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("ss-noScroll");
    btn.focus();
  }

  // Ensure clean state on load (prevents "stuck blurred" if something cached weirdly)
  forceClosedState();

  if (btn && overlay) {
    btn.addEventListener("click", () => {
      if (overlay.hidden) openMenu();
      else closeMenu();
    });

    overlay.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.closest && t.closest("[data-ss-close]")) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay && !overlay.hidden) closeMenu();
    });

    // If tab becomes visible again, guarantee menu is closed (iOS Safari oddities)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") forceClosedState();
    });
  }
})();

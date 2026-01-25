/*! SafeShare Shell v2026-01-25-02 (EN under /en/<slug>/) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // Locale: EN if path starts with /en/ OR html lang="en"
  const path = location.pathname || "/";
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.startsWith("/en/") || htmlLang.startsWith("en");

  // Links (Schema: /en/<slug>/)
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
        langSwitch: "/", // Deutsch
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
        langSwitch: "/en/", // English
      };

  // Labels
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

  // Logo (PNG)
  const LOGO_SRC = "/assets/brand/logo-glyph-mint-512.png";

  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
    <img class="ss-brand__logo" src="${LOGO_SRC}" alt="" width="22" height="22" decoding="async" />
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
      <a class="ss-moreLink" href="${LINKS.support}">${T.support}</a>
      <a class="ss-moreLink" href="${LINKS.privacy}">${T.privacy}</a>
      <a class="ss-moreLink" href="${LINKS.imprint}">${T.imprint}</a>
      <a class="ss-moreLink" href="${LINKS.terms}">${T.terms}</a>
      <a class="ss-moreLink" href="${LINKS.langSwitch}">${T.lang}</a>
    </div>
  </div>
</div>
  `.trim();

  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // Safety reset (prevents "stuck blur/overlay")
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");
  if (overlay) overlay.hidden = true;
  if (btn) btn.setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("ss-noScroll");

  // Active state
  function setActive() {
    const p = (location.pathname || "/").replace(/\/+$/, "/");
    const map = [
      { key: "home", match: [LINKS.home] },
      { key: "app", match: [LINKS.app] },
      { key: "school", match: [LINKS.school] },
      { key: "pro", match: [LINKS.pro] },
      { key: "help", match: [LINKS.help] },
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

  // More menu open/close
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
      if (e.key === "Escape" && !overlay.hidden) closeMenu();
    });
  }
})();

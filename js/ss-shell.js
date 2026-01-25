/*! Datei: /js/ss-shell.js */
/*! SafeShare Shell v2026-01-25-01 (Schema: EN under /en/<slug>/) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts || false);

  // 1) Locale bestimmen: /en/ am Anfang ODER <html lang="en">
  const path = location.pathname || "/";
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path === "/en/" || path.startsWith("/en/") || htmlLang.startsWith("en");

  // 2) Slugs (Schema: /en/<slug>/)
  // DE:
  //   / (home), /app/, /schule/, /pro/, /hilfe/
  //   /datenschutz/, /impressum/, /nutzungsbedingungen/
  // EN:
  //   /en/ (home), /en/app/, /en/school/, /en/pro/, /en/help/
  //   /en/privacy/, /en/imprint/, /en/terms/
  const LINKS = isEN
    ? {
        home: "/en/",
        app: "/en/app/",
        school: "/en/school/",
        pro: "/en/pro/",
        help: "/en/help/",
        support: "mailto:listings@safesharepro.com",
        privacy: "/en/privacy/",
        imprint: "/en/imprint/",
        terms: "/en/terms/",
        // optional language switch
        langSwitchHref: "/", // EN -> DE home by default
        langSwitchLabel: "Deutsch",
      }
    : {
        home: "/",
        app: "/app/",
        school: "/schule/",
        pro: "/pro/",
        help: "/hilfe/",
        support: "mailto:listings@safesharepro.com",
        privacy: "/datenschutz/",
        imprint: "/impressum/",
        terms: "/nutzungsbedingungen/",
        // optional language switch
        langSwitchHref: "/en/",
        langSwitchLabel: "English",
      };

  // 3) Texte (DE/EN)
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
        language: "Language",
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
        language: "Sprache",
      };

  // 4) Logo (Datei) – fix: assets/brand/logo-glyph-mint-512.png
  const LOGO_SRC = "/assets/brand/logo-glyph-mint-512.png";
  const LOGO_ALT = "SafeShare";

  // 5) Shell-Markup
  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="${LOGO_ALT}">
    <span class="ss-brand__mark">
      <img class="ss-brand__img" src="${LOGO_SRC}" alt="" aria-hidden="true" width="20" height="20" decoding="async" />
    </span>
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
      <a class="ss-moreLink" href="${LINKS.langSwitchHref}">${LINKS.langSwitchLabel}</a>
    </div>
  </div>
</div>
  `.trim();

  // 6) Einhängen (Placeholder: #ss-shell)
  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // 7) Active-State anhand Path (Schema-aware)
  function normalize(p) {
    return String(p || "/").replace(/\/+$/, "/");
  }
  function setActive() {
    const p = normalize(location.pathname || "/");

    const routes = [
      { key: "home", href: LINKS.home },
      { key: "app", href: LINKS.app },
      { key: "school", href: LINKS.school },
      { key: "pro", href: LINKS.pro },
      { key: "help", href: LINKS.help },
    ];

    let activeKey = "home";
    for (const r of routes) {
      if (p === normalize(r.href) || p.startsWith(normalize(r.href))) activeKey = r.key;
    }

    document.querySelectorAll("[data-ss-nav]").forEach((a) => {
      const isActive = a.getAttribute("data-ss-nav") === activeKey;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  setActive();

  // 8) Mehr-Menü: open/close + Escape + Click-outside + Hard reset on load
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");

  function hardClose() {
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

  // Wichtig: falls iOS/Safari aus Cache zurückkommt und Overlay “halb offen” wirkt
  hardClose();
  on(window, "pageshow", () => hardClose());

  if (btn && overlay) {
    on(btn, "click", () => {
      if (overlay.hidden) openMenu();
      else closeMenu();
    });

    on(overlay, "click", (e) => {
      const t = e.target;
      if (t && t.closest && t.closest("[data-ss-close]")) closeMenu();
    });

    on(document, "keydown", (e) => {
      if (e.key === "Escape" && overlay && !overlay.hidden) closeMenu();
    });
  }
})();

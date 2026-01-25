/* Datei: /js/ss-shell.js */
/*! SafeShare Shell v2026-01-25-02 (EN schema: /en/<slug>/, logo PNG, blur-fix, optional lang link, hreflang inject) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const byId = (id) => document.getElementById(id);

  // --- helpers
  const normPath = (p) => {
    p = String(p || "/");
    if (!p.startsWith("/")) p = "/" + p;
    // keep single trailing slash
    p = p.replace(/\/+$/, "/");
    return p;
  };

  // 1) Locale bestimmen: /en/ am Anfang ODER <html lang="en">
  const path = normPath(location.pathname || "/");
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.startsWith("/en/") || htmlLang.startsWith("en");

  // 2) Link-Ziele (DE + EN Schema)
  // DE: /hilfe/ /schule/ /pro/ /datenschutz/ /impressum/ /nutzungsbedingungen/
  // EN: /en/help/ /en/school/ /en/pro/ /en/privacy/ /en/imprint/ /en/terms/
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
        // optional language switch:
        langOtherLabel: "Deutsch",
        langOtherHref: "/",
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
        // optional language switch:
        langOtherLabel: "English",
        langOtherHref: "/en/",
      };

  // 3) Texte (DE/EN)
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
        // optional in More menu:
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
        // optional in More menu:
        language: "Sprache",
      };

  // 4) Logo (PNG)
  // Empfehlung: 512px Source, klein gerendert (retina-safe).
  const LOGO_SRC = "/assets/brand/logo-glyph-mint-512.png";

  // 5) Shell-Markup
  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
    <img class="ss-brand__logo" src="${LOGO_SRC}" width="18" height="18" alt="" decoding="async" loading="eager">
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

  <div class="ss-moreMenu" role="dialog" aria-modal="true" aria-label="${T.more}">
    <div class="ss-moreTop">
      <div class="ss-moreTitle">${T.more}</div>
      <button class="ss-moreClose" type="button" data-ss-close aria-label="${T.close}">×</button>
    </div>

    <div class="ss-moreList" role="navigation" aria-label="${T.more}">
      <a class="ss-moreLink" href="${LINKS.support}">${T.support}</a>
      <a class="ss-moreLink" href="${LINKS.privacy}">${T.privacy}</a>
      <a class="ss-moreLink" href="${LINKS.imprint}">${T.imprint}</a>
      <a class="ss-moreLink" href="${LINKS.terms}">${T.terms}</a>

      <!-- optional: language switch (UI link) -->
      <div class="ss-moreDivider" role="separator" aria-hidden="true"></div>
      <div class="ss-moreMeta">${T.language}</div>
      <a class="ss-moreLink" href="${LINKS.langOtherHref}">${LINKS.langOtherLabel}</a>
    </div>
  </div>
</div>
  `.trim();

  // 6) Einhängen (Placeholder: #ss-shell)
  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // 7) Blur-Fix/State-Reset (wichtig gegen „overlay bleibt offen → alles wirkt unscharf“)
  // (a) sofort sicher schließen
  function hardCloseOverlay() {
    const btn = byId("ssMoreBtn");
    const overlay = byId("ssMoreOverlay");
    if (overlay) overlay.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("ss-noScroll");
  }
  hardCloseOverlay();
  // (b) auch bei iOS bfcache/pageshow resetten
  window.addEventListener("pageshow", () => hardCloseOverlay());

  // 8) Active-State anhand Path
  function setActive() {
    const p = normPath(location.pathname || "/");
    const map = [
      { key: "home", match: [normPath(LINKS.home)] },
      { key: "app", match: [normPath(LINKS.app)] },
      { key: "school", match: [normPath(LINKS.school)] },
      { key: "pro", match: [normPath(LINKS.pro)] },
      { key: "help", match: [normPath(LINKS.help)] },
    ];

    let activeKey = "home";
    for (const item of map) {
      if (item.match.some((m) => p === m || p.startsWith(m))) activeKey = item.key;
    }

    document.querySelectorAll("[data-ss-nav]").forEach((a) => {
      const isActive = a.getAttribute("data-ss-nav") === activeKey;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  setActive();

  // 9) Mehr-Menü: open/close + Escape + Click-outside
  const btn = byId("ssMoreBtn");
  const overlay = byId("ssMoreOverlay");

  function openMenu() {
    if (!overlay || !btn) return;
    overlay.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("ss-noScroll");
    const closeBtn = overlay.querySelector("[data-ss-close]");
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
      if (e.key === "Escape" && overlay && !overlay.hidden) closeMenu();
    });
  }

  // 10) hreflang inject (falls du es wirklich „immer“ willst)
  // Erwartung: Seite hat canonical/hreflang meist schon im <head>. Wir ergänzen nur, wenn fehlend.
  function ensureLinkRelAlternate(hreflang, href) {
    const head = document.head;
    if (!head || !href) return;
    const sel = `link[rel="alternate"][hreflang="${hreflang}"]`;
    if ($(sel, head)) return;
    const l = document.createElement("link");
    l.rel = "alternate";
    l.hreflang = hreflang;
    l.href = href;
    head.appendChild(l);
  }

  function ensureCanonical(href) {
    const head = document.head;
    if (!head || !href) return;
    let c = $('link[rel="canonical"]', head);
    if (!c) {
      c = document.createElement("link");
      c.rel = "canonical";
      head.appendChild(c);
    }
    // nur setzen, wenn leer oder offensichtlich falsch
    if (!c.getAttribute("href")) c.setAttribute("href", href);
  }

  // Mapping current page to DE/EN canonical pair for core pages
  function getCanonicalPair() {
    // EN schema: /en/<slug>/
    const p = normPath(location.pathname || "/");
    // EN -> DE
    const pairs = [
      { en: "/en/", de: "/" },
      { en: "/en/app/", de: "/app/" },
      { en: "/en/school/", de: "/schule/" },
      { en: "/en/pro/", de: "/pro/" },
      { en: "/en/help/", de: "/hilfe/" },
      { en: "/en/privacy/", de: "/datenschutz/" },
      { en: "/en/imprint/", de: "/impressum/" },
      { en: "/en/terms/", de: "/nutzungsbedingungen/" },
    ];

    for (const x of pairs) {
      if (p === x.en || p.startsWith(x.en)) {
        return {
          de: "https://safesharepro.com" + x.de,
          en: "https://safesharepro.com" + x.en,
          xdefault: "https://safesharepro.com" + x.en,
          isEnPage: true,
        };
      }
      if (p === x.de || p.startsWith(x.de)) {
        return {
          de: "https://safesharepro.com" + x.de,
          en: "https://safesharepro.com" + x.en,
          xdefault: "https://safesharepro.com" + x.en,
          isEnPage: false,
        };
      }
    }
    return null;
  }

  const pair = getCanonicalPair();
  if (pair) {
    ensureLinkRelAlternate("de", pair.de);
    ensureLinkRelAlternate("en", pair.en);
    ensureLinkRelAlternate("x-default", pair.xdefault);

    // canonical passend zur Seite (nur wenn canonical fehlt)
    ensureCanonical(pair.isEnPage ? pair.en : pair.de);
  }
})();

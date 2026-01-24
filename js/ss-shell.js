/* Datei: /js/ss-shell.js */
/* SafeShare Shell v2026-01-24-04 (logo + capsule nav + bottom-sheet more) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // 1) Locale bestimmen: /en/ oder <html lang="en">
  const path = (location.pathname || "/").toLowerCase();
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.includes("/en/") || htmlLang.startsWith("en");

  // 2) Link-Ziele (DE/EN) – hier nur saubere Root-Pfade
  const LINKS = isEN
    ? {
        home: "/en/",
        app: "/app/en/",
        school: "/schule/en/",
        pro: "/pro/en/",
        help: "/hilfe/en/",
        privacy: "/datenschutz/en/",
        imprint: "/impressum/en/",
        terms: "/nutzungsbedingungen/en/",
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

  // 3) Texte (DE/EN)
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
        channels: "Channels",
        email: "Clean email links",
        messenger: "Clean messenger links",
        social: "Clean social links",
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
        channels: "Kanäle",
        email: "E-Mail-Links bereinigen",
        messenger: "Messenger-Links bereinigen",
        social: "Social-Links bereinigen",
      };

  // 4) Logo-Asset (kein Emoji)
  const LOGO_SRC = "/assets/brand/logo-glyph-mint-deep-256.png?v=2025-12-26-09";

  // 5) Shell-Markup: Nav + Mehr-Button in EINER Capsule
  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
    <span class="ss-brand__logoWrap" aria-hidden="true">
      <img class="ss-brand__logo" src="${LOGO_SRC}" alt="" width="22" height="22"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
      <span class="ss-brand__fallback">SS</span>
    </span>
    <span class="ss-brand__name">SafeShare</span>
  </a>

  <nav class="ss-nav" aria-label="Primary">
    <a class="ss-nav__link" data-ss-nav="home" href="${LINKS.home}">${T.start}</a>
    <a class="ss-nav__link" data-ss-nav="app" href="${LINKS.app}">${T.app}</a>
    <a class="ss-nav__link" data-ss-nav="school" href="${LINKS.school}">${T.school}</a>
    <a class="ss-nav__link" data-ss-nav="pro" href="${LINKS.pro}">${T.pro}</a>
    <a class="ss-nav__link" data-ss-nav="help" href="${LINKS.help}">${T.help}</a>

    <button class="ss-moreBtn" type="button" id="ssMoreBtn"
      aria-haspopup="dialog" aria-expanded="false" aria-controls="ssMoreOverlay">
      ${T.more} <span class="ss-caret" aria-hidden="true">▾</span>
    </button>
  </nav>
</header>

<div class="ss-moreOverlay" id="ssMoreOverlay" hidden>
  <div class="ss-moreBackdrop" data-ss-close></div>

  <div class="ss-moreMenu" role="dialog" aria-modal="true" aria-label="${T.more}">
    <div class="ss-moreTop">
      <div class="ss-moreTitle">${T.more}</div>
      <button class="ss-moreClose" type="button" data-ss-close aria-label="${T.close}">✕</button>
    </div>

    <div class="ss-moreList" role="navigation" aria-label="${T.more}">
      <div class="ss-moreHint">Support</div>
      <a class="ss-moreLink" href="${LINKS.support}">${T.support}</a>

      <div class="ss-moreDivider"></div>

      <div class="ss-moreHint">${T.channels}</div>
      <a class="ss-moreLink" href="${isEN ? "/email-links-bereinigen/en/" : "/email-links-bereinigen/"}">${T.email}</a>
      <a class="ss-moreLink" href="${isEN ? "/messenger-links-bereinigen/en/" : "/messenger-links-bereinigen/"}">${T.messenger}</a>
      <a class="ss-moreLink" href="${isEN ? "/social-links-bereinigen/en/" : "/social-links-bereinigen/"}">${T.social}</a>

      <div class="ss-moreDivider"></div>

      <div class="ss-moreHint">Rechtliches</div>
      <a class="ss-moreLink" href="${LINKS.privacy}">${T.privacy}</a>
      <a class="ss-moreLink" href="${LINKS.imprint}">${T.imprint}</a>
      <a class="ss-moreLink" href="${LINKS.terms}">${T.terms}</a>
    </div>
  </div>
</div>
`.trim();

  // 6) Mount
  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // 7) Active-State anhand Path
  function normalize(p) {
    let s = String(p || "/");
    if (!s.startsWith("/")) s = "/" + s;
    // trailing slash normalisieren
    if (!s.endsWith("/")) s = s + "/";
    return s.toLowerCase();
  }

  function setActive() {
    const p = normalize(location.pathname);

    const map = [
      { key: "home", match: [normalize(LINKS.home)] },
      { key: "app", match: [normalize(LINKS.app)] },
      { key: "school", match: [normalize(LINKS.school)] },
      { key: "pro", match: [normalize(LINKS.pro)] },
      { key: "help", match: [normalize(LINKS.help)] },
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

  // 8) Mehr-Menü: open/close + Escape + close on link click
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");

  function lockScroll(lock) {
    document.documentElement.classList.toggle("ss-noScroll", !!lock);
  }

  function openMenu() {
    if (!overlay || !btn) return;
    overlay.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    lockScroll(true);
    const closeBtn = overlay.querySelector(".ss-moreClose");
    closeBtn && closeBtn.focus();
  }

  function closeMenu() {
    if (!overlay || !btn) return;
    overlay.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    lockScroll(false);
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
      // Klick auf Link im Menü schließt auch
      if (t && t.closest && t.closest(".ss-moreLink")) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay && !overlay.hidden) closeMenu();
    });
  }
})();

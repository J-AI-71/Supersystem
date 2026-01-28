/*! Datei: /js/ss-shell.js */
/*! SafeShare Shell v2026-01-28-01 (Schema B: EN under /en/<slug>/) */
/* Änderungen:
   A) Schule/Pro/Hilfe sind "extra": bleiben in der Primary-Nav drin, aber können per CSS auf Mobile ausgeblendet werden.
      Zusätzlich stehen sie IMMER im Mehr-Menü (damit Mobile sie sicher erreicht).
   B) Mehr-Menü enthält Schule/Pro/Hilfe + Separator vor Support/Legal/Language.
   C) Wenn aktive Seite school/pro/help ist, bekommt der Mehr-Button is-active + aria-current="page".
*/
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // 1) Locale bestimmen: /en/ am Anfang ODER <html lang="en">
  const path = (location.pathname || "/");
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.startsWith("/en/") || htmlLang.startsWith("en");

  // 2) Links (Schema B)
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
      };

  // 3) Texte
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

  // 4) Logo (Bilddatei)
  const LOGO_SRC = "/assets/brand/logo-glyph-mint-512.png";

  // 5) Helper: trailing slash normalisieren
  function norm(p) {
    let s = String(p || "/");
    if (!s.startsWith("/")) s = "/" + s;
    s = s.replace(/\/+$/, "/");
    return s;
  }

  // 6) Sprach-Gegenstück (UI-Link im Mehr-Menü)
  function toCounterpartUrl() {
    const p = norm(location.pathname);

    // EN -> DE
    if (isEN) {
      if (p === "/en/") return "/";
      if (p.startsWith("/en/app/")) return "/app/";
      if (p.startsWith("/en/school/")) return "/schule/";
      if (p.startsWith("/en/pro/")) return "/pro/";
      if (p.startsWith("/en/help/")) return "/hilfe/";
      if (p.startsWith("/en/privacy/")) return "/datenschutz/";
      if (p.startsWith("/en/imprint/")) return "/impressum/";
      if (p.startsWith("/en/terms/")) return "/nutzungsbedingungen/";
      return "/";
    }

    // DE -> EN
    if (p === "/") return "/en/";
    if (p.startsWith("/app/")) return "/en/app/";
    if (p.startsWith("/schule/")) return "/en/school/";
    if (p.startsWith("/pro/")) return "/en/pro/";
    if (p.startsWith("/hilfe/")) return "/en/help/";
    if (p.startsWith("/datenschutz/")) return "/en/privacy/";
    if (p.startsWith("/impressum/")) return "/en/imprint/";
    if (p.startsWith("/nutzungsbedingungen/")) return "/en/terms/";
    return "/en/";
  }

  // 7) Shell-Markup
  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
    <span class="ss-brand__mark">
      <img class="ss-brand__img" src="${LOGO_SRC}" alt="" aria-hidden="true" width="20" height="20" loading="eager" decoding="async">
    </span>
    <span class="ss-brand__name">SafeShare</span>
  </a>

  <nav class="ss-nav" aria-label="Primary">
    <a class="ss-nav__link" data-ss-nav="home" href="${LINKS.home}">${T.start}</a>
    <a class="ss-nav__link" data-ss-nav="app" href="${LINKS.app}">${T.app}</a>

    <!-- A) extra: per CSS auf Mobile ausblenden -->
    <a class="ss-nav__link ss-nav__link--extra" data-ss-nav="school" href="${LINKS.school}">${T.school}</a>
    <a class="ss-nav__link ss-nav__link--extra" data-ss-nav="pro" href="${LINKS.pro}">${T.pro}</a>
    <a class="ss-nav__link ss-nav__link--extra" data-ss-nav="help" href="${LINKS.help}">${T.help}</a>
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
      <button class="ss-moreClose" type="button" data-ss-close aria-label="${T.close}">&times;</button>
    </div>

    <div class="ss-moreList" role="navigation" aria-label="${T.more}">
      <!-- B) Navigation-Links (immer erreichbar) -->
      <a class="ss-moreLink" href="${LINKS.school}">${T.school}</a>
      <a class="ss-moreLink" href="${LINKS.pro}">${T.pro}</a>
      <a class="ss-moreLink" href="${LINKS.help}">${T.help}</a>

      <div class="ss-moreSep" aria-hidden="true"></div>

      <a class="ss-moreLink" href="${LINKS.support}">${T.support}</a>
      <a class="ss-moreLink" href="${LINKS.privacy}">${T.privacy}</a>
      <a class="ss-moreLink" href="${LINKS.imprint}">${T.imprint}</a>
      <a class="ss-moreLink" href="${LINKS.terms}">${T.terms}</a>
      <a class="ss-moreLink" href="${toCounterpartUrl()}">${T.langSwitch}</a>
    </div>
  </div>
</div>
  `.trim();

  // 8) Einhängen (Placeholder: #ss-shell)
  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // 9) Active-State anhand Path
  function setActive() {
    const p = norm(location.pathname);

    const map = [
      { key: "home", match: [norm(LINKS.home)] },
      { key: "app", match: [norm(LINKS.app)] },
      { key: "school", match: [norm(LINKS.school)] },
      { key: "pro", match: [norm(LINKS.pro)] },
      { key: "help", match: [norm(LINKS.help)] },
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

    // C) Mehr-Button als aktiv markieren, wenn aktive Seite im "extra"-Bereich ist
    const btn = $("#ssMoreBtn");
    if (btn) {
      const moreActive = (activeKey === "school" || activeKey === "pro" || activeKey === "help");
      btn.classList.toggle("is-active", moreActive);
      if (moreActive) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    }
  }
  setActive();

  // 10) Mehr-Menü: open/close + Escape + Click-outside
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");

  function hardCloseOverlay() {
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

  // Safety: nie mit offenem Overlay starten (verhindert "verschwommen")
  hardCloseOverlay();

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

    // iOS/Safari: beim Zurück/Weiter oder Tab-Hide immer hart schließen
    window.addEventListener("pageshow", () => hardCloseOverlay());
    window.addEventListener("pagehide", () => hardCloseOverlay());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) hardCloseOverlay();
    });
  }
})();

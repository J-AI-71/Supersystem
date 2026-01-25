/*! SafeShare Shell v2026-01-25-01 (EN under /en/<slug>/) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // Locale bestimmen: EN wenn Path mit /en/ startet ODER <html lang="en">
  const pathRaw = location.pathname || "/";
  const path = pathRaw.replace(/\/+$/, "/"); // normalize trailing slash
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.startsWith("/en/") || htmlLang.startsWith("en");

  // Link-Ziele (DE normal, EN unter /en/<slug>/)
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

  // Texte
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
      };

  // Inline Mark (SVG)
  const markSVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M12 2.6c3.1 2.6 6.3 3.3 8.4 3.6v7.1c0 5.2-3.6 9-8.4 10.9C7.2 22.3 3.6 18.5 3.6 13.3V6.2C5.7 5.9 8.9 5.2 12 2.6Z" stroke="currentColor" stroke-width="1.6" opacity=".95"/>
  <path d="M8.4 12.2l2.3 2.4 4.9-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
</svg>`.trim();

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
          aria-haspopup="dialog" aria-expanded="false" aria-controls="ssMoreMenu">
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
    </div>
  </div>
</div>
  `.trim();

  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // Active-State: Primary + "More" aktiv für Privacy/Imprint/Terms
  function setActive() {
    const p = (location.pathname || "/").replace(/\/+$/, "/");

    const primary = [
      { key: "home", match: [LINKS.home] },
      { key: "app", match: [LINKS.app] },
      { key: "school", match: [LINKS.school] },
      { key: "pro", match: [LINKS.pro] },
      { key: "help", match: [LINKS.help] },
    ];

    let activeKey = null;
    for (const item of primary) {
      if (item.match.some((m) => p.startsWith(m))) activeKey = item.key;
    }

    document.querySelectorAll("[data-ss-nav]").forEach((a) => {
      const isActive = activeKey && a.getAttribute("data-ss-nav") === activeKey;
      a.classList.toggle("is-active", !!isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    const moreBtn = $("#ssMoreBtn");
    const isMorePage =
      p.startsWith(LINKS.privacy) || p.startsWith(LINKS.imprint) || p.startsWith(LINKS.terms);

    if (moreBtn) moreBtn.classList.toggle("is-active", !activeKey && isMorePage);
  }
  setActive();

  // More-Menü open/close + Escape
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");

// 6) Einhängen (Placeholder: #ss-shell)
const mount = $("#ss-shell");
if (!mount) return;
mount.innerHTML = shellHTML;

// ✅ 6.1) Hard reset: Overlay immer sicher AUS (Safari/Cache/State)
const btn = document.querySelector("#ssMoreBtn");
const overlay = document.querySelector("#ssMoreOverlay");

if (overlay) overlay.hidden = true;
if (btn) btn.setAttribute("aria-expanded", "false");
document.documentElement.classList.remove("ss-noScroll");

// 7) Active-State anhand Path
function setActive() { /* ... */ }
setActive();

// 8) Mehr-Menü: open/close + Escape + Click-outside
// ... deine Listener ...
  

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
    btn.addEventListener("click", () => (overlay.hidden ? openMenu() : closeMenu()));
    overlay.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.closest && t.closest("[data-ss-close]")) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.hidden) closeMenu();
    });
  }
})();

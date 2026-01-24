/* /js/ss-shell.js */
/* SafeShare Shell v2026-01-24-01 (dark-aware + bottom-sheet) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // 1) Locale bestimmen: /app/en/ oder <html lang="en">
  const path = location.pathname;
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.includes("/en/") || htmlLang.startsWith("en");

  // 2) Link-Ziele (DE/EN)
  const LINKS = isEN
    ? {
        home: "/en/",
        app: "/app/en/",
        school: "/schule/en/",
        pro: "/pro/en/",
        help: "/hilfe/en/",
        support: "mailto:listings@safesharepro.com",
        privacy: "/datenschutz/en/",
        imprint: "/impressum/en/",
        terms: "/nutzungsbedingungen/en/",
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

  // 4) Shell-Markup
  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
    <span class="ss-brand__mark" aria-hidden="true">🛡️</span>
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
    </div>
  </div>
</div>
  `.trim();

  // 5) Einhängen (Placeholder: #ss-shell)
  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // 6) Active-State anhand Path
  function setActive() {
    const p = (location.pathname || "/").replace(/\/+$/, "/").toLowerCase();
    const map = [
      { key: "home", match: [LINKS.home.toLowerCase()] },
      { key: "app", match: [LINKS.app.toLowerCase()] },
      { key: "school", match: [LINKS.school.toLowerCase()] },
      { key: "pro", match: [LINKS.pro.toLowerCase()] },
      { key: "help", match: [LINKS.help.toLowerCase()] },
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

  // 7) Mehr-Menü: open/close + Escape + Click-outside
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");
  if (!btn || !overlay) return;

  function openMenu() {
    overlay.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("ss-noScroll");

    // Fokus auf ✕ Button (nicht auf Backdrop)
    const closeBtn = overlay.querySelector(".ss-moreClose");
    closeBtn && closeBtn.focus();
  }

  function closeMenu() {
    overlay.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("ss-noScroll");
    btn.focus();
  }

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
})();

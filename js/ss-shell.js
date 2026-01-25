/*! Datei: /js/ss-shell.js */
/*! SafeShare Shell v2026-01-25-01 (Schema A: EN under /en/<slug>/) */
/* DE + EN, inline SVG logo, capsule More button, bottom-sheet menu, Safari blur/pageshow hard-fix */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const byId = (id) => document.getElementById(id);
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  // 1) Locale bestimmen: /en/ anywhere in path OR <html lang="en">
  const path = location.pathname || "/";
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.includes("/en/") || htmlLang.startsWith("en");

  // 2) Link-Ziele (Schema A: EN under /en/<slug>/)
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
        langSwitch: "/", // optional language switch target
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
        langSwitch: "/en/", // optional language switch target
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
        language: "Deutsch",
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
        language: "English",
      };

  // 4) Inline mark (no emoji, no external file)
  const markSVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M12 2.6c3.1 2.6 6.3 3.3 8.4 3.6v7.1c0 5.2-3.6 9-8.4 10.9C7.2 22.3 3.6 18.5 3.6 13.3V6.2C5.7 5.9 8.9 5.2 12 2.6Z" stroke="currentColor" stroke-width="1.6" opacity=".95"/>
  <path d="M8.4 12.2l2.3 2.4 4.9-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
</svg>`.trim();

  // 5) Shell-Markup
  // Language link optional in More menu (as requested). Keep hreflang in <head> of each page.
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
      <button class="ss-moreClose" type="button" data-ss-close aria-label="${T.close}">✕</button>
    </div>

    <div class="ss-moreList" role="navigation" aria-label="${T.more}">
      <a class="ss-moreLink" href="${LINKS.support}">${T.support}</a>
      <a class="ss-moreLink" href="${LINKS.privacy}">${T.privacy}</a>
      <a class="ss-moreLink" href="${LINKS.imprint}">${T.imprint}</a>
      <a class="ss-moreLink" href="${LINKS.terms}">${T.terms}</a>
      <a class="ss-moreLink" href="${LINKS.langSwitch}">${T.language}</a>
    </div>
  </div>
</div>
  `.trim();

  // 6) Einhängen (Placeholder: #ss-shell)
  const mount = byId("ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // 7) Active-State anhand Path
  function setActive() {
    const p = (location.pathname || "/").replace(/\/+$/, "/"); // normalize trailing slash
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

  // 8) Mehr-Menü: open/close + Escape + Click-outside + Safari pageshow hard-fix
  const btn = byId("ssMoreBtn");
  const overlay = byId("ssMoreOverlay");

  function hardClose(skipFocus) {
    if (!overlay || !btn) return;
    overlay.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("ss-noScroll");
    if (!skipFocus) btn.focus();
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
    hardClose(false);
  }

  // Ensure closed on load (prevents "blur stuck" if BFCache restores weird state)
  hardClose(true);

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

    // iOS/Safari BFCache: when navigating back, overlay/backdrop blur may persist unless we force close
    on(window, "pageshow", () => hardClose(true));

    // Also close if tab becomes hidden/visible again (reduces stuck blur cases)
    on(document, "visibilitychange", () => {
      if (document.hidden) hardClose(true);
    });
  }
})();

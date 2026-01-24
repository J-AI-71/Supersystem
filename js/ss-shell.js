/* Datei: /js/ss-shell.2026-01-24-04.js */
/* SafeShare Shell v2026-01-24-04 (logo img, active tabs, capsule "Mehr", bottom-sheet, iOS hidden fix) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // 1) Locale bestimmen: /app/en/ oder <html lang="en">
  const path = (location.pathname || "/").toLowerCase();
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

  // 4) Shell-Markup (KEIN Emoji: echtes Logo)
  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
    <img class="ss-brand__mark" src="/assets/brand/logo-glyph-mint-deep-256.png?v=2025-12-26-09" alt="" aria-hidden="true" decoding="async">
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

  // 6) Active-State anhand Path (robust)
  function norm(p) {
    // z.B. "/schule" -> "/schule/"
    if (!p) return "/";
    p = p.toLowerCase();
    return p.endsWith("/") ? p : p + "/";
  }

  function setActive() {
    const p = norm(location.pathname || "/");

    // Wichtig: home nur exakt matchen, sonst wird alles "home"
    let activeKey = "home";

    const rules = [
      { key: "app", prefix: norm(LINKS.app) },
      { key: "school", prefix: norm(LINKS.school) },
      { key: "pro", prefix: norm(LINKS.pro) },
      { key: "help", prefix: norm(LINKS.help) },
    ];

    for (const r of rules) {
      if (p.startsWith(r.prefix)) activeKey = r.key;
    }

    // home: nur wenn wirklich home path
    if (p === norm(LINKS.home)) activeKey = "home";

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

  function lockScroll(lock) {
    document.documentElement.classList.toggle("ss-noScroll", !!lock);
  }

  function openMenu() {
    if (!overlay || !btn) return;
    overlay.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    lockScroll(true);
    // Fokus auf Close (wichtig iOS)
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

  btn && btn.addEventListener("click", () => {
    if (!overlay) return;
    overlay.hidden ? openMenu() : closeMenu();
  });

  overlay && overlay.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.closest && t.closest("[data-ss-close]")) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay && !overlay.hidden) closeMenu();
  });
})();

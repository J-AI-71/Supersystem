/*! SafeShare Shell v2026-01-24-04 (no emoji + capsule More + bottom-sheet) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // 0) Mount
  const mount = $("#ss-shell");
  if (!mount) return;

  // 1) Locale bestimmen: /en/ oder <html lang="en">
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

  // 4) Logo (kein Emoji)
  const LOGO_SRC = "/assets/brand/logo-glyph-mint-deep-256.png?v=2025-12-26-09";

  // 5) Shell-Markup (Tabs + More im gleichen Capsule-Bar)
  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
    <span class="ss-brand__logoWrap" aria-hidden="true">
      <img class="ss-brand__logo" src="${LOGO_SRC}" alt="SafeShare" width="28" height="28" decoding="async">
      <span class="ss-brand__fallback">SS</span>
    </span>
    <span class="ss-brand__name">SafeShare</span>
  </a>

  <nav class="ss-tabs" aria-label="SafeShare Navigation">
    <a class="ss-tab" data-ss-nav="home" href="${LINKS.home}">${T.start}</a>
    <a class="ss-tab" data-ss-nav="app" href="${LINKS.app}">${T.app}</a>
    <a class="ss-tab" data-ss-nav="school" href="${LINKS.school}">${T.school}</a>
    <a class="ss-tab" data-ss-nav="pro" href="${LINKS.pro}">${T.pro}</a>
    <a class="ss-tab" data-ss-nav="help" href="${LINKS.help}">${T.help}</a>
    <button class="ss-tab ss-moreBtn" type="button" id="ssMoreBtn"
            aria-haspopup="dialog" aria-expanded="false" aria-controls="ssMoreMenu">
      ${T.more} ▾
    </button>
  </nav>
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

  mount.innerHTML = shellHTML;

  // 6) Logo-Fallback wenn Bild nicht lädt
  const logoImg = $(".ss-brand__logo", mount);
  const logoFallback = $(".ss-brand__fallback", mount);
  if (logoImg && logoFallback) {
    logoImg.addEventListener("error", () => {
      logoImg.style.display = "none";
      logoFallback.style.display = "inline-flex";
    });
  }

  // 7) Active-State anhand Path
  function normalize(p) {
    // sorgt dafür, dass "/app" und "/app/" gleich behandelt werden
    if (!p) return "/";
    return p.endsWith("/") ? p : p + "/";
  }

  function setActive() {
    const p = normalize(location.pathname.toLowerCase());

    const candidates = [
      { key: "app", match: normalize(LINKS.app).toLowerCase() },
      { key: "school", match: normalize(LINKS.school).toLowerCase() },
      { key: "pro", match: normalize(LINKS.pro).toLowerCase() },
      { key: "help", match: normalize(LINKS.help).toLowerCase() },
      { key: "home", match: normalize(LINKS.home).toLowerCase() },
    ];

    let activeKey = "home";
    for (const c of candidates) {
      if (c.match !== "/" && p.startsWith(c.match)) {
        activeKey = c.key;
        break;
      }
    }
    if (p === normalize(LINKS.home).toLowerCase()) activeKey = "home";

    mount.querySelectorAll("[data-ss-nav]").forEach((a) => {
      const isActive = a.getAttribute("data-ss-nav") === activeKey;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  setActive();

  // 8) Mehr-Menü: open/close + Escape + Click-outside
  const btn = $("#ssMoreBtn", mount);
  const overlay = $("#ssMoreOverlay", mount);

  function openMenu() {
    overlay.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("ss-noScroll");

    // Fokus auf Close-Button (nicht Backdrop)
    const closeBtn = overlay.querySelector(".ss-moreClose");
    if (closeBtn) closeBtn.focus();
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
    if (e.key === "Escape" && overlay && !overlay.hidden) closeMenu();
  });
})();

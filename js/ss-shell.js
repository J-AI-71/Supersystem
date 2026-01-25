/*! SafeShare Shell v2026-01-25-02 (EN under /en/<slug>/) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---- Locale ----
  const path = (location.pathname || "/");
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.startsWith("/en/") || htmlLang.startsWith("en");

  // ---- Routes (Schema: /en/<slug>/) ----
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
        langSwitchLabel: "Deutsch",
        langSwitchHref: "/"
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
        langSwitchLabel: "English",
        langSwitchHref: "/en/"
      };

  const T = isEN
    ? { start:"Home", app:"App", school:"School", pro:"Pro", help:"Help", more:"More", support:"Support", privacy:"Privacy", imprint:"Imprint", terms:"Terms", close:"Close" }
    : { start:"Start", app:"App", school:"Schule", pro:"Pro", help:"Hilfe", more:"Mehr", support:"Support", privacy:"Datenschutz", imprint:"Impressum", terms:"Nutzungsbedingungen", close:"Schließen" };

  // ---- Inline mark (no emoji, no external file) ----
  const markSVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M12 2.6c3.1 2.6 6.3 3.3 8.4 3.6v7.1c0 5.2-3.6 9-8.4 10.9C7.2 22.3 3.6 18.5 3.6 13.3V6.2C5.7 5.9 8.9 5.2 12 2.6Z" stroke="currentColor" stroke-width="1.6" opacity=".95"/>
  <path d="M8.4 12.2l2.3 2.4 4.9-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
</svg>`.trim();

  // ---- Mount shell ----
  const mount = $("#ss-shell");
  if (!mount) return;

  // language switch is OPTIONAL (show in More menu). Set false if you don't want it.
  const SHOW_LANG_SWITCH_IN_MORE = true;

  mount.innerHTML = `
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
      <button class="ss-moreClose" type="button" data-ss-close aria-label="${T.close}">&times;</button>
    </div>

    <div class="ss-moreList" role="navigation" aria-label="${T.more}">
      <a class="ss-moreLink" href="${LINKS.support}">${T.support}</a>
      <a class="ss-moreLink" href="${LINKS.privacy}">${T.privacy}</a>
      <a class="ss-moreLink" href="${LINKS.imprint}">${T.imprint}</a>
      <a class="ss-moreLink" href="${LINKS.terms}">${T.terms}</a>
      ${SHOW_LANG_SWITCH_IN_MORE ? `<a class="ss-moreLink" href="${LINKS.langSwitchHref}">${LINKS.langSwitchLabel}</a>` : ``}
    </div>
  </div>
</div>
  `.trim();

  // ---- Active state ----
  function normalize(p) {
    return (p || "/").replace(/\/+$/, "/");
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

    $$("[data-ss-nav]").forEach((a) => {
      const isActive = a.getAttribute("data-ss-nav") === activeKey;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  setActive();

  // ---- More menu open/close ----
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");

  function hardCloseMenu() {
    // the snippet you posted ("wo rein?") belongs exactly here
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
    hardCloseMenu();
    if (btn) btn.focus();
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

    // close on any click on a menu link (better UX)
    overlay.addEventListener("click", (e) => {
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (a && overlay.contains(a)) hardCloseMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.hidden) closeMenu();
    });

    window.addEventListener("pageshow", hardCloseMenu);
  }

  // ---- hreflang injection (core pages only) ----
  // If a page already has hreflang tags, we do nothing.
  function hasHreflang() {
    return !!document.querySelector('link[rel="alternate"][hreflang]');
  }

  function injectHreflangCore() {
    if (hasHreflang()) return;

    const p = normalize(location.pathname);

    // map EN -> DE for core routes (because DE uses /schule/, /hilfe/, /datenschutz/ ...)
    const mapEnToDe = {
      "/en/": "/",
      "/en/app/": "/app/",
      "/en/school/": "/schule/",
      "/en/pro/": "/pro/",
      "/en/help/": "/hilfe/",
      "/en/privacy/": "/datenschutz/",
      "/en/imprint/": "/impressum/",
      "/en/terms/": "/nutzungsbedingungen/",
    };

    // map DE -> EN for core routes
    const mapDeToEn = {
      "/": "/en/",
      "/app/": "/en/app/",
      "/schule/": "/en/school/",
      "/pro/": "/en/pro/",
      "/hilfe/": "/en/help/",
      "/datenschutz/": "/en/privacy/",
      "/impressum/": "/en/imprint/",
      "/nutzungsbedingungen/": "/en/terms/",
    };

    const origin = location.origin || "https://safesharepro.com";

    let dePath = "/"; let enPath = "/en/";
    if (p.startsWith("/en/")) {
      enPath = p;
      dePath = mapEnToDe[p] || "/"; // fallback
    } else {
      dePath = p;
      enPath = mapDeToEn[p] || "/en/"; // fallback
    }

    const head = document.head;
    if (!head) return;

    const mk = (hreflang, href) => {
      const l = document.createElement("link");
      l.setAttribute("rel", "alternate");
      l.setAttribute("hreflang", hreflang);
      l.setAttribute("href", href);
      return l;
    };

    head.appendChild(mk("de", origin + dePath));
    head.appendChild(mk("en", origin + enPath));
    head.appendChild(mk("x-default", origin + enPath));
  }

  injectHreflangCore();
})();

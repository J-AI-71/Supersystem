/*! SafeShare Shell v2026-01-25-01 (Schema A: EN under /en/<slug>/) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // ---------- Locale bestimmen (Schema A) ----------
  const pathRaw = location.pathname || "/";
  const path = pathRaw.replace(/\/+$/, "/"); // normalize trailing slash
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.startsWith("/en/") || htmlLang.startsWith("en");

  // ---------- Konfiguration ----------
  // Optionaler Sprachlink im Mehr-Menü (EN <-> DE)
  const SHOW_LANG_LINK_IN_MORE = true;

  // Support Kontakt (ja: das ist deine richtige Adresse)
  const SUPPORT_MAIL = "mailto:listings@safesharepro.com";

  // ---------- Link-Schema A ----------
  // DE: /hilfe/ /schule/ /pro/ /datenschutz/ /impressum/ /nutzungsbedingungen/
  // EN: /en/help/ /en/school/ /en/pro/ /en/privacy/ /en/imprint/ /en/terms/
  const LINKS = isEN
    ? {
        home: "/en/",
        app: "/en/app/",
        school: "/en/school/",
        pro: "/en/pro/",
        help: "/en/help/",
        support: SUPPORT_MAIL,
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
        support: SUPPORT_MAIL,
        privacy: "/datenschutz/",
        imprint: "/impressum/",
        terms: "/nutzungsbedingungen/",
      };

  // ---------- Texte ----------
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
        lang: "Deutsch",
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
        lang: "English",
      };

  // ---------- Inline Logo (kein Emoji, keine externe Datei) ----------
  const markSVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
  <path d="M12 2.6c3.1 2.6 6.3 3.3 8.4 3.6v7.1c0 5.2-3.6 9-8.4 10.9C7.2 22.3 3.6 18.5 3.6 13.3V6.2C5.7 5.9 8.9 5.2 12 2.6Z"
        stroke="currentColor" stroke-width="1.6" opacity=".95"/>
  <path d="M8.4 12.2l2.3 2.4 4.9-5.1"
        stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
</svg>`.trim();

  // ---------- Active-Key + Language Switch Mapping ----------
  function getActiveKey(p) {
    const pp = (p || "/").replace(/\/+$/, "/");
    if (isEN) {
      if (pp.startsWith("/en/app/")) return "app";
      if (pp.startsWith("/en/school/")) return "school";
      if (pp.startsWith("/en/pro/")) return "pro";
      if (pp.startsWith("/en/help/")) return "help";
      if (pp.startsWith("/en/privacy/")) return "privacy";
      if (pp.startsWith("/en/imprint/")) return "imprint";
      if (pp.startsWith("/en/terms/")) return "terms";
      return "home";
    } else {
      if (pp.startsWith("/app/")) return "app";
      if (pp.startsWith("/schule/")) return "school";
      if (pp.startsWith("/pro/")) return "pro";
      if (pp.startsWith("/hilfe/")) return "help";
      if (pp.startsWith("/datenschutz/")) return "privacy";
      if (pp.startsWith("/impressum/")) return "imprint";
      if (pp.startsWith("/nutzungsbedingungen/")) return "terms";
      return "home";
    }
  }

  function counterpartHref(activeKey) {
    // liefert die Gegensprache derselben Section
    const DE = {
      home: "/",
      app: "/app/",
      school: "/schule/",
      pro: "/pro/",
      help: "/hilfe/",
      privacy: "/datenschutz/",
      imprint: "/impressum/",
      terms: "/nutzungsbedingungen/",
    };
    const EN = {
      home: "/en/",
      app: "/en/app/",
      school: "/en/school/",
      pro: "/en/pro/",
      help: "/en/help/",
      privacy: "/en/privacy/",
      imprint: "/en/imprint/",
      terms: "/en/terms/",
    };
    const k = activeKey || "home";
    return isEN ? (DE[k] || DE.home) : (EN[k] || EN.home);
  }

  // ---------- hreflang (auto: nur ergänzen, wenn fehlt) ----------
  function ensureHeadAltLinks() {
    const head = document.head;
    if (!head) return;

    const activeKey = getActiveKey(path);
    const deHref = (isEN ? counterpartHref(activeKey) : (LINKS[activeKey] || LINKS.home));
    const enHref = (isEN ? (LINKS[activeKey] || LINKS.home) : counterpartHref(activeKey));

    const origin = location.origin || "";
    const deAbs = origin + deHref;
    const enAbs = origin + enHref;

    function hasAlt(lang) {
      return !!head.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
    }
    function addAlt(lang, href) {
      const l = document.createElement("link");
      l.rel = "alternate";
      l.hreflang = lang;
      l.href = href;
      head.appendChild(l);
    }

    // nur ergänzen, nicht überschreiben
    if (!hasAlt("de")) addAlt("de", deAbs);
    if (!hasAlt("en")) addAlt("en", enAbs);
    if (!hasAlt("x-default")) addAlt("x-default", enAbs);
  }

  // ---------- Shell Markup ----------
  const activeKey = getActiveKey(path);
  const langHref = counterpartHref(activeKey);

  const langLinkHTML = SHOW_LANG_LINK_IN_MORE
    ? `<a class="ss-moreLink" href="${langHref}">${T.lang}</a>`
    : "";

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
      ${langLinkHTML}
    </div>
  </div>
</div>
  `.trim();

  // ---------- Mount ----------
  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // ---------- Active State ----------
  function setActive() {
    const key = getActiveKey(location.pathname || "/");
    document.querySelectorAll("[data-ss-nav]").forEach((a) => {
      const isActive = a.getAttribute("data-ss-nav") === key;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  setActive();

  // ---------- Menu logic + HARD reset (gegen iOS “overlay hängt / blur”) ----------
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");

  function forceClosedState() {
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

  // direkt nach Mount hart schließen (wichtig für Safari Back/Forward Cache)
  forceClosedState();

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
      if (e.key === "Escape" && !overlay.hidden) closeMenu();
    });

    // iOS/Safari: BFCache / zurück-nach-vorne -> Overlay kann “halb offen” bleiben
    window.addEventListener("pageshow", () => forceClosedState());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") forceClosedState();
    });
  }

  // hreflang ergänzen (nur falls im Head fehlt)
  ensureHeadAltLinks();
})();

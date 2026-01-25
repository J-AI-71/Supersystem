/* /js/ss-shell.js */
/* SafeShare Shell v2026-01-25-02
   - EN lives under /en/<slug>/  (your repo structure)
   - Logo = /assets/brand/logo-glyph-mint-256.png + 512.png (srcset)
   - More menu (bottom-sheet) + Escape + click outside
   - Active nav highlighting
   - Injects canonical + hreflang on every page (auto pair DE<->EN)
*/
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // ---------- 1) Locale ----------
  const rawPath = (location.pathname || "/");
  const path = rawPath.replace(/\/+$/, "/"); // normalize trailing slash
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path === "/en/" || path.startsWith("/en/") || htmlLang.startsWith("en");

  // ---------- 2) URL helpers ----------
  function toAbs(urlPath) {
    // absolute URL for canonical/hreflang
    const u = new URL(urlPath, location.origin);
    return u.toString();
  }

  function dePathFrom(p) {
    // /en/... -> /...
    if (p === "/en/") return "/";
    if (p.startsWith("/en/")) return "/" + p.slice(4);
    return p;
  }

  function enPathFrom(p) {
    // /... -> /en/...
    if (p === "/") return "/en/";
    if (p.startsWith("/en/")) return p;
    return "/en" + (p.startsWith("/") ? p : ("/" + p));
  }

  function computePair() {
    const dePath = dePathFrom(path);
    const enPath = enPathFrom(path);
    return { de: dePath, en: enPath };
  }

  function ensureLinkTag(rel, attrs) {
    const head = document.head;
    if (!head) return;

    // build a stable selector
    const keyParts = [`link[rel="${rel}"]`];
    if (attrs.hreflang) keyParts.push(`[hreflang="${attrs.hreflang}"]`);
    if (attrs.as) keyParts.push(`[as="${attrs.as}"]`);
    if (attrs.type) keyParts.push(`[type="${attrs.type}"]`);
    const sel = keyParts.join("");

    let el = head.querySelector(sel);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      head.appendChild(el);
    }

    Object.entries(attrs).forEach(([k, v]) => {
      if (v === null || typeof v === "undefined") el.removeAttribute(k);
      else el.setAttribute(k, String(v));
    });
  }

  function ensureMetaCanonicalAndHreflang() {
    const pair = computePair();

    // canonical should match current language path
    const canonicalPath = isEN ? pair.en : pair.de;

    // canonical
    let canonical = document.head && document.head.querySelector('link[rel="canonical"]');
    if (!canonical && document.head) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    if (canonical) canonical.setAttribute("href", toAbs(canonicalPath));

    // hreflang
    ensureLinkTag("alternate", { hreflang: "de", href: toAbs(pair.de) });
    ensureLinkTag("alternate", { hreflang: "en", href: toAbs(pair.en) });
    // x-default: use EN homepage as default (common choice)
    ensureLinkTag("alternate", { hreflang: "x-default", href: toAbs("/en/") });
  }

  ensureMetaCanonicalAndHreflang();

  // ---------- 3) Navigation targets (EN under /en/<slug>/) ----------
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
        // optional language toggle
        lang: computePair().de
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
        // optional language toggle
        lang: computePair().en
      };

  const T = isEN
    ? {
        start: "Start",
        app: "App",
        school: "School",
        pro: "Pro",
        help: "Help",
        more: "More",
        support: "Support / Contact",
        privacy: "Privacy",
        imprint: "Imprint",
        terms: "Terms",
        close: "Close",
        lang: "Deutsch"
      }
    : {
        start: "Start",
        app: "App",
        school: "Schule",
        pro: "Pro",
        help: "Hilfe",
        more: "Mehr",
        support: "Support / Kontakt",
        privacy: "Datenschutz",
        imprint: "Impressum",
        terms: "Nutzungsbedingungen",
        close: "Schließen",
        lang: "English"
      };

  // ---------- 4) Logo (your real files) ----------
  const LOGO_1X = "/assets/brand/logo-glyph-mint-256.png";
  const LOGO_2X = "/assets/brand/logo-glyph-mint-512.png";

  // ---------- 5) Shell markup ----------
  const shellHTML = `
<header class="ss-header" role="banner">
  <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
    <img class="ss-brand__logo"
         src="${LOGO_1X}"
         srcset="${LOGO_1X} 1x, ${LOGO_2X} 2x"
         width="18" height="18"
         alt="" aria-hidden="true" />
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

      <!-- optional language switch -->
      <a class="ss-moreLink ss-moreLink--lang" href="${LINKS.lang}">${T.lang}</a>
    </div>
  </div>
</div>
`.trim();

  // ---------- 6) mount ----------
  const mount = $("#ss-shell");
  if (!mount) return;
  mount.innerHTML = shellHTML;

  // ---------- 7) Active state ----------
  function setActive() {
    const p = (location.pathname || "/").replace(/\/+$/, "/");
    const map = [
      { key: "home", starts: [LINKS.home] },
      { key: "app", starts: [LINKS.app] },
      { key: "school", starts: [LINKS.school] },
      { key: "pro", starts: [LINKS.pro] },
      { key: "help", starts: [LINKS.help] }
    ];

    let activeKey = "home";
    for (const item of map) {
      if (item.starts.some((s) => p.startsWith(s))) activeKey = item.key;
    }

    document.querySelectorAll("[data-ss-nav]").forEach((a) => {
      const isActive = a.getAttribute("data-ss-nav") === activeKey;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  setActive();

  // ---------- 8) More menu open/close (no blur bugs) ----------
  const btn = $("#ssMoreBtn");
  const overlay = $("#ssMoreOverlay");

  function forceClosedState() {
    // this is the snippet you asked "wo rein?" — it belongs here, at init and in close()
    if (overlay) overlay.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("ss-noScroll");
  }

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
    forceClosedState();
    btn.focus();
  }

  // Ensure clean state on load (prevents “page blurred” / stuck overlay)
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
      if (e.key === "Escape" && overlay && !overlay.hidden) closeMenu();
    });
  }
})();

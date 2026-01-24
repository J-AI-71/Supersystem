/* Datei: /js/ss-shell.js */
/* SafeShare Shell v2026-01-24-05 (logo + capsule nav + bottom-sheet more, no emoji) */
(function () {
  "use strict";

  const root = document.getElementById("ss-shell");
  if (!root) return;

  const $ = (sel, r = document) => r.querySelector(sel);

  // Locale bestimmen: /en/ oder <html lang="en">
  const path = String(location.pathname || "/").toLowerCase();
  const htmlLang = String(document.documentElement.getAttribute("lang") || "").toLowerCase();
  const isEN = path.includes("/en/") || htmlLang.startsWith("en");

  // Root-Pfade (DE/EN) – sauber als Ordner-Slashes
  const LINKS = isEN
    ? {
        home: "/en/",
        app: "/app/en/",
        school: "/school/en/",
        pro: "/pro/en/",
        help: "/help/en/",
        privacy: "/privacy/en/",
        imprint: "/impressum/en/",
        terms: "/terms/en/",
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

  // Texte (DE/EN)
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
      };

  // Aktive Seite robust erkennen
  function activeKeyFromPath(p) {
    const s = String(p || "/").toLowerCase();

    // EN Root
    if (s === "/en/" || s === "/en") return "home";

    // DE Root
    if (s === "/" || s === "") return "home";

    if (s.startsWith("/app")) return "app";
    if (s.startsWith("/schule")) return "school";
    if (s.startsWith("/pro")) return "pro";
    if (s.startsWith("/hilfe")) return "help";

    // Fallback: Start
    return "home";
  }

  const active = activeKeyFromPath(path);

  // SVG Chevron (statt Emoji/Sonderzeichen)
  const chevronSvg =
    '<svg class="ss-nav__chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M6.7 9.2a1 1 0 0 1 1.4 0L12 13.1l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.6a1 1 0 0 1 0-1.4z" fill="currentColor"></path>' +
    "</svg>";

  // Logo: KEIN Emoji. Nutze dein echtes Asset.
  // Wenn du ein anderes Logo hast: hier den Pfad ändern.
  const logoSrc = "/assets/fav/favicon.svg?v=2025-12-26-01";

  // HTML bauen
  root.innerHTML = `
    <header class="ss-header">
      <a class="ss-brand" href="${LINKS.home}" aria-label="SafeShare">
        <img class="ss-brand__mark" src="${logoSrc}" alt="" width="22" height="22" decoding="async" />
        <span class="ss-brand__name">SafeShare</span>
      </a>

      <nav class="ss-nav" aria-label="Primary">
        <a class="ss-nav__link ${active === "home" ? "is-active" : ""}" href="${LINKS.home}">${T.start}</a>
        <a class="ss-nav__link ${active === "app" ? "is-active" : ""}" href="${LINKS.app}">${T.app}</a>
        <a class="ss-nav__link ${active === "school" ? "is-active" : ""}" href="${LINKS.school}">${T.school}</a>
        <a class="ss-nav__link ${active === "pro" ? "is-active" : ""}" href="${LINKS.pro}">${T.pro}</a>
        <a class="ss-nav__link ${active === "help" ? "is-active" : ""}" href="${LINKS.help}">${T.help}</a>

        <button class="ss-nav__more" type="button" id="ssMoreBtn"
          aria-haspopup="dialog" aria-expanded="false" aria-controls="ssMoreOverlay">
          ${T.more}${chevronSvg}
        </button>
      </nav>
    </header>

    <div class="ss-moreOverlay" id="ssMoreOverlay" hidden>
      <div class="ss-moreBackdrop" id="ssMoreBackdrop" aria-hidden="true"></div>

      <div class="ss-moreMenu" role="dialog" aria-modal="true" aria-label="${T.more}">
        <div class="ss-moreTop">
          <div class="ss-moreTitle">${T.more}</div>
          <button class="ss-moreClose" type="button" id="ssMoreClose" aria-label="${T.close}">×</button>
        </div>

        <div class="ss-moreList">
          <a class="ss-moreLink" href="${LINKS.support}">${T.support}</a>
          <a class="ss-moreLink" href="${LINKS.privacy}">${T.privacy}</a>
          <a class="ss-moreLink" href="${LINKS.imprint}">${T.imprint}</a>
          <a class="ss-moreLink" href="${LINKS.terms}">${T.terms}</a>
        </div>
      </div>
    </div>
  `;

  const html = document.documentElement;
  const overlay = $("#ssMoreOverlay", root);
  const btn = $("#ssMoreBtn", root);
  const closeBtn = $("#ssMoreClose", root);
  const backdrop = $("#ssMoreBackdrop", root);

  function openMore() {
    overlay.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    html.classList.add("ss-noScroll");
    // Fokus aufs Close (iOS freundlich)
    setTimeout(() => closeBtn && closeBtn.focus(), 0);
  }

  function closeMore() {
    overlay.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    html.classList.remove("ss-noScroll");
    // Fokus zurück
    setTimeout(() => btn && btn.focus(), 0);
  }

  function toggleMore() {
    if (overlay.hidden) openMore();
    else closeMore();
  }

  btn && btn.addEventListener("click", toggleMore);
  closeBtn && closeBtn.addEventListener("click", closeMore);
  backdrop && backdrop.addEventListener("click", closeMore);

  // ESC schließt
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay && !overlay.hidden) closeMore();
  });
})();

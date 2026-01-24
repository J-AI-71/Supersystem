/* Datei: /js/ss-shell.js */
/* SafeShare Shell v2026-01-24-04 */

(() => {
  const mount = document.getElementById("ss-shell");
  if (!mount) return;

  const normalizePath = (p) => {
    if (!p) return "/";
    // Strip query/hash, ensure trailing slash for folder routes
    try {
      const u = new URL(p, location.origin);
      p = u.pathname || "/";
    } catch (_) {}
    if (p !== "/" && !p.endsWith("/")) p += "/";
    return p;
  };

  const current = normalizePath(location.href);

  // Primary tabs (capsule nav)
  const TABS = [
    { key: "start",  label: "Start",  href: "/" },
    { key: "app",    label: "App",    href: "/app/" },
    { key: "schule", label: "Schule", href: "/schule/" },
    { key: "pro",    label: "Pro",    href: "/pro/" },
    { key: "hilfe",  label: "Hilfe",  href: "/hilfe/" },
  ];

  // More menu (bottom-sheet)
  const MORE = [
    { label: "Datenschutz", href: "/datenschutz/" },
    { label: "Impressum", href: "/impressum/" },
    { label: "Nutzungsbedingungen", href: "/nutzungsbedingungen/" },
    { label: "Support", href: "/support/" }, // falls vorhanden – sonst anpassen/entfernen
  ];

  const markSVG = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 2l7 4v6c0 5-3.5 9.4-7 10-3.5-.6-7-5-7-10V6l7-4zm0 2.2L7 6v6c0 3.9 2.6 7.6 5 8.4 2.4-.8 5-4.5 5-8.4V6l-5-1.8z"/>
    </svg>
  `;

  const el = (tag, attrs = {}, children = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("data-")) n.setAttribute(k, v);
      else n.setAttribute(k, v);
    }
    for (const c of children) n.appendChild(c);
    return n;
  };

  const isActive = (href) => {
    const h = normalizePath(href);
    if (h === "/") return current === "/";
    return current.startsWith(h);
  };

  // Build header
  const header = el("header", { class: "ss-header" });

  const brand = el("a", { class: "ss-brand", href: "/", "aria-label": "SafeShare Start" }, [
    el("span", { class: "ss-brand__mark", html: markSVG }),
    el("span", { class: "ss-brand__name" }, []),
  ]);
  brand.querySelector(".ss-brand__name").textContent = "SafeShare";

  const nav = el("nav", { class: "ss-nav", "aria-label": "SafeShare Navigation" });
  TABS.forEach(t => {
    const a = el("a", { class: "ss-nav__link", href: t.href, "data-page": t.key });
    a.textContent = t.label;
    if (isActive(t.href)) a.classList.add("is-active");
    nav.appendChild(a);
  });

  const moreBtn = el("button", {
    class: "ss-moreBtn",
    type: "button",
    "aria-haspopup": "dialog",
    "aria-expanded": "false",
    "aria-controls": "ss-moreOverlay",
    title: "Mehr"
  });
  const dots = el("span", { class: "ss-moreBtn__dots", "aria-hidden": "true" });
  dots.textContent = "⋯";
  moreBtn.appendChild(dots);

  header.appendChild(brand);
  header.appendChild(nav);
  header.appendChild(moreBtn);

  // Build overlay
  const overlay = el("div", { class: "ss-moreOverlay", id: "ss-moreOverlay", hidden: "hidden" });
  const backdrop = el("div", { class: "ss-moreBackdrop" });
  const menu = el("div", { class: "ss-moreMenu", role: "dialog", "aria-modal": "true", "aria-label": "Mehr Menü" });

  const top = el("div", { class: "ss-moreTop" });
  const title = el("div", { class: "ss-moreTitle" });
  title.textContent = "Mehr";
  const closeBtn = el("button", { class: "ss-moreClose", type: "button", "aria-label": "Schließen" });
  closeBtn.textContent = "×";

  top.appendChild(title);
  top.appendChild(closeBtn);

  const list = el("div", { class: "ss-moreList" });
  MORE.forEach(item => {
    const a = el("a", { class: "ss-moreLink", href: item.href });
    a.textContent = item.label;
    list.appendChild(a);
  });

  menu.appendChild(top);
  menu.appendChild(list);
  overlay.appendChild(backdrop);
  overlay.appendChild(menu);

  mount.appendChild(header);
  mount.appendChild(overlay);

  // Open/close logic
  const lockScroll = (on) => {
    document.documentElement.classList.toggle("ss-noScroll", !!on);
  };

  const open = () => {
    overlay.hidden = false;
    moreBtn.setAttribute("aria-expanded", "true");
    lockScroll(true);
    // focus close for accessibility
    setTimeout(() => closeBtn.focus(), 0);
  };

  const close = () => {
    overlay.hidden = true;
    moreBtn.setAttribute("aria-expanded", "false");
    lockScroll(false);
    moreBtn.focus();
  };

  moreBtn.addEventListener("click", () => (overlay.hidden ? open() : close()));
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) close();
  });
})();

/* SafeShare Shell split: TOP (Header+Tabs) + BOTTOM (Footer+Mehr-Menü)
   Page:
   - <div id="ss-shell-top"></div> near top inside .wrap
   - <div id="ss-shell-bottom"></div> near bottom inside .wrap
   - <body data-shell-sub="..." data-shell-tag="...">
*/
(function () {
  const TOP_HTML = `
    <header>
      <div class="brand">
        <div class="logoWrap" aria-label="SafeShare Logo">
          <img src="logo.svg" alt="SafeShare"
               onerror="this.style.display='none'; document.getElementById('logoFallback').style.display='block';">
          <span id="logoFallback" class="logoFallback">8</span>
        </div>
        <div class="brandText">
          <div class="title">SafeShare</div>
          <div class="sub" id="ssSub">Links teilen. Ohne Ballast.</div>
        </div>
      </div>
      <div class="small" id="ssTag">local-first</div>
    </header>

    <div class="tabsBar">
      <div class="tabs" role="navigation" aria-label="SafeShare Navigation">
        <a class="tab" href="index.html" data-page="index.html">Start</a>
        <a class="tab" href="app.html" data-page="app.html">App</a>
        <a class="tab" href="education.html" data-page="education.html">Schule</a>
        <a class="tab" href="pro.html" data-page="pro.html">Pro</a>
        <a class="tab" href="help.html" data-page="help.html">Hilfe</a>
        <button class="tab moreBtn" id="moreBtn" type="button" aria-haspopup="menu" aria-expanded="false">Mehr ▾</button>
      </div>
    </div>
  `;

  const BOTTOM_HTML = `
    <footer>
      <div class="footGrid">
        <div>
          <div><strong>SafeShare</strong> – Links teilen. Ohne Ballast.</div>
          <div>App: schnell & einfach · Pro: Policies, Whitelist, Audit.</div>
        </div>
        <div class="footLinks">
          <a href="index.html" data-page="index.html">Start</a>
          <a href="app.html" data-page="app.html">App</a>
          <a href="education.html" data-page="education.html">Schule</a>
          <a href="pro.html" data-page="pro.html">Pro</a>
          <a href="help.html" data-page="help.html">Hilfe</a>
          <a href="bookmarklets.html" data-page="bookmarklets.html">Bookmarklets</a>
          <a href="datenschutz.html" data-page="datenschutz.html">Datenschutz</a>
          <a href="impressum.html" data-page="impressum.html">Impressum</a>
          <a href="terms.html" data-page="terms.html">Nutzungsbedingungen</a>
        </div>
      </div>
    </footer>

    <div class="moreOverlay" id="moreOverlay" hidden></div>
    <nav class="moreMenu" id="moreMenu" role="menu" aria-label="Mehr" hidden>
      <div class="menuHint">Support</div>
      <a href="help.html#kontakt" data-page="help.html">Support / Kontakt</a>

      <div class="divider"></div>

      <div class="menuHint">Öffentlich</div>
      <a href="education.html" data-page="education.html">Schule</a>
      <a href="utm-parameter-entfernen.html" data-page="utm-parameter-entfernen.html">UTM</a>
      <a href="tracking-parameter.html" data-page="tracking-parameter.html">Tracking</a>
      <a href="url-cleaner-tool-vergleich.html" data-page="url-cleaner-tool-vergleich.html">Tool-Vergleich</a>
      <a href="bookmarklets.html" data-page="bookmarklets.html">Bookmarklets</a>

      <div class="divider"></div>

      <a href="datenschutz.html" data-page="datenschutz.html">Datenschutz</a>
      <a href="impressum.html" data-page="impressum.html">Impressum</a>
      <a href="terms.html" data-page="terms.html">Nutzungsbedingungen</a>
    </nav>
  `;

  function lockScroll(lock) {
    document.body.style.overflow = lock ? 'hidden' : '';
    document.body.style.touchAction = lock ? 'none' : '';
  }

  function mount() {
    const top = document.getElementById('ss-shell-top');
    const bottom = document.getElementById('ss-shell-bottom');

    // Backward-compat: if someone still has ss-shell, at least render TOP only (no footer)
    const legacy = document.getElementById('ss-shell');

    if (top) top.innerHTML = TOP_HTML;
    if (bottom) bottom.innerHTML = BOTTOM_HTML;
    if (!top && !bottom && legacy) legacy.innerHTML = TOP_HTML;

    const sub = document.getElementById('ssSub');
    const tag = document.getElementById('ssTag');
    if (sub && document.body.dataset.shellSub) sub.textContent = document.body.dataset.shellSub;
    if (tag && document.body.dataset.shellTag) tag.textContent = document.body.dataset.shellTag;

    const file = location.pathname.split('/').pop();
    const path = (!file || file === '') ? 'index.html' : file;

    document.querySelectorAll('[data-page]').forEach(el => {
      if (el.getAttribute('data-page') === path) el.classList.add('active');
    });

    const moreBtn = document.getElementById('moreBtn');
    const mainTabs = new Set(['index.html', 'app.html', 'education.html', 'pro.html', 'help.html']);
    if (moreBtn && !mainTabs.has(path)) moreBtn.classList.add('active');

    const menu = document.getElementById('moreMenu');
    const overlay = document.getElementById('moreOverlay');
    if (!moreBtn || !menu || !overlay) return;

    function openMenu() {
      overlay.hidden = false;
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('open'));
      moreBtn.setAttribute('aria-expanded', 'true');
      lockScroll(true);
    }
    function closeMenu() {
      menu.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
      setTimeout(() => {
        menu.hidden = true;
        overlay.hidden = true;
        lockScroll(false);
      }, 180);
    }

    moreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = moreBtn.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });
    overlay.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && moreBtn.getAttribute('aria-expanded') === 'true') closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

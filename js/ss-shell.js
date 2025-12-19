/* SafeShare Shell (Header + Tabs + Footer + Mehr-Menü)
   Usage in page:
   - <div id="ss-shell"></div> inside .wrap
   - <body data-shell-sub="..." data-shell-tag="...">
   - <script defer src="js/ss-shell.js?v=YYYY-MM-DD-01"></script>
*/
(function () {
  const SHELL_HTML = `
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

  function mountShell() {
    const mount = document.getElementById('ss-shell');
    if (!mount) return;

    // Inject shell
    mount.innerHTML = SHELL_HTML;

    // Set sub/tag from body data attributes
    const sub = document.getElementById('ssSub');
    const tag = document.getElementById('ssTag');
    if (sub && document.body.dataset.shellSub) sub.textContent = document.body.dataset.shellSub;
    if (tag && document.body.dataset.shellTag) tag.textContent = document.body.dataset.shellTag;

    // Active highlighting
    const file = location.pathname.split('/').pop();
    const path = (!file || file === '') ? 'index.html' : file;

    document.querySelectorAll('[data-page]').forEach(el => {
      if (el.getAttribute('data-page') === path) el.classList.add('active');
    });

    // If current page isn't in main tabs, highlight "Mehr"
    const mainTabs = new Set(['index.html', 'app.html', 'education.html', 'pro.html', 'help.html']);
    const moreBtn = document.getElementById('moreBtn');
    if (moreBtn && !mainTabs.has(path)) moreBtn.classList.add('active');

    // More sheet
    const menu = document.getElementById('moreMenu');
    const overlay = document.getElementById('moreOverlay');

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

    if (moreBtn && menu && overlay) {
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountShell);
  } else {
    mountShell();
  }
})();

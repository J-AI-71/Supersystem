/* Clean-URL Helper ohne Redirect-Loops
   - Wenn *.html geladen wurde: URL "sauber" machen per history.replaceState (kein Reload).
   - Wenn "clean" URL geladen wurde: NICHT weiterleiten (Cloudflare Pages liefert per _redirects 200 die Datei aus).
   - Nur auf GitHub Pages (github.io) darf clean -> .html per location.replace passieren.
*/
(() => {
  'use strict';

  const host = location.hostname.toLowerCase();
  const path = location.pathname;

  // Verifizierungsdateien/Assets nie anfassen
  if (/^\/google[a-z0-9]+\.html$/i.test(path)) return;
  if (/\.(css|js|png|jpg|jpeg|webp|svg|ico|webmanifest|json|txt|xml|pdf|zip)$/i.test(path)) return;

  const isGithubPages = host.endsWith('github.io');

  // 1) Wenn .html geladen wurde → nur URL umschreiben (kein Redirect)
  if (path.endsWith('.html')) {
    const clean = path
      .replace(/index\.html$/i, '')
      .replace(/\.html$/i, '');

    const newPath = clean === '' ? '/' : clean;
    const newUrl = newPath + location.search + location.hash;

    const currentUrl = location.pathname + location.search + location.hash;
    if (newUrl !== currentUrl) history.replaceState(null, '', newUrl);
    return;
  }

  // 2) Nur GitHub Pages: clean -> .html (weil GH keine _redirects-Rewrites macht)
  if (isGithubPages) {
    if (path === '/' || path.endsWith('/')) return;
    location.replace(path + '.html' + location.search + location.hash);
  }

  // 3) Auf Custom Domains / Cloudflare Pages: KEIN Redirect (sonst Loops)
})();

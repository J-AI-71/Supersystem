# SafeShare

SafeShare entfernt Tracking-Parameter (`utm_*`, `fbclid`, `gclid`, …), löst Wrapper (Google `/url`, Facebook `/l.php`), bereinigt AMP-Pfade und kann Affiliate-Parameter auf Wunsch behalten. 1-Klick, Classic-Modus, Profile pro Domain, Bookmarklets, PWA, Offline-Cache.

## Features
- SAFE/STRICT: Affiliates behalten oder strikt alles entfernen
- Tiefes Unwrapping: verschachtelte Links, Google/Facebook-Wrapper, AMP
- Öffnen: gleicher Tab, neuer Tab, referrer-frei, Reload
- Profile pro Domain: SAFE/STRICT merken, Export/Import als JSON
- Bookmarklets für Desktop und iOS
- PWA mit Manifest und Service Worker

## Live-Links
- Start: https://j-ai-71.github.io/Supersystem/index.html
- App: https://j-ai-71.github.io/Supersystem/app.html
- Classic: https://j-ai-71.github.io/Supersystem/app-classic.html
- Bookmarklets: https://j-ai-71.github.io/Supersystem/bookmarklets.html
- Tools (Cache/SW/LS): https://j-ai-71.github.io/Supersystem/tools.html
- Tests: https://j-ai-71.github.io/Supersystem/tests.html
- Danke: https://j-ai-71.github.io/Supersystem/danke.html
- Impressum: https://j-ai-71.github.io/Supersystem/impressum.html
- Datenschutz: https://j-ai-71.github.io/Supersystem/datenschutz.html
- robots.txt: https://j-ai-71.github.io/Supersystem/robots.txt
- sitemap.xml: https://j-ai-71.github.io/Supersystem/sitemap.xml
- security.txt: https://j-ai-71.github.io/Supersystem/.well-known/security.txt

## Quickstart
1. `https://j-ai-71.github.io/Supersystem/app.html` öffnen.  
2. Link einfügen → **Säubern**.  
3. **Kopieren**, **Öffnen**, **1-Klick**, optional **Referrer-frei**.  
4. Haken „Provisionen behalten“ an = **SAFE**. Aus = **STRICT**.

## Ein-Klick-Tester
- SAFE (Affiliates bleiben):  
  `https://j-ai-71.github.io/Supersystem/app.html?aff=1&ao=1&u=https%3A%2F%2Fwww.amazon.de%2Fdp%2FTEST%3Ftag%3Ddeintag-21%26utm_source%3Dx`
- STRICT (alles weg):  
  `https://j-ai-71.github.io/Supersystem/app.html?aff=0&ao=1&u=https%3A%2F%2Fl.facebook.com%2Fl.php%3Fu%3Dhttps%253A%252F%252Fnews.site%252Fa%253Futm_campaign%253Dx%26fbclid%3DABC`

## Bookmarklets
**Desktop:** Lesezeichen anlegen, URL durch Code ersetzen.  
**iOS Safari:** Lesezeichen speichern → bearbeiten → URL ersetzen.

- Affiliate-safe:
javascript:(()=>{const u=location.href;location.href='https://j-ai-71.github.io/Supersystem/app.html?aff=1&ao=1&u='+encodeURIComponent(u);})();

- Strict:
javascript:(()=>{const u=location.href;location.href='https://j-ai-71.github.io/Supersystem/app.html?aff=0&ao=1&u='+encodeURIComponent(u);})();

## URL-Parameter (App-API)
- `u` oder `url`: zu reinigende URL (url-enkodiert)  
- `aff=1|0` oder `mode=safe|strict`: Affiliate behalten ja/nein  
- `ao=1`: nach dem Säubern automatisch öffnen  
Beispiel: `/Supersystem/app.html?u=<ENCODED>&aff=1&ao=1`

## Profile pro Domain
SAFE/STRICT pro Host speichern. Export/Import als JSON. Sticky-Standard möglich.  
Speicherort: LocalStorage im Browser. Keine Serverdaten.

## Datenschutz
Keine Serverlogs. Keine Cookies. Einstellungen nur lokal. „Referrer-frei“ öffnet ohne Referrer.

## PWA / Offline
- Manifest: `/Supersystem/manifest.webmanifest`  
- Service Worker: `/Supersystem/sw.js`  
Installation über „Zum Home-Bildschirm“. Kernseiten offline verfügbar.

## Cache leeren
- Tools: `/Supersystem/tools.html` → **Alle Caches löschen** → **Service Worker abmelden** → Seiten mit `?v=NN` neu laden.

## Projektstruktur (vollständige Pfade)
- HTML:  
  `/Supersystem/index.html`  
  `/Supersystem/app.html`  
  `/Supersystem/app-classic.html`  
  `/Supersystem/bookmarklets.html`  
  `/Supersystem/tools.html`  
  `/Supersystem/tests.html`  
  `/Supersystem/partner.html`  
  `/Supersystem/danke.html`  
  `/Supersystem/faq.html`  
  `/Supersystem/changelog.html`  
  `/Supersystem/impressum.html`  
  `/Supersystem/datenschutz.html`
- Meta:  
  `/Supersystem/robots.txt`  
  `/Supersystem/sitemap.xml`  
  `/Supersystem/manifest.webmanifest`  
  `/Supersystem/.well-known/security.txt`  
  `/Supersystem/.nojekyll`
- Assets:  
  `/Supersystem/safeshare-og-v3b.png`  
  `/Supersystem/favicon-32.png`
- Service Worker:  
  `/Supersystem/sw.js`
- Lizenz und Doku:  
  `/Supersystem/LICENSE`  
  `/Supersystem/README.md`

## Changelog
Aktuell siehe `/Supersystem/changelog.html`.

## Lizenz
MIT © 2025 J-AI-71 – siehe `/Supersystem/LICENSE`.

## Support, Förderung, Partnerschaft
- E-Mail: `support.safeshare@proton.me`
- Payhip (Kauf/Spende): https://payhip.com/b/VDm3B
- Partner werden: https://payhip.com/auth/register/af69075ca4efafa

## Roadmap
- Mehr Host-Regeln für Affiliates  
- UI-Hinweise zu entfernten Parametern pro Link  
- Export als CSV  
- Option „immer Referrer-frei“  
- Tests erweitern
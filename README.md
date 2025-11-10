# SafeShare — Links ohne Tracking

Kleines Web-Tool: entfernt Tracking-Parameter (utm_, gclid, fbclid, …), entpackt Redirects (Google/Facebook), optional Affiliate-Provisionen behalten.

## Live
- App (v41): https://j-ai-71.github.io/Supersystem/app.html
- Classic:   https://j-ai-71.github.io/Supersystem/app-classic.html
- Start:     https://j-ai-71.github.io/Supersystem/

## Features
- Entfernt: `utm_*`, `gclid`, `fbclid`, `twclid`, `msclkid`, `wtmc`, `xtor`, u. a.
- Entschachtelt Redirects, AMP → Canonical, Hash-Cleanup, Sort & Dedupe.
- Affiliate-safe (AN) oder Strict (AUS).
- Statuspanel: Behalten/Entfernt. v41: Lern-Killliste + Domain-Profile.
- Bookmarklets (Sticky/Reload).

## Schnellstart
1. Öffne die App → Link einfügen → **Säubern**.
2. Checkbox **Provisionen behalten** ein = Affiliates bleiben. Aus = Strict.
3. **Öffnen** (gleicher Tab) oder **1-Klick** (neuer Tab).

## Auto-Parameter
- `?u=<urlenc-URL>` füllt Eingabe.
- `&open=1` öffnet nach Säubern.
- `?help=1` zeigt Hilfe offen.
- `?reset=1` löscht lokale App-Einstellungen.
- `&v=42` Cache-Buster.

## Bookmarklets
Siehe `bookmarklets.html`. Sticky=ohne Reload, Reload=robuster.

## Monetarisierung
- Produkt/Support: https://payhip.com/b/VDm3B  
- Success-Redirect: `/danke.html`  
- Affiliate-Programm: https://payhip.com/auth/register/af69075ca4efafa

## Datenschutz
Kein Server-Logging. Läuft komplett im Browser.

## Lizenz
MIT (siehe `LICENSE`).
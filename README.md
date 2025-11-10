# SafeShare – Links ohne Tracking

SafeShare entfernt Tracking-Parameter (`utm_*`, `fbclid`, `gclid`, …), löst Weiterleitungs-Wrapper (z. B. Google `/url?q=`, Facebook `/l.php?u=`), und kann Affiliate-Parameter im **SAFE**-Modus behalten. Alles läuft lokal im Browser, ohne Cookies oder Server-Speicherung.

---

## Live

- **App:** https://j-ai-71.github.io/Supersystem/app.html  
- **Classic:** https://j-ai-71.github.io/Supersystem/app-classic.html  
- **Startseite:** https://j-ai-71.github.io/Supersystem/index.html  
- **Bookmarklets:** https://j-ai-71.github.io/Supersystem/bookmarklets.html  
- **Partner werden:** https://j-ai-71.github.io/Supersystem/partner.html  
- **Danke:** https://j-ai-71.github.io/Supersystem/danke.html

> Cache-Buster bei Updates: `?v=77` anfügen.

---

## Schnellstart

1. **App öffnen:** `app.html` oder **Classic** `app-classic.html`.
2. **Link einfügen → Säubern → Kopieren** oder **Öffnen / 1-Klick**.
3. Optional:
   - **SAFE** (Affiliates behalten) oder **STRICT** (alles weg) wählen.
   - **Profile pro Domain** setzen (SAFE/STRICT) und exportieren/importieren.
   - **Referrer-frei** öffnen oder **Reload** (aktuellen Tab ersetzen).

---

## Funktionen

- Entfernt: `utm_*`, `fbclid`, `gclid`, `twclid`, `msclkid`, `xtor`, `mkt_tok`, `si`, `spm`, `client`, `zx`, `no_sw_cr`, u. a.  
- Löst Wrapper: Google `/url?q=`, Facebook `/l.php?u=`, AMP-Pfade.  
- **SAFE**: typische Affiliate-Parameter bleiben (z. B. Amazon `tag`).  
- **STRICT**: alles weg, inkl. Affiliate.  
- **Profile pro Domain**: pro Host SAFE/STRICT vormerken.  
- **Export/Import**: Profile lokal als JSON sichern.  
- **Referrer-frei**: im neuen Tab ohne Referrer öffnen.  
- **Reload**: aktuellen Tab auf bereinigte URL ersetzen.  
- **Bookmarklets**: 1-Klick-Reinigung direkt von Webseiten.

---

## URL-Parameter (Automatik)

- `u=` URL-enkodierte Quell-URL  
- `aff=1|0` → `1` = SAFE, `0` = STRICT  
- `ao=1` → nach dem Säubern automatisch öffnen

**Beispiel (SAFE + Auto-Open):**
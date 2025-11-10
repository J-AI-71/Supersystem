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
/app.html?aff=1&ao=1&u=https%3A%2F%2Fwww.amazon.de%2Fdp%2FTEST%3Ftag%3Ddeintag-21%26utm_source%3Dx

Erwartet:
- **SAFE** → `https://www.amazon.de/dp/TEST?tag=deintag-21`
- **STRICT** → `https://www.amazon.de/dp/TEST`

---

## Bookmarklets

Seite: https://j-ai-71.github.io/Supersystem/bookmarklets.html

- **Desktop:** Button „SAFE“ oder „STRICT“ in die Lesezeichenleiste ziehen.  
- **iOS:** Lesezeichen anlegen → URL des Lesezeichens durch den Code ersetzen.  
- Anwendung: Auf einer Seite mit langem Tracking-Link das Lesezeichen antippen → SafeShare säubert und öffnet.

---

## Testlinks

- **Amazon SAFE:**  

app.html?aff=0&u=https%3A%2F%2Fwww.amazon.de%2Fdp%2FTEST%3Ftag%3Ddeintag-21%26utm_medium%3Demail

- **Amazon STRICT:**  

app.html?aff=0&u=https%3A%2F%2Fwww.amazon.de%2Fdp%2FTEST%3Ftag%3Ddeintag-21%26utm_medium%3Demail

- **Facebook-Wrapper:**  

app.html?u=https%3A%2F%2Fl.facebook.com%2Fl.php%3Fu%3Dhttps%253A%252F%252Fnews.site%252Fa%253Futm_medium%253Dcpc%26fbclid%3DABC

---

## Dateien

- `index.html` – Landing, QR, CTAs, Changelog  
- `app.html` – Vollversion mit Profilen, Sticky, Reload, Kurzanleitung  
- `app-classic.html` – schlanke Version ohne Profile/Sticky  
- `bookmarklets.html` – Bookmarklets „SAFE/STRICT“  
- `partner.html` – Affiliate-Infos und Bewerbungslink  
- `danke.html` – Erfolgsseite nach Kauf/Tip  
- `impressum.html`, `datenschutz.html` – rechtliche Seiten  
- Assets: `safeshare-og-v3b.png`, `favicon-32.png`

---

## Entwicklung

- **Vanilla JS**, keine Abhängigkeiten, alles clientseitig.  
- Hosting über **GitHub Pages** (Repo → Settings → Pages → Branch `main`/`docs`).  
- Änderungen deployen per Commit auf `main` und hart neu laden (`Ctrl/Cmd+Shift+R`).

---

## Changelog (Kurz)

- **v42**: Sticky-Modus, Reload, Kurzanleitung im App-UI, Host-Kleinschreibung.  
- **v41**: Referrer-frei, Profile-X, Export/Import.  
- **v40**: SAFE/STRICT, tiefes Unwrapping, 1-Klick.

---

## Datenschutz

- Keine Cookies. Keine Analytics.  
- Verarbeitung ausschließlich im Browser.  
- Profile werden nur lokal im **LocalStorage** gespeichert.  
- Zahlungen/Provisionen: über **Payhip** gemäß deren Richtlinien.

---

## Support

- E-Mail: **support.safeshare@proton.me**  
- Produkt/Tip: https://payhip.com/b/VDm3B  
- Partner werden: https://j-ai-71.github.io/Supersystem/partner.html

---

## Lizenz
MIT © 2025 J-AI-71 – siehe [LICENSE](./LICENSE)







# Contributing

Danke für jeden Beitrag. Ziel: einfache, build-freie Website.

## Ablauf
1. Issue anlegen (Bug oder Feature), kurz Problem/Nutzen beschreiben.
2. Fork oder Branch erstellen.
3. Änderungen in HTML/CSS/JS ohne Build-Tool.
4. Lokal/Browser testen:
   - `/Supersystem/tests.html` alle Fälle = OK
   - `app.html`: SAFE und STRICT mit Beispiel-URL
   - Bookmarklets: Desktop + iOS
   - Cache sauber: `/Supersystem/tools.html` → Alle Caches löschen + SW abmelden
5. Pull Request eröffnen. Kurz zusammenfassen, was geändert wurde.

## Leitlinien
- Keine externen Bibliotheken.
- Performance: klein, schnell, kein Tracking.
- Sicherheit: CSP nicht aufweichen. Keine Inline-Remote-Scripts.
- Barrierefreiheit: Buttons sind <button>, Links sind <a>.
- Texte: Deutsch, präzise.

## Code-Stil
- HTML5, semantisch. Kein Framework.
- CSS: kleine Utility-Klassen, keine globalen Resets.
- JS: ES2019+, keine Abhängigkeiten. Nur `fetch`, `URL`, `localStorage`.

## Tests
- Beispiel-URLs aus `tests.html` nutzen.
- „Entfernt:“ Liste prüfen.
- SAFE: Affiliate-Keys bleiben (z. B. `tag`).
- STRICT: alle Tracking-/Affiliate-Keys weg.

## Kontakt
support.safeshare@proton.me

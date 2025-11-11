# Contributing

- Kleine Änderungen direkt per PR.
- Größere Änderungen erst Issue eröffnen.
- Code im Browser testbar machen (keine Build-Schritte).
- HTML/CSS/JS ohne externe Abhängigkeiten.
- CSP nicht aufweichen (nur bei Bedarf ergänzen).

## Test-Checkliste
- /Supersystem/tests.html alle Fälle = OK
- App: SAFE und STRICT mit Beispiel-URL
- Bookmarklets: Desktop + iOS
- SW/Cache: tools.html → Alle Caches löschen, SW abmelden → Reload

# Prüfstand, 18.10.2026

## Ausgeführt

- JavaScript-Syntax mit `npm run check`: bestanden.
- Lokale HTTP-Seite und Assets im Chromium-Browser geladen.
- 3D-Vorschau: `model-viewer.loaded === true`; Modell sichtbar mit Textur.
- Desktop und 390 × 844 Pixel: Screenshots unter `output/playwright/`, kein horizontaler Überlauf auf Start- und AR-Seite.
- AR-Seite: Modell geladen und automatisch normalisiert, Startknopf freigegeben, vor Tippen kein Videostream.
- Simulierte Kameraverweigerung (`getUserMedia` wirft `NotAllowedError`): verständlicher Fehler mit erneutem Versuch, kein JavaScript-Fehler nach Korrektur des Aufräumens.
- Echtes MindAR-Tracking mit **synthetischem** Kamerastream: Ein Canvas zeigt das unveränderte Zielbild im korrekten Seitenverhältnis und stellt `captureStream(10)` als Kameraeingang bereit. Keine echte Kamera benutzt. MindAR meldet `targetFound`, der Zielanker ist sichtbar und der Brunnen wird gerendert. Screenshot: `output/playwright/ar-synthetic-recognized.png`.
- Drehknopf: 45 Grad; Zurücksetzen: 0 Grad und Größe 0,85.
- Zielbild im synthetischen Stream durch Weiß ersetzt: MindAR meldet Zielverlust, Modellanker unsichtbar, Suchhinweis sichtbar.
- Kamera stoppen: Videotrack `ended`, kein Videoelement mehr vorhanden.
- Druckseite geöffnet und Bildansicht geprüft; Druckdialog über Browser-Druckfunktion vorbereitet.

Die Kamera-Simulation besteht ausschließlich im Testbrowser. Sie ist nicht im Anwendungscode enthalten.

## Verbleibende Grenzen

- Kein echter Android-/iPhone-Kameratest. Licht, Spiegelungen, Bewegungsunschärfe, Gerätegeschwindigkeit und Kameraberechtigungen am Handy bleiben praktisch zu prüfen.
- Kein physischer Ausdruck getestet.
- Keine vollständige Prüfung auf Barrierefreiheit.
- A-Frame erzeugt eine nicht blockierende Three.js-Warnung zur veralteten Eigenschaft `useLegacyLights`. Rendering und MindAR-Erkennung waren erfolgreich.
- Der ursprüngliche Browser-Test erfolgte lokal. Diese Repository-Version ist für öffentliche Veröffentlichung mit GitHub Pages eingerichtet; ein echter Handy-Kameratest steht weiterhin aus.

## Modell

Original ca. 43,67 MB; Web-Ableitung ca. 6,23 MB. Originaldatei unverändert. Ableitung mit glTF Transform 4.5.1, Geometrie vereinfacht und Textur auf höchstens 2048 Pixel verkleinert. Visuell als Brunnen mit Textur geladen; keine Garantie auf identische Detailtreue.

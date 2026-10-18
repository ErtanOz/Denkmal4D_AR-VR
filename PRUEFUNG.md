# Prüfstand, 18.10.2026

## Nachprüfung, 19.10.2026: Fingerbedienung in der AR-Kamera

- Ausgangsfehler im laufenden alten AR-Browser reproduziert: ein emulierter Touch-Drag ließ die Modellrotation unverändert (`[0,0,0,1]` vor und nach der Geste). Die interaktive Startseiten-Vorschau hatte eigene Bedienung; die Kameraansicht noch keine Gesten.
- Native Touch-Ereignisse über Chromium DevTools (`Input.dispatchTouchEvent`, keine manuell ausgelösten DOM-PointerEvents), 390 × 844 Pixel. Kameraeingang weiterhin synthetisch; kein Handy-Hardwaretest.
- Neun Ablaufgruppen bestanden: Ein-Finger-Rotation; Zwei-Finger-Zoom; Zwei-Finger-Twist; Wechsel von zwei auf einen Finger ohne Sprung; Gestenabbruch; Dropdown/Drehknopf/Reset ohne Änderung anderer Modelle; per Raycasting berührtes Modell bei vier gleichzeitigen Zielen korrekt auswählen und drehen; Zielverlust bricht die Geste ab; Kamerastopp deaktiviert Gesten und entfernt Video.
- Die Quaternion blieb normalisiert. Beim Vergrößern/Verkleinern blieb `visualViewport.scale` bei 1; der Browser zoomte die Seite nicht.
- Ergänzend geprüft: Kameraneustart nach Stopp, Zoom-Minimum 0,15 = 25 %, Maximum 3 = 500 %, Prozentanzeige und Reset auf 100 %. Werte bleiben auch bei weitergeführter Pinch-Geste an den Grenzen.
- Bedienelemente bleiben über der transparenten Gestenfläche erreichbar. Screenshot `output/playwright/ar-touch-mobile.png` visuell geprüft. Testablauf lokal unter `output/playwright/touch-qa.js` (QA-Ausgabe wird nicht ins Repository eingecheckt).
- Keine JavaScript-Fehler in diesen Browserabläufen. Bekannte nicht blockierende Three.js-Warnung unverändert. Ein echter Safari-/Android-Kamera-/Touchtest und eine vollständige Barrierefreiheitsprüfung stehen weiterhin aus.

## Nachprüfung, 19.10.2026: vier Modelle und vier eigene Bildmarker

- Vier unterschiedliche, reproduzierbar erzeugte Scanbilder mit Modellnamen und Nummern. `models.json` legt die Reihenfolge 0–3 fest.
- Alle vier Bilder mit dem offiziellen MindAR-Compiler 1.2.5 im Browser zu `assets/targets/targets.mind` kompiliert: 4 Ziele, 2.157.949 Bytes.
- Alle vier GLB-Webmodelle geladen. Einzelne Vorschaubilder von Grabstein, Löwenherz und korrigiertem Weihestein aufgenommen und angesehen.
- Echter MindAR-Detektor mit synthetischem Canvas-Kamerastream (1600 × 1200 Pixel): alle vier Marker erkannt, Status „4 / 4 sichtbar“, vier unabhängige sichtbare Modellanker. Keine echten Kameraaufnahmen verwendet.
- Nur Grabstein-Marker aus dem Stream entfernt: nur dessen Modellanker verschwindet; die anderen drei bleiben sichtbar.
- Löwenherz ausgewählt und gedreht: nur dessen Drehung 45 Grad, die anderen drei 0 Grad. Reset geprüft.
- Startseite bei 390 × 844 Pixel: vier Modelloptionen, kein horizontaler Überlauf. Druckkartenansicht separat geprüft.
- Bilddateien im ZIP zum Herunterladen. Drucklayout: eine quadratische Karte pro A4-Seite. Kein physischer Ausdruck getestet.
- Weihesteine: Webkopie auf ca. 5,76 MB vereinfacht, Z-Achse nach Y gedreht, neutrales nichtmetallisches Material ergänzt. Keine ursprüngliche Textur vorhanden. Originaldatei unverändert.
- Glättung aus der vorherigen Änderung beibehalten. Vier Modelle brauchen mehr Geräte-/GPU-Leistung. Bildrate und Stabilität auf einem echten Handy sind weiterhin ungeprüft.

Die älteren Abschnitte dokumentieren den ursprünglichen Einzelmodell-Stand; aktuelle Scanbilder liegen unter `assets/targets/` und ersetzen das frühere Testbild.

## Nachprüfung, 19.10.2026: Tracking-Glättung

- Eingestellte Werte im laufenden MindAR-System geprüft: `filterMinCF = 0.001`, `filterBeta = 10`, `warmupTolerance = 8`, `missTolerance = 8`.
- Neue Anfangsgröße und Reset-Größe: 0,6.
- JavaScript-Syntaxprüfung und `git diff --check`: bestanden.
- Erneuter synthetischer Kamera-Test mit unverändertem Scanbild: `targetFound`, Status „Bild erkannt“, Modellanker sichtbar; keine JavaScript-Fehler.
- Die stärkere Glättung wurde nicht auf einem echten Handy verglichen. Eine messbare Verringerung des Wackelns ist damit noch nicht bestätigt; die Einstellungen können mehr Verzögerung verursachen.

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

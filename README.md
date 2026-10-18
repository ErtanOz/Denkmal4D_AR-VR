# Hänneschen-Brunnen mit MindAR

Handy-Webseite mit Bildtracking, 3D-Vorschau, druckbarem Scanbild, Größenregler und Drehfunktion. Das Repository enthält die optimierte Web-Version des Modells. Das lokale Originalmodell bleibt unverändert.

**Webseite:** https://ErtanOz.github.io/Denkmal4D_AR-VR/

**Scanbild:** https://ErtanOz.github.io/Denkmal4D_AR-VR/target.html

## Lokal starten

Node.js installieren, in diesem Ordner ein Terminal öffnen und ausführen:

```powershell
npm start
```

Am PC: http://localhost:5173. Kein npm install erforderlich. Der Server lauscht nur lokal.

## Mit dem Handy verwenden

1. Die oben verlinkte GitHub-Pages-Adresse direkt in Safari (iPhone) oder Chrome (Android) öffnen. Die Webseite ist öffentlich, ohne Anmeldung.
2. `target.html` am PC öffnen und das Scanbild ausdrucken oder am PC anzeigen.
3. Am Handy „AR mit Kamera starten“ und danach „Kamera starten“ wählen. Kamera erlauben.
4. Das ganze Scanbild erfassen, langsam bewegen und gut beleuchten. Das Modell bleibt an das Bild gebunden und verschwindet, wenn das Bild nicht mehr erkannt wird.

Eine gewöhnliche HTTP-WLAN-Adresse reicht am Handy nicht: Kamerazugriff braucht HTTPS. `localhost` auf dem Handy bezeichnet das Handy selbst. Für eine eigene Bereitstellung den gesamten Inhalt von `dist/` auf einen HTTPS-fähigen statischen Webserver kopieren. Die Kamera muss im Browser zugelassen sein. Kein Öffnen über `file://`.

## Eigenes Scanbild

Momentan ist das offizielle MindAR-Beispielziel eingebaut. Ein beliebiges Foto oder QR-Code wird **nicht** automatisch erkannt. Ein QR-Code kann lediglich den Link zur Seite öffnen.

1. Ein detailreiches Foto im [offiziellen MindAR-Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/) kompilieren.
2. Die exportierte `.mind`-Datei als `dist/assets/zielbild.mind` speichern (genau ein Ziel, Index 0).
3. Genau das zugehörige Bild als `dist/assets/zielbild.png` speichern.
4. Neu veröffentlichen bzw. lokalen Server nutzen und Browser neu laden.

## Dateien und Technik

- `dist/index.html`: Startseite mit drehbarer 3D-Vorschau.
- `dist/ar.html`, `ar.js`: MindAR-Kamera und Bildtracking; Kamera startet nach Tippen und stoppt beim Verlassen/Hintergrundwechsel.
- `dist/target.html`: Druckseite für das Zielbild.
- `dist/assets/brunnen.glb`: mobile Ableitung (ca. 6,2 MB, reduzierte Geometrie und Textur bis 2048 Pixel).
- `dist/vendor/`: A-Frame 1.6.0, MindAR 1.2.5, model-viewer 4.0.0. Bibliotheken lokal; die Vorschau-Bibliothek kann zusätzlich Ressourcen von Google laden, Schriftarten kommen von Google Fonts. MindAR kann Laufzeitressourcen wie TensorFlow/WASM nachladen. Internetverbindung verwenden; kein garantierter Offlinebetrieb.

Die Anwendung lädt Kameraaufnahmen nicht auf einen Server. Das 3D-Modell ist eine vereinfachte Scan-Version; Form und Textur können gegenüber dem Original abweichen.

## Veröffentlichung

Jeder Push auf `main` startet `.github/workflows/pages.yml`. Der Workflow prüft die JavaScript-Syntax und veröffentlicht `dist/` über GitHub Pages. Das Repository verwendet in **Settings → Pages → Source** die Einstellung **GitHub Actions**. Es sind keine API-Schlüssel oder zusätzlichen Secrets für die Webseite nötig.

## Nachvollziehbare Modelloptimierung

Dieser Befehl wurde mit dem lokalen Originalmodell ausgeführt. Das Original ist nicht im Repository enthalten; der Lauf ist für den normalen Start nicht nötig.

```powershell
npx --yes @gltf-transform/cli@4.5.1 optimize ../haennesschen_brunnen_an_der_dau.glb dist/assets/brunnen.glb --compress false --texture-compress auto --texture-size 2048 --simplify-ratio 0.3 --simplify-error 0.001 --instance false
```

Das Modell wird beim Laden anhand seiner tatsächlichen Grenzen zentriert und auf die Breite des Bildes skaliert. Der Modellfuß liegt auf der Bildebene. Bei liegendem Scanbild steht der Brunnen; bei aufrechtem Bild ragt er aus dem Bild heraus.

## Quellen und Lizenzen

- Modell: **Digital Heritage Lab**, [Haennesschen Brunnen an der Dau](https://sketchfab.com/3d-models/haennesschen-brunnen-an-der-dau-f79426ea54ec40bea6f6c24eb8af9900), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Für diese Anwendung verkleinert; Originalmetadaten erhalten.
- [MindAR](https://github.com/hiukim/mind-ar-js), MIT, einschließlich unverändertem `card-example`-Zielbild und Erkennungsdatei.
- [A-Frame](https://github.com/aframevr/aframe), MIT.
- [model-viewer](https://github.com/google/model-viewer), Apache 2.0.

## Prüfung

`npm run check` prüft JavaScript-Syntax. Browser-Prüfungen und ihre Grenzen stehen in `PRUEFUNG.md`. Ein echter Handy-Kameratest ist für eine endgültige Freigabe erforderlich.

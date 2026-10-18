# Denkmal4D – vier eigene Scanbilder, vier 3D-Modelle

**Webseite:** https://ertanoz.github.io/Denkmal4D_AR-VR/

**Scanbilder zum Drucken:** https://ertanoz.github.io/Denkmal4D_AR-VR/target.html?v=multi1

**AR-Kamera:** https://ertanoz.github.io/Denkmal4D_AR-VR/ar.html?v=touch1

## Material für den Workshop

- [Gesamtes Workshop-Paket mit 6 A4-Seiten](https://ertanoz.github.io/Denkmal4D_AR-VR/workshop/Denkmal4D_Workshop_Paket.pdf): Anleitung, QR-Code zur Live-Demo, Touch-Gesten, Partneraufgaben, Testprotokoll und alle vier großen Scanbilder.
- [Teilnehmenden-Handout mit 2 Seiten](https://ertanoz.github.io/Denkmal4D_AR-VR/workshop/Denkmal4D_Workshop_Handout.pdf).
- [Vier Scanbild-Seiten für die Tische](https://ertanoz.github.io/Denkmal4D_AR-VR/workshop/Denkmal4D_Workshop_Scanbilder.pdf).

Druck: Anleitung pro Person; Scanbilder einseitig in A4 bei 100 % pro Tisch. Der QR-Code öffnet die Live-Demo, die großen nummerierten Bilder sind die Erkennungsziele. Kein Workshop-Datum vorausgesetzt; der PDF-Kopf nennt den Bearbeitungsstand. Teilnehmende können das Paket ohne Anmeldung direkt weitergeben.

Erzeugung: `scripts/create-workshop-handout.py` mit Python und `reportlab`, `qrcode`, `Pillow`; Ausgaben unter `output/pdf/`, veröffentlichte Kopien unter `dist/workshop/`. PDF-Seiten wurden gerendert und visuell geprüft; QR-Codes aus den gerenderten Seiten maschinell zurückgelesen. Der physische Ausdruck bleibt praktisch zu testen.

## Zuordnung

| Nr. / MindAR-Index | Modell | Bild unter `dist/assets/targets/` | Web-Modell unter `dist/assets/` |
| --- | --- | --- | --- |
| 01 / 0 | Hänneschen-Brunnen | `brunnen.png` | `brunnen.glb` |
| 02 / 1 | Grabstein | `grabstein.png` | `grabstein.glb` |
| 03 / 2 | Löwenherz Köln | `loewenherz.png` | `loewenherz.glb` |
| 04 / 3 | Weihesteine | `weihesteine.png` | `weihesteine.glb` |

Alle vier Bilder sind gemeinsam in `dist/assets/targets/targets.mind` kompiliert. `models.json` dokumentiert die feste Reihenfolge. Die AR-Seite hat vier unabhängige Anker und `maxTrack: 4`. Das frühere offizielle Testbild `zielbild.png` wird von dieser neuen Version nicht mehr erkannt.

## Mit dem Handy ausprobieren

1. Die Druckseite am PC öffnen. Alle vier Karten (eine pro Seite) oder über „Nur diese Karte öffnen“ eine einzelne Karte ausdrucken.
2. Die Karten flach, mit Abstand und ohne starke Spiegelungen auslegen. Jedes ganze Bild muss im Kamerabild erkennbar sein.
3. Auf dem Handy die AR-Seite direkt in Safari oder Chrome öffnen. Modelle laden lassen, „Kamera starten“ wählen und Kamera erlauben.
4. Ein oder mehrere Bilder erfassen. Jedes Bild zeigt ausschließlich sein zugeordnetes Modell. Bei Zielverlust verschwindet nur dessen Modell.
5. Das gewünschte Modell im Kamerabild antippen oder unter „Modell bearbeiten“ auswählen. Mit **einem Finger ziehen**: frei um alle Ansichten drehen und kippen. Mit **zwei Fingern auseinander-/zusammenziehen**: vergrößern/verkleinern. Mit **zwei Fingern verdrehen**: um die Blickrichtung drehen. Größe und Orientierung bleiben pro Modell getrennt gespeichert. „Zurücksetzen“ stellt nur die Auswahl wieder aufrecht und auf 100 %.

Die Gesten gelten für das sichtbare, ausgewählte Modell. Eine auf dem Modell begonnene Geste wählt es automatisch; bei einer Geste auf freier Kamerafläche wird die sichtbare Auswahl verwendet. Die Auswahl bleibt bis zum Ende der Geste fest, auch wenn weitere Marker auftauchen. Verschwindet das Scanbild, endet die Geste; das Modell bleibt weiterhin an seinen Marker gebunden. Ein Finger kann nach einer Zwei-Finger-Geste ohne Sprung weiterdrehen. Die Webseite selbst wird beim Pinch nicht gezoomt. Regler und Knöpfe bleiben erreichbar; mit der Maus funktionieren Ziehen und Mausrad.

Zoom ist auf **25–500 %** der Anfangsgröße begrenzt, damit das Modell weder beliebig klein noch numerisch unbeherrschbar groß wird. Große Modelle können aus dem Kamerabild ragen; „Zurücksetzen“ stellt die Anfangsansicht wieder her. Freie Rotation erfolgt mit Quaternionen um die Modellmitte und in Bezug auf die Blickrichtung. Damit gibt es keine feste Kippgrenze und keine Euler-Winkelsperre. Standardmäßig liegt der Modellfuß auf dem Bild; nach freiem Kippen kann das Objekt die Bildebene schneiden.

Vier gleichzeitige Modelle belasten das Handy stärker. Die tatsächliche Bildrate und Stabilität hängen vom Gerät, Licht und Kamerabild ab. Die Modelle umfassen zusammen etwa 28 MB. Internetverbindung verwenden; Offlinebetrieb wird nicht zugesichert. Kameraaufnahmen werden von dieser Anwendung nicht hochgeladen.

Die neuen Karten sind detailreiche, unterschiedliche Bildmarker und keine QR-Codes. Sie sind mit `scripts/create-targets.py` deterministisch erzeugt. Ein QR-Code könnte zusätzlich den Webseitenlink öffnen; MindAR erkennt hier das vollständige Bild.

## Lokal starten

Node.js installieren, in diesem Ordner ein Terminal öffnen und ausführen:

```powershell
npm start
```

Am PC: http://localhost:5173. Kein `npm install` erforderlich. Der Server lauscht nur auf dem lokalen PC. Auf dem Handy benötigt die Kamera eine HTTPS-Adresse; die normale HTTP-WLAN-Adresse reicht nicht. Kein Öffnen per `file://`.

## Bilder neu erzeugen / kompilieren

```powershell
python -m pip install Pillow
python scripts/create-targets.py
npm start
```

Dann http://localhost:5173/tools/compile.html öffnen, „Alle vier Bilder kompilieren“ wählen und die heruntergeladene Datei als `dist/assets/targets/targets.mind` speichern. Der Browser lädt hierfür den offiziellen MindAR-Compiler von jsDelivr. Bilder und Erkennungsdatei müssen zusammenpassen. Wird die Reihenfolge geändert, müssen die Indizes in `ar.html` ebenfalls angepasst werden. Die kompilierten Dateien sind bereits enthalten; zum normalen Start ist keine Neukompilierung nötig.

## Web-Kopien der Modelle

Die vom Nutzer in `mindar-brunnen/dist/assets` bereitgestellten Originaldateien bleiben lokal unverändert. Dieses Repository enthält optimierte Ableitungen:

- Brunnen: ca. 6,23 MB; ursprüngliches lokales GLB ca. 43,67 MB.
- Grabstein: ca. 5,45 MB statt 10,84 MB.
- Löwenherz: ca. 10,55 MB statt 19,99 MB.
- Weihesteine: ca. 5,76 MB statt 72 MB; vertikale Z-Achse auf Y gedreht und neutrales Steinmaterial ergänzt, weil das Original ohne Materialien/Texturebenen exportiert wurde. Die Darstellung ist eine ergänzte Web-Darstellung, keine rekonstruierte Originaltextur.

Optimiert mit glTF Transform 4.5.1, ohne zusätzliche Meshdecoder, Texturen höchstens 2048 Pixel. Beispiel für Grabstein und Löwenherz:

```powershell
npx --yes @gltf-transform/cli@4.5.1 optimize INPUT.glb OUTPUT.glb --compress false --texture-compress auto --texture-size 2048 --simplify-ratio 0.25 --simplify-error 0.001 --instance false
```

Weihesteine verwendet `--simplify-ratio 0.08`; anschließend `python scripts/prepare-weihesteine.py` für die Achsen- und Materialkorrektur der Web-Kopie. Form und Details können von den Originalen abweichen.

## Tracking und Prüfung

Glättung: `filterMinCF: 0.001; filterBeta: 10`, Ein-/Ausblendtoleranz jeweils 8 Frames. Stärkere Glättung kann mehr Verzögerung verursachen. Modelle starten mit Größe 0,6 relativ zum Scanbild. Jedes Modell wird einzeln anhand seiner Grenzen zentriert. In aufrechter Grundstellung liegt sein Fuß auf der Bildebene, gedreht wird um die Mitte.

`npm run check` prüft JavaScript-Syntax. Ergebnisse und Grenzen stehen in `PRUEFUNG.md`. Vier gleichzeitige Erkennungen wurden mit einem synthetischen Kamerastream geprüft. Ein echter Handy-Kameratest steht weiterhin aus.

## Veröffentlichung und Quellen

Jeder Push auf `main` veröffentlicht `dist/` mit `.github/workflows/pages.yml` über GitHub Pages. Einstellungen: **Settings → Pages → Source → GitHub Actions**. Keine zusätzlichen API-Schlüssel nötig.

- Brunnenmodell: **Digital Heritage Lab**, [Haennesschen Brunnen an der Dau](https://sketchfab.com/3d-models/haennesschen-brunnen-an-der-dau-f79426ea54ec40bea6f6c24eb8af9900), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), für Web verkleinert.
- Die weiteren Modelle stammen aus den vom Nutzer bereitgestellten Dateien. In ihren GLB-Metadaten waren keine Autoren-/Lizenzangaben enthalten; es werden keine zusätzlichen Angaben erfunden.
- [MindAR](https://github.com/hiukim/mind-ar-js), MIT; [Mehrfachtracking](https://hiukim.github.io/mind-ar-js-doc/examples/multi-tracks/).
- [A-Frame](https://github.com/aframevr/aframe), MIT; [model-viewer](https://github.com/google/model-viewer), Apache 2.0. Lizenzdateien unter `dist/vendor/`.
- Laufzeitbibliotheken liegen lokal. Model-viewer, MindAR und die Google-Schriftarten können weitere Laufzeitressourcen nachladen.

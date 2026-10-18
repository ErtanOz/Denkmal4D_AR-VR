"""Create A4 workshop PDFs. Requires reportlab, qrcode, pillow. No model changes."""
import json
from pathlib import Path
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf'
TMP = ROOT.parent / 'tmp/pdfs'
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)
LIVE = 'https://ertanoz.github.io/Denkmal4D_AR-VR/ar.html?v=touch1'
REPO = 'https://github.com/ErtanOz/Denkmal4D_AR-VR'
DATE = '19.10.2026'
MODELS = json.loads((ROOT/'dist/models.json').read_text(encoding='utf-8'))
W, H = A4
L, R = 18*mm, 192*mm
INK = colors.HexColor('#202725')
GREEN = colors.HexColor('#133c34')
MUTED = colors.HexColor('#5a6660')
LINE = colors.HexColor('#d6ddd6')
PALE = colors.HexColor('#f0f3ed')
for name, filename in [('Body','arial.ttf'),('BodyBold','arialbd.ttf'),('BodyItalic','ariali.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts')/filename)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold', italic='BodyItalic', boldItalic='BodyBold')

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=12, border=4)
qr.add_data(LIVE); qr.make(fit=True)
QR = TMP/'live-qr.png'
qr.make_image(fill_color='black', back_color='white').save(QR)

def para(c, text, x, top, width, size=10.6, leading=None, color=INK, bold=False):
    style=ParagraphStyle('p',fontName='BodyBold' if bold else 'Body',fontSize=size,leading=leading or size*1.32,textColor=color)
    p=Paragraph(text,style)
    _,h=p.wrap(width,H)
    assert top-h>18*mm, f'Paragraph below safe area: {text[:70]}'
    p.drawOn(c,x,top-h)
    return top-h

def text(c, s, x, y, size=10, color=INK, font='Body'):
    c.setFillColor(color);c.setFont(font,size);c.drawString(x,y,s)

def heading(c,s,y,size=14):
    text(c,s,L,y*mm,size,colors.black,'BodyBold')

def base(c, section, index, total):
    text(c,'DENKMAL / 4D',L,279*mm,10,GREEN,'BodyBold')
    c.setFont('Body',8);c.setFillColor(MUTED)
    c.drawRightString(R,279*mm,f'STAND {DATE}')
    c.setStrokeColor(LINE);c.setLineWidth(.6);c.line(L,17*mm,R,17*mm)
    text(c,section,L,11.5*mm,8,MUTED)
    c.drawRightString(R,11.5*mm,f'{index} / {total}')

def live_qr(c,x,y,size):
    c.drawImage(str(QR),x,y,width=size,height=size,mask='auto')
    c.linkURL(LIVE,(x,y,x+size,y+size),relative=0,thickness=0)

def number_step(c, number, body, top):
    c.setFillColor(GREEN);c.circle(L+3.5*mm,(top-3.3)*mm,3.5*mm,fill=1,stroke=0)
    c.setFillColor(colors.white);c.setFont('BodyBold',9)
    c.drawCentredString(L+3.5*mm,(top-4.5)*mm,str(number))
    para(c,body,L+11*mm,top*mm,163*mm,10.6)

def intro(c):
    heading(c,'AR live ausprobieren',264,25)
    para(c,'Vier Scanbilder bringen vier 3D-Modelle in dein Kamerabild.',L,255*mm,174*mm,11.5)
    heading(c,'Das brauchst du',240,13)
    para(c,'Ein Handy mit Kamera und Internet, idealerweise WLAN.<br/>Safari auf dem iPhone oder Chrome auf Android.<br/>Ein ausgedrucktes Scanbild oder einen zweiten Bildschirm.<br/><b>Keine App-Installation und keine Anmeldung nötig.</b>',L,233*mm,119*mm,10.3,leading=15)
    live_qr(c,149*mm,208*mm,42*mm)
    text(c,'Live-Demo öffnen',151*mm,204*mm,9,GREEN,'BodyBold')
    para(c,f'<link href="{LIVE}" color="#133c34">ertanoz.github.io/Denkmal4D_AR-VR/ar.html?v=touch1</link>',L,195*mm,174*mm,9.5)
    heading(c,'In fünf Schritten starten',181)
    steps=[
        'Den QR-Code oben mit der normalen Handykamera scannen und den Link öffnen.',
        'Die Seite direkt in Safari oder Chrome öffnen. Warten, bis alle vier Modelle geladen sind.',
        'Auf <b>Kamera starten</b> tippen und den Kamerazugriff im Browser erlauben.',
        'Ein Scanbild flach auf den Tisch legen. Das ganze Bild mit der Kamera ruhig erfassen.',
        'Das Modell entdecken. Weitere Karten dazulegen. Die Modelle bleiben an ihre sichtbaren Scanbilder gebunden.'
    ]
    for i,s in enumerate(steps):number_step(c,i+1,s,170-i*15)
    heading(c,'Diese vier Bilder gehören zur Demo',88,13)
    labels=['Hänneschen-Brunnen','Grabstein','Löwenherz Köln','Weihesteine']
    for i,(m,label) in enumerate(zip(MODELS,labels)):
        x=L+i*44*mm
        c.drawImage(str(ROOT/'dist'/m['target']),x,49*mm,width=30*mm,height=30*mm)
        text(c,f'{i+1:02}  {label}',x,44*mm,8.2,GREEN,'BodyBold')
    para(c,'<b>Wichtig:</b> Der QR-Code öffnet nur die Webseite. Die nummerierten Bilder auf den Scanbild-Seiten verankern die Modelle.',L,36*mm,174*mm,9.2)
    text(c,'Drucktipp: Anleitung je Person, die vier Scanbild-Seiten einseitig je Tisch.',L,22*mm,8.2,MUTED)

def checkbox(c,x,y):
    c.setStrokeColor(MUTED);c.setLineWidth(.65);c.rect(x,y-1,7.5,7.5,fill=0,stroke=1)

def practice(c):
    heading(c,'Drehen, zoomen und testen',264,23)
    para(c,'Ein kurzer Partner-Test hilft, die Bedienung auf eurem Handy zu prüfen.',L,255*mm,174*mm,11)
    heading(c,'Bedienung in der Kameraansicht',241,13)
    rows=[
        ['Geste oder Aktion','Das passiert'],
        ['Modell antippen','Auswählen; alternativ „Modell bearbeiten“ nutzen.'],
        ['Mit einem Finger ziehen','Das Modell frei drehen und kippen.'],
        ['Zwei Finger auf- oder zuziehen','Vergrößern oder verkleinern, von 25 bis 500 %.'],
        ['Mit zwei Fingern verdrehen','Um die Blickrichtung drehen.'],
        ['„Zurücksetzen“ antippen','Die Auswahl wieder aufrecht und auf 100 % stellen.']
    ]
    sty=ParagraphStyle('cell',fontName='Body',fontSize=10,leading=13,textColor=INK)
    hdr=ParagraphStyle('header',parent=sty,fontName='BodyBold',textColor=colors.white)
    data=[[Paragraph(cell,hdr if r==0 else sty) for cell in row] for r,row in enumerate(rows)]
    table=Table(data,colWidths=[70*mm,104*mm],rowHeights=[9*mm]+[11.5*mm]*5)
    table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),GREEN),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,PALE]),
        ('GRID',(0,0),(-1,-1),.5,LINE),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),
        ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    _,height=table.wrap(174*mm,H);table.drawOn(c,L,235*mm-height)
    heading(c,'Partneraufgabe für den Live-Test',157,13)
    tasks=[
        'Ein Modell auswählen, drehen, zoomen und zurücksetzen.',
        'Zwei Scanbilder nebeneinander erfassen. Nur eines der Modelle verändern.',
        'Ein Scanbild verdecken. Verschwindet nur das zugehörige Modell?'
    ]
    for i,s in enumerate(tasks):
        y=(146-i*10)*mm;checkbox(c,L,y);para(c,s,L+6*mm,y+8,168*mm,10.2)
    text(c,'Handy / Browser:',L,112*mm,10)
    c.setStrokeColor(LINE);c.line(L+31*mm,111*mm,R,111*mm)
    text(c,'Erkennung',L,101*mm,10,INK,'BodyBold')
    for x,label in [(55,'gut'),(88,'wechselhaft'),(135,'nicht erkannt')]:
        checkbox(c,x*mm,101*mm);text(c,label,x*mm+11,101*mm,9.5)
    text(c,'Gesten',L,91*mm,10,INK,'BodyBold')
    for x,label in [(55,'funktionieren'),(105,'teilweise'),(150,'nicht')]:
        checkbox(c,x*mm,91*mm);text(c,label,x*mm+11,91*mm,9.5)
    text(c,'Beobachtung:',L,80*mm,10)
    c.line(L+28*mm,79*mm,R,79*mm)
    heading(c,'Wenn es nicht klappt',66,13)
    para(c,'<b>Kamera fehlt:</b> Berechtigung prüfen und den Link direkt im Browser öffnen.<br/><b>Bild wackelt:</b> Mehr Licht, weniger Spiegelung, ganzes Bild zeigen, langsam bewegen.<br/><b>Modell weg:</b> Scanbild wieder erfassen; nach starkem Zoom „Zurücksetzen“ nutzen.',L,59*mm,174*mm,9.2,leading=14)
    para(c,'<b>Stand:</b> Touch-Bedienung im Browser simuliert geprüft. Der Workshop testet sie auf echten Geräten. Diese Anwendung lädt keine Kameraaufnahmen hoch. Zum Beenden „Kamera stoppen“ wählen.',L,39*mm,174*mm,8.4,leading=11)
    para(c,f'Projekt und Modellquellen: <link href="{REPO}" color="#133c34">github.com/ErtanOz/Denkmal4D_AR-VR</link>',L,25*mm,174*mm,8.2)

def target(c,model):
    heading(c,f'Scanbild {model["targetIndex"]+1:02}   {model["name"]}',262,22)
    para(c,'Diese Seite flach auf den Tisch legen und mit der AR-Webseite erfassen.',L,251*mm,174*mm,10.5)
    c.drawImage(str(ROOT/'dist'/model['target']),20*mm,68*mm,width=170*mm,height=170*mm)
    para(c,'Das große Bild vollständig erfassen. Für den Mehrfachtest weitere Karten danebenlegen.',L,61*mm,174*mm,9.5)
    live_qr(c,19*mm,23*mm,29*mm)
    text(c,'AR-Kamera öffnen',56*mm,47*mm,11,GREEN,'BodyBold')
    para(c,'QR-Code mit der normalen Handykamera öffnen.<br/>Dann in der Webseite das große Scanbild oben scannen.',56*mm,42*mm,135*mm,9.5)
    para(c,f'<link href="{LIVE}" color="#133c34">ertanoz.github.io/Denkmal4D_AR-VR/ar.html?v=touch1</link>',56*mm,30*mm,135*mm,7.8)
    text(c,'A4 bei 100 % drucken. Nicht zuschneiden, falten oder spiegeln.',56*mm,21*mm,7.8,MUTED)

def build(filename,pages,section):
    output=OUT/filename
    c=canvas.Canvas(str(output),pagesize=A4,pageCompression=1)
    c.setTitle('Denkmal4D Workshop Handout' if 'Scanbilder' not in filename else 'Denkmal4D Scanbilder für den Workshop')
    c.setAuthor('Denkmal4D Projekt')
    c.setSubject('AR live ausprobieren mit vier 3D-Modellen und Touch-Gesten')
    c.setKeywords('Denkmal4D, Workshop, MindAR, Handout, Scanbilder, AR')
    for i,(kind,arg) in enumerate(pages,1):
        base(c,section,i,len(pages))
        if kind=='intro':intro(c)
        elif kind=='practice':practice(c)
        else:target(c,arg)
        c.showPage()
    c.save();print(output)

guide=[('intro',None),('practice',None)]
cards=[('target',m) for m in MODELS]
build('Denkmal4D_Workshop_Handout.pdf',guide,'Teilnehmenden-Handout')
build('Denkmal4D_Workshop_Scanbilder.pdf',cards,'Scanbilder für den Tisch')
build('Denkmal4D_Workshop_Paket.pdf',guide+cards,'Workshop-Paket')

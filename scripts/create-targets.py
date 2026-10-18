"""Deterministic, distinct natural-feature image markers. Requires Pillow."""
import json, random, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]
MODELS = json.loads((ROOT/'dist/models.json').read_text(encoding='utf-8'))
def font(size, bold=False):
    candidates = [Path('C:/Windows/Fonts') / ('arialbd.ttf' if bold else 'arial.ttf'), Path('/usr/share/fonts/truetype/dejavu') / ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')]
    return ImageFont.truetype(str(next(p for p in candidates if p.exists())), size)
palettes = [(19,60,52),(138,60,31),(43,67,129),(94,58,115)]
for entry, accent in zip(MODELS,palettes):
    rng = random.Random('denkmal4d:'+entry['id'])
    img = Image.new('RGB',(900,900),(249,247,238))
    d = ImageDraw.Draw(img)
    # Asymmetric, non-repeating landmarks across the card, not a QR code.
    for i in range(175):
        x,y = rng.randint(28,870),rng.randint(28,720)
        size = rng.randint(6,47)
        color = rng.choice([accent,(22,27,29),(100,110,99),(204,187,145)])
        if i%4==0:
            d.polygon([(x,y),(x+size,y+rng.randint(-20,20)),(x+rng.randint(-20,20),y+size)],fill=color)
        elif i%4==1:
            d.ellipse((x,y,x+size,y+size),outline=color,width=rng.randint(3,8))
        elif i%4==2:
            d.line((x,y,x+size,y+size//2),fill=color,width=rng.randint(3,7))
        else:
            d.rectangle((x,y,x+size,y+size//3),fill=color)
    # A different numbered centre makes each marker recognizable to people too.
    d.rounded_rectangle((225,205,675,605),radius=25,fill=(249,247,238),outline=accent,width=7)
    d.text((450,390),f'{entry["targetIndex"]+1:02}',font=font(240,True),fill=accent,anchor='mm')
    d.text((450,555),'DENKMAL / 4D',font=font(30,True),fill=(22,27,29),anchor='mm')
    d.rectangle((0,748,900,900),fill=accent)
    d.text((40,785),entry['name'],font=font(43,True),fill='white')
    d.text((40,850),'AR-SCANBILD  /  BILD VOLLSTÄNDIG SCANNEN',font=font(22),fill='white')
    out=ROOT/'dist'/entry['target'];out.parent.mkdir(parents=True,exist_ok=True);img.save(out)
    print(out.name)

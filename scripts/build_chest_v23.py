from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
from pathlib import Path
import base64, re

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'assets'
INDEX=ROOT/'index.html'
SPRITE=ASSETS/'effect-keyframes-v23.jpg'
PARTS=[
    ASSETS/'effect-keyframes-v23.part1',
    ASSETS/'effect-keyframes-v23.part2',
    ASSETS/'effect-keyframes-v23.part3',
    ASSETS/'effect-keyframes-v23.part4',
    ASSETS/'effect-keyframes-v23.part5a',
    ASSETS/'effect-keyframes-v23.part5b',
]

# Reconstruct the approved mockup keyframe strip from small text chunks.
# We intentionally overwrite any stale/corrupt sprite left by an older attempt.
if not all(p.exists() for p in PARTS):
    missing=[p.name for p in PARTS if not p.exists()]
    raise SystemExit('missing V23 sprite parts: '+', '.join(missing))
s=''.join(p.read_text(encoding='utf-8').strip() for p in PARTS)
s += '=' * (-len(s) % 4)
SPRITE.write_bytes(base64.b64decode(s))

# Fail early if the reconstructed source is not a real image.
with Image.open(SPRITE) as check:
    check.verify()
src=Image.open(SPRITE).convert('RGB')
pw=src.width//5
if pw < 120:
    raise SystemExit('effect sprite is too small')

raw=[]
for i in range(5):
    x0=i*pw
    x1=(i+1)*pw if i<4 else src.width
    p=src.crop((x0,0,x1,src.height))
    if p.width != pw:
        p=p.resize((pw,src.height),Image.Resampling.LANCZOS)
    raw.append(p)

W=640
H=round(raw[0].height*W/raw[0].width)

def grade(im,bright=1.0,contrast=1.0,sharp=1.0):
    x=im.resize((W,H),Image.Resampling.LANCZOS)
    x=ImageEnhance.Brightness(x).enhance(bright)
    x=ImageEnhance.Contrast(x).enhance(contrast)
    x=ImageEnhance.Sharpness(x).enhance(sharp)
    return x

closed=grade(raw[0],1.0,1.06,1.22)
shake=grade(raw[1],1.02,1.05,1.10)
partial=grade(raw[2],1.03,1.06,1.17)
burst=grade(raw[3],1.02,1.05,1.10)
opened=grade(raw[4],1.02,1.06,1.18)

closed.save(ASSETS/'chest-effect-closed-v23.webp','WEBP',quality=93,method=6)
opened.save(ASSETS/'chest-effect-open-v23.webp','WEBP',quality=93,method=6)

def zoom_shift(im,scale=1.0,dx=0,dy=0,angle=0):
    w,h=im.size
    nw,nh=round(w*scale),round(h*scale)
    z=im.resize((nw,nh),Image.Resampling.BICUBIC)
    canvas=Image.new('RGB',(w,h),(8,10,15))
    canvas.paste(z,((w-nw)//2+dx,(h-nh)//2+dy))
    if angle:
        canvas=canvas.rotate(angle,resample=Image.Resampling.BICUBIC,expand=False,fillcolor=(8,10,15))
    return canvas

def flash(im,strength=1.0):
    base=im.convert('RGBA')
    ov=Image.new('RGBA',base.size,(0,0,0,0))
    d=ImageDraw.Draw(ov)
    cx,cy=W//2,round(H*.55)
    for r,a in [(175,20),(128,38),(86,64),(48,104),(25,145)]:
        aa=min(255,round(a*strength))
        d.ellipse((cx-r,cy-r//3,cx+r,cy+r//3),fill=(255,218,96,aa))
    ov=ov.filter(ImageFilter.GaussianBlur(12))
    return Image.alpha_composite(base,ov).convert('RGB')

frames=[]; durations=[]
# Closed / tension stage: full-frame artwork only.
frames.extend([closed,closed]); durations.extend([190,130])
for dx,dy,ang in [(-3,1,-.25),(3,0,.22),(-4,-1,-.30),(4,1,.28),(-2,0,-.12),(2,0,.12)]:
    frames.append(zoom_shift(closed,1.016,dx,dy,ang)); durations.append(75)
# Use the approved mockup's glow/shake artwork.
for b in (.98,1.02,1.06):
    frames.append(ImageEnhance.Brightness(shake).enhance(b)); durations.append(90)
frames.append(flash(shake,.85)); durations.append(95)
frames.append(flash(shake,1.45)); durations.append(100)
# Full-image opening keyframes — never slice or flatten the chest geometry.
frames.append(flash(partial,.90)); durations.append(125)
frames.append(partial); durations.append(230)
frames.append(ImageEnhance.Brightness(partial).enhance(1.06)); durations.append(190)
frames.append(flash(burst,.85)); durations.append(130)
frames.append(burst); durations.append(230)
frames.append(ImageEnhance.Brightness(burst).enhance(1.05)); durations.append(200)
frames.append(flash(opened,.55)); durations.append(135)
frames.append(opened); durations.append(300)
frames.append(opened); durations.append(430)

anim=ASSETS/'chest-effect-opening-v23.webp'
frames[0].save(anim,'WEBP',save_all=True,append_images=frames[1:],duration=durations,loop=1,quality=88,method=6,minimize_size=False)

test=Image.open(anim)
if getattr(test,'n_frames',1) < 20:
    raise SystemExit('V23 Animated WebP validation failed')

html=INDEX.read_text(encoding='utf-8')
css='<link rel="stylesheet" href="/assets/chest-v23.css?v=20260809-v23">'
pre='<link rel="preload" href="/assets/chest-effect-opening-v23.webp?v=20260809-v23" as="image" type="image/webp">'
js='<script src="/assets/chest-v23.js?v=20260809-v23"></script>'
if css not in html:
    html=html.replace('</head>',pre+'\n'+css+'\n</head>',1)
if js not in html:
    html=html.replace('</body>',js+'\n</body>',1)
# First paint must already be the approved V23 closed artwork; do not flash an older chest before JS runs.
html,n=re.subn(r'(<img\s+id="chestVisual"[^>]*?src=")[^"]+("[^>]*>)',r'\1/assets/chest-effect-closed-v23.webp?v=20260809-v23\2',html,count=1)
if n!=1:
    raise SystemExit('Could not update chestVisual initial source')
INDEX.write_text(html,encoding='utf-8')
print(f'V23 effect-art chest built: {getattr(test,"n_frames",1)} frames, {anim.stat().st_size} bytes, {sum(durations)}ms, {W}x{H}')

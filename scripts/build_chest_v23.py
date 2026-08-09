from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
from pathlib import Path
import math

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'assets'
INDEX=ROOT/'index.html'
SPRITE=ASSETS/'effect-keyframes-v23.jpg'

if not SPRITE.exists():
    raise SystemExit('effect-keyframes-v23.jpg missing')

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

closed=grade(raw[0],1.0,1.05,1.16)
shake=grade(raw[1],1.02,1.04,1.05)
partial=grade(raw[2],1.03,1.05,1.12)
burst=grade(raw[3],1.02,1.04,1.06)
opened=grade(raw[4],1.02,1.05,1.15)

closed.save(ASSETS/'chest-effect-closed-v23.webp','WEBP',quality=92,method=6)
opened.save(ASSETS/'chest-effect-open-v23.webp','WEBP',quality=92,method=6)

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
    for r,a in [(165,18),(120,34),(80,58),(45,95),(24,135)]:
        aa=min(255,round(a*strength))
        d.ellipse((cx-r,cy-r//3,cx+r,cy+r//3),fill=(255,215,91,aa))
    ov=ov.filter(ImageFilter.GaussianBlur(12))
    return Image.alpha_composite(base,ov).convert('RGB')

frames=[]
durations=[]
frames.extend([closed,closed]); durations.extend([180,120])
for dx,dy,ang in [(-3,1,-.3),(3,0,.25),(-4,-1,-.35),(4,1,.3),(-2,0,-.15),(2,0,.15)]:
    frames.append(zoom_shift(closed,1.018,dx,dy,ang)); durations.append(72)
for b in (.98,1.02,1.06):
    frames.append(ImageEnhance.Brightness(shake).enhance(b)); durations.append(85)
frames.append(flash(shake,.9)); durations.append(90)
frames.append(flash(shake,1.5)); durations.append(90)
frames.append(flash(partial,.9)); durations.append(130)
frames.append(partial); durations.append(170)
frames.append(ImageEnhance.Brightness(partial).enhance(1.07)); durations.append(160)
frames.append(flash(burst,.9)); durations.append(120)
frames.append(burst); durations.append(200)
frames.append(ImageEnhance.Brightness(burst).enhance(1.06)); durations.append(180)
frames.append(flash(opened,.65)); durations.append(130)
frames.append(opened); durations.append(280)
frames.append(opened); durations.append(420)

anim=ASSETS/'chest-effect-opening-v23.webp'
frames[0].save(anim,'WEBP',save_all=True,append_images=frames[1:],duration=durations,loop=1,quality=86,method=6,minimize_size=False)

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
INDEX.write_text(html,encoding='utf-8')

print(f'V23 effect-art chest built: {getattr(test,"n_frames",1)} frames, {anim.stat().st_size} bytes, {sum(durations)}ms, {W}x{H}')

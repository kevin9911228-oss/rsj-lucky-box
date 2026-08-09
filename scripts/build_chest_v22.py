from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'assets'
INDEX=ROOT/'index.html'
CW,CH=640,620

closed=Image.open(ASSETS/'chest-user-closed-v13.webp').convert('RGBA')
opened=Image.open(ASSETS/'chest-user-open-v13.webp').convert('RGBA')

def fit_width(img,w):
    h=round(img.height*w/img.width)
    return img.resize((w,h),Image.Resampling.LANCZOS)

cl=fit_width(closed,520)
op=fit_width(opened,520)
canvas_closed=Image.new('RGBA',(CW,CH),(0,0,0,0))
canvas_closed.alpha_composite(cl,(60,153))
canvas_open=Image.new('RGBA',(CW,CH),(0,0,0,0))
canvas_open.alpha_composite(op,(60,4))

# This is the key V22 change: every animation frame is a COMPLETE chest image.
# No lid/body split, no clip-path, no two-box crossfade. The lower chest is kept fixed,
# while the complete upper portion of the real open artwork expands continuously upward.
def warp_open(scale,anchor=365):
    out=Image.new('RGBA',(CW,CH),(0,0,0,0))
    base=canvas_open.crop((0,anchor,CW,CH))
    out.alpha_composite(base,(0,anchor))
    upper=canvas_open.crop((0,0,CW,anchor))
    out_h=max(1,round(anchor*scale))
    upper=upper.resize((CW,out_h),Image.Resampling.BICUBIC)
    out.alpha_composite(upper,(0,anchor-out_h))
    return out

def flash(power):
    f=Image.new('RGBA',(CW,CH),(0,0,0,0))
    d=ImageDraw.Draw(f)
    cx,cy=320,330
    for rx,ry,a in [(290,240,65),(220,160,115),(150,95,175),(82,48,245)]:
        d.ellipse((cx-rx,cy-ry,cx+rx,cy+ry),fill=(255,231,135,round(a*power)))
    return f.filter(ImageFilter.GaussianBlur(20))

def pulse_closed(scale=1.0,dy=0,gl=0):
    fr=Image.new('RGBA',(CW,CH),(0,0,0,0))
    w=round(CW*scale); h=round(CH*scale)
    rs=canvas_closed.resize((w,h),Image.Resampling.BICUBIC)
    fr.alpha_composite(rs,((CW-w)//2,(CH-h)//2+dy))
    if gl:
        g=Image.new('RGBA',(CW,CH),(0,0,0,0))
        d=ImageDraw.Draw(g)
        for rx,ry,a in [(180,60,35),(120,44,60),(70,28,100)]:
            d.ellipse((320-rx,335-ry,320+rx,335+ry),fill=(255,207,78,round(a*gl)))
        fr.alpha_composite(g.filter(ImageFilter.GaussianBlur(10)))
    return fr

frames=[]
durations=[]

# Closed tension: one intact chest only.
for i in range(5):
    q=i/4
    frames.append(pulse_closed(1+0.005*math.sin(q*math.pi*2),round(-2*math.sin(q*math.pi*2)),.15+.25*q))
    durations.append(130 if i==0 else 90)

# Gold flash rises over the intact closed chest.
for p in (.18,.38,.68,1.0):
    fr=canvas_closed.copy()
    fr.alpha_composite(flash(p))
    frames.append(fr)
    durations.append(85)

# At peak flash, hard-switch to a complete near-closed frame of the OPEN artwork.
# There is NEVER a second chest blended underneath it.
fr=warp_open(.15)
fr.alpha_composite(flash(1.0))
frames.append(fr)
durations.append(90)

# Continuous complete-image opening. The body remains anchored; upper artwork expands upward.
steps=13
for i in range(steps):
    q=(i+1)/steps
    ease=q*q*(3-2*q)
    scale=.15+.85*ease
    fr=warp_open(scale)
    if q<.45:
        fr.alpha_composite(flash(max(0,(1-q/.45))**1.4))
    frames.append(fr)
    durations.append(80)

# Settle on the full open artwork.
for i in range(3):
    frames.append(canvas_open.copy())
    durations.append(110 if i<2 else 260)

out=ASSETS/'chest-opening-v22.webp'
frames[0].save(out,'WEBP',save_all=True,append_images=frames[1:],duration=durations,loop=1,quality=86,method=3,minimize_size=False)

# Validate that this is actually animated and has enough frames.
test=Image.open(out)
if getattr(test,'n_frames',1)<20:
    raise SystemExit('V22 animated WebP validation failed')

html=INDEX.read_text(encoding='utf-8')
css='<link rel="stylesheet" href="/assets/chest-v22.css?v=20260809-v22">'
pre='<link rel="preload" href="/assets/chest-opening-v22.webp?v=20260809-v22" as="image" type="image/webp">'
js='<script src="/assets/chest-v22.js?v=20260809-v22"></script>'
if css not in html:
    html=html.replace('</head>',pre+'\n'+css+'\n</head>',1)
if js not in html:
    html=html.replace('</body>',js+'\n</body>',1)
INDEX.write_text(html,encoding='utf-8')
print(f'Generated V22 complete-frame animation: {getattr(test,"n_frames",1)} frames, {out.stat().st_size} bytes, {sum(durations)}ms')

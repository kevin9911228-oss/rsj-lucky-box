from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
from pathlib import Path
import base64, re, cv2, numpy as np

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'assets'
INDEX=ROOT/'index.html'
SPRITE=ASSETS/'effect-keyframes-v24.jpg'
PARTS=[
    ASSETS/'effect-keyframes-v23.part1',
    ASSETS/'effect-keyframes-v23.part2',
    ASSETS/'effect-keyframes-v23.part3',
    ASSETS/'effect-keyframes-v23.part4',
    ASSETS/'effect-keyframes-v23.part5a',
    ASSETS/'effect-keyframes-v23.part5b',
]

# Reconstruct the approved effect-art strip already stored in the repo.
s=''.join(p.read_text(encoding='utf-8').strip() for p in PARTS)
s += '=' * (-len(s) % 4)
SPRITE.write_bytes(base64.b64decode(s))
with Image.open(SPRITE) as check:
    check.verify()
src=Image.open(SPRITE).convert('RGB')
pw=src.width//5
raw=[]
for i in range(5):
    x0=i*pw
    x1=(i+1)*pw if i<4 else src.width
    raw.append(src.crop((x0,0,x1,src.height)))

# GIF target: true continuous animation, not five keyframes held on screen.
W=480
H=round(raw[0].height*W/raw[0].width)
keys=[]
for i,im in enumerate(raw):
    x=im.resize((W,H),Image.Resampling.LANCZOS)
    x=ImageEnhance.Contrast(x).enhance(1.05)
    x=ImageEnhance.Sharpness(x).enhance(1.18 if i in (0,4) else 1.08)
    keys.append(np.array(x))

def flow_pair(a,b):
    ga=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY)
    gb=cv2.cvtColor(b,cv2.COLOR_RGB2GRAY)
    dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    dis.setFinestScale(1)
    fab=dis.calc(ga,gb,None)
    dis2=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    dis2.setFinestScale(1)
    fba=dis2.calc(gb,ga,None)
    return fab,fba

def warp(img,flow,amount):
    h,w=img.shape[:2]
    gx,gy=np.meshgrid(np.arange(w,dtype=np.float32),np.arange(h,dtype=np.float32))
    mx=gx-flow[...,0]*amount
    my=gy-flow[...,1]*amount
    return cv2.remap(img,mx,my,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT101)

def ease(t):
    return t*t*(3-2*t)

def interpolate(a,b,count):
    fab,fba=flow_pair(a,b)
    out=[]
    for i in range(count):
        t=(i+1)/(count+1)
        e=ease(t)
        wa=warp(a,fab,e)
        wb=warp(b,fba,1-e)
        # Bidirectional motion interpolation. At every instant this produces one full frame,
        # so the browser never displays a sliced lid/body construction.
        out.append(cv2.addWeighted(wa,1-e,wb,e,0))
    return out

def gold_bloom(im,strength):
    if strength<=0:return im
    base=im.convert('RGBA')
    ov=Image.new('RGBA',base.size,(0,0,0,0))
    d=ImageDraw.Draw(ov)
    cx,cy=W//2,round(H*.53)
    for r,a in [(116,18),(84,32),(54,52),(27,88)]:
        d.ellipse((cx-r,cy-r//3,cx+r,cy+r//3),fill=(255,216,92,round(a*strength)))
    ov=ov.filter(ImageFilter.GaussianBlur(10))
    return Image.alpha_composite(base,ov).convert('RGB')

frames=[]
# ~25fps. Smoothest interval is the actual lid-opening transition (key 2 -> key 3).
frames += [keys[0]]*6
for idx,count in enumerate([10,20,15,19]):
    frames += interpolate(keys[idx],keys[idx+1],count)
    frames.append(keys[idx+1])
frames += [keys[4]]*7

pil=[]
N=len(frames)
for j,arr in enumerate(frames):
    im=Image.fromarray(arr)
    p=j/max(1,N-1)
    # Light naturally builds during the middle of the opening and hides interpolation seams.
    glow=max(0.0,1-abs(p-.62)/.20)
    im=gold_bloom(im,glow)
    # Adaptive GIF palette keeps the file practical on mobile while retaining gold/red detail.
    im=im.quantize(colors=128,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.FLOYDSTEINBERG)
    pil.append(im)

GIF=ASSETS/'chest-effect-opening-v24.gif'
# Intentionally omit loop=0: this is a one-shot GIF. JS swaps to the final still afterwards.
pil[0].save(GIF,save_all=True,append_images=pil[1:],duration=40,optimize=True,disposal=2)

closed=Image.fromarray(keys[0])
opened=Image.fromarray(keys[4])
closed.save(ASSETS/'chest-effect-closed-v24.webp','WEBP',quality=94,method=6)
opened.save(ASSETS/'chest-effect-open-v24.webp','WEBP',quality=94,method=6)

# Verify a genuine multi-frame GIF was generated.
test=Image.open(GIF)
if getattr(test,'n_frames',1) < 55:
    raise SystemExit(f'V24 GIF validation failed: {getattr(test,"n_frames",1)} frames')

html=INDEX.read_text(encoding='utf-8')
css='<link rel="stylesheet" href="/assets/chest-v24.css?v=20260809-v24">'
pre='<link rel="preload" href="/assets/chest-effect-opening-v24.gif?v=20260809-v24" as="image" type="image/gif">'
js='<script src="/assets/chest-v24.js?v=20260809-v24"></script>'
if css not in html:
    html=html.replace('</head>',pre+'\n'+css+'\n</head>',1)
if js not in html:
    html=html.replace('</body>',js+'\n</body>',1)
html,n=re.subn(r'(<img\s+id="chestVisual"[^>]*?src=")[^"]+("[^>]*>)',r'\1/assets/chest-effect-closed-v24.webp?v=20260809-v24\2',html,count=1)
if n!=1:
    raise SystemExit('Could not update chestVisual to V24')
INDEX.write_text(html,encoding='utf-8')
print(f'V24 smooth GIF built: {getattr(test,"n_frames",1)} frames, {GIF.stat().st_size} bytes, {len(pil)*40}ms, {W}x{H}')

from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
from pathlib import Path
import math
import re

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'assets'
INDEX=ROOT/'index.html'

closed_path=ASSETS/'chest-user-closed-v13.webp'
open_path=ASSETS/'chest-user-open-v13.webp'
out_path=ASSETS/'chest-open-anim-a.webp'

if not closed_path.exists() or not open_path.exists():
    raise SystemExit('Required aligned closed/open chest assets are missing')

closed=Image.open(closed_path).convert('RGBA')
opened=Image.open(open_path).convert('RGBA')
W=420
H=round(closed.height*W/closed.width)
closed=closed.resize((W,H),Image.Resampling.LANCZOS)
opened=opened.resize((W,H),Image.Resampling.LANCZOS)
if opened.size != closed.size:
    opened=opened.resize(closed.size,Image.Resampling.LANCZOS)

def smooth(a,b,x):
    if x<=a: return 0.0
    if x>=b: return 1.0
    q=(x-a)/(b-a)
    return q*q*(3-2*q)

def alpha_mult(im,a):
    z=im.copy()
    A=z.getchannel('A').point(lambda v:int(v*a))
    z.putalpha(A)
    return z

def region(im,y0,y1):
    z=Image.new('RGBA',im.size,(0,0,0,0))
    z.alpha_composite(im.crop((0,y0,W,y1)),(0,y0))
    return z

split=int(H*.50)
closed_top=region(closed,0,split+8)
closed_base=region(closed,split-8,H)
open_top=region(opened,0,split+30)
open_base=region(opened,split-18,H)

frames=[]
durations=[]
N=20
for i in range(N):
    t=i/(N-1)
    frame=Image.new('RGBA',(W,H),(0,0,0,0))

    a=1-smooth(.48,.88,t)
    if a>0:
        frame.alpha_composite(alpha_mult(closed_base,a))
    a=smooth(.34,.78,t)
    if a>0:
        frame.alpha_composite(alpha_mult(open_base,a))

    a=1-smooth(.10,.50,t)
    if a>0:
        frame.alpha_composite(alpha_mult(closed_top,a))

    ot=smooth(.08,.82,t)
    if ot>0:
        lid_h=split+30
        crop=open_top.crop((0,0,W,lid_h))
        sy=.44+.56*(ot**.72)
        nh=max(1,int(lid_h*sy))
        lid=crop.resize((W,nh),Image.Resampling.BICUBIC)
        layer=Image.new('RGBA',(W,H),(0,0,0,0))
        hinge=split+16
        y=hinge-nh-int(7*ot)
        layer.alpha_composite(lid,(0,y))
        layer=ImageEnhance.Brightness(layer).enhance(.92+.14*ot)
        frame.alpha_composite(alpha_mult(layer,ot))

    if .10<t<.95:
        g=math.sin(math.pi*min(1,max(0,(t-.10)/.85)))**1.35
        glow=Image.new('RGBA',(W,H),(0,0,0,0))
        d=ImageDraw.Draw(glow)
        cx,cy=W//2,int(H*.53)
        for r,al in [(96,int(26*g)),(68,int(52*g)),(43,int(84*g)),(24,int(118*g))]:
            d.ellipse((cx-r,cy-r//3,cx+r,cy+r//3),fill=(255,207,74,al))
        frame.alpha_composite(glow.filter(ImageFilter.GaussianBlur(10)))

    if t>.30:
        p=smooth(.30,.90,t)
        spark=Image.new('RGBA',(W,H),(0,0,0,0))
        d=ImageDraw.Draw(spark)
        for k in range(10):
            ang=.42+k*.74
            rad=16+p*(35+7*(k%3))
            x=W/2+math.cos(ang)*rad
            y=H*.52-math.sin(ang)*rad*.55
            rr=1+(k%2)
            al=int(175*(1-p*.42))
            d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=(255,232,136,al))
        frame.alpha_composite(spark.filter(ImageFilter.GaussianBlur(.35)))

    frames.append(frame)
    durations.append(55)

durations[0]=135
durations[-1]=220
frames[0].save(
    out_path,'WEBP',save_all=True,append_images=frames[1:],
    duration=durations,loop=1,lossless=False,quality=72,method=3,minimize_size=True
)

test=Image.open(out_path)
n=getattr(test,'n_frames',1)
if n < 10:
    raise SystemExit(f'Animated WebP validation failed: {n} frames')
print(f'Generated {out_path.name}: {n} frames, {out_path.stat().st_size} bytes, {W}x{H}')

s=INDEX.read_text(encoding='utf-8')
css='<link rel="stylesheet" href="/assets/chest-v18.css?v=20260809-v18">'
preload='<link rel="preload" href="/assets/chest-open-anim-a.webp?v=20260809-v18" as="image" type="image/webp">'
if css not in s:
    s=s.replace('</head>',preload+'\n'+css+'\n</head>',1)

# Replace the complete nested chest container using a tiny balanced-div scanner.
marker='<div class="chest">'
start=s.find(marker)
if start<0:
    raise SystemExit('Could not locate chest container')
pos=start
depth=0
end=None
while pos < len(s):
    no=s.find('<div',pos)
    nc=s.find('</div>',pos)
    if nc<0:
        break
    if no!=-1 and no<nc:
        depth+=1
        pos=no+4
    else:
        depth-=1
        pos=nc+6
        if depth==0:
            end=pos
            break
if end is None:
    raise SystemExit('Could not resolve chest container boundary')
new_chest='<div class="chest"><img id="chestVisual" class="chestVisual18" src="/assets/chest-user-closed-v13.webp?v=20260809-v18" alt="皇家红金宝箱" decoding="async"></div>'
s=s[:start]+new_chest+s[end:]

pattern=r'async function openChestSequence\(\)\{.*?\}\nasync function settleReward'
replacement="""function resetChestVisual(){const img=$('chestVisual');if(!img)return;img.src='/assets/chest-user-closed-v13.webp?v=20260809-v18'}
async function openChestSequence(){const st=$('stage'),img=$('chestVisual');st.classList.add('opening','unlocking');$('stageText').innerHTML='锁芯正在发光…<small>惊喜即将开启</small>';await wait(360);st.classList.remove('opening','unlocking');void st.offsetWidth;st.classList.add('explode');$('stageText').innerHTML='宝箱正在开启…<small>惊喜马上出现</small>';if(img){img.src='/assets/chest-open-anim-a.webp?v=20260809-v18';}noiseBurst(.18,.045);tone(420,.16,.04,'triangle');tone(760,.24,.035,'sine',.10);if(navigator.vibrate)navigator.vibrate([35,30,65]);await wait(1320);if(img){img.src='/assets/chest-user-open-v13.webp?v=20260809-v18';}}
async function settleReward"""
s,n=re.subn(pattern,replacement,s,count=1,flags=re.S)
if n!=1:
    raise SystemExit('Could not replace openChestSequence')

if "function closeResult(){resetChestVisual();" not in s:
    s=s.replace("function closeResult(){","function closeResult(){resetChestVisual();",1)

INDEX.write_text(s,encoding='utf-8')
print('Rewired index.html to the three-state chest player')

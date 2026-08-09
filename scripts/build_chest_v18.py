from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
from pathlib import Path
import math
import re

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
INDEX = ROOT / 'index.html'
CACHE = '20260809-v19'

closed_path = ASSETS / 'chest-user-closed-v13.webp'
open_path = ASSETS / 'chest-user-open-v13.webp'
out_path = ASSETS / 'chest-open-anim-a.webp'

if not closed_path.exists() or not open_path.exists():
    raise SystemExit('Required aligned closed/open chest assets are missing')

closed = Image.open(closed_path).convert('RGBA')
opened = Image.open(open_path).convert('RGBA')
W = 420
H = round(closed.height * W / closed.width)
closed = closed.resize((W, H), Image.Resampling.LANCZOS)
opened = opened.resize((W, H), Image.Resampling.LANCZOS)
if opened.size != closed.size:
    opened = opened.resize(closed.size, Image.Resampling.LANCZOS)

def smooth(a, b, x):
    if x <= a:
        return 0.0
    if x >= b:
        return 1.0
    q = (x - a) / (b - a)
    return q * q * (3 - 2 * q)

def alpha_mult(im, a):
    z = im.copy()
    A = z.getchannel('A').point(lambda v: int(v * a))
    z.putalpha(A)
    return z

def region(im, y0, y1):
    z = Image.new('RGBA', im.size, (0, 0, 0, 0))
    z.alpha_composite(im.crop((0, y0, W, y1)), (0, y0))
    return z

# Pre-render the transition as one image resource. The browser itself never splits the chest.
split = int(H * .50)
closed_top = region(closed, 0, split + 10)
closed_base = region(closed, split - 10, H)
open_top = region(opened, 0, split + 34)
open_base = region(opened, split - 20, H)

frames = []
durations = []
N = 32
for i in range(N):
    t = i / (N - 1)
    frame = Image.new('RGBA', (W, H), (0, 0, 0, 0))

    # Keep the closed box readable for the first half-second, then transition the base gently.
    a = 1 - smooth(.54, .88, t)
    if a > 0:
        frame.alpha_composite(alpha_mult(closed_base, a))
    a = smooth(.48, .90, t)
    if a > 0:
        frame.alpha_composite(alpha_mult(open_base, a))

    # Closed lid stays visible well into the animation, instead of disappearing immediately.
    a = 1 - smooth(.22, .80, t)
    if a > 0:
        frame.alpha_composite(alpha_mult(closed_top, a))

    # The open-lid artwork unfolds slowly from the hinge. This is baked into the WebP frames.
    ot = smooth(.20, .90, t)
    if ot > 0:
        lid_h = split + 34
        crop = open_top.crop((0, 0, W, lid_h))
        sy = .14 + .86 * (ot ** .78)
        nh = max(1, int(lid_h * sy))
        lid = crop.resize((W, nh), Image.Resampling.BICUBIC)
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        hinge = split + 17
        y = hinge - nh - int(7 * ot)
        layer.alpha_composite(lid, (0, y))
        layer = ImageEnhance.Brightness(layer).enhance(.95 + .11 * ot)
        frame.alpha_composite(alpha_mult(layer, ot))

    # Gold glow rises from inside the chest only after the lid has clearly begun opening.
    if .28 < t < .98:
        g = math.sin(math.pi * min(1, max(0, (t - .28) / .70))) ** 1.28
        glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(glow)
        cx, cy = W // 2, int(H * .53)
        for r, al in [(94, int(22 * g)), (66, int(48 * g)), (42, int(78 * g)), (23, int(112 * g))]:
            d.ellipse((cx - r, cy - r // 3, cx + r, cy + r // 3), fill=(255, 207, 74, al))
        frame.alpha_composite(glow.filter(ImageFilter.GaussianBlur(10)))

    # Small interior sparks appear late, so the opening itself remains easy to read.
    if t > .46:
        p = smooth(.46, .94, t)
        spark = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(spark)
        for k in range(10):
            ang = .42 + k * .74
            rad = 14 + p * (33 + 7 * (k % 3))
            x = W / 2 + math.cos(ang) * rad
            y = H * .52 - math.sin(ang) * rad * .55
            rr = 1 + (k % 2)
            al = int(168 * (1 - p * .38))
            d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=(255, 232, 136, al))
        frame.alpha_composite(spark.filter(ImageFilter.GaussianBlur(.35)))

    frames.append(frame)
    durations.append(70)

# Deliberate beginning/end holds make the motion feel ceremonial instead of like a jump cut.
durations[0] = 210
durations[-1] = 260
anim_ms = sum(durations) + 80

frames[0].save(
    out_path,
    'WEBP',
    save_all=True,
    append_images=frames[1:],
    duration=durations,
    loop=1,
    lossless=False,
    quality=76,
    method=4,
    minimize_size=True,
)

test = Image.open(out_path)
n = getattr(test, 'n_frames', 1)
if n < 20:
    raise SystemExit(f'Animated WebP validation failed: {n} frames')
print(f'Generated {out_path.name}: {n} frames, {out_path.stat().st_size} bytes, {W}x{H}, wait={anim_ms}ms')

s = INDEX.read_text(encoding='utf-8')
css_tag = f'<link rel="stylesheet" href="/assets/chest-v18.css?v={CACHE}">'
anim_preload = f'<link rel="preload" href="/assets/chest-open-anim-a.webp?v={CACHE}" as="image" type="image/webp">'
open_preload = f'<link rel="preload" href="/assets/chest-user-open-v13.webp?v={CACHE}" as="image" type="image/webp">'

# Refresh existing V18 tags in place so browsers cannot reuse the too-fast cached animation.
if re.search(r'<link rel="stylesheet" href="/assets/chest-v18\.css\?v=[^"]+">', s):
    s = re.sub(r'<link rel="stylesheet" href="/assets/chest-v18\.css\?v=[^"]+">', css_tag, s, count=1)
else:
    s = s.replace('</head>', css_tag + '\n</head>', 1)

if re.search(r'<link rel="preload" href="/assets/chest-open-anim-a\.webp\?v=[^"]+" as="image" type="image/webp">', s):
    s = re.sub(r'<link rel="preload" href="/assets/chest-open-anim-a\.webp\?v=[^"]+" as="image" type="image/webp">', anim_preload, s, count=1)
else:
    s = s.replace(css_tag, anim_preload + '\n' + css_tag, 1)

if re.search(r'<link rel="preload" href="/assets/chest-user-open-v13\.webp\?v=[^"]+" as="image" type="image/webp">', s):
    s = re.sub(r'<link rel="preload" href="/assets/chest-user-open-v13\.webp\?v=[^"]+" as="image" type="image/webp">', open_preload, s, count=1)
else:
    s = s.replace(anim_preload, anim_preload + '\n' + open_preload, 1)

# Replace the complete nested chest container with one IMG player.
marker = '<div class="chest">'
start = s.find(marker)
if start < 0:
    raise SystemExit('Could not locate chest container')
pos = start
depth = 0
end = None
while pos < len(s):
    no = s.find('<div', pos)
    nc = s.find('</div>', pos)
    if nc < 0:
        break
    if no != -1 and no < nc:
        depth += 1
        pos = no + 4
    else:
        depth -= 1
        pos = nc + 6
        if depth == 0:
            end = pos
            break
if end is None:
    raise SystemExit('Could not resolve chest container boundary')
new_chest = f'<div class="chest"><img id="chestVisual" class="chestVisual18" src="/assets/chest-user-closed-v13.webp?v={CACHE}" alt="皇家红金宝箱" decoding="sync" fetchpriority="high"></div>'
s = s[:start] + new_chest + s[end:]

pattern = r'function resetChestVisual\(\)\{.*?\}\nasync function openChestSequence\(\)\{.*?\}\nasync function settleReward'
replacement = f"""function resetChestVisual(){{const img=$('chestVisual');if(!img)return;img.src='/assets/chest-user-closed-v13.webp?v={CACHE}'}}
async function openChestSequence(){{const st=$('stage'),img=$('chestVisual');st.classList.remove('explode');st.classList.add('opening','unlocking');$('stageText').innerHTML='锁芯正在发光…<small>惊喜即将开启</small>';await wait(440);st.classList.remove('opening','unlocking');void st.offsetWidth;st.classList.add('explode');$('stageText').innerHTML='宝箱正在缓缓开启…<small>金光正在从箱内升起</small>';if(img){{img.src='/assets/chest-user-closed-v13.webp?v={CACHE}';await wait(45);img.src='/assets/chest-open-anim-a.webp?v={CACHE}';}}noiseBurst(.18,.045);tone(420,.16,.04,'triangle');tone(760,.24,.035,'sine',.10);if(navigator.vibrate)navigator.vibrate([35,30,65]);await wait({anim_ms});if(img){{img.src='/assets/chest-user-open-v13.webp?v={CACHE}';}}$('stageText').innerHTML='宝箱已开启<small>好运正在揭晓</small>';await wait(120)}}
async function settleReward"""
s, n = re.subn(pattern, replacement, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Could not replace reset/openChestSequence')

if "function closeResult(){resetChestVisual();" not in s:
    s = s.replace('function closeResult(){', 'function closeResult(){resetChestVisual();', 1)

INDEX.write_text(s, encoding='utf-8')
print('Rewired index.html to refined V19 three-state chest player')

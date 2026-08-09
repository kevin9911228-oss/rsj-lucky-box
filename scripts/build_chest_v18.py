from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
from pathlib import Path
import math
import re

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
INDEX = ROOT / 'index.html'
CACHE = '20260809-v20'

closed_path = ASSETS / 'chest-user-closed-v13.webp'
lid_path = ASSETS / 'chest-user-lid-v13.webp'
body_path = ASSETS / 'chest-user-body-v13.webp'
open_path = ASSETS / 'chest-user-open-v13.webp'
out_path = ASSETS / 'chest-open-anim-a.webp'

for p in (closed_path, lid_path, body_path, open_path):
    if not p.exists():
        raise SystemExit(f'Missing required chest asset: {p.name}')

# All V13 parts already share one 1040x920 aligned canvas.
W = 460
src_closed = Image.open(closed_path).convert('RGBA')
ratio = W / src_closed.width
H = round(src_closed.height * ratio)

def load_canvas(path):
    return Image.open(path).convert('RGBA').resize((W, H), Image.Resampling.LANCZOS)

closed = load_canvas(closed_path)
lid_full = load_canvas(lid_path)
body = load_canvas(body_path)
opened = load_canvas(open_path)

lid_bbox = lid_full.getbbox()
if not lid_bbox:
    raise SystemExit('Lid asset has no visible pixels')
lid_crop = lid_full.crop(lid_bbox)
LX0, LY0, LX1, LY1 = lid_bbox
hinge_y = LY1 - 2

# Important V20 rule: NEVER composite the full closed chest and full open chest in the same frame.
# Each moving frame contains only one fixed body + one lid. This removes the double-box ghosting.
frames = []
durations = []
N = 34
for i in range(N):
    t = i / (N - 1)
    frame = Image.new('RGBA', (W, H), (0, 0, 0, 0))

    if t < .16:
        # A clean closed hold: one chest image only.
        frame.alpha_composite(closed)
    else:
        # From this point onward there is exactly one body and one lid.
        frame.alpha_composite(body)

        q = (t - .16) / .84
        q = max(0.0, min(1.0, q))
        ease = q*q*(3 - 2*q)

        # Pre-render a readable slow lid lift. No open-chest bitmap is blended here.
        sy = 1.0 - .34 * ease
        sx = 1.0 + .025 * ease
        new_w = max(1, round(lid_crop.width * sx))
        new_h = max(1, round(lid_crop.height * sy))
        moving_lid = lid_crop.resize((new_w, new_h), Image.Resampling.BICUBIC)
        moving_lid = ImageEnhance.Brightness(moving_lid).enhance(1.0 + .08 * ease)

        # Slight rise/backward feel. Keep centered and never duplicate the lid.
        lift = round(lid_crop.height * .19 * ease)
        x = round((W - new_w) / 2)
        y = LY0 - lift

        # Interior cavity goes BEHIND the lid and above the body.
        glow_strength = max(0.0, min(1.0, (q - .16) / .68))
        if glow_strength > 0:
            cavity = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(cavity)
            cx = W // 2
            cy = round(hinge_y - 4 - 8 * ease)
            # Dark ruby interior first, then gold light.
            rx = round(W * (.18 + .035 * ease))
            ry = round(H * (.025 + .018 * ease))
            d.ellipse((cx-rx, cy-ry, cx+rx, cy+ry), fill=(55, 12, 7, int(190 * glow_strength)))
            for r, al in [(82, 22), (60, 45), (40, 80), (23, 120)]:
                a = int(al * glow_strength)
                d.ellipse((cx-r, cy-r//4, cx+r, cy+r//4), fill=(255, 207, 74, a))
            cavity = cavity.filter(ImageFilter.GaussianBlur(6))
            frame.alpha_composite(cavity)

        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        layer.alpha_composite(moving_lid, (x, y))
        frame.alpha_composite(layer)

        # Late sparks are subtle and do not introduce another chest image.
        if q > .48:
            p = (q - .48) / .52
            spark = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(spark)
            for k in range(12):
                ang = .35 + k * .58
                rad = 16 + p * (38 + 6 * (k % 4))
                x2 = W/2 + math.cos(ang) * rad
                y2 = hinge_y - math.sin(ang) * rad * .62 - 8*p
                rr = 1 + (k % 2)
                al = int(170 * (1 - .28*p))
                d.ellipse((x2-rr, y2-rr, x2+rr, y2+rr), fill=(255, 232, 136, al))
            frame.alpha_composite(spark.filter(ImageFilter.GaussianBlur(.35)))

        # Final bloom masks the handoff to the aligned open still after playback.
        if q > .80:
            p = (q - .80) / .20
            bloom = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(bloom)
            cx, cy = W//2, hinge_y - round(9*ease)
            for r, al in [(104, 28), (72, 58), (45, 100), (25, 150)]:
                d.ellipse((cx-r, cy-r//3, cx+r, cy+r//3), fill=(255, 219, 96, int(al*p)))
            frame.alpha_composite(bloom.filter(ImageFilter.GaussianBlur(9)))

    frames.append(frame)
    durations.append(68)

# Opening cadence: readable closed hold, slow lid travel, final gold hold.
durations[0] = 230
durations[1] = 120
durations[-1] = 300
anim_ms = sum(durations) + 80

frames[0].save(
    out_path,
    'WEBP',
    save_all=True,
    append_images=frames[1:],
    duration=durations,
    loop=1,
    lossless=False,
    quality=78,
    method=4,
    minimize_size=True,
)

test = Image.open(out_path)
n = getattr(test, 'n_frames', 1)
if n < 24:
    raise SystemExit(f'Animated WebP validation failed: {n} frames')
print(f'Generated ghost-free {out_path.name}: {n} frames, {out_path.stat().st_size} bytes, {W}x{H}, wait={anim_ms}ms')

s = INDEX.read_text(encoding='utf-8')
css_tag = f'<link rel="stylesheet" href="/assets/chest-v18.css?v={CACHE}">'
anim_preload = f'<link rel="preload" href="/assets/chest-open-anim-a.webp?v={CACHE}" as="image" type="image/webp">'
open_preload = f'<link rel="preload" href="/assets/chest-user-open-v13.webp?v={CACHE}" as="image" type="image/webp">'

s = re.sub(r'<link rel="stylesheet" href="/assets/chest-v18\.css\?v=[^"]+">', css_tag, s, count=1)
s = re.sub(r'<link rel="preload" href="/assets/chest-open-anim-a\.webp\?v=[^"]+" as="image" type="image/webp">', anim_preload, s, count=1)
if re.search(r'<link rel="preload" href="/assets/chest-user-open-v13\.webp\?v=[^"]+" as="image" type="image/webp">', s):
    s = re.sub(r'<link rel="preload" href="/assets/chest-user-open-v13\.webp\?v=[^"]+" as="image" type="image/webp">', open_preload, s, count=1)
else:
    s = s.replace(anim_preload, anim_preload + '\n' + open_preload, 1)

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
async function openChestSequence(){{const st=$('stage'),img=$('chestVisual');st.classList.remove('explode');st.classList.add('opening','unlocking');$('stageText').innerHTML='锁芯正在发光…<small>惊喜即将开启</small>';await wait(440);st.classList.remove('opening','unlocking');void st.offsetWidth;st.classList.add('explode');$('stageText').innerHTML='宝箱正在缓缓开启…<small>箱盖正在打开</small>';if(img){{img.src='/assets/chest-user-closed-v13.webp?v={CACHE}';await wait(45);img.src='/assets/chest-open-anim-a.webp?v={CACHE}';}}noiseBurst(.18,.045);tone(420,.16,.04,'triangle');tone(760,.24,.035,'sine',.10);if(navigator.vibrate)navigator.vibrate([35,30,65]);await wait({anim_ms});if(img){{img.src='/assets/chest-user-open-v13.webp?v={CACHE}';}}$('stageText').innerHTML='宝箱已开启<small>好运正在揭晓</small>';await wait(130)}}
async function settleReward"""
s, n = re.subn(pattern, replacement, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Could not replace reset/openChestSequence')

INDEX.write_text(s, encoding='utf-8')
print('Rewired index.html to ghost-free V20 animated chest player')

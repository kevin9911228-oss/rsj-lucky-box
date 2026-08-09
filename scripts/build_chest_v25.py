from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
from pathlib import Path
import base64, math, random, re
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
INDEX = ROOT / 'index.html'
SPRITE = ASSETS / 'effect-keyframes-v25.jpg'
PARTS = [
    ASSETS / 'effect-keyframes-v23.part1',
    ASSETS / 'effect-keyframes-v23.part2',
    ASSETS / 'effect-keyframes-v23.part3',
    ASSETS / 'effect-keyframes-v23.part4',
    ASSETS / 'effect-keyframes-v23.part5a',
    ASSETS / 'effect-keyframes-v23.part5b',
]

# V25 design target:
# - 133 full frames
# - 60 ms per frame = 7.98 seconds
# - one continuous ceremonial GIF from sealed chest to final open state
FRAME_MS = 60
FRAME_COUNT = 133
W = 480

# Rebuild the approved five-panel chest artwork already stored in this repo.
s = ''.join(p.read_text(encoding='utf-8').strip() for p in PARTS)
s += '=' * (-len(s) % 4)
SPRITE.write_bytes(base64.b64decode(s))
with Image.open(SPRITE) as check:
    check.verify()

src = Image.open(SPRITE).convert('RGB')
pw = src.width // 5
raw = []
for i in range(5):
    x0 = i * pw
    x1 = (i + 1) * pw if i < 4 else src.width
    raw.append(src.crop((x0, 0, x1, src.height)))

H = round(raw[0].height * W / raw[0].width)
keys = []
for i, im in enumerate(raw):
    x = im.resize((W, H), Image.Resampling.LANCZOS)
    x = ImageEnhance.Contrast(x).enhance(1.08)
    x = ImageEnhance.Color(x).enhance(1.07)
    x = ImageEnhance.Sharpness(x).enhance(1.16 if i in (0, 4) else 1.09)
    keys.append(np.array(x))


def flow_pair(a, b):
    ga = cv2.cvtColor(a, cv2.COLOR_RGB2GRAY)
    gb = cv2.cvtColor(b, cv2.COLOR_RGB2GRAY)
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    dis.setFinestScale(1)
    fab = dis.calc(ga, gb, None)
    dis2 = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    dis2.setFinestScale(1)
    fba = dis2.calc(gb, ga, None)
    return fab, fba


def warp(img, flow, amount):
    h, w = img.shape[:2]
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    mx = gx - flow[..., 0] * amount
    my = gy - flow[..., 1] * amount
    return cv2.remap(img, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT101)


def smoothstep(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3.0 - 2.0 * t)


flows = [flow_pair(keys[i], keys[i + 1]) for i in range(4)]


def morph(a_idx, b_idx, t):
    t = smoothstep(t)
    a = keys[a_idx]
    b = keys[b_idx]
    fab, fba = flows[a_idx]
    wa = warp(a, fab, t)
    wb = warp(b, fba, 1.0 - t)
    return cv2.addWeighted(wa, 1.0 - t, wb, t, 0)


def sample_chest(t):
    # Deliberately slow, formal opening cadence.
    # 0-.10 sealed / breath
    # .10-.29 seal awakens
    # .29-.48 lock opens
    # .48-.73 main lid opening
    # .73-.86 final reveal
    # .86-1.00 open-state celebration / settle
    if t < .10:
        return keys[0].copy()
    if t < .29:
        return morph(0, 1, (t - .10) / .19)
    if t < .48:
        return morph(1, 2, (t - .29) / .19)
    if t < .73:
        return morph(2, 3, (t - .48) / .25)
    if t < .86:
        return morph(3, 4, (t - .73) / .13)
    return keys[4].copy()


# Stable deterministic particle choreography; positions move smoothly instead of flickering.
rng = random.Random(20260825)
dust = []
for _ in range(54):
    dust.append({
        'x': rng.random(),
        'y': rng.random(),
        'phase': rng.random() * math.tau,
        'speed': .45 + rng.random() * 1.25,
        'size': 1 + rng.randint(0, 2),
        'warm': rng.random(),
    })

burst = []
for _ in range(34):
    ang = rng.uniform(-2.75, -0.38)
    speed = rng.uniform(105, 265)
    burst.append({
        'ang': ang,
        'speed': speed,
        'spin': rng.uniform(-5.0, 5.0),
        'size': rng.randint(3, 7),
        'delay': rng.uniform(0.0, .18),
    })


def bell(t, center, width):
    if width <= 0:
        return 0.0
    return max(0.0, 1.0 - abs(t - center) / width)


def add_vignette(im):
    arr = np.asarray(im).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    nx = (xx - W / 2) / (W / 2)
    ny = (yy - H / 2) / (H / 2)
    r = np.sqrt(nx * nx + ny * ny)
    mask = np.clip(1.04 - np.maximum(0.0, r - .60) * .36, .78, 1.04)[..., None]
    arr = np.clip(arr * mask, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, 'RGB')


def radial_rays(size, center, alpha, phase):
    ov = Image.new('RGBA', size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    if alpha <= 0:
        return ov
    cx, cy = center
    radius = max(W, H) * .82
    for i in range(18):
        a = (i / 18.0) * math.tau + phase
        width = .025 + (i % 3) * .009
        a1, a2 = a - width, a + width
        pts = [
            (cx, cy),
            (cx + math.cos(a1) * radius, cy + math.sin(a1) * radius),
            (cx + math.cos(a2) * radius, cy + math.sin(a2) * radius),
        ]
        aa = int(alpha * (.45 + .55 * ((i % 4) / 3)))
        d.polygon(pts, fill=(255, 207, 78, aa))
    return ov.filter(ImageFilter.GaussianBlur(6))


def glow_ellipse(size, box, color, blur):
    ov = Image.new('RGBA', size, (0, 0, 0, 0))
    ImageDraw.Draw(ov).ellipse(box, fill=color)
    return ov.filter(ImageFilter.GaussianBlur(blur))


def star(draw, x, y, r, alpha, warm=True):
    c = (255, 237, 157, alpha) if warm else (255, 255, 238, alpha)
    draw.line((x - r, y, x + r, y), fill=c, width=max(1, r // 4))
    draw.line((x, y - r, x, y + r), fill=c, width=max(1, r // 4))
    rr = max(1, r // 3)
    draw.ellipse((x - rr, y - rr, x + rr, y + rr), fill=(255, 250, 211, min(255, alpha + 35)))


def ceremony_fx(base, t):
    im = add_vignette(base).convert('RGBA')
    center = (W // 2, round(H * .52))

    # Royal radial aura grows before the lid opens and peaks at reveal.
    aura = max(.0, min(1.0, (t - .08) / .55))
    aura *= .70 + .30 * math.sin(min(1.0, t / .82) * math.pi / 2)
    rays_alpha = int(38 * aura + 86 * bell(t, .78, .18))
    im = Image.alpha_composite(im, radial_rays((W, H), center, rays_alpha, t * .22))

    # Layered warm halos keep the center looking premium instead of flat.
    mid = 18 + int(44 * aura)
    reveal = int(130 * bell(t, .80, .19))
    for scale, a, blur in [(1.00, mid, 22), (.68, mid + reveal // 3, 18), (.40, mid + reveal, 13)]:
        rx = int(W * .38 * scale)
        ry = int(H * .21 * scale)
        cx, cy = center
        ov = glow_ellipse((W, H), (cx - rx, cy - ry, cx + rx, cy + ry), (255, 193, 55, min(210, a)), blur)
        im = Image.alpha_composite(im, ov)

    # Lock flare: a precise ceremonial highlight rather than random flashing.
    lock_strength = max(0.0, min(1.0, (t - .16) / .20)) * max(0.0, min(1.0, (.58 - t) / .16))
    if lock_strength > 0:
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(ov)
        lx, ly = W // 2, round(H * .59)
        r = int(10 + 18 * lock_strength)
        star(d, lx, ly, r, int(160 + 85 * lock_strength), True)
        d.ellipse((lx - 6, ly - 6, lx + 6, ly + 6), fill=(255, 246, 188, 220))
        im = Image.alpha_composite(im, ov.filter(ImageFilter.GaussianBlur(1.4)))

    # Floating gold dust remains smooth because each sparkle follows a continuous path.
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for p in dust:
        y = (p['y'] - t * .11 * p['speed']) % 1.0
        x = p['x'] + math.sin(p['phase'] + t * math.tau * p['speed']) * .018
        tw = .35 + .65 * (math.sin(p['phase'] + t * math.tau * 2.4) * .5 + .5)
        alpha = int((35 + 120 * aura) * tw)
        px, py = int(x * W), int(y * H)
        r = p['size']
        col = (255, 219, 105, alpha) if p['warm'] > .22 else (255, 250, 225, alpha)
        d.ellipse((px - r, py - r, px + r, py + r), fill=col)
        if r >= 2 and alpha > 80:
            star(d, px, py, r + 2, min(210, alpha), p['warm'] > .22)
    im = Image.alpha_composite(im, ov.filter(ImageFilter.GaussianBlur(.35)))

    # Reveal explosion is choreographed into the GIF itself.
    if t > .70:
        u = min(1.0, max(0.0, (t - .70) / .24))
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(ov)
        ox, oy = W * .50, H * .51
        for p in burst:
            q = max(0.0, min(1.0, (u - p['delay']) / max(.01, 1 - p['delay'])))
            if q <= 0:
                continue
            dist = p['speed'] * (q ** .82)
            x = ox + math.cos(p['ang']) * dist
            y = oy + math.sin(p['ang']) * dist + 54 * q * q
            fade = int(235 * (1 - q * .72))
            sz = p['size']
            d.ellipse((x - sz, y - sz * .55, x + sz, y + sz * .55), fill=(255, 194, 49, fade), outline=(255, 239, 160, min(255, fade + 20)))
            if sz >= 5:
                d.line((x - sz, y, x + sz, y), fill=(255, 242, 174, fade), width=1)
        im = Image.alpha_composite(im, ov)

    # Final lens flare at the exact moment the chest reaches its fully open pose.
    flare = bell(t, .83, .12)
    if flare > 0:
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(ov)
        y = round(H * .48)
        a = int(165 * flare)
        d.rectangle((int(W * .10), y - 1, int(W * .90), y + 1), fill=(255, 223, 114, a))
        star(d, W // 2, y, int(18 + 34 * flare), min(255, 155 + int(95 * flare)), False)
        im = Image.alpha_composite(im, ov.filter(ImageFilter.GaussianBlur(1.2)))

    # Soft white-gold bloom at climax, then settle back to a crisp open chest.
    climax = bell(t, .82, .10)
    if climax > 0:
        white = Image.new('RGBA', (W, H), (255, 244, 196, int(34 * climax)))
        im = Image.alpha_composite(im, white)

    return im.convert('RGB')


frames = []
for i in range(FRAME_COUNT):
    t = i / (FRAME_COUNT - 1)
    arr = sample_chest(t)
    im = Image.fromarray(arr, 'RGB')
    im = ceremony_fx(im, t)
    # Slight warmth / crispness at the end so the final still feels intentional.
    if t > .90:
        im = ImageEnhance.Contrast(im).enhance(1.02)
        im = ImageEnhance.Sharpness(im).enhance(1.06)
    frames.append(im.quantize(colors=112, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG))

GIF = ASSETS / 'chest-effect-opening-v25.gif'
frames[0].save(
    GIF,
    save_all=True,
    append_images=frames[1:],
    duration=FRAME_MS,
    optimize=True,
    disposal=2,
)

closed = Image.fromarray(keys[0], 'RGB')
opened = ceremony_fx(Image.fromarray(keys[4], 'RGB'), 1.0)
closed.save(ASSETS / 'chest-effect-closed-v25.webp', 'WEBP', quality=95, method=6)
opened.save(ASSETS / 'chest-effect-open-v25.webp', 'WEBP', quality=95, method=6)

# Validate exact ceremony contract.
test = Image.open(GIF)
if getattr(test, 'n_frames', 1) != FRAME_COUNT:
    raise SystemExit(f'V25 frame validation failed: {getattr(test, "n_frames", 1)} != {FRAME_COUNT}')
actual_ms = 0
for i in range(test.n_frames):
    test.seek(i)
    actual_ms += int(test.info.get('duration', FRAME_MS))
if abs(actual_ms - FRAME_COUNT * FRAME_MS) > FRAME_MS:
    raise SystemExit(f'V25 duration validation failed: {actual_ms}ms')

html = INDEX.read_text(encoding='utf-8')
pre = '<link rel="preload" href="/assets/chest-effect-opening-v25.gif?v=20260809-v25" as="image" type="image/gif">'
css = '<link rel="stylesheet" href="/assets/chest-v25.css?v=20260809-v25">'
js = '<script src="/assets/chest-v25.js?v=20260809-v25"></script>'
if pre not in html:
    html = html.replace('</head>', pre + '\n' + css + '\n</head>', 1)
elif css not in html:
    html = html.replace('</head>', css + '\n</head>', 1)
if js not in html:
    html = html.replace('</body>', js + '\n</body>', 1)
html, n = re.subn(
    r'(<img\s+id="chestVisual"[^>]*?src=")[^"]+("[^>]*>)',
    r'\1/assets/chest-effect-closed-v25.webp?v=20260809-v25\2',
    html,
    count=1,
)
if n != 1:
    raise SystemExit('Could not update chestVisual to V25')
INDEX.write_text(html, encoding='utf-8')

print(
    f'V25 ceremonial GIF built: {test.n_frames} frames, '
    f'{actual_ms}ms, {GIF.stat().st_size} bytes, {W}x{H}'
)

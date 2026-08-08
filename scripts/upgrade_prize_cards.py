from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')
marker = '/* PREMIUM_PRIZE_CARDS_V1 */'
if marker in s:
    print('premium prize cards already installed')
    raise SystemExit(0)

new_grid = '''<div class="grid" id="prizeGrid">
<div class="prize p20" data-reward="20"><img class="prizeArt" src="/assets/prizes/20.webp" alt="20元 好运金币" decoding="async"></div>
<div class="prize p40" data-reward="40"><img class="prizeArt" src="/assets/prizes/40.webp" alt="40元 幸运钱袋" decoding="async"></div>
<div class="prize p60" data-reward="60"><img class="prizeArt" src="/assets/prizes/60.webp" alt="60元 惊喜礼券" decoding="async"></div>
<div class="prize p100" data-reward="100"><img class="prizeArt" src="/assets/prizes/100.webp" alt="100元 宝箱奖励" decoding="async"></div>
<div class="prize p120" data-reward="120"><img class="prizeArt" src="/assets/prizes/120.webp" alt="120元 元宝好礼" decoding="async"></div>
<div class="prize p160" data-reward="160"><img class="prizeArt" src="/assets/prizes/160.webp" alt="160元 钻石大奖" decoding="async"></div>
<div class="prize p200" data-reward="200"><img class="prizeArt" src="/assets/prizes/200.webp" alt="200元 皇冠豪礼" decoding="async"></div>
<div class="prize p888" data-reward="888"><img class="prizeArt" src="/assets/prizes/888.webp" alt="888元 隐藏大奖 1%" decoding="async"></div>
</div>'''

pattern = re.compile(r'<div class="grid" id="prizeGrid">.*?</div>(?=</section>\s*</section>)', re.S)
s, n = pattern.subn(new_grid, s, count=1)
if n != 1:
    raise RuntimeError(f'prize grid replacement failed: {n}')

css = r'''
/* PREMIUM_PRIZE_CARDS_V1 */
.grid{gap:6px}
.prize{
  position:relative!important;isolation:isolate;min-width:0;
  height:auto!important;aspect-ratio:3/4;padding:0!important;
  border:1px solid var(--edge,#9b7840)!important;border-radius:11px;
  background:#080a0d!important;overflow:hidden;
  box-shadow:0 5px 14px #0009,0 0 12px var(--shadow,#d5ad4f22)!important;
  transform:translateZ(0);will-change:transform,filter,box-shadow;
  transition:transform .16s ease,filter .16s ease,box-shadow .16s ease,border-color .16s ease;
  animation:premiumCardBreath 3.4s ease-in-out infinite!important;
}
.prize:nth-child(2n){animation-delay:-.8s!important}.prize:nth-child(3n){animation-delay:-1.6s!important}
.prizeArt{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.015);filter:saturate(1.05) brightness(.98);transition:transform .18s ease,filter .18s ease}
.prize:before{
  content:""!important;position:absolute!important;z-index:4!important;pointer-events:none;
  top:-45%!important;left:-80%!important;width:34%!important;height:190%!important;
  transform:rotate(18deg)!important;
  background:linear-gradient(90deg,transparent,#fff6c925,#fffce89e,#fff6c925,transparent)!important;
  animation:premiumCardSweep 5.2s ease-in-out infinite!important;
}
.prize:after{
  content:""!important;position:absolute!important;inset:0!important;z-index:3!important;
  width:auto!important;height:auto!important;right:0!important;bottom:0!important;
  border-radius:inherit!important;border:1px solid #fff4bd24!important;
  background:transparent!important;color:transparent!important;
  box-shadow:inset 0 0 14px var(--inner,#ffd77222)!important;
  opacity:.72;pointer-events:none;animation:premiumEdgeGlow 2.7s ease-in-out infinite!important;
}
.prize.active{
  transform:scale(1.10)!important;z-index:8!important;filter:none!important;
  border-color:#fff5be!important;
  box-shadow:0 0 0 2px #fff2a3 inset,0 0 18px #ffd34f,0 0 38px var(--active,#ffe08e)!important;
  animation:premiumActivePulse .34s ease-in-out infinite alternate!important;
}
.prize.active .prizeArt{transform:scale(1.06);filter:brightness(1.30) saturate(1.22)}
.prize.active:before{animation:premiumActiveSweep .38s ease-out both!important}
.prize.locked{
  transform:scale(1.13)!important;z-index:10!important;filter:none!important;
  border-color:#fffbe0!important;
  box-shadow:0 0 0 2px #fff9dc inset,0 0 30px #ffd64e,0 0 62px var(--active,#ffd64e)!important;
  animation:premiumLockedPulse .62s ease-in-out infinite alternate!important;
}
.prize.locked .prizeArt{transform:scale(1.075);filter:brightness(1.38) saturate(1.26)}
.prize.locked:after{content:""!important;opacity:1!important;box-shadow:inset 0 0 22px #fff6b870,0 0 18px #ffd853!important}
.p20{--edge:#27819f;--shadow:#16bed744;--active:#52dfff;--inner:#5fe7ff}
.p40{--edge:#397ded;--shadow:#397dff55;--active:#72a7ff;--inner:#4d8fff}
.p60{--edge:#a24eff;--shadow:#9f4cff55;--active:#d29aff;--inner:#bc66ff}
.p100{--edge:#e14b37;--shadow:#ff5d3f55;--active:#ff9571;--inner:#ff6848}
.p120{--edge:#ef9b28;--shadow:#ffb32f66;--active:#ffd36a;--inner:#ffbb42}
.p160{--edge:#4cd9f2;--shadow:#5ee9ff66;--active:#a1f7ff;--inner:#80efff}
.p200{--edge:#ffb229;--shadow:#ff5a2777;--active:#fff08a;--inner:#ffbd3e}
.p888{--edge:#ffe489;--shadow:#ffc12fc0;--active:#fff4b9;--inner:#ffe471}
.p888:not(.active):not(.locked){animation:premiumJackpotBreath 1.65s ease-in-out infinite!important}
.p888:before{background:linear-gradient(90deg,transparent,#fff0a228,#fffbe6c9,#fff0a228,transparent)!important;animation-duration:3.1s!important}
@keyframes premiumCardBreath{
  0%,100%{transform:translateY(0);box-shadow:0 5px 14px #0009,0 0 10px var(--shadow)}
  50%{transform:translateY(-1.5px);box-shadow:0 8px 18px #0009,0 0 19px var(--shadow)}
}
@keyframes premiumCardSweep{0%,52%{left:-80%;opacity:0}60%{opacity:.7}82%{left:145%;opacity:.4}100%{left:145%;opacity:0}}
@keyframes premiumEdgeGlow{0%,100%{opacity:.48}50%{opacity:1}}
@keyframes premiumActiveSweep{from{left:-80%;opacity:0}35%{opacity:1}to{left:145%;opacity:0}}
@keyframes premiumActivePulse{from{transform:scale(1.075)}to{transform:scale(1.105)}}
@keyframes premiumLockedPulse{from{transform:scale(1.105)}to{transform:scale(1.14)}}
@keyframes premiumJackpotBreath{
  0%,100%{transform:translateY(0);box-shadow:0 6px 18px #000a,0 0 18px #ffc23577}
  50%{transform:translateY(-2px) scale(1.018);box-shadow:0 8px 24px #000a,0 0 35px #ffd34dbc}
}
@media(min-width:600px){.prize{height:auto!important;padding:0!important}.grid{gap:10px}}
@media(max-width:350px){.prize{height:auto!important;padding:0!important;border-radius:9px}.grid{gap:4px}}
@media(prefers-reduced-motion:reduce){.prize,.prize:before,.prize:after{animation:none!important}}
'''

if '</style>' not in s:
    raise RuntimeError('style closing tag not found')
s = s.replace('</style>', css + '\n</style>', 1)

required = [marker] + [f'/assets/prizes/{v}.webp' for v in (20,40,60,100,120,160,200,888)]
for item in required:
    if item not in s:
        raise RuntimeError(f'missing required marker: {item}')
if 'class="prize b1"' in s or 'class="prize jackpot"' in s:
    raise RuntimeError('old prize markup still present')

p.write_text(s, encoding='utf-8')
print('premium prize cards installed')

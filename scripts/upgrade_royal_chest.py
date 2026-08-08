from pathlib import Path
import re

p = Path('index.html')
s = p.read_text()

css = r'''
/* ROYAL_CHEST_V2 */
.pool{background:radial-gradient(circle at 50% 25%,#7a431c3d 0,transparent 34%),radial-gradient(circle at 50% 54%,#f7b83b14 0,transparent 36%),linear-gradient(180deg,#11141a,#080a0e)!important}
.pool:before{inset:-100px!important;background:repeating-conic-gradient(from 0deg,#ffe48013 0 2deg,transparent 2deg 12deg)!important;animation:ambient 20s linear infinite!important}
.poolHead{position:relative;z-index:6}
.pool h2{display:flex;align-items:center;justify-content:center;gap:8px;margin:0!important;font-size:24px!important;color:#ffd66d!important;text-shadow:0 0 18px #ffc13c54,0 2px 0 #6d3d05}
.crownIcon{position:relative;display:inline-grid;place-items:center;width:34px;height:30px;filter:drop-shadow(0 0 8px #ffc33e8c)}
.crownIcon:after{content:"";position:absolute;inset:-8px;background:radial-gradient(circle,#ffe89799 0 2px,transparent 3px) 12% 18%/13px 13px,radial-gradient(circle,#fff4b0a8 0 1.5px,transparent 2.5px) 88% 24%/11px 11px;animation:crownSpark 2.2s ease-in-out infinite;pointer-events:none}
.crownIcon svg{width:34px;height:30px;overflow:visible}
.poolSub{font-size:10px!important;letter-spacing:2px!important;color:#ad9467!important;text-shadow:0 1px 8px #000}
.stage{height:238px!important;overflow:visible;isolation:isolate}
.stage:before{z-index:0!important}
.stage:after{z-index:1!important}
.halo{width:244px!important;height:134px!important;top:78px!important;border-radius:50%!important;border:1px solid #ffd56945!important;background:radial-gradient(ellipse at center,#ffc84a1c 0,transparent 66%)!important;box-shadow:0 0 48px #f0ad2f32,inset 0 0 28px #f0ad2f24!important;transform:perspective(420px) rotateX(68deg);animation:royalHalo 2.6s ease-in-out infinite!important;z-index:1}
.halo:before{inset:-17px!important;border:1px dashed #efbd4a2f!important}.halo:after{inset:18px!important;border:1px solid #ffe08c1f!important}
.chest{width:300px!important;height:158px!important;position:absolute!important;left:50%!important;top:45%!important;translate:-50% -50%!important;scale:1!important;background:url('/assets/royal-chest.webp?v=royal-v2') center/contain no-repeat!important;filter:drop-shadow(0 16px 18px #000b) drop-shadow(0 0 18px #e5a22945)!important;animation:royalFloat 3s ease-in-out infinite!important;transform-origin:50% 66%!important;z-index:4}
.chest:before{content:"";position:absolute;left:50%;top:49%;width:48%;height:22%;translate:-50% -50%;border-radius:50%;background:radial-gradient(ellipse,#fffbd6 0,#ffe37bbd 22%,#ffc33d59 48%,transparent 72%);filter:blur(4px);opacity:.18;mix-blend-mode:screen;transition:opacity .22s ease,transform .5s ease}
.chest:after{content:"";position:absolute;left:50%;top:38%;width:88%;height:64%;translate:-50% -50%;background:linear-gradient(118deg,transparent 25%,#fff4bd00 35%,#fff4bd80 48%,#fffce4b8 51%,#fff4bd1c 57%,transparent 67%);clip-path:polygon(8% 0,100% 0,88% 100%,0 100%);opacity:.24;transform:translateX(-34%);animation:royalSheen 4.8s ease-in-out infinite;pointer-events:none}
.lid,.base,.band{display:none!important}
.lock{display:block!important;position:absolute!important;z-index:8!important;left:50%!important;top:51%!important;width:24px!important;height:24px!important;margin:-12px 0 0 -12px!important;border-radius:5px!important;transform:rotate(45deg)!important;background:linear-gradient(135deg,#fff5ae 0,#f6c64f 35%,#a85d08 76%,#4b2603 100%)!important;border:1px solid #fff1a6!important;box-shadow:0 0 0 2px #5f3008cc,0 0 10px #ffcf4c75,inset 0 0 7px #fff4b3!important}
.lock:before{content:"";position:absolute;inset:5px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fffad9,#ff6e32 38%,#8d1407 66%,#2d0502 100%);box-shadow:0 0 9px #ff983f}
.lock:after{content:""!important;position:absolute;left:50%;top:50%;width:5px;height:8px;translate:-50% -50%;border-radius:50% 50% 40% 40%;background:#351502!important;transform:rotate(-45deg);box-shadow:0 0 4px #fff3ac88}
.stage.opening .chest{animation:royalTension .38s ease-in-out infinite!important}
.stage.opening .lock,.stage.unlocking .lock{animation:royalLockCharge .42s ease-in-out infinite alternate!important}
.stage.unlocking .chest:before{opacity:.65;transform:scale(1.15)}
.stage.explode .chest{animation:royalOpenHold .78s cubic-bezier(.16,.9,.2,1) forwards!important;filter:drop-shadow(0 0 28px #ffe26c) drop-shadow(0 18px 20px #000c)!important}
.stage.explode .chest:before{opacity:1;transform:scale(1.8,2.8);filter:blur(6px)}
.stage.explode:before{width:330px!important;height:255px!important;z-index:2!important;background:radial-gradient(ellipse,#fff9dbea 0,#ffe38fa3 14%,#ffc43e42 35%,transparent 70%)!important;animation:royalBurstLight .95s ease-out both!important}
.stage.explode:after{width:250px!important;height:280px!important;z-index:3!important;background:linear-gradient(90deg,transparent,#ffdc7352,#fffbd4e8,#ffdc7352,transparent)!important;filter:blur(6px)!important;clip-path:polygon(35% 100%,65% 100%,100% 0,0 0)!important;animation:royalBeam .9s ease-out both!important}
.stageText{z-index:8!important;bottom:3px!important;font-size:17px!important;color:#ffe79d!important;text-shadow:0 2px 7px #000,0 0 12px #ffc44945}
.stageText small{font-size:9px!important;color:#b29b70!important}
.stage.disabled .chest{filter:grayscale(.22) brightness(.72) drop-shadow(0 12px 16px #000b)!important}
@keyframes crownSpark{0%,100%{opacity:.38;transform:scale(.9)}50%{opacity:1;transform:scale(1.08)}}
@keyframes royalFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-5px) scale(1.015)}}
@keyframes royalTension{0%,100%{transform:translateX(0) rotate(0) scale(1.01)}25%{transform:translateX(-3px) rotate(-.55deg) scale(1.018)}75%{transform:translateX(3px) rotate(.55deg) scale(1.018)}}
@keyframes royalLockCharge{from{filter:brightness(1);box-shadow:0 0 0 2px #5f3008cc,0 0 9px #ffca3c75,inset 0 0 7px #fff4b3}to{filter:brightness(1.55);box-shadow:0 0 0 2px #7b430ccc,0 0 28px #ffe06fd6,0 0 52px #ffb92c82,inset 0 0 12px #fffbd4}}
@keyframes royalOpenHold{0%{transform:scale(1) translateY(0)}38%{transform:scale(1.11) translateY(-4px)}62%{transform:scale(1.19) translateY(-9px)}100%{transform:scale(1.10) translateY(-7px)}}
@keyframes royalBurstLight{0%{transform:scale(.18);opacity:0}28%{opacity:1}100%{transform:scale(1.45);opacity:0}}
@keyframes royalBeam{0%{transform:scaleY(.06);opacity:0}24%{opacity:1}100%{transform:scaleY(1.15);opacity:0}}
@keyframes royalHalo{0%,100%{opacity:.52;box-shadow:0 0 35px #e2a52d25,inset 0 0 24px #e2a52d22}50%{opacity:1;box-shadow:0 0 62px #ffd45d42,inset 0 0 34px #ffd45d2f}}
@keyframes royalSheen{0%,46%{opacity:0;transform:translateX(-52%)}58%{opacity:.58}76%{opacity:.18;transform:translateX(42%)}100%{opacity:0;transform:translateX(42%)}}
@media(min-width:600px){.stage{height:300px!important}.chest{width:385px!important;height:203px!important;top:46%!important}.halo{width:310px!important;height:162px!important;top:105px!important}.stageText{font-size:20px!important}.crownIcon,.crownIcon svg{width:42px;height:36px}.pool h2{font-size:30px!important}}
@media(max-width:350px){.stage{height:218px!important}.chest{width:270px!important;height:142px!important;top:45%!important}.halo{width:218px!important;height:120px!important;top:72px!important}.stageText{font-size:15px!important}}
@media(prefers-reduced-motion:reduce){.chest,.lock,.halo,.crownIcon:after{animation:none!important}}
'''

if '/* ROYAL_CHEST_V2 */' not in s:
    s = s.replace('\n</style>', '\n' + css + '\n</style>', 1)

old_h2 = '<h2>👑 惊喜奖池</h2>'
new_h2 = '''<h2><span class="crownIcon" aria-hidden="true"><svg viewBox="0 0 64 54" role="img"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff9bf"/><stop offset=".38" stop-color="#ffd55f"/><stop offset="1" stop-color="#a65b06"/></linearGradient><radialGradient id="rg"><stop offset="0" stop-color="#fff5cf"/><stop offset=".35" stop-color="#ff7447"/><stop offset="1" stop-color="#8a1007"/></radialGradient></defs><path d="M7 17l13 9 12-20 12 20 13-9-5 26H12z" fill="url(#cg)" stroke="#ffe79a" stroke-width="2"/><path d="M13 43h38l-2 7H15z" fill="url(#cg)" stroke="#b8720b" stroke-width="1.5"/><circle cx="20" cy="27" r="4" fill="url(#rg)"/><circle cx="32" cy="18" r="4.5" fill="url(#rg)"/><circle cx="44" cy="27" r="4" fill="url(#rg)"/></svg></span><span>惊喜奖池</span></h2>'''
if old_h2 in s:
    s = s.replace(old_h2, new_h2, 1)

old_explode = re.compile(r"async function explodeChest\(reward\)\{.*?\}\nfunction openResult", re.S)
new_explode = r'''async function openChestSequence(){const st=$('stage');st.classList.add('opening','unlocking');$('stageText').innerHTML='锁芯正在发光…<small>惊喜即将开启</small>';await wait(360);st.classList.remove('opening','unlocking');void st.offsetWidth;st.classList.add('explode');$('stageText').innerHTML='宝箱开启 · 金光释放<small>奖励正在从光里出现</small>';flash();noiseBurst(.24,.055);tone(420,.18,.05,'triangle');tone(760,.28,.04,'sine',.12);coins(false);if(navigator.vibrate)navigator.vibrate([40,35,70]);await wait(760)}
async function settleReward(reward){$('stageText').innerHTML='好运落定 ¥'+reward+'<small>你的惊喜来了</small>';playExplosionSound(reward);if(+reward===888){coins(true);confetti()}else if(+reward>=200)coins(true);else coins(false);await wait(+reward===888?1050:760)}
async function explodeChest(reward){await openChestSequence();await settleReward(reward)}
function openResult'''
s, n = old_explode.subn(new_explode, s, count=1)
assert n == 1, 'explodeChest replacement failed'

old_calls = "await runCardSequence(d.reward);await explodeChest(d.reward);openResult"
new_calls = "await openChestSequence();await runCardSequence(d.reward);await settleReward(d.reward);openResult"
s = s.replace(old_calls, new_calls)
assert s.count('await openChestSequence();await runCardSequence(d.reward);await settleReward(d.reward);openResult') >= 3

old_start = "let idx=lastCardIndex<0?0:(lastCardIndex+1)%8,cards=[...document.querySelectorAll('.prize')];$('stageText').innerHTML='好运启动…<small>今天的幸运正在靠近</small>';for(let i=0;i<10;i++){lightCard(idx,false,'fast');idx=(idx+1)%cards.length;await wait(62+i*3)}const d=await request;"
new_start = "$('stageText').innerHTML='宝箱轻轻震动…<small>好运正在唤醒</small>';await wait(420);$('stage').classList.add('unlocking');$('stageText').innerHTML='锁芯正在发光…<small>惊喜即将开启</small>';await wait(320);const d=await request;"
if old_start in s:
    s = s.replace(old_start, new_start, 1)
else:
    raise SystemExit('drawFromChest start block not found')

s = s.replace("lastCardIndex=(idx-1+cards.length)%cards.length;", "lastCardIndex=-1;", 1)
s = s.replace("$('stage').classList.remove('explode','opening');clearCards();updateStageText()", "$('stage').classList.remove('explode','opening','unlocking');clearCards();updateStageText()")
s = s.replace("$('stage').classList.remove('opening');clearCards();updateStageText()", "$('stage').classList.remove('opening','unlocking','explode');clearCards();updateStageText()")

p.write_text(s)
assert '/assets/royal-chest.webp?v=royal-v2' in s
assert 'class="crownIcon"' in s
assert '宝箱开启 · 金光释放' in s
assert '/* ROYAL_CHEST_V2 */' in s

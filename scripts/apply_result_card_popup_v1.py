from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
html = INDEX.read_text(encoding='utf-8')

css = r'''
/* RESULT_CARD_POPUP_V1 — the exact winning prize card becomes the hero result */
.resultModal.show{background:rgba(2,4,8,.88)!important;backdrop-filter:blur(12px)!important}
.resultCard.resultCardV2{
  --winAccent:#ffd45b;
  width:min(94vw,430px)!important;
  max-height:94vh!important;
  overflow:auto!important;
  overscroll-behavior:contain;
  padding:17px 15px 16px!important;
  border:1px solid #9f7730!important;
  border-radius:24px!important;
  background:
    radial-gradient(circle at 50% 23%,color-mix(in srgb,var(--winAccent) 16%,transparent),transparent 31%),
    linear-gradient(165deg,#17140d 0,#090c12 54%,#05070b 100%)!important;
  box-shadow:0 0 0 1px #ffe6a226 inset,0 0 50px color-mix(in srgb,var(--winAccent) 24%,transparent),0 28px 80px #000d!important;
  animation:resultPanelIn .35s cubic-bezier(.16,.9,.25,1.06) both!important;
}
.resultCard.resultCardV2:before{
  content:""!important;
  position:absolute!important;
  inset:-38%!important;
  pointer-events:none!important;
  background:repeating-conic-gradient(from 0deg,color-mix(in srgb,var(--winAccent) 13%,transparent) 0 5deg,transparent 5deg 15deg)!important;
  opacity:.44!important;
  animation:resultRaysRotate 18s linear infinite!important;
}
.resultCardV2 .closeX{
  z-index:20!important;right:10px!important;top:10px!important;
  width:34px!important;height:34px!important;
  border-color:#d8b45b66!important;background:#05070bcc!important;color:#ffe9ad!important;
  box-shadow:0 0 14px #000a!important;
}
.resultCardV2 .resultInner{position:relative!important;z-index:3!important}
.winCardStage{
  position:relative;
  min-height:325px;
  display:grid;
  place-items:center;
  margin:-3px 0 6px;
  isolation:isolate;
  overflow:visible;
}
.winCardStage:before{
  content:"";
  position:absolute;
  z-index:-3;
  width:390px;height:390px;
  border-radius:50%;
  background:repeating-conic-gradient(from -8deg,color-mix(in srgb,var(--winAccent) 23%,transparent) 0 3deg,transparent 3deg 13deg);
  opacity:.72;
  animation:winRays 12s linear infinite;
  mask-image:radial-gradient(circle,#000 0 25%,rgba(0,0,0,.86) 42%,transparent 72%);
  -webkit-mask-image:radial-gradient(circle,#000 0 25%,rgba(0,0,0,.86) 42%,transparent 72%);
}
.winCardStage:after{
  content:"";
  position:absolute;
  z-index:-2;
  width:300px;height:118px;
  bottom:9px;
  border-radius:50%;
  border:1px solid color-mix(in srgb,var(--winAccent) 55%,transparent);
  box-shadow:0 0 28px color-mix(in srgb,var(--winAccent) 43%,transparent),inset 0 0 25px color-mix(in srgb,var(--winAccent) 20%,transparent);
  transform:perspective(420px) rotateX(69deg);
  opacity:.9;
  animation:winPlatformPulse 1.55s ease-in-out infinite alternate;
}
.winCardHalo{
  position:absolute;
  z-index:-1;
  width:280px;height:280px;
  border-radius:50%;
  background:radial-gradient(circle,#fff8d8cc 0 2%,color-mix(in srgb,var(--winAccent) 58%,transparent) 15%,color-mix(in srgb,var(--winAccent) 22%,transparent) 39%,transparent 69%);
  filter:blur(4px);
  opacity:.82;
  animation:winHaloPulse 1.25s ease-in-out infinite alternate;
}
.winPrizeVisual{
  display:block;
  width:min(63vw,242px);
  aspect-ratio:3/4;
  object-fit:cover;
  border-radius:14px;
  transform-origin:50% 85%;
  filter:drop-shadow(0 18px 18px #000c) drop-shadow(0 0 17px var(--winAccent));
  animation:winCardPop .62s cubic-bezier(.16,1,.28,1.14) both,winCardFloat 2.4s ease-in-out .72s infinite alternate;
  will-change:transform,filter;
}
.winInfoPanel{
  position:relative;
  margin:0 1px 11px;
  padding:13px 13px 11px;
  border:1px solid color-mix(in srgb,var(--winAccent) 37%,#5d4823);
  border-radius:15px;
  background:linear-gradient(180deg,#17140ee8,#080b10f3);
  box-shadow:inset 0 1px 0 #fff5c51a,0 10px 25px #0006;
  animation:winInfoRise .48s .25s ease-out both;
}
.winCongrats{
  display:flex;align-items:center;justify-content:center;gap:7px;
  color:#f5e4bb;font-size:14px;font-weight:900;letter-spacing:.02em;
}
.winSpark{color:var(--winAccent);text-shadow:0 0 12px var(--winAccent);font-size:12px}
.winRewardLine{
  display:flex;align-items:baseline;justify-content:center;gap:8px;
  margin:6px 0 9px;
  color:#ffe39a;
}
.winRewardLine strong{
  font-size:30px;line-height:1;font-weight:1000;
  background:linear-gradient(#fffceb,#ffe391 56%,#d39423);
  -webkit-background-clip:text;color:transparent;
  text-shadow:0 0 18px color-mix(in srgb,var(--winAccent) 22%,transparent);
}
.winRewardLine span{font-size:15px;font-weight:950;color:#f3d995}
.winMeta{display:grid;gap:5px;padding-top:8px;border-top:1px solid #d3a84b28}
.winMetaRow{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;color:#9f9277}
.winMetaRow b{font-size:10px;color:#d9c9a5;font-weight:700;text-align:right;overflow-wrap:anywhere}
.resultCardV2 .againRow{display:grid!important;grid-template-columns:1fr 1fr;gap:9px!important;margin-top:0!important}
.resultCardV2 .again,.resultCardV2 .secondary{
  height:46px!important;border-radius:999px!important;font-size:14px!important;font-weight:1000!important;
}
.resultCardV2 .again{
  background:linear-gradient(90deg,#e6a91c,#fff09a 53%,#d89a16)!important;
  color:#302000!important;box-shadow:0 5px 18px #c98c1936!important;
}
.resultCardV2 .secondary{
  border:1px solid #80642e!important;background:linear-gradient(180deg,#171b22,#0d1117)!important;color:#e2d3af!important;
}
.resultCardV2.jackpotWin{--winAccent:#ffe07b!important;border-color:#ffe69b!important;box-shadow:0 0 0 1px #fff4c063 inset,0 0 78px #ffc12f70,0 28px 80px #000d!important}
@keyframes resultPanelIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@keyframes resultRaysRotate{to{transform:rotate(360deg)}}
@keyframes winRays{to{transform:rotate(360deg)}}
@keyframes winPlatformPulse{from{opacity:.55;scale:.92}to{opacity:1;scale:1.05}}
@keyframes winHaloPulse{from{scale:.88;opacity:.56}to{scale:1.08;opacity:.94}}
@keyframes winCardPop{
  0%{opacity:0;transform:translateY(115px) scale(.28) rotate(-8deg);filter:blur(5px) drop-shadow(0 0 0 transparent)}
  62%{opacity:1;transform:translateY(-13px) scale(1.06) rotate(2.6deg)}
  82%{transform:translateY(4px) scale(.98) rotate(-1deg)}
  100%{opacity:1;transform:translateY(0) scale(1) rotate(0);filter:drop-shadow(0 18px 18px #000c) drop-shadow(0 0 17px var(--winAccent))}
}
@keyframes winCardFloat{from{transform:translateY(0) rotate(-.45deg)}to{transform:translateY(-7px) rotate(.45deg)}}
@keyframes winInfoRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@media(min-width:600px){
  .resultCard.resultCardV2{width:min(92vw,455px)!important;padding:19px 18px 18px!important}
  .winCardStage{min-height:355px}.winPrizeVisual{width:258px}.winCardHalo{width:315px;height:315px}
  .winCongrats{font-size:15px}.winRewardLine strong{font-size:34px}.winRewardLine span{font-size:16px}
}
@media(max-height:680px){
  .resultCard.resultCardV2{max-height:96vh!important;padding-top:13px!important}
  .winCardStage{min-height:278px;margin-top:-8px}.winPrizeVisual{width:min(54vw,205px)}
  .winCardHalo{width:235px;height:235px}.winInfoPanel{padding:10px 11px 9px;margin-bottom:8px}
  .winRewardLine{margin:4px 0 7px}.winRewardLine strong{font-size:26px}
  .resultCardV2 .again,.resultCardV2 .secondary{height:42px!important}
}
'''

if '/* RESULT_CARD_POPUP_V1' not in html:
    if '</style>' not in html:
        raise SystemExit('Could not find </style> for result popup CSS injection')
    html = html.replace('</style>', css + '\n</style>', 1)

new_open_result = r'''function openResult(d,type='normal'){const n=names[d.reward]||['🎁','幸运奖励'],reward=+d.reward;if(type==='normal')updateCredits(Math.max(0,+d.remaining_credits||0));const normal=type==='normal',left=normal?session.credits:null,accent=({20:'#55d8f0',40:'#659cff',60:'#c785ff',100:'#ff795b',120:'#ffc653',160:'#a9f5ff',200:'#ffc34f',888:'#ffe47f'})[reward]||'#ffd45b',art='/assets/prizes/'+reward+'.png?v=final-hd-20260808';$('resultCard').className='resultCard resultCardV2'+(reward===888?' jackpotWin':'');$('resultCard').style.setProperty('--winAccent',accent);let metaRows=normal?'<div class="winMetaRow"><span>剩余次数</span><b>'+left+' 次</b></div><div class="winMetaRow"><span>流水号</span><b>'+esc(d.serial)+'</b></div>':'<div class="winMetaRow"><span>幸运码</span><b>'+esc(d.lucky_code||'')+'</b></div>'+(d.remaining_slots!=null?'<div class="winMetaRow"><span>剩余名额</span><b>'+d.remaining_slots+'</b></div>':'')+'<div class="winMetaRow"><span>流水号</span><b>'+esc(d.serial)+'</b></div>';const buttons=normal?'<div class="againRow"><button class="again" '+(left<=0?'disabled':'')+' onclick="drawAgain()">'+(left>0?'再抽一次':'次数已用完')+'</button><button class="secondary" onclick="closeResult()">返回奖池</button></div>':'<div class="againRow"><button class="again" onclick="closeResult()">收下好运</button><button class="secondary" onclick="closeResult()">返回奖池</button></div>';$('resultInner').innerHTML='<div class="winCardStage"><div class="winCardHalo"></div><img class="winPrizeVisual" src="'+art+'" alt="'+reward+'元 '+esc(n[1])+'"></div><div class="winInfoPanel"><div class="winCongrats"><span class="winSpark">✦</span><span>'+esc(d.display_name)+'，恭喜获得</span><span class="winSpark">✦</span></div><div class="winRewardLine"><strong>'+reward+'元</strong><span>'+esc(n[1])+(reward===888?' · 至尊隐藏大奖':'')+'</span></div><div class="winMeta">'+metaRows+'</div></div>'+buttons;$('resultModal').classList.add('show');document.body.style.overflow='hidden';playResultChime(reward)}function closeResult()'''

pattern = re.compile(r"function openResult\(d,type='normal'\)\{.*?\}function closeResult\(\)", re.S)
html, n = pattern.subn(new_open_result, html, count=1)
if n != 1:
    raise SystemExit(f'Could not replace openResult function; matches={n}')

INDEX.write_text(html, encoding='utf-8')
print('Applied RESULT_CARD_POPUP_V1 to index.html')

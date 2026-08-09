from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='/* RESULT_CARD_POPUP_V2 */'
if marker in s:
    print('V2 already applied')
    raise SystemExit(0)

css=r'''

/* RESULT_CARD_POPUP_V2 */
.resultModal{
  overflow:hidden!important;
  padding:8px!important;
}
.resultModal.show{
  align-items:center!important;
  justify-content:center!important;
  background:rgba(1,3,7,.91)!important;
  backdrop-filter:blur(16px) saturate(1.05)!important;
}
.resultCard.resultCardV2{
  --heroW:min(58vw,29dvh,236px);
  width:min(94vw,460px)!important;
  max-width:460px!important;
  max-height:calc(100dvh - 16px)!important;
  overflow:hidden!important;
  scrollbar-width:none!important;
  padding:13px 14px 14px!important;
  border:1px solid #c89a3e!important;
  border-radius:24px!important;
  background:
    radial-gradient(circle at 50% 24%,color-mix(in srgb,var(--winAccent) 22%,transparent),transparent 33%),
    radial-gradient(circle at 50% 8%,#f5c85c18,transparent 26%),
    linear-gradient(160deg,#17140d 0,#080b11 55%,#04060a 100%)!important;
  box-shadow:
    0 0 0 1px #fff0b62a inset,
    0 0 0 4px #5a3d101e inset,
    0 0 70px color-mix(in srgb,var(--winAccent) 31%,transparent),
    0 28px 90px #000e!important;
}
.resultCard.resultCardV2::-webkit-scrollbar{display:none!important}
.resultCard.resultCardV2:before{
  inset:-48%!important;
  background:
    repeating-conic-gradient(from -7deg,color-mix(in srgb,var(--winAccent) 22%,transparent) 0 3deg,transparent 3deg 12deg)!important;
  opacity:.66!important;
  mask-image:radial-gradient(circle at 50% 36%,#000 0 22%,rgba(0,0,0,.9) 42%,transparent 76%)!important;
  -webkit-mask-image:radial-gradient(circle at 50% 36%,#000 0 22%,rgba(0,0,0,.9) 42%,transparent 76%)!important;
  animation:resultRaysRotate 20s linear infinite!important;
}
.resultCard.resultCardV2:after{
  content:"";
  position:absolute;
  inset:5px;
  z-index:1;
  pointer-events:none;
  border:1px solid #f2ca6940;
  border-radius:19px;
  background:
    radial-gradient(circle at 0 0,#fff2b8 0 1px,#e0a52c 2px 4px,transparent 5px) top left/22px 22px no-repeat,
    radial-gradient(circle at 100% 0,#fff2b8 0 1px,#e0a52c 2px 4px,transparent 5px) top right/22px 22px no-repeat,
    radial-gradient(circle at 0 100%,#fff2b8 0 1px,#e0a52c 2px 4px,transparent 5px) bottom left/22px 22px no-repeat,
    radial-gradient(circle at 100% 100%,#fff2b8 0 1px,#e0a52c 2px 4px,transparent 5px) bottom right/22px 22px no-repeat;
  box-shadow:inset 0 0 28px #e4ad3d12;
}
.resultCardV2 .resultInner{z-index:4!important}
.resultCardV2 .closeX{
  z-index:30!important;
  width:36px!important;height:36px!important;
  top:9px!important;right:9px!important;
  border:1px solid #c89a4d80!important;
  color:#ffe8a5!important;
  background:radial-gradient(circle at 35% 30%,#292013,#080b10 72%)!important;
  box-shadow:0 0 18px #000a,0 0 18px #d69b2c25!important;
}
.winCardStage{
  min-height:0!important;
  height:auto!important;
  width:100%!important;
  padding:10px 0 11px!important;
  margin:0!important;
  overflow:visible!important;
  position:relative!important;
  display:grid!important;
  place-items:center!important;
}
.winCardStage:before{
  width:min(88vw,430px)!important;
  height:min(88vw,430px)!important;
  opacity:.9!important;
  background:repeating-conic-gradient(from -8deg,
    color-mix(in srgb,var(--winAccent) 35%,transparent) 0 2.3deg,
    transparent 2.3deg 9deg,
    color-mix(in srgb,#ffe99a 16%,transparent) 9deg 10.5deg,
    transparent 10.5deg 15deg)!important;
  mask-image:radial-gradient(circle,#000 0 18%,rgba(0,0,0,.95) 35%,rgba(0,0,0,.35) 60%,transparent 78%)!important;
  -webkit-mask-image:radial-gradient(circle,#000 0 18%,rgba(0,0,0,.95) 35%,rgba(0,0,0,.35) 60%,transparent 78%)!important;
  filter:blur(.25px)!important;
  animation:winRays 16s linear infinite!important;
}
.winCardStage:after{
  width:calc(var(--heroW) * 1.44)!important;
  height:calc(var(--heroW) * .52)!important;
  max-width:370px!important;
  bottom:1px!important;
  border:1px solid color-mix(in srgb,var(--winAccent) 70%,transparent)!important;
  box-shadow:
    0 0 18px color-mix(in srgb,var(--winAccent) 45%,transparent),
    0 0 42px color-mix(in srgb,var(--winAccent) 23%,transparent),
    inset 0 0 22px color-mix(in srgb,var(--winAccent) 22%,transparent)!important;
  opacity:1!important;
}
.winCardHalo{
  width:calc(var(--heroW) * 1.45)!important;
  height:calc(var(--heroW) * 1.45)!important;
  max-width:350px!important;max-height:350px!important;
  background:radial-gradient(circle,#fffef2 0 1.5%,#fff3b8d9 5%,color-mix(in srgb,var(--winAccent) 68%,transparent) 15%,color-mix(in srgb,var(--winAccent) 26%,transparent) 38%,transparent 70%)!important;
  filter:blur(3px)!important;
  opacity:.98!important;
  box-shadow:0 0 45px color-mix(in srgb,var(--winAccent) 28%,transparent)!important;
}
.winCardHalo:before,
.winCardHalo:after{
  content:"";
  position:absolute;
  inset:8%;
  border-radius:50%;
  pointer-events:none;
}
.winCardHalo:before{
  border:1px solid color-mix(in srgb,var(--winAccent) 74%,transparent);
  box-shadow:
    0 0 22px color-mix(in srgb,var(--winAccent) 45%,transparent),
    inset 0 0 20px color-mix(in srgb,var(--winAccent) 30%,transparent);
  transform:perspective(380px) rotateX(67deg) scale(1.32,.52);
  animation:winOrbit 3.8s linear infinite;
}
.winCardHalo:after{
  inset:-10%;
  background:
    radial-gradient(circle at 12% 22%,#fff7cc 0 1.2px,transparent 2px),
    radial-gradient(circle at 86% 18%,#fff5b5 0 1.4px,transparent 2.4px),
    radial-gradient(circle at 77% 72%,#ffd95e 0 1.3px,transparent 2.2px),
    radial-gradient(circle at 24% 78%,#fff8d0 0 1.2px,transparent 2.1px),
    radial-gradient(circle at 52% 4%,#fff6bb 0 1.2px,transparent 2px),
    radial-gradient(circle at 5% 54%,#ffc94c 0 1.3px,transparent 2.2px);
  filter:drop-shadow(0 0 6px #ffe178);
  animation:winSparkTwinkle 1.45s ease-in-out infinite alternate;
}
.winPrizeVisual{
  position:relative!important;
  z-index:6!important;
  width:var(--heroW)!important;
  height:auto!important;
  aspect-ratio:3/4!important;
  object-fit:contain!important;
  object-position:center!important;
  border-radius:13px!important;
  box-shadow:
    0 0 0 1px #fff2b84c,
    0 17px 28px #000c,
    0 0 24px color-mix(in srgb,var(--winAccent) 72%,transparent),
    0 0 48px color-mix(in srgb,var(--winAccent) 34%,transparent)!important;
  filter:saturate(1.08) contrast(1.03) brightness(1.04)!important;
  animation:winCardPop .64s cubic-bezier(.14,1,.2,1.08) both,winCardFloat 2.5s ease-in-out .75s infinite alternate!important;
}
.winInfoPanel{
  z-index:7!important;
  margin:1px 2px 9px!important;
  padding:10px 12px 9px!important;
  border:1px solid #a77d374f!important;
  border-radius:14px!important;
  background:linear-gradient(180deg,#15130eeb,#070a0ff2)!important;
  box-shadow:inset 0 1px 0 #fff4c21a,0 8px 20px #0006!important;
}
.winCongrats{font-size:13px!important}
.winRewardLine{margin:5px 0 7px!important;gap:7px!important}
.winRewardLine strong{font-size:clamp(27px,7vw,34px)!important}
.winRewardLine span{font-size:clamp(13px,3.5vw,16px)!important}
.winMeta{gap:4px!important;padding-top:7px!important}
.winMetaRow{font-size:10px!important}
.resultCardV2 .againRow{gap:9px!important}
.resultCardV2 .again,.resultCardV2 .secondary{height:44px!important;font-size:14px!important}
.resultCardV2 .again{
  background:linear-gradient(110deg,#bd7e0f,#ffe477 38%,#fff3ad 52%,#e5ae29 72%,#a56808)!important;
  box-shadow:inset 0 1px 0 #fff8ceaa,0 0 20px #e4aa2e38,0 7px 18px #0005!important;
}
.resultCardV2 .secondary{
  border-color:#9a763c!important;
  box-shadow:inset 0 1px 0 #fff2bc12,0 7px 16px #0005!important;
}
@keyframes winOrbit{to{transform:perspective(380px) rotateX(67deg) rotateZ(360deg) scale(1.32,.52)}}
@keyframes winSparkTwinkle{from{opacity:.42;transform:scale(.96) rotate(-2deg)}to{opacity:1;transform:scale(1.04) rotate(2deg)}}
@media(max-width:480px){
  .resultCard.resultCardV2{--heroW:min(59vw,27dvh,220px);width:min(96vw,430px)!important;padding:11px 12px 12px!important}
  .winInfoPanel{padding:9px 10px 8px!important;margin-bottom:8px!important}
  .winCongrats{font-size:12px!important}
  .winMetaRow,.winMetaRow b{font-size:9px!important}
  .resultCardV2 .again,.resultCardV2 .secondary{height:42px!important;font-size:13px!important}
}
@media(max-height:640px){
  .resultCard.resultCardV2{--heroW:min(50vw,25dvh,180px);padding:9px 10px 10px!important}
  .winCardStage{padding:5px 0 7px!important}
  .winInfoPanel{padding:7px 9px 7px!important;margin-bottom:6px!important}
  .winCongrats{font-size:11px!important}
  .winRewardLine{margin:3px 0 5px!important}
  .winRewardLine strong{font-size:24px!important}
  .winRewardLine span{font-size:12px!important}
  .winMeta{padding-top:5px!important;gap:3px!important}
  .resultCardV2 .again,.resultCardV2 .secondary{height:38px!important;font-size:12px!important}
}
'''

s=s.replace('</style>', css+'\n</style>', 1)
p.write_text(s,encoding='utf-8')
print('Applied result popup V2')

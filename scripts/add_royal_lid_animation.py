from pathlib import Path

p = Path('index.html')
s = p.read_text()

css = r'''
/* ROYAL_CHEST_LID_V3 */
.chest{background:none!important;perspective:520px!important;overflow:visible!important}
.chest:before,.chest:after{content:""!important;position:absolute!important;inset:0!important;left:0!important;top:0!important;width:100%!important;height:100%!important;translate:none!important;border-radius:0!important;background:url('/assets/royal-chest.webp?v=royal-v3') center/contain no-repeat!important;filter:none!important;opacity:1!important;mix-blend-mode:normal!important;pointer-events:none!important;will-change:transform,filter,opacity}
.chest:before{clip-path:polygon(0 0,100% 0,100% 56%,0 56%);transform-origin:50% 55%!important;z-index:5!important}
.chest:after{clip-path:polygon(0 52%,100% 52%,100% 100%,0 100%);transform-origin:50% 54%!important;z-index:2!important;animation:none!important}
.band{display:block!important;position:absolute!important;z-index:3!important;left:18%!important;right:18%!important;top:47%!important;width:auto!important;height:18%!important;border:0!important;border-radius:50%!important;background:radial-gradient(ellipse,#fffbd9 0,#ffe382db 20%,#ffc43b8f 42%,#ff9f1938 61%,transparent 76%)!important;box-shadow:0 0 22px #ffd3546b!important;filter:blur(5px)!important;opacity:.18!important;transform:scale(.72,.36)!important;transition:opacity .18s ease,transform .55s ease!important}
.stage.unlocking .band{opacity:.62!important;transform:scale(1,.54)!important}
.stage.explode .chest{animation:royalOpenHold .78s cubic-bezier(.16,.9,.2,1) forwards!important}
.stage.explode .chest:before{animation:royalLidOpen .88s cubic-bezier(.15,.82,.18,1) forwards!important;filter:drop-shadow(0 0 18px #ffd85c)!important}
.stage.explode .chest:after{animation:royalBaseSettle .72s cubic-bezier(.18,.8,.22,1) forwards!important;filter:drop-shadow(0 13px 13px #0009)!important}
.stage.explode .band{animation:royalSeamFlare .95s ease-out forwards!important}
.stage.explode .lock{animation:royalLockRelease .62s cubic-bezier(.2,.8,.2,1) forwards!important}
@keyframes royalLidOpen{0%{transform:translateY(0) scale(1);filter:brightness(1)}28%{transform:translateY(-5px) scale(1.025);filter:brightness(1.35)}56%{transform:translateY(-15px) scaleY(.91) perspective(520px) rotateX(-12deg);filter:brightness(1.55)}100%{transform:translateY(-30px) scaleY(.78) perspective(520px) rotateX(-30deg);filter:brightness(1.18)}}
@keyframes royalBaseSettle{0%{transform:translateY(0) scale(1)}42%{transform:translateY(5px) scale(1.035)}100%{transform:translateY(2px) scale(1.012)}}
@keyframes royalSeamFlare{0%{opacity:.25;transform:scale(.7,.28)}24%{opacity:1;transform:scale(1.35,1.15);filter:blur(4px)}60%{opacity:.92;transform:scale(1.85,2.4);filter:blur(8px)}100%{opacity:.18;transform:scale(2.2,3);filter:blur(12px)}}
@keyframes royalLockRelease{0%{transform:rotate(45deg) scale(1);opacity:1;filter:brightness(1)}36%{transform:rotate(45deg) scale(1.38);opacity:1;filter:brightness(1.8)}100%{transform:translateY(15px) rotate(78deg) scale(.72);opacity:0;filter:brightness(2)}}
@media(prefers-reduced-motion:reduce){.stage.explode .chest:before,.stage.explode .chest:after,.stage.explode .band,.stage.explode .lock{animation:none!important}}
'''

if '/* ROYAL_CHEST_LID_V3 */' not in s:
    s = s.replace('\n</style>', '\n' + css + '\n</style>', 1)

p.write_text(s)
assert '/* ROYAL_CHEST_LID_V3 */' in s

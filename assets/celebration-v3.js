/* RSJ_CELEBRATION_V3 — glyph-free SVG/CSS celebration runtime. */
(function(){
  if(window.__RSJ_CELEBRATION_V3__) return;
  window.__RSJ_CELEBRATION_V3__=true;

  (function loadVectorStyles(){
    if(document.querySelector('link[data-rsj-vector-hotfix]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/assets/celebration-v2-hotfix.css?v=20260809-v4';
    link.dataset.rsjVectorHotfix='1';
    document.head.appendChild(link);
  })();

  function ensureLayer(){
    let layer=document.getElementById('rsjCelebrationV2');
    if(layer) return layer;
    layer=document.createElement('div');
    layer.id='rsjCelebrationV2';
    layer.className='rsj-celebration-layer';
    document.body.appendChild(layer);
    return layer;
  }

  function iconSvg(reward){
    reward=Number(reward||0);
    if(reward===888)return '<svg class="rsj-result-svg" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="v3tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8c9"/><stop offset=".33" stop-color="#ffd85a"/><stop offset=".7" stop-color="#e89b18"/><stop offset="1" stop-color="#8e4b07"/></linearGradient></defs><path d="M37 18h46v17c0 24-8 40-23 46-15-6-23-22-23-46z" fill="url(#v3tg)" stroke="#fff0a0" stroke-width="3"/><path d="M38 28H20c0 20 8 31 25 34M82 28h18c0 20-8 31-25 34" fill="none" stroke="#f6be35" stroke-width="8" stroke-linecap="round"/><path d="M55 79h10v16H55zM42 95h36l8 10H34z" fill="url(#v3tg)" stroke="#b56a0b" stroke-width="2"/><path d="M60 29l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#fff7bd"/></svg>';
    if(reward>=200)return '<svg class="rsj-result-svg" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="v3cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff9c8"/><stop offset=".45" stop-color="#ffd553"/><stop offset="1" stop-color="#a85d08"/></linearGradient></defs><path d="M17 39l22 17 21-34 21 34 22-17-10 48H27z" fill="url(#v3cg)" stroke="#fff0a3" stroke-width="3"/><path d="M29 88h62l-4 13H33z" fill="url(#v3cg)" stroke="#a45b08" stroke-width="2"/><circle cx="39" cy="63" r="5" fill="#ff633d"/><circle cx="60" cy="51" r="6" fill="#4c86ff"/><circle cx="81" cy="63" r="5" fill="#ff633d"/></svg>';
    if(reward>=160)return '<svg class="rsj-result-svg" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="v3dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6ffff"/><stop offset=".45" stop-color="#85eaff"/><stop offset="1" stop-color="#2676d8"/></linearGradient></defs><path d="M25 37l16-17h38l16 17-35 60z" fill="url(#v3dg)" stroke="#d9fbff" stroke-width="3"/><path d="M25 37h70M41 20l19 77M79 20L60 97M41 20l19 17 19-17" fill="none" stroke="#ffffffa8" stroke-width="2"/></svg>';
    if(reward>=120)return '<svg class="rsj-result-svg" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="v3ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4a9"/><stop offset=".52" stop-color="#ffc93e"/><stop offset="1" stop-color="#d98608"/></linearGradient></defs><path d="M24 48c8-10 18-15 36-15s28 5 36 15l-7 29c-10 8-18 11-29 11s-19-3-29-11z" fill="url(#v3ig)" stroke="#fff0a1" stroke-width="3"/><ellipse cx="60" cy="48" rx="25" ry="10" fill="#fff5bd" opacity=".78"/><path d="M31 76c-9-3-14-10-13-20 9 1 15 5 19 12M89 76c9-3 14-10 13-20-9 1-15 5-19 12" fill="none" stroke="#e9a11b" stroke-width="7" stroke-linecap="round"/></svg>';
    if(reward>=100)return '<svg class="rsj-result-svg" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="v3ch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b84e22"/><stop offset="1" stop-color="#5f1d0c"/></linearGradient><linearGradient id="v3gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a3"/><stop offset="1" stop-color="#d48a0d"/></linearGradient></defs><path d="M23 48h74v43H23z" fill="url(#v3ch)" stroke="url(#v3gg)" stroke-width="5"/><path d="M28 50V39c0-16 13-25 32-25s32 9 32 25v11" fill="url(#v3ch)" stroke="url(#v3gg)" stroke-width="5"/><path d="M55 42h10v51H55z" fill="url(#v3gg)"/><rect x="49" y="57" width="22" height="21" rx="5" fill="url(#v3gg)" stroke="#8f5007" stroke-width="2"/></svg>';
    if(reward>=60)return '<svg class="rsj-result-svg" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="v3tk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6c7ff"/><stop offset="1" stop-color="#8052dc"/></linearGradient></defs><path d="M22 35h76v18c-8 2-8 12 0 14v18H22V67c8-2 8-12 0-14z" fill="url(#v3tk)" stroke="#f1ddff" stroke-width="3"/><path d="M60 39v42" stroke="#ffffff8c" stroke-width="2" stroke-dasharray="5 5"/><circle cx="42" cy="60" r="8" fill="#fff4c0"/></svg>';
    if(reward>=40)return '<svg class="rsj-result-svg" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="v3bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6bd4f"/><stop offset="1" stop-color="#9b4f0b"/></linearGradient></defs><path d="M45 27c8 6 22 6 30 0l9 13-9 8c13 8 20 19 20 34 0 17-14 25-35 25S25 99 25 82c0-15 7-26 20-34l-9-8z" fill="url(#v3bg)" stroke="#ffe9a2" stroke-width="3"/><path d="M43 48h34" stroke="#6f3407" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="76" r="15" fill="#ffd85c" stroke="#a65e08" stroke-width="3"/><path d="M60 65v22M52 70h16M52 80h16" stroke="#8f4d06" stroke-width="2.5"/></svg>';
    return '<svg class="rsj-result-svg" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="v3coin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6b5"/><stop offset=".5" stop-color="#ffd34b"/><stop offset="1" stop-color="#b56808"/></linearGradient></defs><circle cx="60" cy="60" r="39" fill="url(#v3coin)" stroke="#fff0a0" stroke-width="4"/><circle cx="60" cy="60" r="29" fill="none" stroke="#bd770d" stroke-width="3"/><path d="M60 38v44M48 47h24M48 60h24M48 73h24" stroke="#925108" stroke-width="4" stroke-linecap="round"/></svg>';
  }

  function crownSvg(){return '<svg class="rsj-crown-svg" viewBox="0 0 120 76" aria-hidden="true"><defs><linearGradient id="v3top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbd0"/><stop offset=".42" stop-color="#ffd75d"/><stop offset="1" stop-color="#a75a07"/></linearGradient></defs><path d="M12 25l25 18 23-36 23 36 25-18-11 38H23z" fill="url(#v3top)" stroke="#fff1a4" stroke-width="3"/><path d="M24 62h72l-4 10H28z" fill="url(#v3top)" stroke="#aa620a" stroke-width="2"/><circle cx="38" cy="48" r="5" fill="#f65e3d"/><circle cx="60" cy="36" r="6" fill="#4b82ff"/><circle cx="82" cy="48" r="5" fill="#f65e3d"/></svg>'}

  function vectorLegacyCoins(big=false){
    const layer=document.getElementById('particles');
    if(!layer)return;
    layer.innerHTML='';
    const total=big?54:24;
    for(let i=0;i<total;i++){
      const c=document.createElement('i');
      c.className='coin rsj-legacy-vector-coin '+(i%6===0?'rsj-legacy-star':'');
      const a=Math.random()*Math.PI*2,d=(big?210:125)+Math.random()*(big?290:150);
      c.style.setProperty('--x',Math.cos(a)*d+'px');
      c.style.setProperty('--y',Math.sin(a)*d+'px');
      c.style.setProperty('--r',(Math.random()*1000-500)+'deg');
      c.style.width=(i%6===0?10:18)+'px';
      c.style.height=(i%6===0?10:13)+'px';
      layer.appendChild(c);
    }
    setTimeout(()=>{if(layer)layer.innerHTML=''},1500);
  }
  if(typeof window.coins==='function')window.coins=vectorLegacyCoins;

  function clearCelebration(){
    const layer=ensureLayer();layer.classList.remove('show');layer.innerHTML='';
    document.body.classList.remove('rsj-screen-shake');
    document.getElementById('resultModal')?.classList.remove('celebration-v2');
    document.getElementById('resultCard')?.classList.remove('rsj-v2-win','rsj-v2-jackpot');
  }
  function makeRings(layer,reward){for(let i=0;i<(reward===888?3:reward>=200?2:1);i++){const r=document.createElement('i');r.className='rsj-ring r'+(i+1);layer.appendChild(r)}}
  function makeBurst(layer,reward){const total=reward===888?70:reward>=200?42:26,maxDist=reward===888?430:reward>=200?320:240;for(let i=0;i<total;i++){const p=document.createElement('i');p.className='rsj-burst-particle'+(i%4===0?' spark':'');const a=Math.random()*Math.PI*2,d=80+Math.random()*maxDist;p.style.setProperty('--x',(Math.cos(a)*d).toFixed(1)+'px');p.style.setProperty('--y',(Math.sin(a)*d*.78).toFixed(1)+'px');p.style.setProperty('--r',(Math.random()*1200-600).toFixed(0)+'deg');p.style.setProperty('--d',(0.9+Math.random()*.9).toFixed(2)+'s');p.style.setProperty('--delay',(Math.random()*.14).toFixed(2)+'s');layer.appendChild(p)}}
  function makeCoinRain(layer,reward){if(reward<120)return;const total=reward===888?56:reward>=200?28:16;for(let i=0;i<total;i++){const c=document.createElement('i');c.className='rsj-falling-coin '+(i%5===0?'rsj-star-shape':'rsj-coin-shape');c.style.setProperty('--left',(Math.random()*100).toFixed(2)+'vw');c.style.setProperty('--dur',(2.3+Math.random()*2.4).toFixed(2)+'s');c.style.setProperty('--delay',(Math.random()*(reward===888?1.5:.7)).toFixed(2)+'s');c.style.setProperty('--drift',(Math.random()*150-75).toFixed(0)+'px');c.style.setProperty('--rot',(Math.random()*1500-750).toFixed(0)+'deg');c.style.setProperty('--fs',(16+Math.random()*16).toFixed(0)+'px');layer.appendChild(c)}}
  function addGlints(layer,reward){for(let i=0;i<(reward===888?18:8);i++){const g=document.createElement('i');g.className='rsj-corner-glint';g.style.left=(8+Math.random()*84)+'vw';g.style.top=(8+Math.random()*76)+'vh';g.style.animationDelay=(Math.random()*.8)+'s';layer.appendChild(g)}}
  function runScreenImpact(reward){if(reward<120)return;document.body.classList.remove('rsj-screen-shake');void document.body.offsetWidth;document.body.classList.add('rsj-screen-shake');setTimeout(()=>document.body.classList.remove('rsj-screen-shake'),520);if(reward===888&&navigator.vibrate)navigator.vibrate([80,45,110,55,170])}
  function celebrate(reward){const layer=ensureLayer();layer.innerHTML='';makeRings(layer,reward);makeBurst(layer,reward);makeCoinRain(layer,reward);addGlints(layer,reward);layer.classList.add('show');runScreenImpact(reward);setTimeout(()=>{if(!document.getElementById('resultModal')?.classList.contains('show'))clearCelebration();else layer.classList.remove('show')},reward===888?5200:reward>=200?3600:2400)}
  function countMoney(reward){const el=document.querySelector('#resultInner .money');if(!el)return;const start=performance.now(),duration=reward===888?1050:780;function frame(now){const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,4);el.textContent='¥'+Math.max(0,Math.round(reward*eased));if(t<1)requestAnimationFrame(frame);else el.textContent='¥'+reward}requestAnimationFrame(frame)}
  function decorateResult(reward){
    reward=Number(reward||0);const modal=document.getElementById('resultModal'),card=document.getElementById('resultCard'),inner=document.getElementById('resultInner');if(!modal||!card||!inner)return;
    const icon=inner.querySelector('.resultIcon');if(icon){icon.innerHTML=iconSvg(reward);icon.classList.add('rsj-vector-result-icon')}
    const congrats=inner.querySelector('.congrats');if(congrats)congrats.textContent=congrats.textContent.replace(/^\s*\uD83C\uDF89\s*/,'');
    modal.classList.add('celebration-v2');card.classList.add('rsj-v2-win');
    if(reward===888){card.classList.add('rsj-v2-jackpot');if(!inner.querySelector('.rsj-jackpot-crown')){const crown=document.createElement('div');crown.className='rsj-jackpot-crown';crown.innerHTML=crownSvg();inner.prepend(crown)}}
    countMoney(reward);celebrate(reward);
  }
  if(typeof window.openResult==='function'){const original=window.openResult;window.openResult=function(d,type){const out=original.apply(this,arguments);decorateResult(Number(d&&d.reward||0));return out}}
  if(typeof window.settleReward==='function'){const original=window.settleReward;window.settleReward=async function(reward){const out=await original.apply(this,arguments);if(Number(reward)>=120)runScreenImpact(Number(reward));return out}}
  if(typeof window.closeResult==='function'){const original=window.closeResult;window.closeResult=function(){const out=original.apply(this,arguments);clearCelebration();return out}}
  window.addEventListener('pagehide',clearCelebration,{once:true});
})();

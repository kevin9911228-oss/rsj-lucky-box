/* RSJ_CELEBRATION_V2 — presentation wrapper only; existing draw/result logic remains authoritative. */
(function(){
  if(window.__RSJ_CELEBRATION_V2__) return;
  window.__RSJ_CELEBRATION_V2__=true;

  function ensureLayer(){
    let layer=document.getElementById('rsjCelebrationV2');
    if(layer) return layer;
    layer=document.createElement('div');
    layer.id='rsjCelebrationV2';
    layer.className='rsj-celebration-layer';
    document.body.appendChild(layer);
    return layer;
  }

  function clearCelebration(){
    const layer=ensureLayer();
    layer.classList.remove('show');
    layer.innerHTML='';
    document.body.classList.remove('rsj-screen-shake');
    const modal=document.getElementById('resultModal');
    const card=document.getElementById('resultCard');
    if(modal) modal.classList.remove('celebration-v2');
    if(card) card.classList.remove('rsj-v2-win','rsj-v2-jackpot');
  }

  function makeRings(layer,reward){
    const count=reward===888?3:reward>=200?2:1;
    for(let i=0;i<count;i++){
      const r=document.createElement('i');
      r.className='rsj-ring r'+(i+1);
      layer.appendChild(r);
    }
  }

  function makeBurst(layer,reward){
    const total=reward===888?76:reward>=200?46:28;
    const maxDist=reward===888?440:reward>=200?330:250;
    for(let i=0;i<total;i++){
      const p=document.createElement('i');
      p.className='rsj-burst-particle'+(i%4===0?' spark':'');
      const a=Math.random()*Math.PI*2;
      const d=(80+Math.random()*maxDist);
      p.style.setProperty('--x',(Math.cos(a)*d).toFixed(1)+'px');
      p.style.setProperty('--y',(Math.sin(a)*d*.78).toFixed(1)+'px');
      p.style.setProperty('--r',(Math.random()*1200-600).toFixed(0)+'deg');
      p.style.setProperty('--d',(0.9+Math.random()*.9).toFixed(2)+'s');
      p.style.setProperty('--delay',(Math.random()*.14).toFixed(2)+'s');
      p.style.setProperty('--s',(5+Math.random()*9).toFixed(0)+'px');
      p.style.setProperty('--w',(3+Math.random()*4).toFixed(0)+'px');
      p.style.setProperty('--h',(12+Math.random()*17).toFixed(0)+'px');
      layer.appendChild(p);
    }
  }

  function makeCoinRain(layer,reward){
    if(reward<120) return;
    const total=reward===888?62:reward>=200?30:18;
    for(let i=0;i<total;i++){
      const c=document.createElement('span');
      c.className='rsj-falling-coin';
      c.textContent=i%5===0?'✦':'🪙';
      c.style.setProperty('--left',(Math.random()*100).toFixed(2)+'vw');
      c.style.setProperty('--dur',(2.3+Math.random()*2.4).toFixed(2)+'s');
      c.style.setProperty('--delay',(Math.random()*(reward===888?1.5:.7)).toFixed(2)+'s');
      c.style.setProperty('--drift',(Math.random()*150-75).toFixed(0)+'px');
      c.style.setProperty('--rot',(Math.random()*1500-750).toFixed(0)+'deg');
      c.style.setProperty('--fs',(16+Math.random()*16).toFixed(0)+'px');
      layer.appendChild(c);
    }
  }

  function addGlints(layer,reward){
    const count=reward===888?18:8;
    for(let i=0;i<count;i++){
      const g=document.createElement('i');
      g.className='rsj-corner-glint';
      g.style.left=(8+Math.random()*84)+'vw';
      g.style.top=(8+Math.random()*76)+'vh';
      g.style.animationDelay=(Math.random()*.8)+'s';
      layer.appendChild(g);
    }
  }

  function runScreenImpact(reward){
    if(reward<120) return;
    document.body.classList.remove('rsj-screen-shake');
    void document.body.offsetWidth;
    document.body.classList.add('rsj-screen-shake');
    setTimeout(()=>document.body.classList.remove('rsj-screen-shake'),520);
    if(reward===888 && navigator.vibrate) navigator.vibrate([80,45,110,55,170]);
  }

  function celebrate(reward){
    reward=Number(reward||0);
    const layer=ensureLayer();
    layer.innerHTML='';
    makeRings(layer,reward);
    makeBurst(layer,reward);
    makeCoinRain(layer,reward);
    addGlints(layer,reward);
    layer.classList.add('show');
    runScreenImpact(reward);
    const hold=reward===888?5200:reward>=200?3600:2400;
    setTimeout(()=>{
      if(!document.getElementById('resultModal')?.classList.contains('show')) clearCelebration();
      else layer.classList.remove('show');
    },hold);
  }

  function countMoney(reward){
    const el=document.querySelector('#resultInner .money');
    if(!el) return;
    reward=Number(reward||0);
    const start=performance.now();
    const duration=reward===888?1050:780;
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-t,4);
      const value=Math.max(0,Math.round(reward*eased));
      el.textContent='¥'+value;
      if(t<1) requestAnimationFrame(frame); else el.textContent='¥'+reward;
    }
    requestAnimationFrame(frame);
  }

  function decorateResult(reward){
    reward=Number(reward||0);
    const modal=document.getElementById('resultModal');
    const card=document.getElementById('resultCard');
    const inner=document.getElementById('resultInner');
    if(!modal||!card||!inner) return;
    modal.classList.add('celebration-v2');
    card.classList.add('rsj-v2-win');
    if(reward===888){
      card.classList.add('rsj-v2-jackpot');
      if(!inner.querySelector('.rsj-jackpot-crown')){
        const crown=document.createElement('div');
        crown.className='rsj-jackpot-crown';
        inner.prepend(crown);
      }
    }
    countMoney(reward);
    celebrate(reward);
  }

  if(typeof window.openResult==='function'){
    const originalOpenResult=window.openResult;
    window.openResult=function(d,type){
      const out=originalOpenResult.apply(this,arguments);
      requestAnimationFrame(()=>decorateResult(Number(d&&d.reward||0)));
      return out;
    };
  }

  if(typeof window.settleReward==='function'){
    const originalSettleReward=window.settleReward;
    window.settleReward=async function(reward){
      const out=await originalSettleReward.apply(this,arguments);
      if(Number(reward)>=120) runScreenImpact(Number(reward));
      return out;
    };
  }

  if(typeof window.closeResult==='function'){
    const originalCloseResult=window.closeResult;
    window.closeResult=function(){
      const out=originalCloseResult.apply(this,arguments);
      clearCelebration();
      return out;
    };
  }

  window.addEventListener('pagehide',clearCelebration,{once:true});
})();

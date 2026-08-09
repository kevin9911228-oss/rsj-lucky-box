/* RSJ CHEST V25 — fixed ceremonial draw timing matched to the GIF. */
(function(){
  const VERSION='20260809-v25';
  const CLOSED='/assets/chest-effect-closed-v25.webp?v='+VERSION;
  const ANIM='/assets/chest-effect-opening-v25.gif?v='+VERSION;
  const OPEN='/assets/chest-effect-open-v25.webp?v='+VERSION;
  const ANIM_MS=7980; // 133 frames × 60ms: fixed 7.98s ceremony.

  try{
    const a=new Image(); a.src=ANIM;
    const c=new Image(); c.src=CLOSED;
    const o=new Image(); o.src=OPEN;
  }catch(e){}

  function waitLocal(ms){
    return (typeof wait==='function') ? wait(ms) : new Promise(r=>setTimeout(r,ms));
  }

  function useClosed(){
    const img=document.getElementById('chestVisual');
    if(!img)return;
    img.src=CLOSED;
  }

  window.resetChestVisual=useClosed;

  window.openChestSequence=async function(){
    const st=document.getElementById('stage');
    const img=document.getElementById('chestVisual');
    const txt=document.getElementById('stageText');
    if(!st||!img)return;

    st.classList.remove('opening','unlocking','explode','ceremony25');
    void st.offsetWidth;
    st.classList.add('ceremony25');

    // Restart from frame 1 on every draw, then let the GIF itself carry the whole ceremony.
    img.src=ANIM+'&run='+Date.now();

    if(txt)txt.innerHTML='皇家宝箱正在唤醒…<small>好运仪式正式开启</small>';
    const cues=[
      [1500,'金色能量正在汇聚…<small>幸运封印正在解除</small>'],
      [3350,'宝箱正在缓缓开启…<small>荣耀之光正在升起</small>'],
      [5550,'惊喜即将揭晓…<small>好运正在抵达</small>'],
      [7100,'荣耀之光绽放…<small>最终结果即将出现</small>']
    ];
    const timers=cues.map(([ms,html])=>setTimeout(()=>{if(txt&&st.classList.contains('ceremony25'))txt.innerHTML=html;},ms));

    try{
      if(typeof noiseBurst==='function')noiseBurst(.22,.035);
      if(typeof tone==='function'){
        tone(196,.18,.035,'sine');
        tone(294,.20,.032,'triangle',.12);
        tone(392,.24,.030,'triangle',.28);
        tone(587,.30,.026,'sine',.55);
      }
      if(navigator.vibrate)navigator.vibrate([24,30,46]);
    }catch(e){}

    await waitLocal(ANIM_MS);
    timers.forEach(clearTimeout);
    img.src=OPEN;
    st.classList.remove('ceremony25');
    st.classList.add('explode');
    if(txt)txt.innerHTML='皇家宝箱已经开启<small>好运正式揭晓</small>';
  };

  // V25 removes the old 6–10 second prize-grid roulette. The GIF is the draw ceremony;
  // the prize grid only performs one formal lock-on at the end.
  window.runCardSequence=async function(reward){
    const cards=[...document.querySelectorAll('.prize')];
    const target=cards.findIndex(x=>+x.dataset.reward===+reward);
    if(typeof clearCards==='function')clearCards();
    if(target>=0){
      if(typeof lightCard==='function')lightCard(target,true,'slow');
      else cards[target].classList.add('locked');
    }
    const txt=document.getElementById('stageText');
    if(txt)txt.innerHTML='好运已经锁定 ¥'+reward+'<small>你的惊喜来了</small>';
    await waitLocal(180);
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',useClosed,{once:true});
  else setTimeout(useClosed,0);
})();

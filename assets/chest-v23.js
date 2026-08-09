/* RSJ CHEST V23 — approved-mockup art player. One complete Animated WebP, no sliced layers. */
(function(){
  const CLOSED='/assets/chest-effect-closed-v23.webp?v=20260809-v23';
  const ANIM='/assets/chest-effect-opening-v23.webp?v=20260809-v23';
  const OPEN='/assets/chest-effect-open-v23.webp?v=20260809-v23';
  const ANIM_MS=2960;

  try{
    const a=new Image(); a.src=ANIM;
    const c=new Image(); c.src=CLOSED;
    const o=new Image(); o.src=OPEN;
  }catch(e){}

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

    st.classList.remove('opening','unlocking','explode');
    void st.offsetWidth;
    st.classList.add('explode');
    if(txt)txt.innerHTML='宝箱正在开启…<small>惊喜金光正在释放</small>';

    // Unique cache-buster restarts the full Animated WebP from frame 1 on every draw.
    img.src=ANIM+'&run='+Date.now();

    try{
      if(typeof noiseBurst==='function')noiseBurst(.14,.03);
      if(typeof tone==='function'){
        tone(392,.14,.03,'triangle');
        tone(659,.22,.028,'sine',.12);
      }
      if(navigator.vibrate)navigator.vibrate([26,22,48]);
    }catch(e){}

    if(typeof wait==='function')await wait(ANIM_MS);
    else await new Promise(r=>setTimeout(r,ANIM_MS));

    img.src=OPEN;
    if(txt)txt.innerHTML='宝箱已经开启<small>好运正在揭晓</small>';
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',useClosed,{once:true});
  }else{
    setTimeout(useClosed,0);
  }
})();

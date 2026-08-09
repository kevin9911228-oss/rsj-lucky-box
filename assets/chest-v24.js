/* RSJ CHEST V24 — real GIF playback. The browser displays one complete animation file. */
(function(){
  const CLOSED='/assets/chest-effect-closed-v24.webp?v=20260809-v24';
  const ANIM='/assets/chest-effect-opening-v24.gif?v=20260809-v24';
  const OPEN='/assets/chest-effect-open-v24.webp?v=20260809-v24';
  const ANIM_MS=3240;

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
    if(txt)txt.innerHTML='宝箱正在缓缓开启…<small>完整开箱动画播放中</small>';

    // Cache buster guarantees the GIF restarts from frame one every draw.
    img.src=ANIM+'&run='+Date.now();

    try{
      if(typeof noiseBurst==='function')noiseBurst(.16,.035);
      if(typeof tone==='function'){
        tone(392,.15,.03,'triangle');
        tone(659,.24,.028,'sine',.14);
      }
      if(navigator.vibrate)navigator.vibrate([28,24,54]);
    }catch(e){}

    if(typeof wait==='function')await wait(ANIM_MS);
    else await new Promise(r=>setTimeout(r,ANIM_MS));

    img.src=OPEN;
    if(txt)txt.innerHTML='宝箱已经开启<small>好运正在揭晓</small>';
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',useClosed,{once:true});
  else setTimeout(useClosed,0);
})();

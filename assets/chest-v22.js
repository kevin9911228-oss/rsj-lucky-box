/* RSJ CHEST V22 — override the old sliced animations with one complete Animated WebP. */
(function(){
  const CLOSED='/assets/chest-user-closed-v13.webp?v=20260809-v22';
  const ANIM='/assets/chest-opening-v22.webp?v=20260809-v22';
  const OPEN='/assets/chest-user-open-v13.webp?v=20260809-v22';
  const ANIM_MS=2440;

  try{ const p=new Image(); p.src=ANIM; }catch(e){}

  window.resetChestVisual=function(){
    const img=document.getElementById('chestVisual');
    if(!img)return;
    img.src=CLOSED;
  };

  window.openChestSequence=async function(){
    const st=document.getElementById('stage');
    const img=document.getElementById('chestVisual');
    if(!st||!img)return;

    st.classList.remove('opening','unlocking','explode');
    void st.offsetWidth;
    st.classList.add('explode');

    const txt=document.getElementById('stageText');
    if(txt)txt.innerHTML='宝箱正在缓缓开启…<small>完整开箱动画播放中</small>';

    // A unique query guarantees the Animated WebP restarts from frame 1 every draw.
    img.src=ANIM+'&run='+Date.now();

    try{
      if(typeof noiseBurst==='function')noiseBurst(.16,.035);
      if(typeof tone==='function'){
        tone(420,.14,.035,'triangle');
        tone(720,.22,.03,'sine',.10);
      }
      if(navigator.vibrate)navigator.vibrate([30,25,55]);
    }catch(e){}

    if(typeof wait==='function')await wait(ANIM_MS);
    else await new Promise(r=>setTimeout(r,ANIM_MS));

    img.src=OPEN;
    if(txt)txt.innerHTML='宝箱已经开启<small>好运正在揭晓</small>';
  };
})();

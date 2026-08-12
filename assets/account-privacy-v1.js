(()=>{
  'use strict';
  const MASK='•••••••••••';
  let applying=false;

  function getCode(text){
    const m=String(text||'').match(/账号\s*[:：]\s*([^\s]+)/);
    return m?m[1].trim():'';
  }

  function applyPrivacy(){
    if(applying) return;
    const el=document.querySelector('.profileCode');
    if(!el) return;
    if(el.querySelector('[data-rsj-account-private="1"]')) return;

    const raw=getCode(el.textContent);
    if(!raw || /^[•*]+$/.test(raw)) return;

    applying=true;
    try{
      el.textContent='';
      el.style.display='flex';
      el.style.alignItems='center';
      el.style.gap='6px';
      el.style.flexWrap='wrap';

      const label=document.createElement('span');
      label.textContent='账号：';

      const value=document.createElement('span');
      value.setAttribute('data-rsj-account-private','1');
      value.textContent=MASK;
      value.style.letterSpacing='1px';

      const toggle=document.createElement('button');
      toggle.type='button';
      toggle.setAttribute('aria-label','显示账号');
      toggle.title='显示账号';
      toggle.textContent='👁';
      Object.assign(toggle.style,{
        width:'24px',height:'24px',padding:'0',margin:'0',border:'0',
        borderRadius:'999px',background:'transparent',color:'#d8c392',
        fontSize:'14px',lineHeight:'24px',cursor:'pointer',display:'inline-grid',placeItems:'center'
      });

      let visible=false;
      toggle.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        visible=!visible;
        value.textContent=visible?raw:MASK;
        toggle.textContent=visible?'🙈':'👁';
        toggle.setAttribute('aria-label',visible?'隐藏账号':'显示账号');
        toggle.title=visible?'隐藏账号':'显示账号';
      });

      el.append(label,value,toggle);
    }finally{
      applying=false;
    }
  }

  function start(){
    applyPrivacy();
    const target=document.body||document.documentElement;
    if(!target) return;
    const mo=new MutationObserver(()=>{
      if(applying) return;
      requestAnimationFrame(applyPrivacy);
    });
    mo.observe(target,{subtree:true,childList:true,characterData:true});
    setInterval(applyPrivacy,1500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

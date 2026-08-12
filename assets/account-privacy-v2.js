(()=>{
  'use strict';
  const MASK='•••••••••••';
  let rawCode='';
  let visible=false;
  let rendering=false;

  function extractCode(text){
    const m=String(text||'').match(/账号\s*[:：]\s*([^\s]+)/);
    return m ? m[1].trim() : '';
  }

  function render(el,code,show=false){
    if(!el || !code) return;
    rendering=true;
    rawCode=code;
    visible=!!show;
    try{
      el.replaceChildren();
      el.style.display='flex';
      el.style.alignItems='center';
      el.style.gap='6px';
      el.style.flexWrap='wrap';

      const label=document.createElement('span');
      label.textContent='账号：';

      const value=document.createElement('span');
      value.dataset.rsjAccountValue='1';
      value.textContent=visible ? rawCode : MASK;
      value.style.letterSpacing='1px';

      const toggle=document.createElement('button');
      toggle.type='button';
      toggle.dataset.rsjAccountToggle='1';
      toggle.textContent=visible ? '🙈' : '👁';
      toggle.setAttribute('aria-label',visible ? '隐藏账号' : '显示账号');
      toggle.title=visible ? '隐藏账号' : '显示账号';
      Object.assign(toggle.style,{
        width:'24px',height:'24px',padding:'0',margin:'0',border:'0',
        borderRadius:'999px',background:'transparent',color:'#d8c392',
        fontSize:'14px',lineHeight:'24px',cursor:'pointer',display:'inline-grid',placeItems:'center'
      });
      toggle.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        const next=!visible;
        render(el,rawCode,next);
      });

      el.append(label,value,toggle);
    }finally{
      rendering=false;
    }
  }

  function enforce(){
    if(rendering) return;
    const el=document.getElementById('profileCode');
    if(!el) return;

    const value=el.querySelector('[data-rsj-account-value="1"]');
    if(value){
      // 正常隐私结构存在时，不主动打断用户手动“显示”状态。
      return;
    }

    // 主页面 renderSession() 每次都会把完整账号重新写回 #profileCode。
    // 一旦检测到原始文本重新出现，立即重新进入默认隐藏状态。
    const code=extractCode(el.textContent);
    if(code && code!=='--' && !/^[•*]+$/.test(code)) render(el,code,false);
  }

  function start(){
    enforce();
    const el=document.getElementById('profileCode');
    if(el){
      new MutationObserver(()=>{
        if(!rendering) queueMicrotask(enforce);
      }).observe(el,{childList:true,characterData:true,subtree:true});
    }
    // 兼容个人中心延迟恢复登录状态或页面脚本重新渲染。
    setInterval(enforce,250);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

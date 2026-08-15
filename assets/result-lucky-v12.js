/* RESULT LUCKY V12 — lucky box wording + hide code value + result serial guard */
(()=>{
  'use strict';
  if(window.__RSJ_RESULT_LUCKY_V12__) return;
  window.__RSJ_RESULT_LUCKY_V12__=true;

  const id=x=>document.getElementById(x);

  function patchLuckyPanel(){
    const tab=id('tabLucky');
    if(tab && !tab.dataset.rsjLuckyV12){
      tab.dataset.rsjLuckyV12='1';
      tab.innerHTML='<i>🎁</i>幸运礼盒';
    }
    const panel=id('luckyPanel');
    if(!panel) return;
    const title=panel.querySelector('.title');
    if(title && title.textContent.trim()!=='🎁 幸运礼盒') title.textContent='🎁 幸运礼盒';
    const hint=panel.querySelector('.hint');
    if(hint && hint.textContent.includes('幸运码')) hint.textContent='礼盒码不消耗普通盲盒次数，登录后输入礼盒码即可开启。';
    const input=id('luckyCode');
    if(input && input.placeholder!=='输入礼盒码') input.placeholder='输入礼盒码';
    const btn=id('tempDrawBtn');
    if(btn && !btn.disabled && btn.textContent!=='开启幸运礼盒') btn.textContent='开启幸运礼盒';
    const guest=panel.querySelector('#luckyGuest button');
    if(guest && guest.textContent!=='登录后开启幸运礼盒') guest.textContent='登录后开启幸运礼盒';
  }

  function patchResult(type){
    const card=id('resultCard');
    if(!card) return;
    const rows=[...card.querySelectorAll('.winMetaRow')];
    const luckyRow=rows.find(row=>row.querySelector('span')?.textContent.trim()==='幸运码');
    const isLucky=type==='temp' || !!luckyRow || card.classList.contains('rsjLuckyResult');
    card.classList.toggle('rsjLuckyResult',isLucky);

    if(isLucky){
      const row=luckyRow || rows.find(r=>r.classList.contains('rsjLuckyGiftRow')) || rows[0];
      if(row){
        row.classList.add('rsjLuckyGiftRow');
        const label=row.querySelector('span');
        const value=row.querySelector('b');
        if(label) label.textContent='幸运礼盒';
        if(value){
          value.textContent='';
          value.setAttribute('aria-hidden','true');
          value.style.display='none';
        }
      }
    }

    rows.forEach(row=>{
      const label=row.querySelector('span');
      if(label?.textContent.trim()==='流水号') row.classList.add('rsjSerialRow');
    });
  }

  function patchHistory(){
    document.querySelectorAll('#historyList .record .type.tempType').forEach(node=>{
      if(node.textContent!=='幸运礼盒') node.textContent='幸运礼盒';
    });
  }

  function patchNotice(){
    if(typeof window.showNotice!=='function' || window.showNotice.__rsjLuckyV12) return;
    const base=window.showNotice;
    const wrapped=function(message,title,icon){
      let m=String(message??'');
      let t=String(title??'');
      m=m.replace(/请输入幸运码后再开启专享惊喜。?/g,'请输入礼盒码后再开启幸运礼盒。')
         .replace(/幸运码暂时无法使用/g,'礼盒码暂时无法使用');
      t=t.replace(/幸运码提示/g,'幸运礼盒提示').replace(/^幸运码$/,'幸运礼盒');
      return base.call(this,m,t,icon);
    };
    wrapped.__rsjLuckyV12=true;
    window.showNotice=wrapped;
  }

  function patchOpenLogin(){
    if(typeof window.openLoginModal!=='function' || window.openLoginModal.__rsjLuckyV12) return;
    const base=window.openLoginModal;
    const wrapped=function(ret='home',message=''){
      if(ret==='lucky' && !message) message='登录后开启幸运礼盒';
      message=String(message||'').replace(/幸运码/g,'幸运礼盒');
      return base.call(this,ret,message);
    };
    wrapped.__rsjLuckyV12=true;
    window.openLoginModal=wrapped;
  }

  function patchOpenResult(){
    if(typeof window.openResult!=='function' || window.openResult.__rsjLuckyV12) return;
    const base=window.openResult;
    const wrapped=function(d,type='normal'){
      const out=base.apply(this,arguments);
      patchResult(type);
      patchLuckyPanel();
      return out;
    };
    wrapped.__rsjLuckyV12=true;
    window.openResult=wrapped;
  }

  function patchLoadHistory(){
    if(typeof window.loadHistory!=='function' || window.loadHistory.__rsjLuckyV12) return;
    const base=window.loadHistory;
    const wrapped=async function(){
      const out=await base.apply(this,arguments);
      patchHistory();
      return out;
    };
    wrapped.__rsjLuckyV12=true;
    window.loadHistory=wrapped;
  }

  function observe(){
    const modal=id('resultModal');
    if(modal){
      const mo=new MutationObserver(()=>{
        const rows=[...modal.querySelectorAll('.winMetaRow')];
        if(rows.some(r=>r.querySelector('span')?.textContent.trim()==='幸运码')) patchResult('temp');
        else if(rows.length) patchResult(modal.querySelector('.rsjLuckyGiftRow')?'temp':'normal');
      });
      mo.observe(modal,{subtree:true,childList:true,characterData:true});
    }
    const history=id('historyList');
    if(history){
      const hm=new MutationObserver(patchHistory);
      hm.observe(history,{subtree:true,childList:true,characterData:true});
    }
  }

  function init(){
    patchLuckyPanel();
    patchNotice();
    patchOpenLogin();
    patchOpenResult();
    patchLoadHistory();
    patchHistory();
    observe();
    setInterval(()=>{
      patchLuckyPanel();
      patchNotice();
      patchOpenLogin();
      patchOpenResult();
      patchLoadHistory();
      patchHistory();
    },1200);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

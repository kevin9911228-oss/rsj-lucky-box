/* RESULT LUCKY V12.2 — restore 幸运码 UI, hide code value in public result/history */
(()=>{
  'use strict';
  if(window.__RSJ_RESULT_LUCKY_V12__) return;
  window.__RSJ_RESULT_LUCKY_V12__=true;

  const id=x=>document.getElementById(x);

  function patchLuckyPanel(){
    const tab=id('tabLucky');
    if(tab){
      tab.dataset.rsjLuckyV12='1';
      tab.innerHTML='<i>🎟️</i>幸运码';
    }
    const panel=id('luckyPanel');
    if(!panel) return;
    const title=panel.querySelector('.title');
    if(title && title.textContent.trim()!=='🎟️ 幸运码专享') title.textContent='🎟️ 幸运码专享';
    const hint=panel.querySelector('.hint');
    if(hint) hint.textContent='幸运码不消耗普通盲盒次数，登录后输入幸运码即可参与。';
    const input=id('luckyCode');
    if(input) input.placeholder='输入幸运码，例如 RSJ888';
    const btn=id('tempDrawBtn');
    if(btn && !btn.disabled) btn.textContent='使用幸运码抽奖';
    const guest=panel.querySelector('#luckyGuest button');
    if(guest) guest.textContent='登录后使用幸运码';
  }

  function patchResult(type){
    const card=id('resultCard');
    if(!card) return;
    const rows=[...card.querySelectorAll('.winMetaRow')];
    const originalLuckyRow=rows.find(row=>row.querySelector('span')?.textContent.trim()==='幸运码');
    const patchedLuckyRow=rows.find(row=>row.classList.contains('rsjLuckyGiftRow'));
    const isLucky=type==='temp' || !!originalLuckyRow || !!patchedLuckyRow || card.classList.contains('rsjLuckyResult');
    card.classList.toggle('rsjLuckyResult',isLucky);

    if(isLucky){
      const row=originalLuckyRow || patchedLuckyRow || rows[0];
      if(row){
        row.classList.add('rsjLuckyGiftRow');
        const label=row.querySelector('span');
        const value=row.querySelector('b');
        if(label && label.textContent!=='🎫 幸运码 · 恭喜获得') label.textContent='🎫 幸运码 · 恭喜获得';
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
      if(node.textContent!=='幸运码') node.textContent='幸运码';
    });
  }

  function patchOpenLogin(){
    if(typeof window.openLoginModal!=='function' || window.openLoginModal.__rsjLuckyV12) return;
    const base=window.openLoginModal;
    const wrapped=function(ret='home',message=''){
      if(ret==='lucky' && !message) message='登录后使用幸运码专享';
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
        else if(rows.some(r=>r.classList.contains('rsjLuckyGiftRow'))) patchResult('temp');
        else if(rows.length) patchResult('normal');
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
    patchOpenLogin();
    patchOpenResult();
    patchLoadHistory();
    patchHistory();
    observe();
    setInterval(()=>{
      patchLuckyPanel();
      patchOpenLogin();
      patchOpenResult();
      patchLoadHistory();
      patchHistory();
    },1200);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

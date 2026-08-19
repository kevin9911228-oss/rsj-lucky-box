/* GIFT ADMIN PERFORMANCE V1 — prioritize gift-code list and avoid duplicate legacy loads */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_ADMIN_PERF_V1__) return;
  window.__RSJ_GIFT_ADMIN_PERF_V1__=true;

  const $id=id=>document.getElementById(id);

  function install(){
    if(typeof window.tab!=='function'||typeof window.loadGiftCodesV5!=='function'){
      setTimeout(install,120);return;
    }
    if(window.tab.__giftPerfV1Patched) return;

    const baseTab=window.tab;
    const fastTab=function(name,node){
      if(name==='giftcodes'){
        try{current='giftcodes'}catch{}
        document.querySelectorAll('.page').forEach(x=>x.classList.add('hide'));
        $id('giftcodes')?.classList.remove('hide');
        document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
        node?.classList.add('active');
        // Only load the campaign list here. Heavy history is user-triggered.
        Promise.resolve(window.loadGiftCodesV5()).catch(()=>{});
        return;
      }
      return baseTab.apply(this,arguments);
    };
    fastTab.__giftPerfV1Patched=true;
    window.tab=fastTab;

    if(typeof window.refreshCurrent==='function'){
      const baseRefresh=window.refreshCurrent;
      const fastRefresh=async function(){
        try{
          if(current==='giftcodes'){
            await window.loadGiftCodesV5();
            return;
          }
        }catch{}
        return baseRefresh.apply(this,arguments);
      };
      fastRefresh.__giftPerfV1Patched=true;
      window.refreshCurrent=fastRefresh;
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(install,500),{once:true});
  else setTimeout(install,500);
})();

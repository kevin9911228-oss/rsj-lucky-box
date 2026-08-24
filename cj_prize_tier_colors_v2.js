/* cj-prize-tier-colors-v4-stable */
(()=>{
  if(location.pathname.startsWith('/admin')) return;

  const TIER={
    '88现金':'normal','188现金':'normal','588现金':'big','888现金':'luxury',
    '金条5克':'super','电视机':'super','冰箱':'super','空调':'super'
  };
  const COLORS={
    normal:{name:'#FFD45A',serial:'#D8A63E',shadow:'0 0 7px rgba(255,212,90,.34)'},
    big:{name:'#FF8A1F',serial:'#E56A17',shadow:'0 0 10px rgba(255,138,31,.70)'},
    luxury:{name:'#D98CFF',serial:'#B96FE3',shadow:'0 0 12px rgba(217,140,255,.82)'},
    super:{name:'#DDF7FF',serial:'#88D9FF',shadow:'0 0 12px rgba(109,219,255,.90)'}
  };
  const all=['cjtxt-normal','cjtxt-big','cjtxt-luxury','cjtxt-super'];

  function apply(row){
    const nameEl=row.querySelector('.cjpc-prize');
    if(!nameEl) return;
    const tier=TIER[nameEl.textContent.trim()]||'normal';
    const c=COLORS[tier];
    const meta=row.querySelector('.cjpc-meta');

    nameEl.classList.remove(...all);
    nameEl.classList.add('cjtxt-'+tier);
    nameEl.style.setProperty('color',c.name,'important');
    nameEl.style.setProperty('text-shadow',c.shadow,'important');

    if(meta){
      meta.classList.remove(...all);
      meta.classList.add('cjtxt-'+tier);
      meta.style.setProperty('color',c.serial,'important');
      meta.style.setProperty('text-shadow','none','important');
    }
  }

  function patch(){
    document.querySelectorAll('#cjpcRecords .cjpc-record').forEach(apply);
  }

  function start(){
    const stable=document.getElementById('profilePage')||document.body;
    let scheduled=false;
    const schedule=()=>{
      if(scheduled) return;
      scheduled=true;
      requestAnimationFrame(()=>{scheduled=false;patch();});
    };
    new MutationObserver(schedule).observe(stable,{childList:true,subtree:true});
    patch();
    document.querySelectorAll('.nav button[data-p="profile"]').forEach(btn=>btn.addEventListener('click',()=>{
      setTimeout(patch,80);
      setTimeout(patch,350);
      setTimeout(patch,900);
    }));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
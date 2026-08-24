/* cj-prize-tier-colors-v2 */
(()=>{
  if(location.pathname.startsWith('/admin')) return;

  const TIER={
    '88现金':'normal',
    '188现金':'normal',
    '588现金':'big',
    '888现金':'luxury',
    '金条5克':'super',
    '电视机':'super',
    '冰箱':'super',
    '空调':'super'
  };

  const COLORS={
    normal:{name:'#F5D58F',serial:'#B9914F',shadow:'0 0 5px rgba(214,163,72,.18)'},
    big:{name:'#FFB438',serial:'#D98C2D',shadow:'0 0 9px rgba(255,166,35,.55)'},
    luxury:{name:'#F0C1FF',serial:'#C68DDE',shadow:'0 0 10px rgba(211,111,255,.72),0 0 5px rgba(255,211,78,.25)'},
    super:{name:'#FFF6CF',serial:'#EBD58F',shadow:'0 0 11px rgba(255,222,105,.72)'}
  };

  const style=document.createElement('style');
  style.textContent=`
    #cjpcRecords .cjpc-record .cjpc-prize.cjtxt-normal{color:#F5D58F!important;text-shadow:0 0 5px rgba(214,163,72,.18)!important}
    #cjpcRecords .cjpc-record .cjpc-meta.cjtxt-normal{color:#B9914F!important}

    #cjpcRecords .cjpc-record .cjpc-prize.cjtxt-big{color:#FFB438!important;text-shadow:0 0 9px rgba(255,166,35,.55)!important}
    #cjpcRecords .cjpc-record .cjpc-meta.cjtxt-big{color:#D98C2D!important}

    #cjpcRecords .cjpc-record .cjpc-prize.cjtxt-luxury{color:#F0C1FF!important;text-shadow:0 0 10px rgba(211,111,255,.72),0 0 5px rgba(255,211,78,.25)!important}
    #cjpcRecords .cjpc-record .cjpc-meta.cjtxt-luxury{color:#C68DDE!important}

    #cjpcRecords .cjpc-record .cjpc-prize.cjtxt-super{color:#FFF6CF!important;text-shadow:0 0 11px rgba(255,222,105,.72)!important}
    #cjpcRecords .cjpc-record .cjpc-meta.cjtxt-super{color:#EBD58F!important}
  `;
  document.head.appendChild(style);

  const all=['cjtxt-normal','cjtxt-big','cjtxt-luxury','cjtxt-super'];

  function applyTextColor(row){
    const nameEl=row.querySelector('.cjpc-prize');
    if(!nameEl) return;
    const tier=TIER[nameEl.textContent.trim()]||'normal';
    const meta=row.querySelector('.cjpc-meta');
    const c=COLORS[tier];

    nameEl.classList.remove(...all);
    nameEl.classList.add('cjtxt-'+tier);
    nameEl.style.setProperty('color',c.name,'important');
    nameEl.style.setProperty('text-shadow',c.shadow,'important');

    if(meta){
      meta.classList.remove(...all);
      meta.classList.add('cjtxt-'+tier);
      meta.style.setProperty('color',c.serial,'important');
    }
  }

  function patch(){
    document.querySelectorAll('#cjpcRecords .cjpc-record').forEach(applyTextColor);
  }

  function watch(){
    const host=document.getElementById('cjpcRecords');
    if(!host) return setTimeout(watch,120);
    new MutationObserver(()=>setTimeout(patch,0)).observe(host,{childList:true,subtree:true,characterData:true});
    patch();
    setTimeout(patch,300);
    setTimeout(patch,900);
  }

  watch();
  document.querySelectorAll('.nav button[data-p="profile"]').forEach(b=>b.addEventListener('click',()=>{
    setTimeout(patch,80);
    setTimeout(patch,500);
  }));
})();
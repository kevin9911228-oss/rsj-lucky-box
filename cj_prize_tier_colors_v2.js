/* cj-prize-tier-colors-v3-strong */
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
    normal:{name:'#FFD45A',serial:'#D8A63E',shadow:'0 0 7px rgba(255,212,90,.34)'},
    big:{name:'#FF8A1F',serial:'#E56A17',shadow:'0 0 10px rgba(255,138,31,.70)'},
    luxury:{name:'#D98CFF',serial:'#B96FE3',shadow:'0 0 12px rgba(217,140,255,.82)'},
    super:{name:'#DDF7FF',serial:'#88D9FF',shadow:'0 0 12px rgba(109,219,255,.90)'}
  };

  const style=document.createElement('style');
  style.textContent=`
    #cjpcRecords .cjpc-record .cjpc-prize.cjtxt-normal{color:#FFD45A!important;text-shadow:0 0 7px rgba(255,212,90,.34)!important}
    #cjpcRecords .cjpc-record .cjpc-meta.cjtxt-normal{color:#D8A63E!important}

    #cjpcRecords .cjpc-record .cjpc-prize.cjtxt-big{color:#FF8A1F!important;text-shadow:0 0 10px rgba(255,138,31,.70)!important}
    #cjpcRecords .cjpc-record .cjpc-meta.cjtxt-big{color:#E56A17!important}

    #cjpcRecords .cjpc-record .cjpc-prize.cjtxt-luxury{color:#D98CFF!important;text-shadow:0 0 12px rgba(217,140,255,.82)!important}
    #cjpcRecords .cjpc-record .cjpc-meta.cjtxt-luxury{color:#B96FE3!important}

    #cjpcRecords .cjpc-record .cjpc-prize.cjtxt-super{color:#DDF7FF!important;text-shadow:0 0 12px rgba(109,219,255,.90)!important}
    #cjpcRecords .cjpc-record .cjpc-meta.cjtxt-super{color:#88D9FF!important}
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
    const observer=new MutationObserver(()=>requestAnimationFrame(patch));
    observer.observe(host,{childList:true,subtree:true,characterData:true});
    patch();
  }

  watch();
  document.querySelectorAll('.nav button[data-p="profile"]').forEach(b=>b.addEventListener('click',()=>setTimeout(patch,80)));
})();
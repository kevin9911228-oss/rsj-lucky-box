/* cj-prize-tier-colors-v5-new-cards */
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

  const ASSET_BASE='https://raw.githubusercontent.com/kevin9911228-oss/rsj-lucky-box/chenjiancj-site/chenjiancj-assets/';
  const CARD_VERSION='20260824-cards-v1';
  const CARD_URLS={
    goldbar:ASSET_BASE+'prize-goldbar.png',
    cash888:ASSET_BASE+'prize-cash-888.png',
    tv:ASSET_BASE+'prize-tv.png',
    cash188:ASSET_BASE+'prize-cash-188.png',
    fridge:ASSET_BASE+'prize-fridge.png',
    cash588:ASSET_BASE+'prize-cash-588.png',
    aircon:ASSET_BASE+'prize-aircon.png',
    cash88:ASSET_BASE+'prize-cash-88.png'
  };

  const cardStyle=document.createElement('style');
  cardStyle.textContent=`
    #drawPage .board{padding:6px!important;border-color:#b98631!important;background:radial-gradient(circle at 50% 0,rgba(132,76,14,.18),transparent 38%),linear-gradient(#2b0507,#0c0001)!important}
    #drawPage .grid{gap:5px!important}
    #drawPage .slot:not(.center){display:grid!important;place-items:center!important;padding:2px!important;background:linear-gradient(180deg,#f8f1e3,#e6d8bd)!important;border:1px solid #d4ac57!important;border-radius:9px!important;box-shadow:inset 0 0 0 1px rgba(255,250,226,.55),0 4px 12px rgba(0,0,0,.28)!important}
    #drawPage .slot:not(.center)>img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;display:block!important;border-radius:7px!important;background:#efe5d2!important}
    #drawPage .slot.center{border-radius:9px!important;border-color:#a96c24!important;box-shadow:inset 0 0 0 1px rgba(255,218,122,.08)!important}
    #drawPage .center img{object-fit:contain!important}
    #drawPage .slot.active{z-index:5!important;transform:scale(1.035)!important;border-color:#fff4bd!important;box-shadow:0 0 0 2px rgba(255,224,116,.82),0 0 20px rgba(255,190,39,.95),0 0 38px rgba(255,135,20,.48)!important;filter:brightness(1.07)!important}
    #drawPage .slot.win{z-index:6!important;border-color:#fff8d4!important;box-shadow:0 0 0 2px rgba(255,244,188,.9),0 0 26px rgba(255,196,36,1),0 0 48px rgba(255,119,15,.56)!important}
    @media(max-width:430px){#drawPage .board{padding:4px!important}#drawPage .grid{gap:4px!important}#drawPage .slot:not(.center){padding:1px!important;border-radius:8px!important}#drawPage .slot:not(.center)>img{border-radius:6px!important}}
  `;
  document.head.appendChild(cardStyle);

  function normalizePrizeUrl(src){
    if(!src) return src;
    const clean=String(src).split('?')[0];
    if(clean.includes('/chenjiancj-assets/prize-goldbar-5g.png')) return CARD_URLS.goldbar+'?v='+CARD_VERSION;
    if(clean.includes('/chenjiancj-assets/prize-')) return clean+'?v='+CARD_VERSION;
    return src;
  }

  function patchPrizeCards(){
    document.querySelectorAll('#drawPage .slot[data-id]').forEach(slot=>{
      const img=slot.querySelector('img');
      const url=CARD_URLS[slot.dataset.id];
      if(!img||!url) return;
      const next=url+'?v='+CARD_VERSION;
      if(img.getAttribute('src')!==next) img.setAttribute('src',next);
      img.decoding='async';
      img.loading='eager';
    });
  }

  function patchWinnerImage(){
    const img=document.getElementById('winImg');
    if(!img) return;
    const current=img.getAttribute('src')||'';
    const next=normalizePrizeUrl(current);
    if(next&&next!==current) img.setAttribute('src',next);
  }

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

  function patchProfile(){document.querySelectorAll('#cjpcRecords .cjpc-record').forEach(apply)}

  function start(){
    patchPrizeCards();
    patchProfile();
    patchWinnerImage();

    const profileStable=document.getElementById('profilePage')||document.body;
    let profileScheduled=false;
    new MutationObserver(()=>{
      if(profileScheduled) return;
      profileScheduled=true;
      requestAnimationFrame(()=>{profileScheduled=false;patchProfile();});
    }).observe(profileStable,{childList:true,subtree:true});

    const winImg=document.getElementById('winImg');
    if(winImg){
      new MutationObserver(patchWinnerImage).observe(winImg,{attributes:true,attributeFilter:['src']});
    }

    document.querySelectorAll('.nav button[data-p="profile"]').forEach(btn=>btn.addEventListener('click',()=>{
      setTimeout(patchProfile,80);
      setTimeout(patchProfile,350);
      setTimeout(patchProfile,900);
    }));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
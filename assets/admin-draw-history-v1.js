/* ADMIN DRAW HISTORY V1 — searched member/history queries return all matching draws */
(()=>{'use strict';if(window.__RSJ_ADMIN_DRAW_HISTORY_V1__)return;window.__RSJ_ADMIN_DRAW_HISTORY_V1__=true;
const baseLoadDraws=loadDraws;let loadingFull=false;
function ensureInfo(){let el=document.getElementById('drawQueryInfo');if(el)return el;const toolbar=document.getElementById('drawSearch')?.closest('.toolbar');if(!toolbar)return null;el=document.createElement('div');el.id='drawQueryInfo';el.style.cssText='width:100%;font-size:11px;color:#aa9b7f;padding:0 2px 2px';toolbar.after(el);return el}
function setInfo(t){const el=ensureInfo();if(el)el.textContent=t||''}
loadDraws=async function(render=true){
  const q=(document.getElementById('drawSearch')?.value||'').trim();
  const date=document.getElementById('drawDate')?.value||null;
  if(!q){setInfo('');return baseLoadDraws(render)}
  if(loadingFull)return;
  loadingFull=true;
  const btn=[...document.querySelectorAll('#draws .toolbar button')].find(x=>x.textContent.includes('查询'));
  const oldText=btn?.textContent||'查询';if(btn){btn.disabled=true;btn.textContent='查询中…'}
  try{
    const d=await rpc('manager_draws_search_all',{...creds(),p_query:q,p_date:date});
    if(!d.ok)return authFail(d);
    draws=Array.isArray(d.draws)?d.draws:[];
    if(render)renderDraws();
    setInfo('已显示全部 '+draws.length+' 条匹配记录'+(date?' · '+date:''));
  }finally{
    loadingFull=false;if(btn){btn.disabled=false;btn.textContent=oldText}
  }
};
function init(){const input=document.getElementById('drawSearch');if(!input)return;input.placeholder='搜索账号 / 昵称 / 流水号（查询显示全部）';input.oninput=null;input.addEventListener('keydown',e=>{if(e.key==='Enter')loadDraws()});ensureInfo()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

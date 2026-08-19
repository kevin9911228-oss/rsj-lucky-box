/* GIFT ADMIN PAGINATION V1 — true server-side pagination for gift draw records */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_ADMIN_PAGINATION_V1__) return;
  window.__RSJ_GIFT_ADMIN_PAGINATION_V1__=true;

  const el=id=>document.getElementById(id);
  const state={page:1,pageSize:100,total:0,totalPages:0,loading:false};
  const safe=v=>{try{return typeof esc==='function'?esc(v):String(v??'')}catch{return String(v??'')}};
  const num=v=>{try{return typeof n==='function'?n(v):Number(v||0).toLocaleString('zh-CN')}catch{return String(v??0)}};
  const time=v=>{try{return typeof fmt==='function'?fmt(v):String(v||'')}catch{return String(v||'')}};

  function addStyle(){
    if(el('giftHistoryPagerStyle')) return;
    const s=document.createElement('style');
    s.id='giftHistoryPagerStyle';
    s.textContent=`
      .giftHistoryPager{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:11px 2px 2px}.giftHistoryPagerLeft,.giftHistoryPagerRight{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.giftPageBtn{height:34px;padding:0 11px;border:1px solid #4b4438;border-radius:9px;background:#151b23;color:#ddcfb1;font-weight:850;font-size:10px;cursor:pointer}.giftPageBtn:hover:not(:disabled){border-color:#b58a3b;color:#ffe398}.giftPageBtn:disabled{opacity:.32;cursor:not-allowed}.giftPageInfo{min-width:120px;text-align:center;color:#e9d08d;font-size:11px;font-weight:900}.giftPageTotal{color:#958b7a;font-size:10px}.giftPageSize{height:34px;border:1px solid #4b4438;border-radius:9px;background:#0b0f15;color:#e6d7b8;padding:0 8px;font-size:10px;outline:none}@media(max-width:760px){.giftHistoryPager{justify-content:center}.giftHistoryPagerLeft,.giftHistoryPagerRight{justify-content:center}.giftPageBtn{padding:0 9px}.giftPageInfo{min-width:100px}}
    `;
    document.head.appendChild(s);
  }

  function ensurePager(){
    const section=el('giftDrawRecordsSection');
    if(!section){setTimeout(ensurePager,150);return}
    if(el('giftHistoryPager')) return;
    const wrap=section.querySelector('.tableWrap');
    if(!wrap){setTimeout(ensurePager,150);return}
    const pager=document.createElement('div');
    pager.id='giftHistoryPager';
    pager.className='giftHistoryPager';
    pager.innerHTML=`
      <div class="giftHistoryPagerLeft">
        <button id="giftPageFirst" class="giftPageBtn" type="button" onclick="giftHistoryGoPage(1)">首页</button>
        <button id="giftPagePrev" class="giftPageBtn" type="button" onclick="giftHistoryGoPage('prev')">上一页</button>
        <span id="giftPageInfo" class="giftPageInfo">第 0 / 0 页</span>
        <button id="giftPageNext" class="giftPageBtn" type="button" onclick="giftHistoryGoPage('next')">下一页</button>
        <button id="giftPageLast" class="giftPageBtn" type="button" onclick="giftHistoryGoPage('last')">末页</button>
      </div>
      <div class="giftHistoryPagerRight">
        <span id="giftPageTotal" class="giftPageTotal">共 0 条</span>
        <select id="giftPageSize" class="giftPageSize" onchange="giftHistorySetPageSize(this.value)">
          <option value="50">每页 50 条</option>
          <option value="100" selected>每页 100 条</option>
          <option value="200">每页 200 条</option>
        </select>
      </div>`;
    wrap.insertAdjacentElement('afterend',pager);
    addStyle();
    renderPager();
  }

  function renderPager(){
    ensurePager();
    const pages=Number(state.totalPages||0),page=pages?Number(state.page||1):0;
    if(el('giftPageInfo')) el('giftPageInfo').textContent=`第 ${page} / ${pages} 页`;
    if(el('giftPageTotal')) el('giftPageTotal').textContent=`共 ${num(state.total)} 条`;
    const noPrev=!pages||page<=1||state.loading,noNext=!pages||page>=pages||state.loading;
    if(el('giftPageFirst')) el('giftPageFirst').disabled=noPrev;
    if(el('giftPagePrev')) el('giftPagePrev').disabled=noPrev;
    if(el('giftPageNext')) el('giftPageNext').disabled=noNext;
    if(el('giftPageLast')) el('giftPageLast').disabled=noNext;
    if(el('giftPageSize')) el('giftPageSize').disabled=state.loading;
  }

  function renderRows(rows){
    const box=el('giftDrawRecordRows');
    if(!box) return;
    if(!rows.length){box.innerHTML='<tr><td colspan="7" class="loader">没有符合条件的中奖记录</td></tr>';return}
    box.innerHTML=rows.map(x=>{
      const cls=x.prize_key==='gold_bracelet'?'giftPrizeGold':x.prize_key==='iphone17'?'giftPrizeIphone':x.prize_key==='coach_bag'?'giftPrizeCoach':'giftPrizeCoupon';
      const source=x.award_source==='指定'?'<span class="giftSourceForced">指定</span>':'<span class="giftSourceRandom">随机</span>';
      return `<tr><td>${time(x.drawn_at)}</td><td><b>${safe(x.gift_code||'--')}</b></td><td>${safe(x.member_code||'--')}</td><td>${safe(x.display_name||'--')}</td><td class="${cls}">${safe(x.prize_label||'--')}</td><td>${source}</td><td>${safe(x.serial||'--')}</td></tr>`;
    }).join('');
  }

  async function loadPage(){
    ensurePager();
    if(state.loading) return;
    try{if(typeof auth==='undefined'||!auth)return}catch{return}
    const box=el('giftDrawRecordRows');
    const code=(el('giftRecordCode')?.value||'').trim();
    const search=(el('giftRecordSearch')?.value||'').trim();
    if(box) box.innerHTML='<tr><td colspan="7" class="loader">正在读取中奖记录…</td></tr>';
    state.loading=true;renderPager();
    let d;
    try{
      d=await rpc('manager_gift_draw_records_paged',{...creds(),p_code:code||null,p_search:search||null,p_page:state.page,p_page_size:state.pageSize});
    }catch(e){d={ok:false,message:'查询失败，请稍后重试'}}
    state.loading=false;
    if(!d?.ok){if(box)box.innerHTML=`<tr><td colspan="7" class="loader">${safe(d?.message||'查询失败')}</td></tr>`;renderPager();return}
    const s=d.summary||{},p=d.pagination||{},rows=Array.isArray(d.records)?d.records:[];
    state.page=Number(p.page||1);state.pageSize=Number(p.page_size||state.pageSize);state.total=Number(p.total||s.total||0);state.totalPages=Number(p.total_pages||0);
    if(el('giftRecTotal'))el('giftRecTotal').textContent=num(s.total||0);
    if(el('giftRecGold'))el('giftRecGold').textContent=num(s.gold_bracelet||0);
    if(el('giftRecIphone'))el('giftRecIphone').textContent=num(s.iphone17||0);
    if(el('giftRecCoach'))el('giftRecCoach').textContent=num(s.coach_bag||0);
    if(el('giftRecCoupon'))el('giftRecCoupon').textContent=num(s.voucher68||0);
    if(el('giftPageSize'))el('giftPageSize').value=String(state.pageSize);
    renderRows(rows);renderPager();
  }

  window.loadGiftDrawRecordsV5=function(){state.page=1;return loadPage()};
  window.openGiftDrawRecordsV5=function(code){ensurePager();if(el('giftRecordCode'))el('giftRecordCode').value=code||'';if(el('giftRecordSearch'))el('giftRecordSearch').value='';state.page=1;el('giftDrawRecordsSection')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(loadPage,80)};
  window.clearGiftRecordFilterV5=function(){if(el('giftRecordCode'))el('giftRecordCode').value='';if(el('giftRecordSearch'))el('giftRecordSearch').value='';state.page=1;loadPage()};
  window.giftHistoryGoPage=function(where){
    if(state.loading||!state.totalPages)return;
    let next=state.page;
    if(where==='prev')next--;
    else if(where==='next')next++;
    else if(where==='last')next=state.totalPages;
    else next=Number(where||1);
    next=Math.max(1,Math.min(state.totalPages,next));
    if(next===state.page)return;
    state.page=next;loadPage();
  };
  window.giftHistorySetPageSize=function(value){const v=[50,100,200].includes(Number(value))?Number(value):100;state.pageSize=v;state.page=1;loadPage()};

  function init(){addStyle();ensurePager();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,500),{once:true});else setTimeout(init,500);
})();

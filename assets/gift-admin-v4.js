/* GIFT ADMIN V4 — gift draw records + per-campaign lookup */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_ADMIN_V4__) return;
  window.__RSJ_GIFT_ADMIN_V4__=true;
  const el=id=>document.getElementById(id);
  let recordLoaded=false;

  function ensure(){
    const page=el('giftcodes');if(!page){setTimeout(ensure,100);return}
    if(!el('giftDrawRecordsSection')){
      const sec=document.createElement('div');sec.id='giftDrawRecordsSection';sec.className='section card';sec.innerHTML=`
        <div class="giftRecordHead"><div><h3>礼品码中奖记录</h3><div class="muted">记录实际参与结果：账号、昵称、奖项、随机/指定来源、流水号。</div></div><button class="btn blue" onclick="loadGiftDrawRecords()">刷新记录</button></div>
        <div class="stats giftRecordStats"><div class="stat card"><span>查询记录</span><b id="giftRecTotal">0</b></div><div class="stat card"><span>5000元消费券</span><b id="giftRecVoucher">0</b></div><div class="stat card"><span>谢谢惠顾</span><b id="giftRecThanks">0</b></div></div>
        <div class="toolbar"><input id="giftRecordCode" class="field" placeholder="礼品码（留空查全部）"><input id="giftRecordSearch" class="field" placeholder="搜索账号 / 昵称 / 流水号" onkeydown="if(event.key==='Enter')loadGiftDrawRecords()"><button class="btn blue" onclick="loadGiftDrawRecords()">查询</button><button class="btn dark" onclick="clearGiftRecordFilter()">全部记录</button></div>
        <div class="tableWrap"><table class="table giftRecordTable"><thead><tr><th>时间</th><th>礼品码</th><th>账号</th><th>昵称</th><th>中奖结果</th><th>来源</th><th>流水号</th></tr></thead><tbody id="giftDrawRecordRows"><tr><td colspan="7" class="loader">点击查询查看礼品码中奖记录</td></tr></tbody></table></div>`;
      page.appendChild(sec);
    }
    addStyle();patchCampaignButtons();
  }

  function addStyle(){if(el('giftAdminV4Style'))return;const s=document.createElement('style');s.id='giftAdminV4Style';s.textContent=`
    .giftRecordHead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}.giftRecordHead h3{margin:0 0 3px!important}.giftRecordStats{grid-template-columns:repeat(3,1fr)!important;margin:8px 0 10px!important}.giftRecordStats .stat{padding:11px 13px!important}.giftRecordStats .stat b{font-size:21px!important}.giftRecordTable{min-width:980px!important}.giftPrizeVoucher{color:#ffe07b!important;font-weight:1000}.giftPrizeThanks{color:#9fa8b4!important}.giftSourceForced{display:inline-block;padding:3px 7px;border-radius:999px;background:#5a4114;color:#ffe18b;font-size:9px;font-weight:900}.giftSourceRandom{display:inline-block;padding:3px 7px;border-radius:999px;background:#17382e;color:#85e5bd;font-size:9px;font-weight:900}.giftRecordBtn{border-color:#665023!important;color:#f2d894!important}@media(max-width:760px){.giftRecordHead{align-items:flex-start}.giftRecordStats{grid-template-columns:1fr 1fr 1fr!important}.giftRecordStats .stat{padding:9px!important}.giftRecordStats .stat b{font-size:17px!important}}
  `;document.head.appendChild(s)}

  function patchCampaignButtons(){
    const body=el('giftCodeRows');if(!body)return;
    body.querySelectorAll('tr[data-code]').forEach(tr=>{
      if(tr.querySelector('.giftRecordBtn'))return;
      const code=tr.dataset.code||'';const action=tr.querySelector('td:last-child .actions');if(!action)return;
      const b=document.createElement('button');b.className='smallBtn giftRecordBtn';b.textContent='中奖记录';b.onclick=()=>window.openGiftDrawRecords(code);action.prepend(b);
    });
  }

  window.loadGiftDrawRecords=async function(){
    ensure();if(typeof auth==='undefined'||!auth)return;
    const code=(el('giftRecordCode')?.value||'').trim();const search=(el('giftRecordSearch')?.value||'').trim();
    const box=el('giftDrawRecordRows');if(box)box.innerHTML='<tr><td colspan="7" class="loader">正在读取中奖记录…</td></tr>';
    const d=await rpc('manager_gift_draw_records',{...creds(),p_code:code||null,p_search:search||null,p_limit:500});
    if(!d?.ok){if(box)box.innerHTML=`<tr><td colspan="7" class="loader">${esc(d?.message||'查询失败')}</td></tr>`;return typeof authFail==='function'&&String(d?.message||'').includes('验证')?authFail(d):null}
    recordLoaded=true;const s=d.summary||{},rows=Array.isArray(d.records)?d.records:[];
    if(el('giftRecTotal'))el('giftRecTotal').textContent=n(s.total||0);if(el('giftRecVoucher'))el('giftRecVoucher').textContent=n(s.voucher5000||0);if(el('giftRecThanks'))el('giftRecThanks').textContent=n(s.thanks||0);
    if(!box)return;box.innerHTML=rows.length?rows.map(x=>{const voucher=x.prize_key==='voucher5000';return `<tr><td>${fmt(x.drawn_at)}</td><td><b>${esc(x.gift_code||'--')}</b></td><td>${esc(x.member_code||'--')}</td><td>${esc(x.display_name||'--')}</td><td class="${voucher?'giftPrizeVoucher':'giftPrizeThanks'}">${esc(x.prize_label||(voucher?'5000元消费券':'谢谢惠顾'))}</td><td>${x.award_source==='指定'?'<span class="giftSourceForced">指定</span>':'<span class="giftSourceRandom">随机</span>'}</td><td>${esc(x.serial||'--')}</td></tr>`}).join(''):'<tr><td colspan="7" class="loader">没有符合条件的礼品码中奖记录</td></tr>';
  };

  window.openGiftDrawRecords=function(code){ensure();if(el('giftRecordCode'))el('giftRecordCode').value=code||'';if(el('giftRecordSearch'))el('giftRecordSearch').value='';el('giftDrawRecordsSection')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>window.loadGiftDrawRecords(),120)};
  window.clearGiftRecordFilter=function(){if(el('giftRecordCode'))el('giftRecordCode').value='';if(el('giftRecordSearch'))el('giftRecordSearch').value='';window.loadGiftDrawRecords()};

  function patch(){
    if(typeof window.tab==='function'&&!window.tab.__giftAdminV4Patched){const base=window.tab;const w=function(name,node){const out=base.apply(this,arguments);if(name==='giftcodes'){setTimeout(()=>{ensure();patchCampaignButtons();if(!recordLoaded)window.loadGiftDrawRecords()},180)}return out};w.__giftAdminV4Patched=true;window.tab=w}
    if(typeof window.refreshCurrent==='function'&&!window.refreshCurrent.__giftAdminV4Patched){const base=window.refreshCurrent;const w=async function(){if(typeof current!=='undefined'&&current==='giftcodes'){const out=await base.apply(this,arguments);ensure();patchCampaignButtons();await window.loadGiftDrawRecords();return out}return base.apply(this,arguments)};w.__giftAdminV4Patched=true;window.refreshCurrent=w}
    const body=el('giftCodeRows');if(body&&!body.dataset.giftV4Observer){body.dataset.giftV4Observer='1';new MutationObserver(()=>patchCampaignButtons()).observe(body,{childList:true,subtree:true})}
  }

  function init(){ensure();patch();setInterval(patchCampaignButtons,1200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
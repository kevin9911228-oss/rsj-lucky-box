/* RSJ Security Admin V2 — separate pending risks from manual restriction archive */
(()=>{
  'use strict';
  if(window.__RSJ_SECURITY_ADMIN_V2__) return;
  window.__RSJ_SECURITY_ADMIN_V2__=true;

  let secData={risk_accounts:[],recent_events:[],summary:{}};
  let secMode='review';
  const el=id=>document.getElementById(id);
  const manualBlocked=x=>x?.status==='blocked' && String(x?.note||'').trim()==='管理员手动限制';
  const reasonText=reasons=>Array.isArray(reasons)?reasons.map(r=>r&&typeof r==='object'?(r.detail||r.type||''):String(r||'')).filter(Boolean).join('；'):'';

  function waitForPage(){
    const page=el('securityPage');
    if(!page){setTimeout(waitForPage,80);return}
    if(page.dataset.securityV2==='1') return;
    page.dataset.securityV2='1';
    page.innerHTML=`
      <div class="stats">
        <div class="stat card"><span>待审核风险</span><b id="secReview">--</b></div>
        <div class="stat card"><span>已限制归档</span><b id="secArchived">--</b></div>
        <div class="stat card"><span>24小时审计</span><b id="secEvents">--</b></div>
        <div class="stat card"><span>24小时拦截</span><b id="secBlocked24">--</b></div>
      </div>

      <div class="section card secRiskManager">
        <div class="secHeadRow">
          <h3>风险账号管理</h3>
          <button class="btn blue" onclick="loadSecurityAudit()">刷新</button>
        </div>
        <div class="secSubTabs">
          <button id="secTabReview" class="secSubTab active" onclick="securitySwitchView('review')">待审核风险 <span id="secReviewBadge">0</span></button>
          <button id="secTabArchive" class="secSubTab" onclick="securitySwitchView('archive')">已限制归档 <span id="secArchiveBadge">0</span></button>
        </div>

        <div id="secReviewView">
          <div class="toolbar"><input id="secRiskSearch" class="field" placeholder="搜索账号 / 昵称" oninput="renderSecurityRisk()"></div>
          <div class="tableWrap"><table class="table"><thead><tr><th>账号</th><th>昵称</th><th>风险分</th><th>状态</th><th>原因</th><th>最近发现</th><th>操作</th></tr></thead><tbody id="secRiskRows"></tbody></table></div>
        </div>

        <div id="secArchiveView" class="hide">
          <div class="toolbar"><input id="secArchiveSearch" class="field" placeholder="搜索已限制账号 / 昵称" oninput="renderSecurityArchive()"></div>
          <div class="tableWrap"><table class="table"><thead><tr><th>账号</th><th>昵称</th><th>风险分</th><th>归档状态</th><th>限制原因</th><th>限制时间</th><th>操作</th></tr></thead><tbody id="secArchiveRows"></tbody></table></div>
        </div>
      </div>

      <div class="section card"><h3>最近安全审计</h3><div class="toolbar"><input id="secEventSearch" class="field" placeholder="搜索账号 / IP / 幸运码 / 设备" oninput="renderSecurityEvents()"></div><div class="tableWrap"><table class="table"><thead><tr><th>时间</th><th>行为</th><th>账号</th><th>幸运码</th><th>IP</th><th>设备</th><th>浏览器指纹</th><th>结果</th><th>原因</th></tr></thead><tbody id="secEventRows"></tbody></table></div></div>`;
    addStyle();
  }

  function addStyle(){
    if(el('securityAdminV2Style')) return;
    const st=document.createElement('style');st.id='securityAdminV2Style';st.textContent=`
      #securityPage .table{min-width:1180px}
      #securityPage .risk80{color:#ff927f;font-weight:900}
      #securityPage .risk70{color:#f4c45d;font-weight:900}
      #securityPage .secDevice{max-width:150px;overflow:hidden;text-overflow:ellipsis}
      #securityPage .secReason{max-width:340px;white-space:normal!important;line-height:1.35}
      .secHeadRow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .secHeadRow h3{margin:0!important}
      .secSubTabs{display:flex;gap:8px;margin:2px 0 12px;padding:5px;border:1px solid #3d3529;border-radius:12px;background:#090d13}
      .secSubTab{border:1px solid transparent;border-radius:9px;padding:9px 13px;background:transparent;color:#9f9687;font-weight:900;cursor:pointer}
      .secSubTab.active{border-color:#765822;background:linear-gradient(180deg,#332713,#1c1710);color:#ffe18a;box-shadow:inset 0 0 16px #d69b2918}
      .secSubTab span{display:inline-grid;place-items:center;min-width:20px;height:20px;margin-left:5px;padding:0 6px;border-radius:999px;background:#1c232d;color:#c8b88f;font-size:9px}
      .secSubTab.active span{background:#6d4b18;color:#ffe39a}
      .secArchiveTag{display:inline-block;padding:3px 7px;border-radius:999px;background:#3c211f;color:#ff9b8e;font-size:9px;font-weight:900}
      .secSystemTag{display:inline-block;padding:3px 7px;border-radius:999px;background:#392d16;color:#f1c86f;font-size:9px;font-weight:900}
      .secReviewTag{display:inline-block;padding:3px 7px;border-radius:999px;background:#172e3a;color:#89cdeb;font-size:9px;font-weight:900}
      @media(max-width:760px){.secHeadRow{align-items:flex-start}.secSubTabs{display:grid;grid-template-columns:1fr 1fr}.secSubTab{padding:9px 6px;font-size:10px}}
    `;document.head.appendChild(st);
  }

  function reviewRows(){return (secData.risk_accounts||[]).filter(x=>!manualBlocked(x));}
  function archiveRows(){return (secData.risk_accounts||[]).filter(manualBlocked);}

  window.securitySwitchView=function(mode){
    secMode=mode==='archive'?'archive':'review';
    el('secReviewView')?.classList.toggle('hide',secMode!=='review');
    el('secArchiveView')?.classList.toggle('hide',secMode!=='archive');
    el('secTabReview')?.classList.toggle('active',secMode==='review');
    el('secTabArchive')?.classList.toggle('active',secMode==='archive');
    if(secMode==='archive') window.renderSecurityArchive(); else window.renderSecurityRisk();
  };

  window.loadSecurityAudit=async function(){
    waitForPage();
    if(typeof auth==='undefined'||!auth) return;
    const d=await rpc('manager_security_overview',{...creds(),p_limit:300});
    if(!d?.ok) return typeof authFail==='function'?authFail(d||{message:'加载失败'}):null;
    secData=d;
    const reviews=reviewRows(),archives=archiveRows(),s=d.summary||{};
    if(el('secReview')) el('secReview').textContent=n(reviews.length);
    if(el('secArchived')) el('secArchived').textContent=n(archives.length);
    if(el('secEvents')) el('secEvents').textContent=n(s.events_24h||0);
    if(el('secBlocked24')) el('secBlocked24').textContent=n(s.blocked_24h||0);
    if(el('secReviewBadge')) el('secReviewBadge').textContent=n(reviews.length);
    if(el('secArchiveBadge')) el('secArchiveBadge').textContent=n(archives.length);
    window.renderSecurityRisk();window.renderSecurityArchive();window.renderSecurityEvents();
  };

  window.renderSecurityRisk=function(){
    const q=(el('secRiskSearch')?.value||'').trim().toLowerCase();
    const rows=reviewRows().filter(x=>!q||String(x.member_code||'').toLowerCase().includes(q)||String(x.display_name||'').toLowerCase().includes(q));
    const box=el('secRiskRows');if(!box)return;
    box.innerHTML=rows.length?rows.map(x=>{
      const score=Number(x.risk_score||0),systemBlocked=x.status==='blocked';
      const status=systemBlocked?'<span class="secSystemTag">系统拦截</span>':'<span class="secReviewTag">待审核</span>';
      return `<tr><td><b>${esc(x.member_code)}</b></td><td>${esc(x.display_name)}</td><td class="${score>=80?'risk80':'risk70'}">${score}</td><td>${status}</td><td class="secReason">${esc(reasonText(x.reasons)||x.note||'--')}</td><td>${fmt(x.last_seen_at)}</td><td><div class="actions"><button class="smallBtn" onclick="securitySetStatus('${esc(x.member_code)}','blocked')">限制幸运码</button><button class="smallBtn" onclick="securitySetStatus('${esc(x.member_code)}','cleared')">解除风险</button></div></td></tr>`;
    }).join(''):'<tr><td colspan="7" class="loader">暂无待审核风险账号</td></tr>';
  };

  window.renderSecurityArchive=function(){
    const q=(el('secArchiveSearch')?.value||'').trim().toLowerCase();
    const rows=archiveRows().filter(x=>!q||String(x.member_code||'').toLowerCase().includes(q)||String(x.display_name||'').toLowerCase().includes(q));
    const box=el('secArchiveRows');if(!box)return;
    box.innerHTML=rows.length?rows.map(x=>{
      const score=Number(x.risk_score||0);
      return `<tr><td><b>${esc(x.member_code)}</b></td><td>${esc(x.display_name)}</td><td class="${score>=80?'risk80':'risk70'}">${score}</td><td><span class="secArchiveTag">已限制归档</span></td><td class="secReason">${esc(reasonText(x.reasons)||x.note||'管理员手动限制')}</td><td>${fmt(x.last_seen_at)}</td><td><div class="actions"><button class="smallBtn" onclick="securitySetStatus('${esc(x.member_code)}','cleared')">解除限制</button></div></td></tr>`;
    }).join(''):'<tr><td colspan="7" class="loader">暂无已限制归档账号</td></tr>';
  };

  window.renderSecurityEvents=function(){
    const q=(el('secEventSearch')?.value||'').trim().toLowerCase();
    const rows=(secData.recent_events||[]).filter(x=>!q||[x.member_code,x.ip,x.lucky_code,x.device_id,x.fingerprint,x.reason].some(v=>String(v||'').toLowerCase().includes(q)));
    const box=el('secEventRows');if(!box)return;
    box.innerHTML=rows.length?rows.map(x=>`<tr><td>${fmt(x.created_at)}</td><td>${x.action==='register'?'注册':'幸运码'}</td><td>${esc(x.member_code||'--')}</td><td>${esc(x.lucky_code||'--')}</td><td><b>${esc(x.ip||'--')}</b></td><td class="secDevice" title="${esc(x.device_id||'')}">${esc(x.device_id||'--')}</td><td class="secDevice" title="${esc(x.fingerprint||'')}">${esc(x.fingerprint||'--')}</td><td class="${x.outcome==='blocked'?'off':x.outcome==='ok'?'ok':''}">${esc(x.outcome||'--')}</td><td class="secReason">${esc(x.reason||'--')}</td></tr>`).join(''):'<tr><td colspan="9" class="loader">暂无审计记录</td></tr>';
  };

  window.securitySetStatus=async function(code,status){
    const blocking=status==='blocked';
    const action=blocking?'限制该账号参与幸运码，并移入“已限制归档”？':'解除该账号限制/风险标记？';
    if(!confirm(action)) return;
    const d=await rpc('manager_security_set_status',{...creds(),p_member_code:code,p_status:status,p_note:blocking?'管理员手动限制':'管理员复核解除'});
    if(!d?.ok) return toast(d?.message||'操作失败');
    toast(blocking?'已限制并归档':'已解除');
    await window.loadSecurityAudit();
    if(blocking) window.securitySwitchView('review');
  };

  function init(){waitForPage();setTimeout(()=>{if(typeof auth!=='undefined'&&auth)window.loadSecurityAudit()},180)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
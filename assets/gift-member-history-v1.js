/* GIFT MEMBER HISTORY V1 — member-facing gift winning records */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_MEMBER_HISTORY_V1__) return;
  window.__RSJ_GIFT_MEMBER_HISTORY_V1__=true;

  const id=x=>document.getElementById(x);
  const safe=s=>{try{return typeof esc==='function'?esc(s):String(s??'')}catch{return String(s??'')}};
  const currentSession=()=>{try{return typeof session!=='undefined'?session:null}catch{return null}};
  const iconMap={gold_bracelet:'🏆',iphone17:'📱',coach_bag:'👜',voucher68:'🎫',voucher5000:'🎫'};
  const fmtTime=v=>{try{return new Date(v).toLocaleString('zh-CN',{hour12:false})}catch{return String(v||'')}};

  function addStyle(){
    if(id('giftMemberHistoryStyle')) return;
    const s=document.createElement('style');
    s.id='giftMemberHistoryStyle';
    s.textContent=`
      .giftHistoryEntry{width:100%;margin-top:10px;padding:0;border:1px solid #5d4722;border-radius:15px;background:linear-gradient(145deg,#131922,#0a0e14);color:#f5e6c5;overflow:hidden;text-align:left;box-shadow:0 9px 24px #0004}.giftHistoryEntryInner{display:flex;align-items:center;gap:11px;padding:12px 13px}.giftHistoryEntryIcon{width:42px;height:42px;display:grid;place-items:center;border-radius:13px;background:linear-gradient(145deg,#493410,#1a1309);font-size:22px;box-shadow:inset 0 0 0 1px #85672b}.giftHistoryEntryText{flex:1;min-width:0}.giftHistoryEntryTitle{display:block;font-size:14px;font-weight:950;color:#f7dda0}.giftHistoryEntrySub{display:block;margin-top:2px;font-size:9px;color:#9a8b6f}.giftHistoryEntryArrow{font-size:22px;color:#bba675}
      #giftHistoryModal .modalCard{width:min(520px,94vw);max-height:86vh;overflow:hidden;padding:0;background:linear-gradient(180deg,#121821,#090d13);border:1px solid #755a28}#giftHistoryModal .giftHistoryHead{display:flex;align-items:center;justify-content:space-between;padding:15px 16px 11px;border-bottom:1px solid #3a3022}#giftHistoryModal .giftHistoryHead h3{margin:0;color:#ffe08d;font-size:18px}#giftHistoryModal .giftHistoryHead small{display:block;margin-top:2px;color:#8f826c;font-size:9px}#giftHistoryModal .giftHistoryClose{border:0;background:transparent;color:#c5b28a;font-size:25px;line-height:1;cursor:pointer}#giftHistoryModal .giftHistoryBody{max-height:68vh;overflow:auto;padding:10px}#giftHistoryModal .giftHistoryLoading,#giftHistoryModal .giftHistoryEmpty{padding:36px 12px;text-align:center;color:#8e836f;font-size:12px}.giftHistoryItem{display:grid;grid-template-columns:44px 1fr;gap:10px;padding:11px;margin-bottom:8px;border:1px solid #313a45;border-radius:13px;background:linear-gradient(145deg,#111720,#090d13)}.giftHistoryIcon{width:44px;height:44px;display:grid;place-items:center;border-radius:13px;background:#1b2430;font-size:23px}.giftHistoryMain{min-width:0}.giftHistoryTop{display:flex;align-items:center;justify-content:space-between;gap:8px}.giftHistoryTier{font-size:9px;font-weight:950;color:#e4bd63}.giftHistoryTime{font-size:8px;color:#7f8791}.giftHistoryPrize{margin-top:3px;font-size:15px;font-weight:950;color:#fff0bd}.giftHistorySerial{margin-top:5px;font-size:8px;line-height:1.45;color:#8f9aa7;word-break:break-all}.giftHistorySerial b{color:#b8a77f;font-weight:700}
      @media(max-width:420px){#giftHistoryModal .modalCard{width:94vw}.giftHistoryItem{grid-template-columns:38px 1fr;padding:9px}.giftHistoryIcon{width:38px;height:38px;font-size:20px}.giftHistoryPrize{font-size:14px}}
    `;
    document.head.appendChild(s);
  }

  function ensureUI(){
    const member=id('giftMember');
    if(!member){setTimeout(ensureUI,120);return}
    if(!id('giftHistoryEntry')){
      const btn=document.createElement('button');
      btn.id='giftHistoryEntry';
      btn.className='giftHistoryEntry';
      btn.type='button';
      btn.innerHTML='<div class="giftHistoryEntryInner"><div class="giftHistoryEntryIcon">🎁</div><div class="giftHistoryEntryText"><span class="giftHistoryEntryTitle">礼品中奖记录</span><span class="giftHistoryEntrySub">查看我的转盘中奖明细</span></div><span class="giftHistoryEntryArrow">›</span></div>';
      btn.addEventListener('click',openHistory);
      member.appendChild(btn);
    }
    if(!id('giftHistoryModal')){
      const modal=document.createElement('div');
      modal.id='giftHistoryModal';
      modal.className='modal';
      modal.innerHTML='<div class="modalCard"><div class="giftHistoryHead"><div><h3>🎁 礼品中奖记录</h3><small id="giftHistoryCount">我的礼品转盘中奖明细</small></div><button class="giftHistoryClose" type="button">×</button></div><div id="giftHistoryBody" class="giftHistoryBody"><div class="giftHistoryLoading">正在读取中奖记录…</div></div></div>';
      modal.addEventListener('click',e=>{if(e.target===modal)closeHistory()});
      modal.querySelector('.giftHistoryClose').addEventListener('click',closeHistory);
      document.body.appendChild(modal);
    }
    addStyle();
  }

  async function openHistory(){
    ensureUI();
    const s=currentSession();
    if(!s){if(typeof openLoginModal==='function')openLoginModal('home','登录后查看礼品中奖记录');return}
    const modal=id('giftHistoryModal'),body=id('giftHistoryBody');
    modal?.classList.add('show');document.body.style.overflow='hidden';
    if(body)body.innerHTML='<div class="giftHistoryLoading">正在读取中奖记录…</div>';
    let d;
    try{d=await rpc('member_session_gift_history',{p_token:s.token,p_limit:50})}catch{d={ok:false,message:'网络连接有些波动'}}
    if(!d?.ok){if(body)body.innerHTML='<div class="giftHistoryEmpty">'+safe(d?.message||'中奖记录加载失败')+'</div>';return}
    const rows=Array.isArray(d.records)?d.records:[];
    const count=id('giftHistoryCount');if(count)count.textContent='共 '+Number(d.total||rows.length)+' 条中奖记录';
    if(!rows.length){if(body)body.innerHTML='<div class="giftHistoryEmpty">暂时还没有礼品中奖记录</div>';return}
    body.innerHTML=rows.map(x=>`<div class="giftHistoryItem"><div class="giftHistoryIcon">${iconMap[x.prize_key]||'🎁'}</div><div class="giftHistoryMain"><div class="giftHistoryTop"><span class="giftHistoryTier">${safe(x.prize_tier||'礼品奖')}</span><span class="giftHistoryTime">${safe(fmtTime(x.drawn_at))}</span></div><div class="giftHistoryPrize">${safe(x.prize_label||'礼品')}</div><div class="giftHistorySerial"><b>流水号：</b>${safe(x.serial||'--')}</div></div></div>`).join('');
  }

  function closeHistory(){id('giftHistoryModal')?.classList.remove('show');if(!id('giftResultModal')?.classList.contains('show')&&!id('resultModal')?.classList.contains('show')&&!id('historyModal')?.classList.contains('show'))document.body.style.overflow=''}

  window.openGiftMemberHistory=openHistory;
  function init(){addStyle();ensureUI()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,160),{once:true});else setTimeout(init,160);
})();
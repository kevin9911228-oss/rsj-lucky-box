/* GIFT ADMIN V3 — partial designated winners + random remainder */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_ADMIN_V3__) return;
  window.__RSJ_GIFT_ADMIN_V3__=true;
  let mixedCodes=[];
  const el=x=>document.getElementById(x);

  function updateCopy(){
    const page=el('giftcodes');
    if(!page){setTimeout(updateCopy,120);return}
    const notice=page.querySelector('.notice');
    if(notice) notice.innerHTML='本期推荐配置：<b>100个名额 / 3张5000元消费券</b>。可只指定其中一部分中奖账号，未指定的消费券名额会在其余参与者中随机产生。';
    const modal=el('giftWinnerModal');
    const n=modal?.querySelector('.notice');
    if(n) n.textContent='可指定0个到消费券总名额之间的任意数量；未指定的消费券名额自动进入随机奖池。';
    const h=page.querySelectorAll('thead th');
    if(h.length>=4){h[2].textContent='5000券指定';h[3].textContent='5000券已发出'}
  }

  async function loadMixed(){
    if(typeof auth==='undefined'||!auth) return;
    const d=await rpc('manager_gift_codes',creds());
    if(!d.ok) return typeof authFail==='function'?authFail(d):null;
    mixedCodes=Array.isArray(d.codes)?d.codes:[];
    const body=el('giftCodeRows'); if(!body) return;
    body.innerHTML=mixedCodes.length?mixedCodes.map(x=>`<tr data-code="${esc(x.code)}"><td><b>${esc(x.code)}</b></td><td>${n(x.used_count)} / ${n(x.max_uses)}</td><td class="amount">${n(x.voucher_assigned_count)} / ${n(x.voucher_quota)}</td><td>${n(x.voucher_drawn_count)}${Number(x.voucher_random_count||0)>0?` <span class="giftRandomTag">随机${n(x.voucher_random_count)}</span>`:''}</td><td class="${x.active?'ok':'off'}">${x.active?'启用':'停用'}</td><td>${esc(x.note||'--')}</td><td><div class="actions"><button class="smallBtn" onclick="openGiftWinnersV3('${esc(x.code)}')">奖项策略</button><button class="smallBtn" onclick="setGiftActive('${esc(x.code)}',${!x.active})">${x.active?'停用':'启用'}</button></div></td></tr>`).join(''):'<tr><td colspan="7" class="loader">暂无礼品码活动</td></tr>';
  }

  window.openGiftWinnersV3=async code=>{
    const row=mixedCodes.find(x=>x.code===code);
    el('giftWinnerCode').value=code;
    el('giftWinnerInfo').textContent=`消费券总名额：${row?.voucher_quota??0} · 已指定：${row?.voucher_assigned_count??0} · 已发出：${row?.voucher_drawn_count??0} · 随机产生：${row?.voucher_random_count??0}`;
    el('giftWinnerMembers').value='';
    el('giftWinnerCurrent').classList.add('hide');
    showGiftModal('giftWinnerModal');
    const d=await rpc('manager_gift_voucher_winners',{...creds(),p_code:code});
    if(!d.ok) return toast(d.message||'读取名单失败');
    const ws=Array.isArray(d.winners)?d.winners:[];
    el('giftWinnerMembers').value=ws.map(x=>x.member_code).join('\n');
    el('giftWinnerCurrent').innerHTML=ws.length?'当前指定：<br>'+ws.map(x=>`<span class="giftWinnerTag ${x.claimed?'giftClaimed':''}">${esc(x.member_code)} · ${esc(x.display_name)}${x.claimed?' · 已领取':''}</span>`).join(''):'当前没有指定账号，消费券名额全部随机';
    el('giftWinnerCurrent').classList.remove('hide');
  };

  window.saveGiftWinners=async()=>{
    const code=el('giftWinnerCode').value;
    const rows=el('giftWinnerMembers').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const cfg=mixedCodes.find(x=>x.code===code),quota=Number(cfg?.voucher_quota||0);
    const unique=[...new Set(rows.map(x=>x.toUpperCase()))];
    if(unique.length>quota) return toast(`最多只能指定 ${quota} 个账号，现在填写了 ${unique.length} 个`);
    const d=await rpc('manager_set_gift_voucher_winners',{...creds(),p_code:code,p_member_codes:unique});
    if(!d.ok) return toast(d.message||'保存失败');
    const randomLeft=Math.max(0,quota-unique.length);
    toast(unique.length?`已指定 ${unique.length} 个；剩余 ${randomLeft} 个消费券名额随机产生`:`已取消指定，${quota} 个消费券名额全部随机产生`);
    hideGiftModal('giftWinnerModal');
    await loadMixed();
  };

  function patchNav(){
    if(typeof window.tab==='function'&&!window.tab.__giftAdminV3Patched){
      const base=window.tab;
      const w=function(name,node){const out=base.apply(this,arguments);if(name==='giftcodes')setTimeout(loadMixed,0);return out};
      w.__giftAdminV3Patched=true;window.tab=w;
    }
    if(typeof window.refreshCurrent==='function'&&!window.refreshCurrent.__giftAdminV3Patched){
      const base=window.refreshCurrent;
      const w=async function(){if(typeof current!=='undefined'&&current==='giftcodes')return loadMixed();return base.apply(this,arguments)};
      w.__giftAdminV3Patched=true;window.refreshCurrent=w;
    }
  }

  function addStyle(){if(el('giftAdminV3Style'))return;const s=document.createElement('style');s.id='giftAdminV3Style';s.textContent='.giftRandomTag{display:inline-block;margin-left:4px;padding:2px 5px;border-radius:999px;background:#173b32;color:#7ee3bd;font-size:9px}';document.head.appendChild(s)}
  function init(){updateCopy();patchNav();addStyle();setTimeout(loadMixed,150)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80),{once:true});else setTimeout(init,80);
})();

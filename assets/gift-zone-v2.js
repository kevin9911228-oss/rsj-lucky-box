/* GIFT ZONE V2 — six-segment wheel with designated 5000 voucher winners */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_ZONE_V2__) return;
  window.__RSJ_GIFT_ZONE_V2__=true;
  const PRIZES=[
    {key:'voucher5000',label:'5000元消费券',icon:'🎫'},
    {key:'cigarette',label:'香烟',icon:'🚬'},
    {key:'lipstick',label:'口红',icon:'💄'},
    {key:'air_conditioner',label:'空调',icon:'❄️'},
    {key:'iphone17',label:'苹果17',icon:'📱'},
    {key:'thanks',label:'谢谢惠顾',icon:'✨'}
  ];
  const PENDING_KEY='rsj_pending_gift_draw';
  let spinning=false,wheelRotation=0,loginPending=false;
  const id=x=>document.getElementById(x);
  const currentSession=()=>{try{return typeof session!=='undefined'?session:null}catch(e){return null}};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const reqId=()=>{try{return typeof newRequestId==='function'?newRequestId():'gift-'+Date.now()+'-'+Math.random().toString(36).slice(2)}catch(e){return 'gift-'+Date.now()+'-'+Math.random().toString(36).slice(2)}};
  const safe=s=>{try{return typeof esc==='function'?esc(s):String(s??'')}catch(e){return String(s??'')}};

  function replacePanel(){
    id('giftPanel')?.remove(); id('giftResultModal')?.remove(); id('tabGift')?.remove();
    const lucky=id('luckyPanel'); if(!lucky) return;
    const panel=document.createElement('section');
    panel.id='giftPanel'; panel.className='panel giftPanel giftPanelV2 hide';
    panel.innerHTML=`<section class="giftZoneCard">
      <div class="giftZoneHead"><div class="giftZoneKicker">燃 生 纪 · 礼 遇</div><div class="giftZoneTitle">🎡 礼品专区</div><div class="giftZoneSub">输入礼品码 · 转动好运 · 赢取惊喜好礼</div></div>
      <div class="giftCampaignBanner"><strong>本期大奖</strong><b>5000元消费券 × 3</b><span>共 100 个参与名额 · 指定中奖账号由后台锁定</span></div>
      <div class="giftWheelArea"><div class="giftWheelShell"><div class="giftWheelOuter"></div><div id="giftWheel" class="giftWheel giftWheel6">
        <div class="giftSegmentLabel s0"><i>🎫</i>5000券</div><div class="giftSegmentLabel s1"><i>🚬</i>香烟</div><div class="giftSegmentLabel s2"><i>💄</i>口红</div><div class="giftSegmentLabel s3"><i>❄️</i>空调</div><div class="giftSegmentLabel s4"><i>📱</i>苹果17</div><div class="giftSegmentLabel s5"><i>✨</i>谢谢惠顾</div>
      </div><div class="giftHub">好运<br>转盘<small>GIFT</small></div><div class="giftPointer"></div></div></div>
      <div class="giftLegend giftLegend6"><div class="giftLegendItem voucher"><b>🎫</b>5000券</div><div class="giftLegendItem"><b>🚬</b>香烟</div><div class="giftLegendItem"><b>💄</b>口红</div><div class="giftLegendItem"><b>❄️</b>空调</div><div class="giftLegendItem"><b>📱</b>苹果17</div><div class="giftLegendItem"><b>✨</b>谢谢惠顾</div></div>
      <div id="giftGuest" class="giftGuest"><button id="giftLoginBtn" class="btn btnGold">登录后使用礼品码</button></div>
      <div id="giftMember" class="hide"><div id="giftIdentity" class="giftIdentity">当前账号：<b>--</b></div><div class="giftForm"><input id="giftCode" maxlength="30" placeholder="输入礼品码" autocomplete="off"><button id="giftSpinBtn" class="giftSpinBtn">开始转动</button></div></div>
      <div class="giftRule"><strong>活动说明：</strong>礼品码不消耗普通盲盒次数；每个账号对同一礼品码仅能参与一次。5000元消费券属于本期定向大奖，仅后台指定的中奖账号可获得。香烟奖品仅限符合所在地法定年龄及当地法律要求的用户领取。</div>
    </section>`;
    lucky.after(panel);
    const nav=document.querySelector('.bottomNav'),my=id('tabMy');
    if(nav){nav.classList.add('giftNav4');const b=document.createElement('button');b.id='tabGift';b.className='navBtn';b.innerHTML='<i>🎡</i>礼品专区';b.onclick=()=>window.switchTab('gift');nav.insertBefore(b,my||null)}
    const modal=document.createElement('div');modal.id='giftResultModal';modal.className='modal giftResultModal';modal.innerHTML=`<div class="modalCard"><button id="giftResultX" class="closeX">×</button><div id="giftResultIcon" class="giftResultIcon">🎁</div><div id="giftResultTitle" class="giftResultTitle">恭喜获得</div><div id="giftResultPrize" class="giftResultPrize">礼品</div><div id="giftResultMeta" class="giftResultMeta"></div><div id="giftAdultNote" class="giftAdultNote hide"></div><button id="giftResultClose" class="btn btnGold giftResultClose">返回礼品专区</button></div>`;document.body.appendChild(modal);
    modal.onclick=e=>{if(e.target===modal)closeResult()}; id('giftResultX').onclick=closeResult; id('giftResultClose').onclick=closeResult;
    id('giftLoginBtn').onclick=()=>{loginPending=true;openLoginModal('home','登录后使用礼品码参与礼品转盘')};
    id('giftSpinBtn').onclick=draw; id('giftCode').onkeydown=e=>{if(e.key==='Enter')draw()}; renderSessionV2();
  }
  function renderSessionV2(){const s=currentSession(),g=id('giftGuest'),m=id('giftMember');if(!g||!m)return;g.classList.toggle('hide',!!s);m.classList.toggle('hide',!s);if(s)id('giftIdentity').innerHTML='当前账号：<b>'+safe(s.name||'--')+'</b>（'+safe(s.code||'--')+'）'}
  function patchLogin(){if(typeof window.loginMember==='function'&&!window.loginMember.__giftV2Patched){const base=window.loginMember;const w=async function(){const out=await base.apply(this,arguments);if(loginPending&&currentSession()){loginPending=false;setTimeout(()=>window.switchTab('gift'),40)}return out};w.__giftV2Patched=true;window.loginMember=w}if(typeof window.renderSession==='function'&&!window.renderSession.__giftV2Patched){const base=window.renderSession;const w=function(){const out=base.apply(this,arguments);renderSessionV2();return out};w.__giftV2Patched=true;window.renderSession=w}}
  function getPending(){try{return JSON.parse(localStorage.getItem(PENDING_KEY)||'null')}catch(e){localStorage.removeItem(PENDING_KEY);return null}}
  function savePending(p){localStorage.setItem(PENDING_KEY,JSON.stringify(p))}function clearPending(){localStorage.removeItem(PENDING_KEY)}
  async function draw(){const s=currentSession();if(!s){loginPending=true;openLoginModal('home','登录后使用礼品码参与礼品转盘');return}if(spinning)return;const code=(id('giftCode')?.value||'').trim().toUpperCase();if(!/^[A-Z0-9_-]{4,30}$/.test(code)){showNotice('请输入正确的礼品码后再转动。','礼品专区','🎡');return}let p=getPending();if(!p||p.memberCode!==s.code||p.giftCode!==code){p={requestId:reqId(),giftCode:code,memberCode:s.code};savePending(p)}const btn=id('giftSpinBtn'),wheel=id('giftWheel');spinning=true;btn.disabled=true;btn.textContent='礼品码确认中…';wheel?.classList.add('isChecking');let d;try{d=await rpc('member_session_gift_draw_safe',{p_token:s.token,p_request_id:p.requestId,p_gift_code:code})}catch(e){d={ok:false,network_error:true,message:'网络连接有些波动'}}wheel?.classList.remove('isChecking');if(!d?.ok){spinning=false;btn.disabled=false;btn.textContent='开始转动';if(!d?.network_error)clearPending();showNotice(d?.network_error?'网络有些波动，这次礼品开奖编号已经保存。恢复网络后用同一礼品码重试即可确认原结果。':(d?.message||'礼品码暂时无法使用'),'礼品专区',d?.network_error?'🛡️':'🎡');return}clearPending();const idx=Math.max(0,PRIZES.findIndex(x=>x.key===d.prize_key));await spinTo(idx);openResult(d);spinning=false;btn.disabled=false;btn.textContent='开始转动'}
  async function spinTo(index){const wheel=id('giftWheel');if(!wheel)return;const current=((wheelRotation%360)+360)%360,desired=((360-index*60)%360+360)%360,align=(desired-current+360)%360;wheelRotation+=7*360+align;wheel.style.transition='transform 5.4s cubic-bezier(.12,.72,.16,1)';wheel.style.transform='rotate('+wheelRotation+'deg)';try{tone(330,.08,.025,'triangle');setTimeout(()=>tone(520,.10,.028,'triangle'),1200);setTimeout(()=>tone(760,.12,.032,'triangle'),3000);setTimeout(()=>tone(1040,.20,.045,'sine'),5000)}catch(e){}await sleep(5550)}
  function openResult(d){const p=PRIZES.find(x=>x.key===d.prize_key)||PRIZES[5],thanks=d.prize_key==='thanks',voucher=d.prize_key==='voucher5000';id('giftResultIcon').textContent=p.icon;id('giftResultTitle').textContent=thanks?'感谢参与':'🎉 '+safe(d.display_name||'')+'，恭喜获得';id('giftResultPrize').textContent=d.prize_label||p.label;id('giftResultMeta').innerHTML='礼品码：'+safe(d.gift_code||'')+'<br>流水号：'+safe(d.serial||'')+(d.remaining_slots!=null?'<br>剩余名额：'+Number(d.remaining_slots):'');const adult=id('giftAdultNote');if(d.requires_adult){adult.textContent='该奖品属于年龄限制品类，仅限符合所在地法定年龄及当地法律要求的用户领取。';adult.classList.remove('hide')}else if(voucher){adult.textContent='5000元消费券为本期指定大奖，请按活动兑奖规则联系工作人员领取。';adult.classList.remove('hide')}else{adult.textContent='';adult.classList.add('hide')}id('giftResultModal').classList.add('show');document.body.style.overflow='hidden';try{if(!thanks)coins(voucher||d.prize_key==='iphone17'||d.prize_key==='air_conditioner')}catch(e){}}
  function closeResult(){id('giftResultModal')?.classList.remove('show');if(!id('resultModal')?.classList.contains('show')&&!id('historyModal')?.classList.contains('show'))document.body.style.overflow=''}
  function addCss(){const s=document.createElement('style');s.textContent=`.giftCampaignBanner{margin:10px 0 2px;padding:10px 12px;border:1px solid #8c6727;border-radius:12px;background:radial-gradient(circle at 50% 0,#d99f2930,transparent 56%),#0b1017;text-align:center}.giftCampaignBanner strong{display:block;font-size:9px;letter-spacing:3px;color:#a98e5e}.giftCampaignBanner b{display:block;margin-top:2px;font-size:21px;color:#ffe28b;text-shadow:0 0 15px #e6ac3440}.giftCampaignBanner span{display:block;margin-top:3px;font-size:8px;color:#9b8a6b}.giftWheel6{background:conic-gradient(from -30deg,#8f6817 0 60deg,#7a3128 60deg 120deg,#6d2d59 120deg 180deg,#175d72 180deg 240deg,#283b79 240deg 300deg,#5c491d 300deg 360deg)!important}.giftWheel6:before{background:repeating-conic-gradient(from -30deg,transparent 0 59.1deg,#f5d779aa 59.1deg 60deg)!important}.giftPanelV2 .giftSegmentLabel.s0{transform:rotate(0deg) translateY(-31.5cqw) rotate(0deg)!important}.giftPanelV2 .giftSegmentLabel.s1{transform:rotate(60deg) translateY(-31.5cqw) rotate(-60deg)!important}.giftPanelV2 .giftSegmentLabel.s2{transform:rotate(120deg) translateY(-31.5cqw) rotate(-120deg)!important}.giftPanelV2 .giftSegmentLabel.s3{transform:rotate(180deg) translateY(-31.5cqw) rotate(-180deg)!important}.giftPanelV2 .giftSegmentLabel.s4{transform:rotate(240deg) translateY(-31.5cqw) rotate(-240deg)!important}.giftPanelV2 .giftSegmentLabel.s5{transform:rotate(300deg) translateY(-31.5cqw) rotate(-300deg)!important}.giftLegend6{grid-template-columns:repeat(6,1fr)!important}.giftLegend6 .voucher{border-color:#b78b34;background:linear-gradient(180deg,#2c210a,#0b1017);color:#ffe28b}.giftPanelV2 .giftSegmentLabel{font-size:4.1cqw!important}.giftPanelV2 .giftSegmentLabel i{font-size:6.6cqw!important}@media(max-width:420px){.giftLegend6{grid-template-columns:repeat(3,1fr)!important}.giftPanelV2 .giftSegmentLabel{font-size:3.9cqw!important}}`;document.head.appendChild(s)}
  function init(){addCss();setTimeout(()=>{replacePanel();patchLogin()},0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
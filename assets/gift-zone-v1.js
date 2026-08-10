/* GIFT ZONE V1 — injected gift wheel + safe gift-code draw */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_ZONE_V1__) return;
  window.__RSJ_GIFT_ZONE_V1__=true;

  const PRIZES=[
    {key:'cigarette',label:'香烟',icon:'🚬'},
    {key:'lipstick',label:'口红',icon:'💄'},
    {key:'air_conditioner',label:'空调',icon:'❄️'},
    {key:'iphone17',label:'苹果17',icon:'📱'},
    {key:'thanks',label:'谢谢惠顾',icon:'✨'}
  ];
  const PENDING_KEY='rsj_pending_gift_draw';
  let spinning=false;
  let wheelRotation=0;
  let giftLoginPending=false;

  const byId=id=>document.getElementById(id);
  const currentSession=()=>{try{return typeof session!=='undefined'?session:null}catch(e){return null}};
  const safeEsc=s=>{try{return typeof esc==='function'?esc(s):String(s??'')}catch(e){return String(s??'')}};
  const makeReq=()=>{try{return typeof newRequestId==='function'?newRequestId():'gift-'+Date.now()+'-'+Math.random().toString(36).slice(2)}catch(e){return 'gift-'+Date.now()+'-'+Math.random().toString(36).slice(2)}};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  function buildPanel(){
    if(byId('giftPanel')) return;
    const lucky=byId('luckyPanel');
    const my=byId('myPanel');
    if(!lucky||!my) return;

    const panel=document.createElement('section');
    panel.id='giftPanel';
    panel.className='panel giftPanel hide';
    panel.innerHTML=`
      <section class="giftZoneCard">
        <div class="giftZoneHead">
          <div class="giftZoneKicker">燃 生 纪 · 礼 遇</div>
          <div class="giftZoneTitle">🎡 礼品专区</div>
          <div class="giftZoneSub">输入礼品码 · 转动好运 · 赢取惊喜实物</div>
        </div>
        <div class="giftWheelArea">
          <div class="giftWheelShell">
            <div class="giftWheelOuter"></div>
            <div id="giftWheel" class="giftWheel">
              <div class="giftSegmentLabel s0"><i>🚬</i>香烟</div>
              <div class="giftSegmentLabel s1"><i>💄</i>口红</div>
              <div class="giftSegmentLabel s2"><i>❄️</i>空调</div>
              <div class="giftSegmentLabel s3"><i>📱</i>苹果17</div>
              <div class="giftSegmentLabel s4"><i>✨</i>谢谢惠顾</div>
            </div>
            <div class="giftHub">好运<br>转盘<small>GIFT</small></div>
            <div class="giftPointer"></div>
          </div>
        </div>
        <div class="giftLegend">
          <div class="giftLegendItem"><b>🚬</b>香烟</div>
          <div class="giftLegendItem"><b>💄</b>口红</div>
          <div class="giftLegendItem"><b>❄️</b>空调</div>
          <div class="giftLegendItem"><b>📱</b>苹果17</div>
          <div class="giftLegendItem"><b>✨</b>谢谢惠顾</div>
        </div>
        <div id="giftGuest" class="giftGuest">
          <button id="giftLoginBtn" class="btn btnGold">登录后使用礼品码</button>
        </div>
        <div id="giftMember" class="hide">
          <div id="giftIdentity" class="giftIdentity">当前账号：<b>--</b></div>
          <div class="giftForm">
            <input id="giftCode" maxlength="30" placeholder="输入礼品码，例如 GIFT2026" autocomplete="off">
            <button id="giftSpinBtn" class="giftSpinBtn">开始转动</button>
          </div>
        </div>
        <div class="giftRule"><strong>礼品专区说明：</strong>礼品码不消耗普通盲盒次数，每个账号对同一礼品码仅可使用一次。香烟奖品仅限符合所在地法定年龄的用户领取，具体兑奖以当地法律及活动规则为准。</div>
      </section>`;
    lucky.after(panel);

    const nav=document.querySelector('.bottomNav');
    const myBtn=byId('tabMy');
    if(nav&&!byId('tabGift')){
      nav.classList.add('giftNav4');
      const btn=document.createElement('button');
      btn.id='tabGift';
      btn.className='navBtn';
      btn.innerHTML='<i>🎡</i>礼品专区';
      btn.addEventListener('click',()=>window.switchTab('gift'));
      nav.insertBefore(btn,myBtn||null);
    }

    const modal=document.createElement('div');
    modal.id='giftResultModal';
    modal.className='modal giftResultModal';
    modal.innerHTML=`<div class="modalCard">
      <button id="giftResultX" class="closeX">×</button>
      <div id="giftResultIcon" class="giftResultIcon">🎁</div>
      <div id="giftResultTitle" class="giftResultTitle">恭喜获得</div>
      <div id="giftResultPrize" class="giftResultPrize">礼品</div>
      <div id="giftResultMeta" class="giftResultMeta"></div>
      <div id="giftAdultNote" class="giftAdultNote hide"></div>
      <button id="giftResultClose" class="btn btnGold giftResultClose">返回礼品专区</button>
    </div>`;
    modal.addEventListener('click',e=>{if(e.target===modal) closeGiftResult()});
    document.body.appendChild(modal);

    byId('giftLoginBtn').addEventListener('click',()=>{
      giftLoginPending=true;
      if(typeof openLoginModal==='function') openLoginModal('home','登录后使用礼品码参与礼品转盘');
    });
    byId('giftSpinBtn').addEventListener('click',giftDraw);
    byId('giftCode').addEventListener('keydown',e=>{if(e.key==='Enter') giftDraw()});
    byId('giftResultX').addEventListener('click',closeGiftResult);
    byId('giftResultClose').addEventListener('click',closeGiftResult);
    renderGiftSession();
  }

  function renderGiftSession(){
    const s=currentSession();
    const guest=byId('giftGuest'),member=byId('giftMember'),identity=byId('giftIdentity');
    if(!guest||!member) return;
    guest.classList.toggle('hide',!!s);
    member.classList.toggle('hide',!s);
    if(s&&identity) identity.innerHTML='当前账号：<b>'+safeEsc(s.name||'--')+'</b>（'+safeEsc(s.code||'--')+'）';
  }

  function patchSiteFunctions(){
    if(typeof window.switchTab==='function'&&!window.switchTab.__giftPatched){
      const baseSwitch=window.switchTab;
      const wrapped=function(t){
        const gift=byId('giftPanel'),giftBtn=byId('tabGift');
        if(t==='gift'){
          ['homePanel','luckyPanel','myPanel'].forEach(id=>byId(id)?.classList.add('hide'));
          gift?.classList.remove('hide');
          document.querySelectorAll('.bottomNav .navBtn').forEach(x=>x.classList.remove('active'));
          giftBtn?.classList.add('active');
          renderGiftSession();
          window.scrollTo({top:0,behavior:'smooth'});
          return;
        }
        gift?.classList.add('hide');
        giftBtn?.classList.remove('active');
        return baseSwitch.apply(this,arguments);
      };
      wrapped.__giftPatched=true;
      window.switchTab=wrapped;
    }

    if(typeof window.renderSession==='function'&&!window.renderSession.__giftPatched){
      const baseRender=window.renderSession;
      const wrapped=function(){const out=baseRender.apply(this,arguments);renderGiftSession();return out};
      wrapped.__giftPatched=true;
      window.renderSession=wrapped;
    }

    if(typeof window.loginMember==='function'&&!window.loginMember.__giftPatched){
      const baseLogin=window.loginMember;
      const wrapped=async function(){
        const out=await baseLogin.apply(this,arguments);
        if(giftLoginPending&&currentSession()){
          giftLoginPending=false;
          setTimeout(()=>window.switchTab('gift'),30);
        }
        return out;
      };
      wrapped.__giftPatched=true;
      window.loginMember=wrapped;
    }
  }

  function pendingGift(){try{return JSON.parse(localStorage.getItem(PENDING_KEY)||'null')}catch(e){localStorage.removeItem(PENDING_KEY);return null}}
  function savePending(req,code,s){localStorage.setItem(PENDING_KEY,JSON.stringify({requestId:req,giftCode:code,memberCode:s.code,createdAt:Date.now()}))}
  function clearPending(){localStorage.removeItem(PENDING_KEY)}

  async function giftDraw(){
    const s=currentSession();
    if(!s){giftLoginPending=true; if(typeof openLoginModal==='function') openLoginModal('home','登录后使用礼品码参与礼品转盘'); return}
    if(spinning) return;
    const input=byId('giftCode');
    const btn=byId('giftSpinBtn');
    const wheel=byId('giftWheel');
    const code=(input?.value||'').trim().toUpperCase();
    if(!/^[A-Z0-9_-]{4,30}$/.test(code)){
      if(typeof showNotice==='function') showNotice('请输入正确的礼品码后再转动。','礼品专区','🎡');
      return;
    }

    let p=pendingGift();
    if(!p||p.memberCode!==s.code||p.giftCode!==code){
      p={requestId:makeReq(),giftCode:code,memberCode:s.code};
      savePending(p.requestId,code,s);
    }

    spinning=true;
    if(btn){btn.disabled=true;btn.textContent='礼品码确认中…'}
    wheel?.classList.add('isChecking');
    let d;
    try{
      d=await rpc('member_session_gift_draw_safe',{p_token:s.token,p_request_id:p.requestId,p_gift_code:code});
    }catch(e){d={ok:false,network_error:true,message:'网络连接有些波动，请稍后重试'}}

    wheel?.classList.remove('isChecking');
    if(wheel) void wheel.offsetWidth;

    if(!d||!d.ok){
      spinning=false;
      if(btn){btn.disabled=false;btn.textContent='开始转动'}
      if(!d?.network_error) clearPending();
      if(typeof showNotice==='function') showNotice(d?.network_error?'网络有些波动，这次礼品开奖编号已经保存。恢复网络后用同一礼品码重试即可确认原结果。':(d?.message||'礼品码暂时无法使用'),'礼品专区',d?.network_error?'🛡️':'🎡');
      return;
    }

    clearPending();
    const idx=Math.max(0,PRIZES.findIndex(x=>x.key===d.prize_key));
    await spinTo(idx);
    openGiftResult(d);
    spinning=false;
    if(btn){btn.disabled=false;btn.textContent='开始转动'}
  }

  async function spinTo(index){
    const wheel=byId('giftWheel');
    if(!wheel) return;
    const current=((wheelRotation%360)+360)%360;
    const desired=((360-index*72)%360+360)%360;
    const align=(desired-current+360)%360;
    wheelRotation+=6*360+align;
    wheel.style.transition='transform 5.2s cubic-bezier(.12,.72,.16,1)';
    wheel.style.transform='rotate('+wheelRotation+'deg)';
    try{
      if(typeof tone==='function'){
        tone(330,.08,.025,'triangle');
        setTimeout(()=>tone(520,.10,.028,'triangle'),1100);
        setTimeout(()=>tone(720,.12,.032,'triangle'),2700);
        setTimeout(()=>tone(980,.18,.04,'sine'),4700);
      }
    }catch(e){}
    await sleep(5350);
  }

  function openGiftResult(d){
    const prize=PRIZES.find(x=>x.key===d.prize_key)||PRIZES[4];
    const isThanks=d.prize_key==='thanks';
    byId('giftResultIcon').textContent=prize.icon;
    byId('giftResultTitle').textContent=isThanks?'感谢参与':'🎉 '+safeEsc(d.display_name||'')+'，恭喜获得';
    byId('giftResultPrize').textContent=d.prize_label||prize.label;
    byId('giftResultMeta').innerHTML='礼品码：'+safeEsc(d.gift_code||'')+'<br>流水号：'+safeEsc(d.serial||'')+(d.remaining_slots!=null?'<br>剩余名额：'+Number(d.remaining_slots):'');
    const adult=byId('giftAdultNote');
    if(d.requires_adult){adult.textContent='该奖品属于年龄限制品类，仅限符合所在地法定年龄及当地法律要求的用户领取。';adult.classList.remove('hide')}else{adult.textContent='';adult.classList.add('hide')}
    byId('giftResultModal').classList.add('show');
    document.body.style.overflow='hidden';
    try{if(!isThanks&&typeof coins==='function') coins(d.prize_key==='iphone17'||d.prize_key==='air_conditioner')}catch(e){}
  }

  function closeGiftResult(){
    byId('giftResultModal')?.classList.remove('show');
    if(!byId('resultModal')?.classList.contains('show')&&!byId('historyModal')?.classList.contains('show')) document.body.style.overflow='';
  }

  function init(){buildPanel();patchSiteFunctions();renderGiftSession()}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();

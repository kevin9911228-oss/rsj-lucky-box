/* GIFT ZONE V5 — four-tier campaign: bracelet / iPhone17 / Coach / 68 voucher */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_ZONE_V5__) return;
  window.__RSJ_GIFT_ZONE_V5__=true;

  const PENDING_KEY='rsj_pending_gift_draw';
  const SEGMENT=60;
  const INDEXES={gold_bracelet:[0],iphone17:[1],coach_bag:[2,4],voucher68:[3,5]};
  const ICONS={gold_bracelet:'🏆',iphone17:'📱',coach_bag:'👜',voucher68:'🎫'};
  const TIERS={gold_bracelet:'一等奖',iphone17:'二等奖',coach_bag:'三等奖',voucher68:'鼓励奖'};
  let spinning=false,rotation=0,raf=0,lastTick=-1,loginPending=false;

  const id=x=>document.getElementById(x);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const currentSession=()=>{try{return typeof session!=='undefined'?session:null}catch{return null}};
  const safe=s=>{try{return typeof esc==='function'?esc(s):String(s??'')}catch{return String(s??'')}};
  const requestId=()=>{try{return typeof newRequestId==='function'?newRequestId():'gift-'+Date.now()+'-'+Math.random().toString(36).slice(2)}catch{return 'gift-'+Date.now()+'-'+Math.random().toString(36).slice(2)}};
  const easeOutQuint=t=>1-Math.pow(1-t,5),easeOutCubic=t=>1-Math.pow(1-t,3);

  function playTone(freq,dur=.02,gain=.018,type='square'){try{if(typeof tone==='function')tone(freq,dur,gain,type)}catch{}}
  function tick(speed=1){playTone(Math.min(920,390+speed*430),.014,.012,'square')}
  function finale(key){
    if(key!=='voucher68'){
      playTone(660,.10,.035,'sine');setTimeout(()=>playTone(990,.12,.04,'sine'),110);setTimeout(()=>playTone(1320,.18,.045,'sine'),245);
    }else{playTone(520,.07,.022,'triangle');setTimeout(()=>playTone(720,.10,.02,'triangle'),120)}
  }
  function setRotation(wheel,value){rotation=value;wheel.style.transform=`rotate(${rotation}deg)`;wheel.dataset.rsjRotation=String(rotation);const t=Math.floor(rotation/SEGMENT);if(t!==lastTick){lastTick=t;return true}return false}
  function startCruise(wheel){cancelAnimationFrame(raf);wheel.style.transition='none';wheel.classList.add('giftWheelSpinning');wheel.classList.remove('giftWheelSettled');const start=performance.now();let prev=start,active=true;const loop=now=>{if(!active)return;const dt=Math.min((now-prev)/1000,.05);prev=now;const elapsed=(now-start)/1000,velocity=560+Math.min(1,elapsed/.55)*390;if(setRotation(wheel,rotation+velocity*dt))tick(Math.min(1,velocity/950));raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);return()=>{active=false;cancelAnimationFrame(raf)}}
  async function animateRotation(wheel,target,duration,ease=easeOutQuint){cancelAnimationFrame(raf);wheel.style.transition='none';const startRot=rotation,start=performance.now(),delta=target-startRot;return new Promise(resolve=>{const frame=now=>{const t=Math.min(1,(now-start)/duration),next=startRot+delta*ease(t);if(setRotation(wheel,next)){tick(Math.max(.10,1-t));try{if(navigator.vibrate&&t>.72)navigator.vibrate(8)}catch{}}if(t<1)raf=requestAnimationFrame(frame);else resolve()};raf=requestAnimationFrame(frame)})}
  function desiredAngle(index){return ((360-index*SEGMENT)%360+360)%360}
  async function settleTo(wheel,index){const cur=((rotation%360)+360)%360,desired=desiredAngle(index),align=(desired-cur+360)%360,target=rotation+5*360+align;await animateRotation(wheel,target,5100,easeOutQuint);wheel.classList.remove('giftWheelSpinning');wheel.classList.add('giftWheelSettled');const p=document.querySelector('#giftPanel .giftPointer');p?.classList.remove('giftPointerHit');void p?.offsetWidth;p?.classList.add('giftPointerHit');await sleep(180)}
  async function brake(wheel){await animateRotation(wheel,rotation+300,720,easeOutCubic);wheel.classList.remove('giftWheelSpinning')}
  function pending(){try{return JSON.parse(localStorage.getItem(PENDING_KEY)||'null')}catch{localStorage.removeItem(PENDING_KEY);return null}}
  function savePending(p){localStorage.setItem(PENDING_KEY,JSON.stringify(p))}function clearPending(){localStorage.removeItem(PENDING_KEY)}

  function applyCampaignUI(){
    const panel=id('giftPanel'),wheel=id('giftWheel');if(!panel||!wheel)return false;
    const banner=panel.querySelector('.giftCampaignBanner');
    if(banner)banner.innerHTML='<strong>本期奖池</strong><b>一等奖 黄金手链 × 3</b><span>二等奖 苹果17 × 5 · 三等奖 蔻驰包包 × 10 · 鼓励奖 68元消费券</span>';
    const labels=[...panel.querySelectorAll('.giftSegmentLabel')];
    const html=['<i>🏆</i>黄金手链','<i>📱</i>苹果17','<i>👜</i>蔻驰包包','<i>🎫</i>68元券','<i>👜</i>蔻驰包包','<i>🎫</i>68元券'];
    labels.forEach((n,i)=>{if(html[i])n.innerHTML=html[i]});
    const legend=panel.querySelector('.giftLegend');if(legend){legend.className='giftLegend giftLegendTierV5';legend.innerHTML='<div class="giftLegendItem first"><b>🏆</b><span>一等奖</span>黄金手链 × 3</div><div class="giftLegendItem second"><b>📱</b><span>二等奖</span>苹果17 × 5</div><div class="giftLegendItem third"><b>👜</b><span>三等奖</span>蔻驰包包 × 10</div><div class="giftLegendItem encourage"><b>🎫</b><span>鼓励奖</span>68元消费券</div>'}
    const rule=panel.querySelector('.giftRule');if(rule)rule.innerHTML='<strong>活动说明：</strong>输入礼品码即可参与转盘，每个账号对同一礼品码仅能参与一次。';
    wheel.classList.remove('giftWheelCurrent');wheel.classList.add('giftWheelTierV5');
    return true;
  }

  function chooseIndex(key){const arr=INDEXES[key]||INDEXES.voucher68;return arr[Math.floor(Math.random()*arr.length)]}
  function openResult(d){
    const key=d.prize_key||'voucher68',tier=TIERS[key]||'鼓励奖',premium=key!=='voucher68';
    id('giftResultIcon').textContent=ICONS[key]||'🎁';
    id('giftResultTitle').textContent='🎉 '+safe(d.display_name||'')+'，恭喜获得';
    id('giftResultPrize').textContent=tier+' · '+(d.prize_label||'68元消费券');
    id('giftResultMeta').innerHTML='礼品码：'+safe(d.gift_code||'')+'<br>流水号：'+safe(d.serial||'')+(d.remaining_slots!=null?'<br>剩余名额：'+Number(d.remaining_slots):'');
    const note=id('giftAdultNote');
    if(premium){note.textContent='请按本期活动兑奖规则领取实物奖品。';note.classList.remove('hide')}else{note.textContent='68元消费券为本期鼓励奖。';note.classList.remove('hide')}
    id('giftResultModal')?.classList.add('show');document.body.style.overflow='';
    try{if(premium&&typeof coins==='function')coins(true)}catch{}
  }

  async function drawV5(){
    const s=currentSession();if(!s){loginPending=true;if(typeof openLoginModal==='function')openLoginModal('home','登录后使用礼品码参与礼品转盘');return}if(spinning)return;
    const input=id('giftCode'),btn=id('giftSpinBtn'),wheel=id('giftWheel');if(!input||!btn||!wheel)return;
    const code=input.value.trim().toUpperCase();if(!/^[A-Z0-9_-]{4,30}$/.test(code)){if(typeof showNotice==='function')showNotice('请输入正确的礼品码后再转动。','礼品专区','🎡');return}
    let p=pending();if(!p||p.memberCode!==s.code||p.giftCode!==code){p={requestId:requestId(),giftCode:code,memberCode:s.code};savePending(p)}
    spinning=true;btn.disabled=true;btn.textContent='转动中…';input.disabled=true;rotation=Number(wheel.dataset.rsjRotation||0)||0;lastTick=Math.floor(rotation/SEGMENT);playTone(280,.055,.026,'triangle');const stop=startCruise(wheel);
    let d;try{const req=rpc('member_session_gift_draw_safe',{p_token:s.token,p_request_id:p.requestId,p_gift_code:code});[d]=await Promise.all([req,sleep(900)])}catch{d={ok:false,network_error:true,message:'网络连接有些波动'}}
    stop();if(!d?.ok){await brake(wheel);spinning=false;btn.disabled=false;btn.textContent='开始转动';input.disabled=false;if(!d?.network_error)clearPending();if(typeof showNotice==='function')showNotice(d?.network_error?'网络有些波动，这次礼品开奖编号已经保存。恢复网络后用同一礼品码重试即可确认原结果。':(d?.message||'礼品码暂时无法使用'),'礼品专区',d?.network_error?'🛡️':'🎡');return}
    clearPending();await settleTo(wheel,chooseIndex(d.prize_key));finale(d.prize_key);await sleep(260);openResult(d);spinning=false;btn.disabled=false;btn.textContent='开始转动';input.disabled=false;
  }

  function replaceControls(){
    const oldBtn=id('giftSpinBtn'),oldInput=id('giftCode');if(!oldBtn||!oldInput)return false;if(oldBtn.dataset.giftV5==='1')return true;
    const btn=oldBtn.cloneNode(true),input=oldInput.cloneNode(true);btn.dataset.giftV5='1';btn.disabled=false;btn.textContent='开始转动';input.disabled=false;oldBtn.replaceWith(btn);oldInput.replaceWith(input);btn.addEventListener('click',drawV5);input.addEventListener('keydown',e=>{if(e.key==='Enter')drawV5()});return true;
  }

  function addStyle(){if(id('giftV5Style'))return;const s=document.createElement('style');s.id='giftV5Style';s.textContent=`
    .giftWheelTierV5{background:conic-gradient(from -30deg,#a77813 0 60deg,#334f86 60deg 120deg,#6e442a 120deg 180deg,#6e5a22 180deg 240deg,#76462b 240deg 300deg,#5b5024 300deg 360deg)!important}
    .giftWheelTierV5:before{background:repeating-conic-gradient(from -30deg,transparent 0 59.1deg,#f5d779aa 59.1deg 60deg)!important}
    .giftLegendTierV5{grid-template-columns:repeat(4,1fr)!important;gap:7px!important}.giftLegendTierV5 .giftLegendItem{min-height:62px!important;font-size:9px!important;padding:7px 3px!important}.giftLegendTierV5 .giftLegendItem b{font-size:20px!important}.giftLegendTierV5 .giftLegendItem span{display:block;font-size:8px;color:#ac9b77;margin:1px 0 2px}.giftLegendTierV5 .first{border-color:#c99d3c!important;color:#ffe593!important;background:linear-gradient(180deg,#30230a,#0b1017)!important}.giftLegendTierV5 .second{border-color:#5577a8!important}.giftLegendTierV5 .third{border-color:#7c573b!important}.giftLegendTierV5 .encourage{border-color:#7d702f!important}
    #giftWheel.giftWheelSpinning{filter:brightness(1.12) drop-shadow(0 0 18px #e4b84d66)}#giftWheel.giftWheelSettled{filter:brightness(1.22) drop-shadow(0 0 24px #ffd45a88)}.giftPointerHit{animation:giftPointerHit .42s cubic-bezier(.2,.85,.25,1)}@keyframes giftPointerHit{0%{transform:translateX(-50%) scale(1)}25%{transform:translateX(-50%) scale(1.22) rotate(-7deg)}55%{transform:translateX(-50%) scale(.94) rotate(4deg)}100%{transform:translateX(-50%) scale(1)}}
    @media(max-width:420px){.giftLegendTierV5{grid-template-columns:1fr 1fr!important}.giftLegendTierV5 .giftLegendItem{min-height:56px!important}}
  `;document.head.appendChild(s)}

  function patchLogin(){if(typeof window.loginMember==='function'&&!window.loginMember.__giftV5Patched){const base=window.loginMember;const w=async function(){const out=await base.apply(this,arguments);if(loginPending&&currentSession()){loginPending=false;setTimeout(()=>window.switchTab('gift'),40)}return out};w.__giftV5Patched=true;window.loginMember=w}}
  function init(){addStyle();const run=()=>{const ok=applyCampaignUI()&&replaceControls();patchLogin();if(!ok)setTimeout(run,100)};setTimeout(run,260)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

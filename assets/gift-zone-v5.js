/* GIFT ZONE V5 — five-prize campaign: iPhone18 / 888 / 588 / 388 / 188 */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_ZONE_V5__) return;
  window.__RSJ_GIFT_ZONE_V5__=true;

  const PENDING_KEY='rsj_pending_gift_draw';
  const SEGMENT=72;
  const INDEXES={gold_bracelet:[0],iphone17:[1],coach_bag:[2],voucher68:[3],voucher188:[4]};
  const ICONS={gold_bracelet:'📱',iphone17:'👑',coach_bag:'💰',voucher68:'🪙',voucher188:'🧧'};
  const TIERS={gold_bracelet:'特等奖',iphone17:'一等奖',coach_bag:'二等奖',voucher68:'三等奖',voucher188:'四等奖'};
  const DEFAULT_LABELS={gold_bracelet:'苹果18',iphone17:'888',coach_bag:'588',voucher68:'388',voucher188:'188'};
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
    if(key==='gold_bracelet'){
      playTone(523,.16,.05,'triangle');setTimeout(()=>playTone(784,.18,.052,'triangle'),150);setTimeout(()=>playTone(1047,.22,.055,'sine'),320);setTimeout(()=>playTone(1318,.34,.05,'sine'),510);
    }else if(key==='voucher188'){
      playTone(520,.07,.022,'triangle');setTimeout(()=>playTone(720,.10,.02,'triangle'),120);
    }else{
      playTone(660,.10,.035,'sine');setTimeout(()=>playTone(990,.12,.04,'sine'),110);setTimeout(()=>playTone(1320,.18,.045,'sine'),245);
    }
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
    if(banner)banner.innerHTML='<strong>本期奖池</strong><b>苹果18 · 888 · 588 · 388 · 188</b><span>特等奖 苹果18 · 一等奖 888 · 二等奖 588 · 三等奖 388 · 四等奖 188</span>';
    const labels=[...panel.querySelectorAll('.giftSegmentLabel')];
    const html=['<i>📱</i>苹果18','<i>👑</i>888','<i>💰</i>588','<i>🪙</i>388','<i>🧧</i>188'];
    labels.forEach((n,i)=>{if(i<5)n.innerHTML=html[i];else n.style.display='none'});
    const legend=panel.querySelector('.giftLegend');if(legend){legend.className='giftLegend giftLegendTierV5';legend.innerHTML='<div class="giftLegendItem special"><b>📱</b><span>特等奖</span>苹果18</div><div class="giftLegendItem first"><b>👑</b><span>一等奖</span>888</div><div class="giftLegendItem second"><b>💰</b><span>二等奖</span>588</div><div class="giftLegendItem third"><b>🪙</b><span>三等奖</span>388</div><div class="giftLegendItem fourth"><b>🧧</b><span>四等奖</span>188</div>'}
    const rule=panel.querySelector('.giftRule');if(rule)rule.innerHTML='<strong>活动说明：</strong>输入礼品码即可参与转盘，每个账号对同一礼品码仅能参与一次。';
    wheel.classList.remove('giftWheelCurrent','giftWheelTierV4','giftWheelTierV5');wheel.classList.add('giftWheelTierV5');
    return true;
  }

  function chooseIndex(key){const arr=INDEXES[key]||INDEXES.voucher188;return arr[Math.floor(Math.random()*arr.length)]}
  function openResult(d){
    const key=d.prize_key||'voucher188',tier=TIERS[key]||'四等奖',label=d.prize_label||DEFAULT_LABELS[key]||'188';
    id('giftResultIcon').textContent=ICONS[key]||'🎁';
    id('giftResultTitle').textContent='🎉 '+safe(d.display_name||'')+'，恭喜获得';
    id('giftResultPrize').textContent=tier+' · '+label;
    id('giftResultMeta').innerHTML='礼品码：'+safe(d.gift_code||'')+'<br>流水号：'+safe(d.serial||'')+(d.remaining_slots!=null?'<br>剩余名额：'+Number(d.remaining_slots):'');
    const note=id('giftAdultNote');
    note.textContent=key==='gold_bracelet'?'恭喜获得本期特等奖，请按活动兑奖规则领取苹果18。':'请按本期活动兑奖规则领取对应奖品。';
    note.classList.remove('hide');
    id('giftResultModal')?.classList.add('show');document.body.style.overflow='';
    try{if(typeof coins==='function')coins(key==='gold_bracelet'||key==='iphone17')}catch{}
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
    const oldBtn=id('giftSpinBtn'),oldInput=id('giftCode');if(!oldBtn||!oldInput)return false;
    if(oldBtn.dataset.giftV5==='2')return true;
    const btn=oldBtn.cloneNode(true),input=oldInput.cloneNode(true);btn.dataset.giftV5='2';btn.disabled=false;btn.textContent='开始转动';input.disabled=false;oldBtn.replaceWith(btn);oldInput.replaceWith(input);btn.addEventListener('click',drawV5);input.addEventListener('keydown',e=>{if(e.key==='Enter')drawV5()});return true;
  }

  function addStyle(){if(id('giftV5Style'))id('giftV5Style').remove();const s=document.createElement('style');s.id='giftV5Style';s.textContent=`
    .giftWheelTierV5{background:conic-gradient(from -36deg,#17294e 0 72deg,#7a4b12 72deg 144deg,#553526 144deg 216deg,#465223 216deg 288deg,#71312a 288deg 360deg)!important}
    .giftWheelTierV5:before{background:repeating-conic-gradient(from -36deg,transparent 0 71deg,#f5d779c9 71deg 72deg)!important}
    .giftPanelV2 .giftSegmentLabel.s0{transform:rotate(0deg) translateY(-31.5cqw) rotate(0deg)!important}
    .giftPanelV2 .giftSegmentLabel.s1{transform:rotate(72deg) translateY(-31.5cqw) rotate(-72deg)!important}
    .giftPanelV2 .giftSegmentLabel.s2{transform:rotate(144deg) translateY(-31.5cqw) rotate(-144deg)!important}
    .giftPanelV2 .giftSegmentLabel.s3{transform:rotate(216deg) translateY(-31.5cqw) rotate(-216deg)!important}
    .giftPanelV2 .giftSegmentLabel.s4{transform:rotate(288deg) translateY(-31.5cqw) rotate(-288deg)!important}
    .giftPanelV2 .giftSegmentLabel.s5{display:none!important}
    .giftPanelV2 .giftSegmentLabel{font-size:4.35cqw!important;font-weight:1000!important;text-shadow:0 2px 5px #000,0 0 10px #000!important}.giftPanelV2 .giftSegmentLabel i{font-size:6.8cqw!important}
    .giftLegendTierV5{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:7px!important}.giftLegendTierV5 .giftLegendItem{min-height:70px!important;font-size:10px!important;padding:8px 3px!important}.giftLegendTierV5 .giftLegendItem b{font-size:23px!important}.giftLegendTierV5 .giftLegendItem span{display:block;font-size:8px;color:#ac9b77;margin:1px 0 3px}.giftLegendTierV5 .special{border-color:#e4b34e!important;color:#ffe593!important;background:radial-gradient(circle at 50% 0,#a2732635,transparent 55%),linear-gradient(180deg,#2f230b,#0b1017)!important;box-shadow:0 0 15px #d8a83a20}.giftLegendTierV5 .first{border-color:#c99d3c!important}.giftLegendTierV5 .second{border-color:#85644a!important}.giftLegendTierV5 .third{border-color:#707a34!important}.giftLegendTierV5 .fourth{border-color:#8c4d48!important}
    #giftWheel.giftWheelSpinning{filter:brightness(1.12) drop-shadow(0 0 18px #e4b84d66)}#giftWheel.giftWheelSettled{filter:brightness(1.22) drop-shadow(0 0 24px #ffd45a88)}.giftPointerHit{animation:giftPointerHit .42s cubic-bezier(.2,.85,.25,1)}@keyframes giftPointerHit{0%{transform:translateX(-50%) scale(1)}25%{transform:translateX(-50%) scale(1.22) rotate(-7deg)}55%{transform:translateX(-50%) scale(.94) rotate(4deg)}100%{transform:translateX(-50%) scale(1)}}
    @media(max-width:420px){.giftLegendTierV5{gap:4px!important}.giftLegendTierV5 .giftLegendItem{min-height:61px!important;font-size:8px!important;padding:6px 1px!important}.giftLegendTierV5 .giftLegendItem b{font-size:18px!important}.giftLegendTierV5 .giftLegendItem span{font-size:7px!important}.giftPanelV2 .giftSegmentLabel{font-size:3.95cqw!important}.giftPanelV2 .giftSegmentLabel i{font-size:6.1cqw!important}}
  `;document.head.appendChild(s)}

  function patchLogin(){if(typeof window.loginMember==='function'&&!window.loginMember.__giftV5Patched){const base=window.loginMember;const w=async function(){const out=await base.apply(this,arguments);if(loginPending&&currentSession()){loginPending=false;setTimeout(()=>window.switchTab('gift'),40)}return out};w.__giftV5Patched=true;window.loginMember=w}}
  function init(){addStyle();const run=()=>{const ok=applyCampaignUI()&&replaceControls();patchLogin();if(!ok)setTimeout(run,100)};setTimeout(run,260)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

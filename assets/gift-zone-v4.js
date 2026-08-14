/* GIFT ZONE V4 — immediate fast spin, mechanical ticks, slow settle, mixed voucher/random campaign */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_ZONE_V4__) return;
  window.__RSJ_GIFT_ZONE_V4__=true;

  const PENDING_KEY='rsj_pending_gift_draw';
  const SEGMENT=60;
  let spinning=false;
  let rotation=0;
  let raf=0;
  let lastTick=-1;
  let loginPending=false;

  const id=x=>document.getElementById(x);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const currentSession=()=>{try{return typeof session!=='undefined'?session:null}catch{return null}};
  const safe=s=>{try{return typeof esc==='function'?esc(s):String(s??'')}catch{return String(s??'')}};
  const requestId=()=>{try{return typeof newRequestId==='function'?newRequestId():'gift-'+Date.now()+'-'+Math.random().toString(36).slice(2)}catch{return 'gift-'+Date.now()+'-'+Math.random().toString(36).slice(2)}};
  const easeOutQuint=t=>1-Math.pow(1-t,5);
  const easeOutCubic=t=>1-Math.pow(1-t,3);

  function playTone(freq,dur=.02,gain=.018,type='square'){
    try{if(typeof tone==='function') tone(freq,dur,gain,type)}catch{}
  }
  function tick(speed=1){
    const f=Math.min(920,390+speed*430);
    playTone(f,.014,.012,'square');
  }
  function finale(voucher){
    if(voucher){
      playTone(660,.10,.035,'sine');
      setTimeout(()=>playTone(990,.12,.04,'sine'),110);
      setTimeout(()=>playTone(1320,.18,.045,'sine'),245);
    }else{
      playTone(520,.07,.022,'triangle');
      setTimeout(()=>playTone(650,.10,.018,'triangle'),120);
    }
  }

  function setRotation(wheel,value){
    rotation=value;
    wheel.style.transform=`rotate(${rotation}deg)`;
    wheel.dataset.rsjRotation=String(rotation);
    const t=Math.floor(rotation/SEGMENT);
    if(t!==lastTick){
      lastTick=t;
      return true;
    }
    return false;
  }

  function startCruise(wheel){
    cancelAnimationFrame(raf);
    wheel.style.transition='none';
    wheel.classList.add('giftWheelSpinning');
    wheel.classList.remove('giftWheelSettled');
    const start=performance.now();
    let prev=start;
    let active=true;
    const loop=now=>{
      if(!active) return;
      const dt=Math.min((now-prev)/1000,.05); prev=now;
      const elapsed=(now-start)/1000;
      const velocity=560+Math.min(1,elapsed/.55)*390;
      const crossed=setRotation(wheel,rotation+velocity*dt);
      if(crossed) tick(Math.min(1,velocity/950));
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>{active=false;cancelAnimationFrame(raf)};
  }

  async function animateRotation(wheel,target,duration,ease=easeOutQuint){
    cancelAnimationFrame(raf);
    wheel.style.transition='none';
    const startRot=rotation,start=performance.now(),delta=target-startRot;
    return new Promise(resolve=>{
      const frame=now=>{
        const t=Math.min(1,(now-start)/duration);
        const eased=ease(t);
        const next=startRot+delta*eased;
        const crossed=setRotation(wheel,next);
        if(crossed){
          const remaining=1-t;
          tick(Math.max(.10,remaining));
          try{if(navigator.vibrate&&t>.72) navigator.vibrate(8)}catch{}
        }
        if(t<1) raf=requestAnimationFrame(frame); else resolve();
      };
      raf=requestAnimationFrame(frame);
    });
  }

  function desiredAngle(index){return ((360-index*SEGMENT)%360+360)%360}
  async function settleTo(wheel,index){
    const cur=((rotation%360)+360)%360;
    const desired=desiredAngle(index);
    const align=(desired-cur+360)%360;
    const target=rotation+5*360+align;
    await animateRotation(wheel,target,5100,easeOutQuint);
    wheel.classList.remove('giftWheelSpinning');
    wheel.classList.add('giftWheelSettled');
    const pointer=document.querySelector('#giftPanel .giftPointer');
    pointer?.classList.remove('giftPointerHit');
    void pointer?.offsetWidth;
    pointer?.classList.add('giftPointerHit');
    await sleep(180);
  }

  async function brake(wheel){
    const target=rotation+300;
    await animateRotation(wheel,target,720,easeOutCubic);
    wheel.classList.remove('giftWheelSpinning');
  }

  function pending(){try{return JSON.parse(localStorage.getItem(PENDING_KEY)||'null')}catch{localStorage.removeItem(PENDING_KEY);return null}}
  function savePending(p){localStorage.setItem(PENDING_KEY,JSON.stringify(p))}
  function clearPending(){localStorage.removeItem(PENDING_KEY)}

  function openResult(d){
    const voucher=d.prize_key==='voucher5000';
    const thanks=d.prize_key==='thanks';
    id('giftResultIcon').textContent=voucher?'🎫':'✨';
    id('giftResultTitle').textContent=thanks?'感谢参与':'🎉 '+safe(d.display_name||'')+'，恭喜获得';
    id('giftResultPrize').textContent=d.prize_label||(voucher?'5000元消费券':'谢谢惠顾');
    id('giftResultMeta').innerHTML='礼品码：'+safe(d.gift_code||'')+'<br>流水号：'+safe(d.serial||'')+(d.remaining_slots!=null?'<br>剩余名额：'+Number(d.remaining_slots):'');
    const note=id('giftAdultNote');
    if(voucher){note.textContent='5000元消费券为本期大奖，请按活动兑奖规则联系工作人员领取。';note.classList.remove('hide')}
    else{note.textContent='';note.classList.add('hide')}
    id('giftResultModal')?.classList.add('show');
    document.body.style.overflow='hidden';
    try{if(voucher&&typeof coins==='function') coins(true)}catch{}
  }

  async function drawV4(){
    const s=currentSession();
    if(!s){loginPending=true; if(typeof openLoginModal==='function') openLoginModal('home','登录后使用礼品码参与礼品转盘'); return}
    if(spinning) return;
    const input=id('giftCode'),btn=id('giftSpinBtn'),wheel=id('giftWheel');
    if(!input||!btn||!wheel) return;
    const code=input.value.trim().toUpperCase();
    if(!/^[A-Z0-9_-]{4,30}$/.test(code)){
      if(typeof showNotice==='function') showNotice('请输入正确的礼品码后再转动。','礼品专区','🎡');
      return;
    }

    let p=pending();
    if(!p||p.memberCode!==s.code||p.giftCode!==code){p={requestId:requestId(),giftCode:code,memberCode:s.code};savePending(p)}

    spinning=true; btn.disabled=true; btn.textContent='转动中…'; input.disabled=true;
    rotation=Number(wheel.dataset.rsjRotation||0)||0;
    lastTick=Math.floor(rotation/SEGMENT);
    playTone(280,.055,.026,'triangle');
    const stopCruise=startCruise(wheel);

    let d;
    try{
      const rpcPromise=rpc('member_session_gift_draw_safe',{p_token:s.token,p_request_id:p.requestId,p_gift_code:code});
      [d]=await Promise.all([rpcPromise,sleep(900)]);
    }catch{d={ok:false,network_error:true,message:'网络连接有些波动'}}

    stopCruise();
    if(!d?.ok){
      await brake(wheel);
      spinning=false; btn.disabled=false; btn.textContent='开始转动'; input.disabled=false;
      if(!d?.network_error) clearPending();
      if(typeof showNotice==='function') showNotice(d?.network_error?'网络有些波动，这次礼品开奖编号已经保存。恢复网络后用同一礼品码重试即可确认原结果。':(d?.message||'礼品码暂时无法使用'),'礼品专区',d?.network_error?'🛡️':'🎡');
      return;
    }

    clearPending();
    const index=d.prize_key==='voucher5000'?0:(1+Math.floor(Math.random()*5));
    await settleTo(wheel,index);
    finale(d.prize_key==='voucher5000');
    await sleep(260);
    openResult(d);
    spinning=false; btn.disabled=false; btn.textContent='开始转动'; input.disabled=false;
  }

  function patch(){
    const panel=id('giftPanel'),btn=id('giftSpinBtn'),input=id('giftCode');
    if(!panel||!btn||!input){setTimeout(patch,100);return}
    if(btn.dataset.giftV4==='1') return;
    btn.dataset.giftV4='1';
    btn.onclick=null;
    btn.addEventListener('click',drawV4);
    input.onkeydown=null;
    input.addEventListener('keydown',e=>{if(e.key==='Enter') drawV4()});

    const rule=panel.querySelector('.giftRule');
    if(rule) rule.innerHTML='<strong>活动说明：</strong>礼品码不消耗普通盲盒次数；每个账号对同一礼品码仅能参与一次。本期消费券名额由活动资格与随机奖池共同产生。';

    const style=document.createElement('style');
    style.id='giftV4Style';
    style.textContent=`
      #giftWheel.giftWheelSpinning{filter:brightness(1.12) drop-shadow(0 0 18px #e4b84d66)}
      #giftWheel.giftWheelSettled{filter:brightness(1.22) drop-shadow(0 0 24px #ffd45a88)}
      .giftPointerHit{animation:giftPointerHit .42s cubic-bezier(.2,.85,.25,1)}
      @keyframes giftPointerHit{0%{transform:translateX(-50%) scale(1)}25%{transform:translateX(-50%) scale(1.22) rotate(-7deg)}55%{transform:translateX(-50%) scale(.94) rotate(4deg)}100%{transform:translateX(-50%) scale(1)}}
      #giftSpinBtn:disabled{cursor:default;opacity:.82;box-shadow:0 0 22px #d9ac3b55}
    `;
    if(!id('giftV4Style')) document.head.appendChild(style);
  }

  function patchLogin(){
    if(typeof window.loginMember==='function'&&!window.loginMember.__giftV4Patched){
      const base=window.loginMember;
      const w=async function(){const out=await base.apply(this,arguments);if(loginPending&&currentSession()){loginPending=false;setTimeout(()=>window.switchTab('gift'),40)}return out};
      w.__giftV4Patched=true;window.loginMember=w;
    }
  }

  function init(){patch();patchLogin()}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80),{once:true}); else setTimeout(init,80);
})();

/* GIFT ZONE V3 — current campaign has only 5000 voucher + thanks */
(()=>{
  'use strict';
  if(window.__RSJ_GIFT_ZONE_V3__) return;
  window.__RSJ_GIFT_ZONE_V3__=true;

  function apply(){
    const panel=document.getElementById('giftPanel');
    const wheel=document.getElementById('giftWheel');
    if(!panel||!wheel){setTimeout(apply,80);return}

    const banner=panel.querySelector('.giftCampaignBanner');
    if(banner) banner.innerHTML='<strong>本期奖项</strong><b>5000元消费券 × 3</b><span>共 100 个参与名额</span>';

    const labels=[...panel.querySelectorAll('.giftSegmentLabel')];
    labels.forEach((node,i)=>{
      if(i===0) node.innerHTML='<i>🎫</i>5000券';
      else node.innerHTML='<i>✨</i>谢谢惠顾';
    });

    const legend=panel.querySelector('.giftLegend');
    if(legend){
      legend.className='giftLegend giftLegendCurrent';
      legend.innerHTML='<div class="giftLegendItem voucher"><b>🎫</b>5000元消费券</div><div class="giftLegendItem"><b>✨</b>谢谢惠顾</div>';
    }

    const rule=panel.querySelector('.giftRule');
    if(rule) rule.innerHTML='<strong>活动说明：</strong>礼品码不消耗普通盲盒次数；每个账号对同一礼品码仅能参与一次。5000元消费券按本期活动资格规则发放，未获得消费券则显示“谢谢惠顾”。';

    wheel.classList.add('giftWheelCurrent');

    if(!document.getElementById('giftV3Style')){
      const style=document.createElement('style');
      style.id='giftV3Style';
      style.textContent=`
        .giftWheelCurrent{background:conic-gradient(from -30deg,#9a7419 0 60deg,#3d351f 60deg 120deg,#312d21 120deg 180deg,#3d351f 180deg 240deg,#312d21 240deg 300deg,#3d351f 300deg 360deg)!important}
        .giftWheelCurrent:before{background:repeating-conic-gradient(from -30deg,transparent 0 59.1deg,#f5d779aa 59.1deg 60deg)!important}
        .giftPanelV2 .giftSegmentLabel:not(.s0){color:#d8c9aa!important;text-shadow:0 2px 5px #000,0 0 8px #000!important}
        .giftPanelV2 .giftSegmentLabel.s0{color:#fff0a2!important;text-shadow:0 2px 5px #000,0 0 12px #e5b53675!important}
        .giftLegendCurrent{grid-template-columns:1fr 1fr!important;max-width:430px;margin-left:auto!important;margin-right:auto!important;gap:8px!important}
        .giftLegendCurrent .giftLegendItem{font-size:9px!important;padding:9px 4px!important}
        .giftLegendCurrent .giftLegendItem b{font-size:20px!important}
        .giftLegendCurrent .voucher{border-color:#b78b34!important;background:linear-gradient(180deg,#2c210a,#0b1017)!important;color:#ffe28b!important}
      `;
      document.head.appendChild(style);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,40),{once:true});
  else setTimeout(apply,40);
})();

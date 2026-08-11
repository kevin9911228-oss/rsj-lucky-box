/* RSJ Security Gateway V1 — IP/device audit + anti-bot routing */
(()=>{'use strict';if(window.__RSJ_SECURITY_GATEWAY_V1__)return;window.__RSJ_SECURITY_GATEWAY_V1__=true;
const originalFetch=window.fetch.bind(window);
const GATEWAY='https://iovzxyzjekaikvnkrenz.supabase.co/functions/v1/security-gateway';
function deviceId(){try{let id=localStorage.getItem('rsj_device_id_v1');if(!id){id=(crypto.randomUUID?crypto.randomUUID():('rsj-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)));localStorage.setItem('rsj_device_id_v1',id)}return id}catch{return 'ephemeral-'+Math.random().toString(36).slice(2)}}
function hash32(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return ('00000000'+(h>>>0).toString(16)).slice(-8)}
function fingerprint(){try{const z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';const sc=window.screen||{};const parts=[navigator.userAgent||'',navigator.language||'',navigator.platform||'',String(sc.width||''),String(sc.height||''),String(sc.colorDepth||''),z,String(navigator.hardwareConcurrency||''),String(navigator.deviceMemory||'')];return 'fp1-'+hash32(parts.join('|'))}catch{return 'fp1-unknown'}}
function targetRpc(url){const m=String(url||'').match(/\/rest\/v1\/rpc\/(self_register_member|member_session_lucky_draw_safe)(?:\?|$)/);return m&&m[1]}
window.fetch=async function(input,init){const url=typeof input==='string'?input:(input&&input.url)||'';const rpc=targetRpc(url);if(!rpc)return originalFetch(input,init);let args={};try{if(init&&typeof init.body==='string')args=JSON.parse(init.body)||{}}catch{}
const payload={rpc,args,device_id:deviceId(),fingerprint:fingerprint()};
return originalFetch(GATEWAY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:init&&init.signal,cache:'no-store'});
};
})();

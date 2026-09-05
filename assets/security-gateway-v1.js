/* RSJ Security Gateway V3 — resilient same-origin proxy with direct fallback */
(()=>{'use strict';if(window.__RSJ_SECURITY_GATEWAY_V1__)return;window.__RSJ_SECURITY_GATEWAY_V1__=true;
const originalFetch=window.fetch.bind(window);
const DIRECT_GATEWAY='https://iovzxyzjekaikvnkrenz.supabase.co/functions/v1/security-gateway';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function deviceId(){try{let id=localStorage.getItem('rsj_device_id_v1');if(!id){id=(crypto.randomUUID?crypto.randomUUID():('rsj-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)));localStorage.setItem('rsj_device_id_v1',id)}return id}catch{return 'ephemeral-'+Math.random().toString(36).slice(2)}}
function hash32(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return ('00000000'+(h>>>0).toString(16)).slice(-8)}
function fingerprint(){try{const z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';const sc=window.screen||{};const parts=[navigator.userAgent||'',navigator.language||'',navigator.platform||'',String(sc.width||''),String(sc.height||''),String(sc.colorDepth||''),z,String(navigator.hardwareConcurrency||''),String(navigator.deviceMemory||'')];return 'fp1-'+hash32(parts.join('|'))}catch{return 'fp1-unknown'}}
function targetRpc(url){const m=String(url||'').match(/\/rest\/v1\/rpc\/([A-Za-z0-9_]+)(?:\?|$)/);return m&&m[1]}
function parseArgs(init){let args={};try{if(init&&typeof init.body==='string')args=JSON.parse(init.body)||{}}catch{}return args}
async function viaProxy(url,init){let last;for(let i=0;i<2;i++){try{const r=await originalFetch(url,init);if(r.status<500&&r.status!==429)return r;last=r}catch(e){last=e}if(i===0)await wait(120)}if(last&&typeof last.status==='number')return last;throw last||new Error('proxy failed')}
window.fetch=async function(input,init){
  const url=typeof input==='string'?input:(input&&input.url)||'';
  const rpc=targetRpc(url);
  if(!rpc)return originalFetch(input,init);
  const args=parseArgs(init);
  const common={method:'POST',headers:{'Content-Type':'application/json'},signal:init&&init.signal,cache:'no-store'};
  if(rpc==='self_register_member'||rpc==='member_session_lucky_draw_safe'){
    const payload={rpc,args,device_id:deviceId(),fingerprint:fingerprint()};
    try{
      const r=await viaProxy('/api/security-gateway',{...common,body:JSON.stringify(payload)});
      if(r.status<500&&r.status!==429)return r;
    }catch(e){}
    return originalFetch(DIRECT_GATEWAY,{...common,body:JSON.stringify(payload)});
  }
  try{
    const r=await viaProxy('/api/rpc?name='+encodeURIComponent(rpc),{...common,body:JSON.stringify(args)});
    if(r.status<500&&r.status!==429)return r;
  }catch(e){}
  return originalFetch(input,init);
};
})();

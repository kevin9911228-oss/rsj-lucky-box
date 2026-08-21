/* ADMIN STABILITY V2 — retry transient RPC failures + lazy-load core modules */
(()=>{
  'use strict';
  if(window.__RSJ_ADMIN_STABILITY_V2__) return;
  window.__RSJ_ADMIN_STABILITY_V2__=true;

  const inflight=new Map();
  const cache=new Map();
  const READ_RPCS=new Set([
    'manager_members','manager_draws','manager_draws_by_date','manager_lucky_codes','manager_credit_logs',
    'manager_gift_codes','manager_gift_draw_records','manager_security_snapshot','manager_security_risk_accounts',
    'manager_security_audit','manager_social_dashboard','manager_social_members'
  ]);
  const $id=id=>document.getElementById(id);

  function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
  function makeKey(name,body){try{return name+'|'+JSON.stringify(body||{})}catch{return name}}
  function parseErrorText(text,status){
    try{
      const j=JSON.parse(text||'{}');
      const m=j.message||j.error||j.hint||j.details;
      if(m) return String(m);
    }catch{}
    if(status===429) return '请求过于频繁，请稍后重试';
    if(status>=500) return '数据服务暂时繁忙';
    if(status===408) return '数据请求超时';
    return text&&text.length<180?text:'数据请求失败';
  }
  function setHealth(ok,msg){
    let el=$id('adminNetStateV2');
    if(!el){
      const top=document.querySelector('.topActions');
      if(!top)return;
      el=document.createElement('span');
      el.id='adminNetStateV2';
      el.style.cssText='display:inline-flex;align-items:center;min-height:40px;padding:0 11px;border-radius:11px;border:1px solid #3e4b46;background:#10151b;color:#84e0bc;font-size:11px;font-weight:800;white-space:nowrap';
      top.prepend(el);
    }
    el.textContent=(ok?'● ':'● ')+(msg||(ok?'数据连接正常':'数据连接异常'));
    el.style.color=ok?'#84e0bc':'#ef9b8f';
    el.style.borderColor=ok?'#345247':'#6b3e3a';
  }

  async function robustRpc(name,body){
    const key=makeKey(name,body);
    const isRead=READ_RPCS.has(name);
    const now=Date.now();
    if(isRead){
      const c=cache.get(key);
      if(c&&now-c.at<3500) return c.value;
      if(inflight.has(key)) return inflight.get(key);
    }

    const task=(async()=>{
      let lastMessage='数据连接失败';
      const maxAttempts=isRead?3:2;
      for(let attempt=1;attempt<=maxAttempts;attempt++){
        const ctl=new AbortController();
        const timer=setTimeout(()=>ctl.abort(),12000);
        try{
          const r=await fetch(BASE+'/rest/v1/rpc/'+name,{
            method:'POST',
            headers:{'Content-Type':'application/json','apikey':KEY},
            body:JSON.stringify(body||{}),
            signal:ctl.signal
          });
          const t=await r.text();
          clearTimeout(timer);
          if(r.ok){
            let value;
            try{value=JSON.parse(t)}catch{value={ok:false,message:'服务器返回格式异常'}}
            if(isRead) cache.set(key,{at:Date.now(),value});
            else cache.clear();
            setHealth(true,'数据连接正常');
            return value;
          }
          lastMessage=parseErrorText(t,r.status);
          const retryable=r.status===408||r.status===429||r.status>=500;
          if(!retryable||attempt===maxAttempts){
            setHealth(false,lastMessage);
            return {ok:false,message:lastMessage,status:r.status};
          }
        }catch(e){
          clearTimeout(timer);
          lastMessage=(e&&e.name==='AbortError')?'数据请求超时':'网络波动';
          if(attempt===maxAttempts){
            setHealth(false,lastMessage);
            return {ok:false,message:lastMessage+'，已自动重试'};
          }
        }
        await sleep(450*attempt);
      }
      setHealth(false,lastMessage);
      return {ok:false,message:lastMessage};
    })();

    if(isRead) inflight.set(key,task);
    try{return await task}finally{if(isRead) inflight.delete(key)}
  }

  function install(){
    if(typeof window.rpc!=='function'||typeof window.tab!=='function'||typeof window.loadMembers!=='function'){
      setTimeout(install,120);return;
    }

    window.rpc=robustRpc;

    window.loadAll=async function(){
      const d=await window.rpc('manager_members',creds());
      if(!d||!d.ok){
        setHealth(false,d?.message||'总览数据加载失败');
        return;
      }
      members=Array.isArray(d.members)?d.members:[];
      renderDashboard();
    };

    window.loadDashboard=async function(){
      const d=await window.rpc('manager_members',creds());
      if(!d||!d.ok){
        setHealth(false,d?.message||'总览数据加载失败');
        return;
      }
      members=Array.isArray(d.members)?d.members:[];
      renderDashboard();
    };

    const baseTab=window.tab;
    window.tab=function(name,el){
      if(['dashboard','members','lucky','draws','logs','settings'].includes(name)){
        current=name;
        document.querySelectorAll('.page').forEach(x=>x.classList.add('hide'));
        $id(name)?.classList.remove('hide');
        document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
        el?.classList.add('active');
        if(name==='dashboard') window.loadDashboard();
        else if(name==='members') window.loadMembers();
        else if(name==='lucky') window.loadLucky();
        else if(name==='draws') window.loadDraws();
        else if(name==='logs') window.loadLogs();
        return;
      }
      return baseTab.apply(this,arguments);
    };

    window.refreshCurrent=async function(){
      try{
        if(current==='dashboard') return window.loadDashboard();
        if(current==='members') return window.loadMembers();
        if(current==='lucky') return window.loadLucky();
        if(current==='draws') return window.loadDraws();
        if(current==='logs') return window.loadLogs();
        if(current==='giftcodes'&&typeof window.loadGiftCodesV5==='function') return window.loadGiftCodesV5();
        if(current==='security'&&typeof window.loadSecurityRisk==='function') return window.loadSecurityRisk();
      }catch(e){setHealth(false,'当前模块刷新失败')}
    };

    window.authFail=function(d){
      const msg=String(d?.message||'操作失败');
      if(msg.includes('验证失败')||msg.includes('登录已失效')){
        alert('管理员登录已失效，请重新登录');
        logout();
        return;
      }
      setHealth(false,msg);
      console.warn('[admin module error]',msg,d||'');
    };

    setHealth(true,'数据连接正常');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(install,350),{once:true});
  else setTimeout(install,350);
})();

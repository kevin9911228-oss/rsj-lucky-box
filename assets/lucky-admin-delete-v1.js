/* Lucky code admin delete V1 */
(()=>{
  'use strict';
  if(window.__RSJ_LUCKY_ADMIN_DELETE_V1__) return;
  window.__RSJ_LUCKY_ADMIN_DELETE_V1__=true;

  window.deleteLuckyCode=async function(code){
    const c=String(code||'').trim();
    if(!c) return;
    if(!confirm('确定删除幸运码 '+c+' 吗？\n\n已产生的中奖/使用历史会保留。')) return;
    const d=await rpc('manager_delete_lucky_code',{...creds(),p_code:c});
    if(!d||!d.ok){
      alert((d&&d.message)||'删除失败');
      return;
    }
    alert(d.message||'幸运码已删除');
    await loadLucky();
  };

  const oldRender=window.renderLucky;
  window.renderLucky=function(){
    const body=document.getElementById('luckyRows');
    if(!body){ if(typeof oldRender==='function') return oldRender(); return; }
    body.innerHTML=codes.length?codes.map(x=>
      '<tr data-code="'+esc(x.code)+'">'+
      '<td><b>'+esc(x.code)+'</b></td>'+
      '<td>'+n(x.used_count)+' / '+n(x.max_uses)+'</td>'+
      '<td>'+n(x.remaining_count)+'</td>'+
      '<td class="'+(x.active?'ok':'off')+'">'+(x.active?'启用':'停用')+'</td>'+
      '<td>'+esc(x.note||'--')+'</td>'+
      '<td><div class="actions">'+
        '<button class="smallBtn" onclick="setLucky(this.closest(\'tr\').dataset.code,'+(!x.active)+')">'+(x.active?'停用':'启用')+'</button>'+
        '<button class="smallBtn" style="border-color:#7b3f3b;color:#f3a199" onclick="deleteLuckyCode(this.closest(\'tr\').dataset.code)">删除</button>'+
      '</div></td></tr>'
    ).join(''):'<tr><td colspan="6" class="loader">暂无幸运码</td></tr>';
  };
})();

/* ADMIN RECOVERY V1 — stabilize login and make data failures visible */
(()=>{
  'use strict';
  if(window.__RSJ_ADMIN_RECOVERY_V1__) return;
  window.__RSJ_ADMIN_RECOVERY_V1__=true;

  const byId=id=>document.getElementById(id);
  function banner(){
    let box=byId('adminRecoveryState');
    if(box) return box;
    box=document.createElement('div');
    box.id='adminRecoveryState';
    box.style.cssText='display:none;margin:0 0 12px;padding:10px 12px;border:1px solid #5f4e2e;border-radius:11px;background:#0d1117;color:#e4d3ad;font-size:11px;line-height:1.55';
    const app=byId('appView');
    const nav=app&&app.querySelector('.nav');
    if(app&&nav) app.insertBefore(box,nav);
    return box;
  }
  function state(msg,kind='info'){
    const box=banner();
    box.style.display='block';
    box.textContent=msg;
    box.style.borderColor=kind==='ok'?'#345f4e':kind==='err'?'#74433e':'#6a562f';
    box.style.color=kind==='ok'?'#91e5c2':kind==='err'?'#ffad9f':'#ead59e';
  }
  function clearLoginMsg(){const x=byId('loginMsg');if(x){x.textContent='';x.classList.add('hide')}}
  function showLoginMsg(msg){const x=byId('loginMsg');if(x){x.textContent=msg;x.classList.remove('hide')}}
  function renderSummary(d){
    if(!d||!d.ok) return false;
    if(byId('stMembers')) byId('stMembers').textContent=n(d.member_count);
    if(byId('stCredits')) byId('stCredits').textContent=n(d.total_credits);
    if(byId('stDraws')) byId('stDraws').textContent=n(d.draw_count);
    if(byId('stRewards')) byId('stRewards').textContent='¥'+n(d.reward_total);
    return true;
  }
  async function loadCore(u,p){
    const credentials={p_username:u,p_admin_pin:p};
    state('正在读取后台数据…');
    let dash;
    try{ dash=await rpc('manager_dashboard_summary',credentials); }catch(e){ dash={ok:false,message:'总览读取异常'}; }
    if(renderSummary(dash)){
      if(typeof setAdminHealth==='function') setAdminHealth(true,'数据连接正常');
      state('后台数据已恢复并加载完成','ok');
      return {ok:true};
    }

    let mem;
    try{ mem=await rpc('manager_members',credentials); }catch(e){ mem={ok:false,message:'成员数据读取异常'}; }
    if(mem&&mem.ok&&Array.isArray(mem.members)){
      try{
        members=mem.members;
        if(typeof renderDashboard==='function') renderDashboard();
        if(current==='members'&&typeof renderMembers==='function') renderMembers();
      }catch(e){}
      if(typeof setAdminHealth==='function') setAdminHealth(true,'备用数据通道正常');
      state('总览接口暂时异常，已通过备用数据通道恢复显示','ok');
      return {ok:true,fallback:true};
    }

    const msg=(dash&&dash.message)||(mem&&mem.message)||'后台数据读取失败';
    if(typeof setAdminHealth==='function') setAdminHealth(false,msg);
    state('登录成功，但数据没有读取出来：'+msg+'。请点右上角“刷新”重试。','err');
    return {ok:false,message:msg};
  }

  window.login=async function(){
    const u=(byId('adminUser')?.value||'').trim(),p=byId('adminPin')?.value||'';
    if(!u||!p){showLoginMsg('请输入管理员账号和管理密码');return;}
    const btn=byId('loginBtn');
    if(btn){btn.disabled=true;btn.textContent='正在验证…'}
    clearLoginMsg();
    let d;
    try{d=await rpc('manager_login',{p_username:u,p_pin:p});}catch(e){d={ok:false,message:'登录请求异常，请重试'}}
    if(!d?.ok){
      if(btn){btn.disabled=false;btn.textContent='登录后台'}
      showLoginMsg(d?.message||'管理员账号或密码不正确');
      return;
    }
    auth={username:u,pin:p};
    sessionStorage.setItem('rsj_admin_user',u);
    byId('loginView')?.classList.add('hide');
    byId('appView')?.classList.remove('hide');
    if(byId('who')) byId('who').textContent='当前管理员：'+u;
    const loaded=await loadCore(u,p);
    if(btn){btn.disabled=false;btn.textContent='登录后台'}
    if(byId('adminPin')) byId('adminPin').value='';
    if(!loaded.ok) state('账号验证已通过，但数据读取失败。右上角“刷新”可再次尝试。','err');
  };

  window.loadDashboard=async function(){
    if(typeof auth==='undefined'||!auth) return;
    await loadCore(auth.username,auth.pin);
  };

  const oldAuthFail=window.authFail;
  window.authFail=function(d){
    const msg=String(d&&d.message||'操作失败');
    if(msg.includes('验证失败')||msg.includes('登录已失效')){
      state('管理员凭证已失效，请重新登录。','err');
      if(typeof oldAuthFail==='function') return oldAuthFail(d);
      return;
    }
    if(typeof setAdminHealth==='function') setAdminHealth(false,msg);
    state('数据读取失败：'+msg+'。可点击右上角“刷新”重试。','err');
  };

  window.addEventListener('unhandledrejection',e=>{
    const msg=String(e&&e.reason&&e.reason.message||e&&e.reason||'未知错误');
    state('后台页面出现数据异常：'+msg,'err');
  });
})();

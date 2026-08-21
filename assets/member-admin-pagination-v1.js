(()=>{
'use strict';
if(window.__RSJ_MEMBER_ADMIN_PAGINATION_V1__)return;
window.__RSJ_MEMBER_ADMIN_PAGINATION_V1__=true;
try{if(typeof ADMIN_READ_RPCS!=='undefined'&&ADMIN_READ_RPCS.add)ADMIN_READ_RPCS.add('manager_members_page')}catch{}

const state={page:1,size:20,total:0,pages:1,query:'',timer:null,loading:false};
const sizes=[20,50,100,200,500,1000];
const byId=id=>document.getElementById(id);

function injectUI(){
  const page=byId('members');
  const wrap=page&&page.querySelector('.tableWrap');
  if(!wrap||byId('memberPagerV1'))return;
  const box=document.createElement('div');
  box.id='memberPagerV1';
  box.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:10px;padding:10px 2px;color:#b8aa8d;font-size:11px';
  box.innerHTML=`
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span id="memberPagerInfoV1">第 1 / 1 页 · 共 0 人</span>
      <label style="display:flex;align-items:center;gap:6px">每页
        <select id="memberPageSizeV1" style="height:34px;border:1px solid #4d493f;border-radius:8px;background:#10151c;color:#ead9b8;padding:0 8px">
          ${sizes.map(v=>`<option value="${v}"${v===20?' selected':''}>${v}</option>`).join('')}
        </select>
      </label>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button id="memberFirstV1" class="smallBtn">首页</button>
      <button id="memberPrevV1" class="smallBtn">上一页</button>
      <button id="memberNextV1" class="smallBtn">下一页</button>
      <button id="memberLastV1" class="smallBtn">末页</button>
    </div>`;
  wrap.insertAdjacentElement('afterend',box);
  byId('memberPageSizeV1').addEventListener('change',e=>{state.size=Number(e.target.value)||20;state.page=1;loadPage()});
  byId('memberFirstV1').addEventListener('click',()=>{if(state.page!==1){state.page=1;loadPage()}});
  byId('memberPrevV1').addEventListener('click',()=>{if(state.page>1){state.page--;loadPage()}});
  byId('memberNextV1').addEventListener('click',()=>{if(state.page<state.pages){state.page++;loadPage()}});
  byId('memberLastV1').addEventListener('click',()=>{if(state.page!==state.pages){state.page=state.pages;loadPage()}});
}

function renderRows(){
  const body=byId('memberRows');
  if(!body)return;
  body.innerHTML=members.length?members.map(x=>'<tr data-code="'+esc(x.member_code)+'" data-name="'+esc(x.display_name)+'"><td><b>'+esc(x.member_code)+'</b></td><td>'+esc(x.display_name)+'</td><td class="amount">'+n(x.draw_credits)+'</td><td>'+n(x.draw_count)+'</td><td class="amount">¥'+n(x.reward_total)+'</td><td class="'+(x.active?'ok':'off')+'">'+(x.active?'正常':'停用')+'</td><td><div class="actions"><button class="smallBtn" onclick="openAdjust(this.closest(\'tr\').dataset.code,this.closest(\'tr\').dataset.name)">增减次数</button><button class="smallBtn" onclick="openReset(this.closest(\'tr\').dataset.code)">重置密码</button></div></td></tr>').join(''):'<tr><td colspan="7" class="loader">暂无成员</td></tr>';
}

function updatePager(){
  injectUI();
  const info=byId('memberPagerInfoV1');
  if(info)info.textContent=`第 ${state.page} / ${state.pages} 页 · 共 ${Number(state.total||0).toLocaleString('zh-CN')} 人`;
  const first=byId('memberFirstV1'),prev=byId('memberPrevV1'),next=byId('memberNextV1'),last=byId('memberLastV1');
  if(first)first.disabled=state.loading||state.page<=1;
  if(prev)prev.disabled=state.loading||state.page<=1;
  if(next)next.disabled=state.loading||state.page>=state.pages;
  if(last)last.disabled=state.loading||state.page>=state.pages;
}

async function loadPage(){
  if(!auth||state.loading)return;
  state.loading=true;updatePager();
  const q=(byId('memberSearch')?.value||'').trim();
  const body=byId('memberRows');
  if(body)body.innerHTML='<tr><td colspan="7" class="loader">正在加载…</td></tr>';
  const d=await rpc('manager_members_page',{...creds(),p_page:state.page,p_page_size:state.size,p_query:q||null});
  state.loading=false;
  if(!d||!d.ok){updatePager();return authFail(d||{message:'成员数据加载失败'})}
  members=Array.isArray(d.members)?d.members:[];
  state.page=Number(d.page||1);
  state.size=Number(d.page_size||state.size);
  state.total=Number(d.total_count||0);
  state.pages=Math.max(1,Number(d.total_pages||1));
  state.query=q;
  renderRows();updatePager();
}

window.loadMembers=async function(render=true){
  injectUI();
  return loadPage();
};

window.renderMembers=function(){
  injectUI();
  const q=(byId('memberSearch')?.value||'').trim();
  if(q===state.query){renderRows();return}
  clearTimeout(state.timer);
  state.timer=setTimeout(()=>{state.page=1;loadPage()},280);
};

function install(){
  injectUI();
  const input=byId('memberSearch');
  if(input)input.setAttribute('autocomplete','off');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
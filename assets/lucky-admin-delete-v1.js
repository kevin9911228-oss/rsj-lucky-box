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

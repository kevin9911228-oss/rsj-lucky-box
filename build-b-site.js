const fs = require('fs');
const path = require('path');

const SOURCE = 'https://chenjiancj-com.vercel.app';
const A_REF = 'iovzxyzjekaikvnkrenz';
const SITE_REF = 'wdpktkpdxsvhaiaxnssq';
const SITE_HOST = 'https://www.chenjiancjc.com';
const ADMIN_PATH = 'epgurrynzevkg4irqyc2am';

async function get(url) {
  const r = await fetch(url, {
    headers: { 'user-agent': 'chenjiancj-c-build/1.0' },
    redirect: 'follow'
  });
  if (!r.ok) throw new Error(`Fetch failed ${r.status}: ${url}`);
  return await r.text();
}

function convert(html) {
  return html
    .replaceAll(A_REF, SITE_REF)
    .replaceAll('https://chenjiancj.com', 'https://chenjiancjc.com')
    .replaceAll('https://www.chenjiancj.com', SITE_HOST)
    .replaceAll("const prefer=['cash188','cash288','cash588','cash88','cash888'];", "const prefer=['cash188','cash588','cash88','cash888'];");
}

function patchAdmin(html) {
  let out = html;
  out = out.replace('<th>最近更新</th><th>次数调整</th></tr>', '<th>最近更新</th><th>次数调整</th><th>操作</th></tr>');
  out = out.replace(
    `>调整</button></td></tr>').join(''):'<tr><td colspan="7" class="empty">暂无成员</td></tr>'`,
    `>调整</button></td><td><button class="mini" style="border-color:#713a36;color:#f29b91;background:#24100f" data-deleteuser="'+encodeURIComponent(x.client_id)+'" data-account="'+encodeURIComponent(x.account||'')+'">删除</button></td></tr>').join(''):'<tr><td colspan="8" class="empty">暂无成员</td></tr>'`
  );
  out = out.replace(
    'function parseRegisterLines(){',
    `$('memberRows').addEventListener('click',async e=>{let b=e.target.closest('[data-deleteuser]');if(!b)return;let client_id=decodeURIComponent(b.dataset.deleteuser||''),account=decodeURIComponent(b.dataset.account||'');if(!confirm('确认删除成员「'+(account||client_id)+'」？\\n\\n删除后该账号将无法登录，剩余抽奖次数会清空；历史中奖记录会保留。'))return;if(!confirm('再次确认：此操作无法撤销，确定删除？'))return;b.disabled=true;b.textContent='删除中…';let r=await memberAction('delete_user',{client_id});if(!r.ok){b.disabled=false;b.textContent='删除';return toastMsg(r.message||'删除失败')}toastMsg('成员已删除');await loadMembers()});
function parseRegisterLines(){`
  );
  if (!out.includes('data-deleteuser')) throw new Error('Member delete UI patch failed');
  return out;
}

(async () => {
  const [front, admin] = await Promise.all([
    get(`${SOURCE}/`),
    get(`${SOURCE}/admin`)
  ]);

  const out = path.join(process.cwd(), 'dist');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, ADMIN_PATH), { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), convert(front));
  fs.writeFileSync(path.join(out, ADMIN_PATH, 'index.html'), patchAdmin(convert(admin)));

  const marker = {
    site: 'C',
    supabase_ref: SITE_REF,
    source: SOURCE,
    built_at: new Date().toISOString()
  };
  fs.writeFileSync(path.join(out, 'site-info.json'), JSON.stringify(marker, null, 2));
  console.log('C site built with member delete:', marker);
})();

const fs = require('fs');
const path = require('path');

const SOURCE = 'https://www.chenjiancj.com';
const A_REF = 'iovzxyzjekaikvnkrenz';
const B_REF = 'ubgmpviwfaoxpyxjipya';

async function get(url) {
  const r = await fetch(url, {
    headers: { 'user-agent': 'chenjiancj-b-build/1.0' },
    redirect: 'follow'
  });
  if (!r.ok) throw new Error(`Fetch failed ${r.status}: ${url}`);
  return await r.text();
}

function convert(html) {
  return html
    .replaceAll(A_REF, B_REF)
    .replaceAll('https://chenjiancj.com', 'https://chenjiancjb.com')
    .replaceAll('https://www.chenjiancj.com', 'https://www.chenjiancjb.com')
    .replaceAll("const prefer=['cash188','cash288','cash588','cash88','cash888'];", "const prefer=['cash188','cash588','cash88','cash888'];");
}

(async () => {
  const [front, admin] = await Promise.all([
    get(`${SOURCE}/`),
    get(`${SOURCE}/admin`)
  ]);

  const out = path.join(process.cwd(), 'dist');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'admin'), { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), convert(front));
  fs.writeFileSync(path.join(out, 'admin', 'index.html'), convert(admin));

  const marker = {
    site: 'B',
    supabase_ref: B_REF,
    source: SOURCE,
    built_at: new Date().toISOString()
  };
  fs.writeFileSync(path.join(out, 'site-info.json'), JSON.stringify(marker, null, 2));
  console.log('B site built:', marker);
})();

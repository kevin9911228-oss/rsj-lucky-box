const fs = require('fs');
const path = require('path');

const SOURCE = 'https://chenjiancj-com.vercel.app';
const ADMIN_PATH = '1cfhzq05c31h8t1g5d7fal';

async function get(url) {
  const r = await fetch(url, {
    headers: { 'user-agent': 'chenjiancj-a-build/1.0' },
    redirect: 'follow'
  });
  if (!r.ok) throw new Error(`Fetch failed ${r.status}: ${url}`);
  return await r.text();
}

(async () => {
  const [front, admin] = await Promise.all([
    get(`${SOURCE}/`),
    get(`${SOURCE}/admin`)
  ]);

  const out = path.join(process.cwd(), 'dist');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, ADMIN_PATH), { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), front);
  fs.writeFileSync(path.join(out, ADMIN_PATH, 'index.html'), admin);

  const marker = {
    site: 'A',
    source: SOURCE,
    built_at: new Date().toISOString()
  };
  fs.writeFileSync(path.join(out, 'site-info.json'), JSON.stringify(marker, null, 2));
  console.log('A site built with private admin route:', marker);
})();

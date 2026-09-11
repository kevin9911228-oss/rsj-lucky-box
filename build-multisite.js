const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projects = {
  'prj_4NDfe6AGQKLDnKRGp9U8YsWkoMxc': { site:'B', ref:'ubgmpviwfaoxpyxjipya', domain:'chenjiancjb.com', admin:'7o4aly75t1lij3m7z1v51l' },
  'prj_laL876J8gxshPETvt5MevAmZ5pOm': { site:'E', ref:'kbofkjogcehjciweigki', domain:'chenjiancje.com', admin:'azyn1xc30qsuave6pziki6' },
  'prj_sPXNxFFejoIbr3AoW5gUGcp0NCE3': { site:'F', ref:'efielhfpucsnqcrkyhhu', domain:'chenjiancjf.com', admin:'jvujrix6x3ej1ge3ujmyia' },
  'prj_643Ils4GB95fl8TcNffYioEPh5G0': { site:'G', ref:'zalhttwidkvceqgctero', domain:'chenjiancjg.com', admin:'lu18821e8dak5eu2j0spux' }
};

const base = { site:'B', ref:'ubgmpviwfaoxpyxjipya', domain:'chenjiancjb.com', admin:'7o4aly75t1lij3m7z1v51l' };
const cfg = projects[process.env.VERCEL_PROJECT_ID] || base;

const run = spawnSync(process.execPath, ['build-b-site.js'], { stdio:'inherit', env:process.env });
if (run.status !== 0) process.exit(run.status || 1);
if (cfg.site === 'B') process.exit(0);

const dist = path.join(process.cwd(), 'dist');
const replace = s => s
  .replaceAll(base.ref, cfg.ref)
  .replaceAll('https://www.' + base.domain, 'https://www.' + cfg.domain)
  .replaceAll('https://' + base.domain, 'https://' + cfg.domain);

for (const name of ['index.html']) {
  const p = path.join(dist, name);
  fs.writeFileSync(p, replace(fs.readFileSync(p, 'utf8')));
}

const oldAdmin = path.join(dist, base.admin);
const newAdmin = path.join(dist, cfg.admin);
fs.renameSync(oldAdmin, newAdmin);
const adminIndex = path.join(newAdmin, 'index.html');
fs.writeFileSync(adminIndex, replace(fs.readFileSync(adminIndex, 'utf8')));

fs.writeFileSync(path.join(dist, 'site-info.json'), JSON.stringify({
  site: cfg.site,
  supabase_ref: cfg.ref,
  admin_path: cfg.admin,
  project_id: process.env.VERCEL_PROJECT_ID || null,
  built_at: new Date().toISOString()
}, null, 2));

console.log('Multisite build selected', cfg.site, cfg.domain, cfg.ref);

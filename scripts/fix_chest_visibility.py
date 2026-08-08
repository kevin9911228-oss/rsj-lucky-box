from pathlib import Path

p = Path('index.html')
s = p.read_text()
marker = '/* ROYAL_CHEST_VISIBILITY_HOTFIX_V2 */'
patch = r'''
/* ROYAL_CHEST_VISIBILITY_HOTFIX_V2 */
.chest{
  background:url('/assets/royal-chest.webp?v=royal-visible-v5') center/contain no-repeat!important;
  overflow:visible!important;
}
.chest:before,.chest:after{
  opacity:0!important;
  visibility:hidden!important;
}
.stage.explode .chest{
  background:none!important;
}
.stage.explode .chest:before,.stage.explode .chest:after{
  opacity:1!important;
  visibility:visible!important;
}
.stage:not(.explode) .band{opacity:.16!important}
.stage:not(.explode) .lock{opacity:1!important}
'''
if marker not in s:
    s = s.replace('\n</style>', '\n' + patch + '\n</style>', 1)
    p.write_text(s)
    print('patched')
else:
    print('already patched')

from pathlib import Path
p=Path('index.html')
s=p.read_text()
s=s.replace('/assets/royal-chest.webp?v=royal-visible-v5','/assets/royal-chest.svg?v=royal-svg-v1')
s=s.replace('/assets/royal-chest.webp?v=royal-img-v6','/assets/royal-chest.svg?v=royal-svg-v1')
s=s.replace('/assets/royal-chest.webp?v=royal-v3','/assets/royal-chest.svg?v=royal-svg-v1')
s=s.replace('/assets/royal-chest.webp?v=royal-v2','/assets/royal-chest.svg?v=royal-svg-v1')
if 'ROYAL_CHEST_SVG_V7' not in s:
    patch='''\n/* ROYAL_CHEST_SVG_V7 */\n.chestMain{object-fit:contain!important;opacity:1!important;visibility:visible!important}\n.stage:not(.explode) .chestMain{display:block!important}\n.stage:not(.explode) .lock{display:none!important}\n.stage.opening .lock,.stage.unlocking .lock,.stage.explode .lock{display:block!important}\n'''
    s=s.replace('\n</style>',patch+'\n</style>',1)
p.write_text(s)
print('switched to svg chest')

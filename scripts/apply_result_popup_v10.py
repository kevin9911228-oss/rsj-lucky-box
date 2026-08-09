from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/'index.html'
html=INDEX.read_text(encoding='utf-8')
link='<link rel="stylesheet" href="/assets/result-popup-v10.css?v=20260809-v10">'
html=re.sub(r'\n?<link rel="stylesheet" href="/assets/result-popup-v10\.css\?v=[^"]+">','',html)
if link not in html:
    html=html.replace('</head>',link+'\n</head>',1)
INDEX.write_text(html,encoding='utf-8')
print('Wired result popup V10 stylesheet')

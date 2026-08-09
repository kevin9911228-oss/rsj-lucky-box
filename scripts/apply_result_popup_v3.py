from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
link='<link rel="stylesheet" href="/assets/result-popup-v3.css?v=20260809-v3">'
if link not in s:
    s=s.replace('</head>',link+'\n</head>',1)
p.write_text(s,encoding='utf-8')
print('result popup V3 link applied')

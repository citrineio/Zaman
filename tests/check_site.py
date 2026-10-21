#!/usr/bin/env python3
"""Check deployable pages, local assets, internal routes and roadmap evidence."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
import json,subprocess
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.refs=[];self.ids=[];self.h1=0;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  for k in ['href','src','poster']:
   if a.get(k):self.refs.append(a[k])
errors=[];pages={p.name:Page(p.read_text()) for p in ROOT.glob('*.html')}
for name,p in pages.items():
 if len(set(p.ids))!=len(p.ids):errors.append(f'{name}: duplicate IDs')
 if name!='demo.html' and p.h1!=1:errors.append(f'{name}: expected one h1, found {p.h1}')
 for ref in p.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=ROOT/unquote(u.path) if u.path else ROOT/name
  if not target.exists():errors.append(f'{name}: missing {ref}')
  elif u.fragment and target.suffix=='.html' and target.name in pages and u.fragment not in pages[target.name].ids:
   errors.append(f'{name}: missing fragment {ref}')
features=json.loads((ROOT/'assets/features.json').read_text())
assert all(f['status'] in ['working','validation','planned','exploring'] for f in features)
assert all(f.get('source') for f in features if f['status']=='working')
for p in ['assets/demo.js','assets/site.js']:subprocess.run(['node','--check',str(ROOT/p)],check=True)
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages, {len(features)} roadmap entries, local assets, IDs, routes and JavaScript syntax.')

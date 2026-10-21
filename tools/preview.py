#!/usr/bin/env python3
"""Prepare the static output directory for local QA or static hosting."""
from pathlib import Path
import shutil,subprocess,sys
root=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(root/'tools/build.py')],check=True)
out=root/'dist'
if out.is_symlink():raise SystemExit('Refusing a symlink output directory.')
out.mkdir(exist_ok=True)
for old in out.iterdir():
 if old.is_dir() and not old.is_symlink():shutil.rmtree(old)
 else:old.unlink()
for p in root.glob('*.html'):shutil.copy(p,out/p.name)
shutil.copytree(root/'assets',out/'assets',dirs_exist_ok=True)
print('Prepared dist/ for static hosting.')

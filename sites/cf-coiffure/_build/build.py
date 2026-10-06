"""Assemble les pages : remplace {{HEAD}}, {{HEADER}} et {{FOOTER}} par les blocs communs,
et ajoute une empreinte (?v=…) aux CSS/JS locaux pour que les navigateurs ne gardent
jamais une ancienne version en cache.

Usage : python3 _build/build.py   (depuis sites/cf-coiffure)
"""
import hashlib
import pathlib
import re
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from partials import HEAD, HEADER, FOOTER  # noqa: E402

root = pathlib.Path(__file__).resolve().parent.parent


def fingerprint(match):
    path = match.group(1)
    file = root / path.lstrip('/')
    digest = hashlib.sha1(file.read_bytes()).hexdigest()[:8] if file.exists() else 'x'
    return f'"{path}?v={digest}"'


for src in sorted((root / '_build' / 'pages').glob('*.html')):
    html = src.read_text(encoding='utf-8')
    html = html.replace('{{HEAD}}', HEAD).replace('{{HEADER}}', HEADER).replace('{{FOOTER}}', FOOTER)
    html = re.sub(r'"(/assets/(?:css|js|vendor)/[^"?]+\.(?:css|js))"', fingerprint, html)
    (root / src.name).write_text(html, encoding='utf-8')
    print('écrit', src.name)

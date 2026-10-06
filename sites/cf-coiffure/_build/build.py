"""Assemble les pages : remplace {{HEAD}}, {{HEADER}} et {{FOOTER}} par les blocs communs.

Usage : python3 _build/build.py   (depuis sites/cf-coiffure)
Les pages sources sont dans _build/pages/, le résultat à la racine du site.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from partials import HEAD, HEADER, FOOTER  # noqa: E402

root = pathlib.Path(__file__).resolve().parent.parent
for src in sorted((root / '_build' / 'pages').glob('*.html')):
    html = src.read_text(encoding='utf-8')
    header = HEADER
    if src.name == 'index.html':
        header = header.replace('href="/#', 'href="#')
    html = html.replace('{{HEAD}}', HEAD).replace('{{HEADER}}', header).replace('{{FOOTER}}', FOOTER.replace('href="/#', 'href="#') if src.name == 'index.html' else FOOTER)
    (root / src.name).write_text(html, encoding='utf-8')
    print('écrit', src.name)

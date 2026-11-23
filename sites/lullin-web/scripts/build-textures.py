"""Convertit les captures (.captures/raw/*.png) en textures WebP optimisées.

Usage : python3 scripts/build-textures.py   (nécessite Pillow)
"""
import json
import pathlib
from PIL import Image

root = pathlib.Path(__file__).resolve().parent.parent
raw = root / ".captures" / "raw"
pub = root / "public" / "screens"
meta = json.loads((root / ".captures" / "meta.json").read_text())

# (dossier, largeur, hauteur max, qualité)
variants = [
    ("wall", 384, 1536, 68),
    ("wall-sm", 256, 1024, 62),
    ("feature", 1024, 3072, 72),
    ("feature-sm", 768, 2304, 70),
]

for m in meta:
    if not m.get("ok"):
        print("ignoré :", m["slug"])
        continue
    im = Image.open(raw / f"{m['slug']}.png").convert("RGB")
    for folder, w, max_h, q in variants:
        s = w / im.width
        full = int(im.height * s)
        h = min(full, max_h)
        h -= h % 16
        (pub / folder).mkdir(parents=True, exist_ok=True)
        im.resize((w, full), Image.LANCZOS).crop((0, 0, w, h)).save(
            pub / folder / f"{m['slug']}.webp", "WEBP", quality=q, method=6
        )
    print("ok :", m["slug"])

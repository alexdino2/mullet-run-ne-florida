#!/usr/bin/env python3
"""One-off: download a single station header photo from Wikimedia Commons.

Same processing as fetch-gulf-beach-images.py: fetches the 1280px Commons
rendition (or the original when it is smaller), center-crops anything taller
than 4:3, resizes to 1200px wide and writes public/images/beaches/<slug>.jpg.
Record the credit and license in src/lib/content/beaches.ts.

    pip install pillow
    python3 scripts/fetch-beach-image.py lake-worth-inlet "Lake_Worth_Inlet_aerial_view.jpg"
"""
import io, json, sys, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

from PIL import Image

UA = "FloridaMulletRunImageFetch/1.0 (https://floridamulletrun.com)"
OUT = Path(__file__).resolve().parent.parent / "public/images/beaches"


def get(url: str) -> bytes:
    for attempt in range(6):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return urllib.request.urlopen(req, timeout=90).read()
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            print(f"  rate limited, retry {attempt + 1}", file=sys.stderr)
            time.sleep(15 * (attempt + 1))
    raise RuntimeError(f"gave up on {url}")


def image_url(name: str, width: int) -> str:
    title = urllib.parse.quote("File:" + name.replace(" ", "_"))
    api = (
        "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo"
        f"&iiprop=url&iiurlwidth={width}&format=json&titles={title}"
    )
    page = next(iter(json.loads(get(api))["query"]["pages"].values()))
    info = page["imageinfo"][0]
    return info.get("thumburl") or info["url"]


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    slug, name = sys.argv[1], sys.argv[2]
    im = Image.open(io.BytesIO(get(image_url(name, 1280)))).convert("RGB")
    w, h = im.size
    if h > w * 0.75:
        nh = int(w * 0.75)
        top = (h - nh) // 2
        im = im.crop((0, top, w, top + nh))
    if im.width > 1200:
        im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    dest = OUT / f"{slug}.jpg"
    im.save(dest, quality=80, optimize=True, progressive=True)
    print(f"{slug}: {im.width}x{im.height} -> {dest}")


if __name__ == "__main__":
    main()

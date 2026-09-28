#!/usr/bin/env python3
"""One-off: download the Gulf station header photos from Wikimedia Commons.

Fetches the 1280px Commons rendition of each file, center-crops anything
taller than 4:3, resizes to 1200px wide and writes
public/images/beaches/<slug>.jpg. Credits and licenses live in
src/lib/content/gulf-beaches.ts. Safe to re-run; existing files are skipped
unless --force is passed.

    pip install pillow && python3 scripts/fetch-gulf-beach-images.py
"""
import io, sys, time, urllib.error, urllib.parse, urllib.request
from hashlib import md5
from pathlib import Path

from PIL import Image

UA = "FloridaMulletRunImageFetch/1.0 (https://floridamulletrun.com)"
OUT = Path(__file__).resolve().parent.parent / "public/images/beaches"

# (station slug, Commons file name)
FILES = [
    ("pensacola-pass", "GINS_FL_Fort_Pickens_beach02.jpg"),
    ("navarre-beach", "Navarre_Beach_Pier_IGP2095.jpg"),
    ("destin-east-pass", "Okaloosa_Island,_FL,_USA_-_panoramio_(1).jpg"),
    ("st-andrew-pass", "Emerald_Coast_Waters_from_St_Andrews_State_Park.jpg"),
    ("cape-san-blas", "St_Joseph_Peninsula_FL_SP_beach_north01.jpg"),
    ("st-george-island", "PC_St_George_Island_SP07.jpg"),
    ("st-marks", "Red_clouds_at_sunrise_over_Apalachee_Bay_St._Marks_NWR_2020-07-22.jpg"),
    ("steinhatchee", "Steinhatchee_FL_River_west01.jpg"),
    ("cedar-key-suwannee", "Cedar_Key_Dock_Street01.jpg"),
    ("crystal-river", "Crystal_River_Preserve_State_Park_2.jpg"),
    ("homosassa", "Monkey_Island_on_Homosassa_River,_Florida_USA,_Jan_2013.jpg"),
    ("egmont-fort-desoto", "Fort_de_Soto_Beach.jpg"),
    ("anna-maria", "My_Day_on_Anna_Maria_Island_-_Nov_30_2009_028.JPG"),
    ("longboat-pass", "Longboat_Pass_Coquina_Jetty_(38954573295).jpg"),
    ("venice-inlet", "Venice_Jettys.jpg"),
    ("stump-pass", "Stump_Pass_Beach_SP_beach02.jpg"),
    ("boca-grande-pass", "Gasparilla_Island_SP_lighthouse02.jpg"),
    ("redfish-pass", "Captiva_Pass_&_North_Captiva_Island_(view_from_Cayo_Costa_Island,_Florida,_USA)_2_(23769694284).jpg"),
    ("sanibel", "Florida_Trip_-_March_2019_-_Sanibel_Lighthouse_(33724041868).jpg"),
    ("wiggins-pass", "Delnor-Wiggins_SP_beach01.jpg"),
    ("naples", "End_of_the_Naples_Pier.jpeg"),
    ("marco-island", "Marco_Island_Beach,_Marco_Island,_Florida_-_panoramio.jpg"),
]


def commons_thumb(name: str, width: int) -> str:
    name = name.replace(" ", "_")
    h = md5(name.encode()).hexdigest()
    q = urllib.parse.quote(name)
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{width}px-{q}"


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


def main() -> None:
    force = "--force" in sys.argv
    for slug, name in FILES:
        dest = OUT / f"{slug}.jpg"
        if dest.exists() and not force:
            print(f"skip {slug}")
            continue
        im = Image.open(io.BytesIO(get(commons_thumb(name, 1280)))).convert("RGB")
        w, h = im.size
        if h > w * 0.75:
            nh = int(w * 0.75)
            top = (h - nh) // 2
            im = im.crop((0, top, w, top + nh))
        if im.width > 1200:
            im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
        im.save(dest, quality=80, optimize=True, progressive=True)
        print(f"{slug}: {im.width}x{im.height}")
        time.sleep(4)


if __name__ == "__main__":
    main()

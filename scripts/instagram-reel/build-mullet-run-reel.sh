#!/usr/bin/env bash
# One-off: build the "mullet run is on" Instagram Reel (1080x1920, ~28s).
#
# Downloads three openly licensed Wikimedia Commons clips (see CREDITS.md),
# cuts them into a vertical edit with text overlays, and keeps the real surf
# sound from Apollo Beach as the audio bed. Music is added in the Instagram
# app so it stays licensed. Safe to re-run; downloads are cached in
# $WORK/src and skipped when present.
#
#   bash scripts/instagram-reel/build-mullet-run-reel.sh [WORK_DIR]
#
# Output: $WORK/mullet-run-reel.mp4
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${1:-$HERE/out}"
SRC="$WORK/src"
TXT="$WORK/text"
mkdir -p "$SRC" "$TXT"

UA="FloridaMulletRunVideo/1.0 (https://floridamulletrun.com)"
FONT_DIR="${FONT_DIR:-/usr/share/fonts/opentype/inter}"
BLACK="$FONT_DIR/Inter-Black.otf"
SEMI="$FONT_DIR/Inter-SemiBold.otf"

# Commons rate-limits original files, so fetch its transcoded renditions.
fetch() { # out_name commons_path resolution
  local out="$SRC/$1" name="${2##*/}"
  if [[ -s "$out" ]] && ffprobe -v error "$out" >/dev/null 2>&1; then return; fi
  local url="https://upload.wikimedia.org/wikipedia/commons/transcoded/$2/$name.$3.vp9.webm"
  for i in 1 2 3 4 5; do
    echo "fetch $1 ($3) attempt $i"
    if curl -fsSL -m 600 -A "$UA" -o "$out" "$url" && ffprobe -v error "$out" >/dev/null 2>&1; then return; fi
    sleep $((i * 30))
  done
  echo "failed to download $1 from $url" >&2; exit 1
}

fetch surf.webm     "2/29/Waves_waving_at_Apollo_Beach_%28Canaveral_National_Seashore%2C_Florida%2C_GEDC7077%29.webm" 720p
fetch mullet.webm   "c/ca/%D0%9A%D0%B5%D1%84%D0%B0%D0%BB%D1%8C-%D0%BB%D0%BE%D0%B1%D0%B0%D0%BD_._Mugil_cephalus_DSCF5631.webm" 1080p
fetch pelicans.webm "c/c1/Feeding_brown_pelicans_%28Pelecanus_occidentalis%29.webm" 720p

# Overlay copy lives in files so apostrophes need no escaping.
printf '%s' "THE MULLET"                         > "$TXT/t1a"
printf '%s' "RUN IS ON"                          > "$TXT/t1b"
printf '%s' "Florida's Atlantic coast, every fall" > "$TXT/s1"
printf '%s' "Millions of"                        > "$TXT/t2a"
printf '%s' "striped mullet"                     > "$TXT/t2b"
printf '%s' "pushing south along the beach"      > "$TXT/s2"
printf '%s' "Everything hungry"                  > "$TXT/t3a"
printf '%s' "follows"                            > "$TXT/t3b"
printf '%s' "pelicans, jacks, tarpon, sharks"    > "$TXT/s3"
printf '%s' "Wind, tide and"                     > "$TXT/t4a"
printf '%s' "water temp"                         > "$TXT/t4b"
printf '%s' "decide where they show up"          > "$TXT/s4"
printf '%s' "Know before"                        > "$TXT/e1"
printf '%s' "you go"                             > "$TXT/e2"
printf '%s' "floridamulletrun.com"               > "$TXT/e3"
printf '%s' "Live mullet run scores for both coasts" > "$TXT/e4"
printf '%s' "Footage via Wikimedia Commons: Trougnouf (CC BY 4.0)," > "$TXT/cr1"
printf '%s' "Kora27 (CC BY-SA 4.0), IseFire (CC BY 2.0)"          > "$TXT/cr2"

# Fill a 1080x1920 frame from a 16:9 source (centre crop), 30 fps.
V="scale=-2:1920:flags=lanczos,crop=1080:1920,fps=30,setsar=1,format=yuv420p"
# Pull the pink cast out of the Red Sea mullet footage.
MULLET_GRADE="colorchannelmixer=rr=0.88:gg=1.0:bb=1.04,eq=saturation=1.08:contrast=1.05"

# drawtext helper: file, font, size, y, start, end (fade in 0.35s).
dt() {
  printf "drawtext=fontfile=%s:textfile=%s:fontsize=%s:fontcolor=white:x=(w-text_w)/2:y=%s:shadowcolor=black@0.55:shadowx=0:shadowy=4:enable='between(t,%s,%s)':alpha='min(1,(t-%s)/0.35)'" \
    "$2" "$TXT/$1" "$3" "$4" "$5" "$6" "$5"
}

# Timeline (seconds): surf 0-4 | mullet 4-8, 8-11.5 | pelicans 11.5-15, 15-18 | mullet 18-22 | end card 22-28
FC="
[0:v]trim=start=210:duration=4,setpts=PTS-STARTPTS,$V[a];
[1:v]trim=start=0.2:duration=4,setpts=PTS-STARTPTS,$V,$MULLET_GRADE[b];
[1:v]trim=start=16.5:duration=3.5,setpts=PTS-STARTPTS,$V,$MULLET_GRADE[c];
[2:v]trim=start=0.5:duration=3.5,setpts=PTS-STARTPTS,$V[d];
[2:v]trim=start=20.5:duration=3,setpts=PTS-STARTPTS,$V[e];
[1:v]trim=start=20.8:duration=4,setpts=PTS-STARTPTS,$V,$MULLET_GRADE[f];
[0:v]trim=start=230:duration=6,setpts=PTS-STARTPTS,$V,gblur=sigma=18,eq=brightness=-0.18:saturation=0.85[g];
[a][b][c][d][e][f][g]concat=n=7:v=1:a=0,
drawbox=x=0:y=590:w=iw:h=420:color=black@0.30:t=fill:enable='lt(t,22)',
$(dt t1a "$BLACK" 118 640 0.3 4),
$(dt t1b "$BLACK" 118 770 0.3 4),
$(dt s1 "$SEMI" 50 920 0.8 4),
$(dt t2a "$BLACK" 104 640 4.3 11.5),
$(dt t2b "$BLACK" 104 760 4.3 11.5),
$(dt s2 "$SEMI" 50 900 4.8 11.5),
$(dt t3a "$BLACK" 94 645 11.8 18),
$(dt t3b "$BLACK" 94 760 11.8 18),
$(dt s3 "$SEMI" 50 900 12.3 18),
$(dt t4a "$BLACK" 104 640 18.3 22),
$(dt t4b "$BLACK" 104 760 18.3 22),
$(dt s4 "$SEMI" 50 900 18.8 22),
$(dt e1 "$BLACK" 120 600 22.3 28),
$(dt e2 "$BLACK" 120 735 22.3 28),
$(dt e3 "$BLACK" 72 920 22.9 28),
$(dt e4 "$SEMI" 46 1015 23.3 28),
drawtext=fontfile=$SEMI:textfile=$TXT/cr1:fontsize=26:fontcolor=white@0.8:x=(w-text_w)/2:y=1500:enable='between(t,22.3,28)',
drawtext=fontfile=$SEMI:textfile=$TXT/cr2:fontsize=26:fontcolor=white@0.8:x=(w-text_w)/2:y=1540:enable='between(t,22.3,28)',
fade=t=in:st=0:d=0.4,fade=t=out:st=27.4:d=0.6[v];
[0:a]atrim=start=210:duration=28,asetpts=PTS-STARTPTS,aresample=48000,volume=0.9,afade=t=in:st=0:d=0.8,afade=t=out:st=26.5:d=1.5[aud]
"

ffmpeg -v warning -stats -y \
  -i "$SRC/surf.webm" -i "$SRC/mullet.webm" -i "$SRC/pelicans.webm" \
  -filter_complex "$FC" -map "[v]" -map "[aud]" \
  -c:v libx264 -profile:v high -preset slow -crf 20 -r 30 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -t 28 \
  "$WORK/mullet-run-reel.mp4"

echo "wrote $WORK/mullet-run-reel.mp4"

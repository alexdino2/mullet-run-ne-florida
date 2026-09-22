#!/usr/bin/env python3
"""Generate public/images/mullet-school.svg.

A mullet blitz at sunrise: ~120 mullet leaping left in panic while a tarpon,
shark fins and jacks chase them in from the right. Animation is pure CSS inside
the SVG so it plays when used as a plain <img>; prefers-reduced-motion pauses
it on the first frame.

Run: python3 scripts/generate-mullet-school.py
"""
import os
import random

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images", "mullet-school.svg")
rng = random.Random(1225)  # fixed seed so the output is reproducible

W, H = 400, 320
WATERLINE = 193  # splash base
CLIP_Y = 198  # fish are clipped below this so they emerge from / vanish into the sea


def r(a, b):
    return rng.uniform(a, b)


def f(x):
    return f"{x:.1f}".rstrip("0").rstrip(".")


# ---------------------------------------------------------------------------
# Leaping fish. Each entry: start x, horizontal run, peak y, pitch, scale,
# cycle length, start phase, splash?  Mullet all flee left (mirrored).
# ---------------------------------------------------------------------------
LAYERS = [
    # name, count, scale range, peak-y range, run range, splash
    ("far", 56, (0.16, 0.28), (120, 172), (22, 50), False),
    ("mid", 44, (0.30, 0.48), (70, 150), (40, 80), True),
    ("near", 20, (0.52, 0.78), (28, 110), (60, 110), True),
]


def make_fish(count, scale, peak, run, splash):
    fish = []
    for i in range(count):
        # denser toward the right, where the predators are pushing the school
        x0 = 20 + (430 - 20) * (rng.random() ** 0.7)
        sc = r(*scale)
        y0 = CLIP_Y + 62 * sc + 6  # fully hidden at rest
        fish.append(dict(
            x0=x0, y0=y0, sc=sc,
            h=y0 - r(*peak),
            dx=r(*run),
            a=r(44, 60),
            dur=r(2.3, 3.9),
            phase=rng.random(),
            splash=splash,
        ))
    return fish


layers = {name: make_fish(n, s, p, d, sp) for name, n, s, p, d, sp in LAYERS}


def fish_markup(fsh, sym="mullet", sym_box=(-62, -26, 118, 44)):
    x, y, w, h = sym_box
    delay = -fsh["phase"] * fsh["dur"]
    var = (f"--dx:{f(fsh['dx'])}px;--h:{f(fsh['h'])}px;--a:{f(fsh['a'])}deg;"
           f"--dur:{fsh['dur']:.2f}s;--delay:{delay:.2f}s")
    return (f'<g transform="translate({f(fsh["x0"])} {f(fsh["y0"])}) scale(-1 1)" style="{var}">'
            f'<g class="ly"><g class="lxr">'
            f'<use href="#{sym}" x="{x}" y="{y}" width="{w}" height="{h}" transform="scale({fsh["sc"]:.2f})"/>'
            f'</g></g></g>')


def splash_markup(fsh, size=None):
    delay = -fsh["phase"] * fsh["dur"]
    var = f"--dur:{fsh['dur']:.2f}s;--delay:{delay:.2f}s"
    ss = size or round(0.45 + fsh["sc"] * 0.7, 2)
    xin = fsh["x0"] - fsh["dx"] * 0.1
    xout = fsh["x0"] - fsh["dx"] * 0.9
    use = '<use href="#splash" x="-30" y="-30" width="60" height="36" class="{}"/>'
    return (f'<g style="{var}">'
            f'<g transform="translate({f(xin)} {WATERLINE}) scale({ss})">{use.format("sp-in")}</g>'
            f'<g transform="translate({f(xout)} {WATERLINE}) scale({ss})">{use.format("sp-out")}</g>'
            f'</g>')


# Tarpon crashing through the school
tarpons = [
    dict(x0=420, y0=CLIP_Y + 60, sc=0.62, h=CLIP_Y + 60 - 62, dx=150, a=40, dur=5.2, phase=0.08),
    dict(x0=250, y0=CLIP_Y + 50, sc=0.46, h=CLIP_Y + 50 - 96, dx=110, a=42, dur=6.7, phase=0.55),
]

# Underwater school: two identical tiles side by side scrolling left forever
school = [(r(0, 400), r(212, 312), r(0.45, 1.0)) for _ in range(60)]

# Jacks / bluefish chasing below the surface
jacks = [(232, 0.7, 6.5, 0.1), (262, 0.8, 7.8, 0.62), (292, 0.65, 5.8, 0.35), (248, 0.55, 7.1, 0.82), (282, 0.75, 8.6, 0.9)]

# Shark fins cutting the surface
sharks = [(1.0, 11.0, 0.15), (0.75, 14.0, 0.7)]

# Surface chop over the blitz
ripples = [(r(0, 380), r(206, 250), r(0.6, 1.3)) for _ in range(26)]


STYLE = """
  <style>
    .ly { animation: ly var(--dur) var(--delay) infinite; }
    .lxr { animation: lxr var(--dur) linear var(--delay) infinite; }
    .sp-in, .sp-out { opacity: 0; }
    .sp-in { animation: sp-in var(--dur) ease-out var(--delay) infinite; }
    .sp-out { animation: sp-out var(--dur) ease-out var(--delay) infinite; }
    .school { animation: scroll 16s linear infinite; }
    .swim { animation: swim var(--dur) linear var(--delay) infinite; }
    .ripple { animation: ripple 1.6s ease-in-out var(--delay) infinite alternate; }
    .glint { animation: glint 3s ease-in-out infinite alternate; }
    .glint:nth-child(2) { animation-delay: -1s; }
    .glint:nth-child(3) { animation-delay: -2s; }

    /* Leap: x and pitch are linear, y rises then falls, which traces a parabola.
       translateX and translateY commute, so x + pitch share one element. */
    @keyframes lxr {
      0% { transform: translateX(0) rotate(calc(var(--a) * -1)); }
      30%, 100% { transform: translateX(var(--dx)) rotate(var(--a)); }
    }
    @keyframes ly {
      0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1); }
      15% { transform: translateY(calc(var(--h) * -1)); animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33); }
      30%, 100% { transform: translateY(0); }
    }
    @keyframes sp-in {
      0% { opacity: 0; transform: scale(0.3); }
      4% { opacity: 1; transform: scale(0.7); }
      12%, 100% { opacity: 0; transform: scale(1.15); }
    }
    @keyframes sp-out {
      0%, 25% { opacity: 0; transform: scale(0.3); }
      28% { opacity: 1; transform: scale(0.75); }
      37%, 100% { opacity: 0; transform: scale(1.2); }
    }
    @keyframes scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-400px); }
    }
    @keyframes swim {
      from { transform: translateX(0); }
      to { transform: translateX(-560px); }
    }
    @keyframes ripple {
      from { opacity: 0.2; transform: translateX(3px); }
      to { opacity: 0.85; transform: translateX(-3px); }
    }
    @keyframes glint {
      from { opacity: 0.4; }
      to { opacity: 1; }
    }

    /* Reduced motion: hold the first (mid-blitz) frame instead of looping */
    @media (prefers-reduced-motion: reduce) {
      * { animation-play-state: paused !important; }
    }
  </style>
"""

DEFS = """
  <defs>
    <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="190">
      <stop offset="0" stop-color="#0a2d44"/>
      <stop offset="0.45" stop-color="#0f5479"/>
      <stop offset="0.78" stop-color="#e79a74"/>
      <stop offset="1" stop-color="#fcd9a8"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff4d6"/>
      <stop offset="0.45" stop-color="#ffd58a"/>
      <stop offset="1" stop-color="#ffd58a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0480b6"/>
      <stop offset="0.4" stop-color="#096694"/>
      <stop offset="1" stop-color="#0a2d44"/>
    </linearGradient>
    <linearGradient id="glint" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffe2b0" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffe2b0" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#ffe2b0" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="scales" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b4a5e"/>
      <stop offset="0.38" stop-color="#6f8fa3"/>
      <stop offset="0.6" stop-color="#d6e3ea"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="tarpon-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c3a48"/>
      <stop offset="0.3" stop-color="#6d8a96"/>
      <stop offset="0.55" stop-color="#dfe8ec"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <pattern id="tarpon-scales" width="9" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 8 Q4.5 1 9 8" fill="none" stroke="#1c3a48" stroke-width="0.8" opacity="0.35"/>
    </pattern>
    <clipPath id="air"><rect width="400" height="198"/></clipPath>

    <!-- Striped mullet, facing right, ~112 units nose to tail -->
    <symbol id="mullet" viewBox="-62 -26 118 44" overflow="visible">
      <path fill="#2b4a5e" d="M-40 0 L-61 -14 Q-55 0 -61 14 Z"/>
      <path fill="#35566b" d="M-22 -9 L-17 -17 L-12 -9 Z"/>
      <path fill="#35566b" d="M0 -12 L7 -23 L10 -21 L16 -11 Z"/>
      <path fill="#35566b" d="M-26 8 L-19 14 L-14 8 Z"/>
      <path fill="url(#scales)" stroke="#1d3547" stroke-width="0.8"
        d="M-42 0 C-30 -9 -6 -14 20 -12 C38 -12 50 -8 52 0 C50 7 38 11 20 11 C-6 13 -30 9 -42 0 Z"/>
      <g fill="none" stroke="#2b4a5e" stroke-width="0.9" stroke-linecap="round" opacity="0.55">
        <path d="M-34 -3 C-14 -8 10 -9 32 -6"/>
        <path d="M-36 0 C-14 -4 12 -5 36 -2"/>
        <path d="M-34 3 C-14 0 12 -1 34 2"/>
      </g>
      <path fill="none" stroke="#1d3547" stroke-width="0.9" d="M34 -8 Q30 0 35 8"/>
      <path fill="#5f7f93" d="M28 1 L16 8 L24 2 Z"/>
      <circle cx="42" cy="-2.5" r="3.4" fill="#f2f6f8" stroke="#1d3547" stroke-width="0.6"/>
      <circle cx="42.6" cy="-2.5" r="1.9" fill="#0a1a24"/>
      <path fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.7" d="M-18 -7 C0 -11 18 -11 34 -7"/>
    </symbol>

    <!-- Tarpon, facing right, jaws open: big scales, trailing dorsal ray, upturned jaw -->
    <symbol id="tarpon" viewBox="-104 -64 204 100" overflow="visible">
      <path fill="#1c3a48" d="M-66 0 L-102 -34 Q-86 0 -102 34 Z"/>
      <path fill="#2a4a58" d="M-14 -27 L0 -46 Q-18 -54 -44 -60 Q-16 -44 10 -26 Z"/>
      <path fill="#2a4a58" d="M-34 18 L-28 34 L-12 21 Z"/>
      <path fill="url(#tarpon-body)" stroke="#12303d" stroke-width="1"
        d="M-70 0 C-54 -17 -10 -30 34 -28 C58 -27 74 -19 84 -9 L98 -20 L92 -4 L86 0 C80 11 62 21 34 22 C-10 25 -54 16 -70 0 Z"/>
      <path fill="url(#tarpon-scales)"
        d="M-60 0 C-46 -14 -10 -25 30 -24 L30 18 C-10 21 -46 13 -60 0 Z"/>
      <path fill="none" stroke="#12303d" stroke-width="1.2" d="M54 -22 Q46 -2 56 16"/>
      <path fill="#0a1a24" d="M84 -9 L98 -20 L92 -4 Z" opacity="0.6"/>
      <path fill="#6d8a96" d="M50 6 L30 18 L44 5 Z"/>
      <circle cx="70" cy="-11" r="6" fill="#f6f1e0" stroke="#12303d" stroke-width="0.8"/>
      <circle cx="71" cy="-11" r="3.4" fill="#0a1a24"/>
      <path fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity="0.6" d="M-30 -18 C0 -24 30 -24 52 -19"/>
    </symbol>

    <!-- Shark dorsal + tail fin, heading left, with wake -->
    <symbol id="shark" viewBox="-4 -36 80 40" overflow="visible">
      <path fill="#0d2230" d="M0 2 C3 -14 9 -26 18 -33 C17 -19 21 -8 32 2 Z"/>
      <path fill="#0d2230" d="M60 2 L66 -12 L68 -2 L72 2 Z"/>
      <g fill="none" stroke="#e6f7fd" stroke-width="1.4" stroke-linecap="round" opacity="0.8">
        <path d="M-2 2 Q14 -3 34 2"/>
        <path d="M30 4 L60 8"/>
        <path d="M28 0 L52 -4"/>
      </g>
    </symbol>

    <!-- Splash crown -->
    <symbol id="splash" viewBox="-30 -30 60 36" overflow="visible">
      <g fill="#e6f7fd">
        <path d="M-24 4 Q-18 -10 -14 -20 Q-12 -8 -8 2 Z"/>
        <path d="M-10 2 Q-6 -16 0 -28 Q4 -14 8 2 Z"/>
        <path d="M8 2 Q12 -8 16 -18 Q18 -6 24 4 Z"/>
        <circle cx="-18" cy="-24" r="2"/>
        <circle cx="-4" cy="-32" r="1.6"/>
        <circle cx="8" cy="-30" r="2.2"/>
        <circle cx="20" cy="-22" r="1.6"/>
      </g>
      <ellipse cx="0" cy="4" rx="28" ry="4" fill="none" stroke="#e6f7fd" stroke-width="1.6" opacity="0.8"/>
    </symbol>

    <!-- Underwater silhouettes, facing left -->
    <path id="shadow" d="M20 0 C12 -5 -6 -6 -16 -4 C-22 -3 -25 -1 -26 0 C-25 1 -22 3 -16 4 C-6 6 12 5 20 0 Z M19 0 L28 -6 L26 0 L28 6 Z"/>
    <path id="jack" d="M-40 0 C-30 -14 0 -18 24 -12 C34 -9 40 -4 44 0 L60 -16 L54 0 L60 16 L44 0 C40 4 34 9 24 12 C0 18 -30 14 -40 0 Z M-4 -16 L10 -26 L14 -15 Z"/>
  </defs>
"""


def build():
    o = []
    o.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="title desc">')
    o.append('  <title id="title">Mullet blitz: a school of mullet leaping to escape predators</title>')
    o.append('  <desc id="desc">Over a hundred silver mullet leap from the Atlantic surf at sunrise, fleeing a tarpon, sharks and jacks chasing them in from the right.</desc>')
    o.append(STYLE)
    o.append(DEFS)

    o.append('  <!-- Sky and sunrise -->')
    o.append('  <rect width="400" height="320" fill="url(#sky)"/>')
    o.append('  <circle cx="300" cy="182" r="70" fill="url(#sun)"/>')
    o.append('  <circle cx="300" cy="186" r="22" fill="#fff1cf"/>')
    o.append('  <g fill="none" stroke="#0a2d44" stroke-width="1.6" stroke-linecap="round" opacity="0.7">')
    for d in ("M60 58 q6 -6 12 0 q6 -6 12 0", "M96 42 q4 -4 8 0 q4 -4 8 0",
              "M340 70 q5 -5 10 0 q5 -5 10 0", "M200 30 q4 -4 8 0 q4 -4 8 0",
              "M150 48 q5 -5 10 0 q5 -5 10 0"):
        o.append(f'    <path d="{d}"/>')
    o.append('  </g>')

    o.append('\n  <!-- Sea -->')
    o.append('  <rect y="186" width="400" height="134" fill="url(#sea)"/>')
    o.append('  <g>')
    o.append('    <rect x="220" y="188" width="160" height="4" fill="url(#glint)" class="glint"/>')
    o.append('    <rect x="240" y="196" width="120" height="3" fill="url(#glint)" class="glint"/>')
    o.append('    <rect x="262" y="204" width="76" height="2" fill="url(#glint)" class="glint"/>')
    o.append('  </g>')

    o.append('\n  <!-- The school below, streaming left (two tiles for a seamless loop) -->')
    o.append('  <g fill="#0a2d44" opacity="0.5"><g class="school">')
    for tile in (0, 400):
        for x, y, s in school:
            o.append(f'    <use href="#shadow" transform="translate({f(x + tile)} {f(y)}) scale({s:.2f})"/>')
    o.append('  </g></g>')

    o.append('\n  <!-- Jacks chasing through the school -->')
    o.append('  <g fill="#061c2b" opacity="0.6">')
    for y, s, dur, ph in jacks:
        o.append(f'    <g style="--dur:{dur}s;--delay:{-ph * dur:.2f}s"><g class="swim">'
                 f'<use href="#jack" transform="translate(470 {y}) scale({s})"/></g></g>')
    o.append('  </g>')

    o.append('\n  <!-- Nervous water over the blitz -->')
    o.append('  <g fill="none" stroke="#b0e8fb" stroke-width="1.3" stroke-linecap="round">')
    for x, y, s in ripples:
        o.append(f'    <path class="ripple" style="--delay:{-r(0, 1.6):.2f}s" '
                 f'd="M{f(x)} {f(y)} q{f(6 * s)} -{f(3 * s)} {f(12 * s)} 0 t{f(12 * s)} 0"/>')
    o.append('  </g>')

    o.append('\n  <!-- Shark fins cutting the surface -->')
    for s, dur, ph in sharks:
        o.append(f'  <g style="--dur:{dur}s;--delay:{-ph * dur:.2f}s"><g class="swim">'
                 f'<use href="#shark" x="-4" y="-36" width="80" height="40" transform="translate(440 196) scale({s})"/></g></g>')

    o.append('\n  <!-- Splashes, timed to each fish leaving and re-entering the water -->')
    o.append('  <g>')
    for name in ("far", "mid", "near"):
        for fsh in layers[name]:
            if fsh["splash"]:
                o.append('    ' + splash_markup(fsh))
    for t in tarpons:
        o.append('    ' + splash_markup(t, size=1.9))
    o.append('  </g>')

    o.append('\n  <!-- Leaping fish, back to front, clipped at the waterline -->')
    o.append('  <g clip-path="url(#air)">')
    for name in ("far", "mid"):
        o.append(f'    <!-- {name} -->')
        for fsh in layers[name]:
            o.append('    ' + fish_markup(fsh))
    o.append('    <!-- tarpon -->')
    for t in tarpons:
        o.append('    ' + fish_markup(t, "tarpon", (-104, -64, 204, 100)))
    o.append('    <!-- near -->')
    for fsh in layers["near"]:
        o.append('    ' + fish_markup(fsh))
    o.append('  </g>')

    o.append('\n  <!-- Foreground water lip -->')
    wave = "M0 196 q20 -6 40 0" + " t40 0" * 9
    o.append(f'  <path fill="#0480b6" opacity="0.85" d="{wave} V204 H0 Z"/>')
    o.append(f'  <path fill="none" stroke="#d6f3fd" stroke-width="1.4" stroke-linecap="round" opacity="0.8" d="{wave}"/>')
    o.append('</svg>\n')
    return "\n".join(o)


if __name__ == "__main__":
    with open(OUT, "w") as fh:
        fh.write(build())
    print(f"wrote {os.path.normpath(OUT)} ({os.path.getsize(OUT)} bytes)")

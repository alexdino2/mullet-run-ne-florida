#!/usr/bin/env python3
"""Render a simulated drone flyover of the fall mullet run in Northeast Florida.

A procedural (CGI) top-down tracking shot: the drone follows a mullet school
running south through the trough between the sandbar and the beach, drops low
as a blacktip shark blitzes the school, then pulls back as pelicans glide north
over the wash. Everything is generated from code: no stock footage.

Orientation: screen up is east (offshore), screen right is south, so the
schools swim left to right like they would past you standing on the beach.

Run:   python3 scripts/render-mullet-run-drone.py [--out FILE] [--width 1920]
                [--fps 30] [--preview 0,8,13,20]
Needs: numpy, Pillow, ffmpeg on PATH.
"""
import argparse
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

DURATION = 26.0
SCHOOL_SPEED = 1.3  # m/s, mullet cruising south
SEED = 1225

# --------------------------------------------------------------------------
# Noise textures (tileable, built in the frequency domain)
# --------------------------------------------------------------------------


def make_noise(n, beta, seed):
    rng = np.random.default_rng(seed)
    fx = np.fft.fftfreq(n)[:, None]
    fy = np.fft.rfftfreq(n)[None, :]
    f = np.sqrt(fx * fx + fy * fy)
    f[0, 0] = 1.0
    # high-pass so the dominant feature is ~FEATURE texels, not the whole tile
    amp = 1.0 / f ** beta * (1 - np.exp(-(f * FEATURE) ** 4)) * np.exp(-(f * FEATURE / 4.0) ** 2)
    amp[0, 0] = 0.0
    spec = amp * (rng.normal(size=f.shape) + 1j * rng.normal(size=f.shape))
    tex = np.fft.irfft2(spec, s=(n, n))
    tex = (tex - tex.mean()) / tex.std()
    return tex.astype(np.float32)


TEX_N = 512
FEATURE = 16.0  # texels across a typical blob; samp(scale) => blobs ~16*scale m
NOISE = {}


def init_noise():
    NOISE["a"] = make_noise(TEX_N, 1.6, SEED)
    NOISE["b"] = make_noise(TEX_N, 1.6, SEED + 1)
    NOISE["c"] = make_noise(TEX_N, 1.1, SEED + 2)  # lacy, more high frequency
    NOISE["d"] = make_noise(TEX_N, 2.2, SEED + 3)  # smooth, big shapes


def samp(name, x, y, scale):
    """Bilinear sample of a tileable noise texture with blobs about `scale` meters across."""
    tex = NOISE[name]
    u = x * (FEATURE / scale)
    v = y * (FEATURE / scale)
    u0 = np.floor(u)
    v0 = np.floor(v)
    fu = (u - u0).astype(np.float32)
    fv = (v - v0).astype(np.float32)
    i0 = u0.astype(np.int64) % TEX_N
    j0 = v0.astype(np.int64) % TEX_N
    i1 = (i0 + 1) % TEX_N
    j1 = (j0 + 1) % TEX_N
    a = tex[j0, i0] * (1 - fu) + tex[j0, i1] * fu
    b = tex[j1, i0] * (1 - fu) + tex[j1, i1] * fu
    return a * (1 - fv) + b * fv


def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def shore(y):
    """Cross-shore x of the mean waterline at alongshore position y (m)."""
    y = np.asarray(y, dtype=np.float64)
    return 4.0 * np.sin(y / 85.0) + 2.5 * np.sin(y / 31.0 + 1.3) + 1.2 * samp("d", 7.0, y, 70.0)


# --------------------------------------------------------------------------
# Camera
# --------------------------------------------------------------------------

# t, center cross-shore offset (m from waterline), alongshore offset from the
# main school (m, + = south), frame width (m), rotation (deg, 90 = beach level)
KEYS = [
    (0.0, 14.0, -95.0, 190.0, 97.0),
    (6.5, 14.0, -38.0, 125.0, 94.0),
    (11.0, 13.0, -3.0, 50.0, 90.0),
    (16.5, 14.0, 3.0, 40.0, 87.0),
    (21.0, 11.0, 18.0, 115.0, 84.0),
    (26.0, 14.0, 42.0, 220.0, 80.0),
]


def catmull(p0, p1, p2, p3, s):
    s2, s3 = s * s, s * s * s
    return 0.5 * ((2 * p1) + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s2 + (-p0 + 3 * p1 - 3 * p2 + p3) * s3)


def interp_keys(keys, t):
    ts = [k[0] for k in keys]
    vals = [np.array(k[1:], dtype=np.float64) for k in keys]
    if t <= ts[0]:
        return vals[0]
    if t >= ts[-1]:
        return vals[-1]
    i = max(j for j in range(len(ts) - 1) if ts[j] <= t)
    s = (t - ts[i]) / (ts[i + 1] - ts[i])
    s = s * s * (3 - 2 * s) * 0.35 + s * 0.65  # gentle ease, keeps momentum
    p0 = vals[max(i - 1, 0)]
    p3 = vals[min(i + 2, len(vals) - 1)]
    return catmull(p0, vals[i], vals[i + 1], p3, s)


def school_y(t):
    return SCHOOL_SPEED * t


def camera(t):
    k = KEYS
    logk = [(a, b, c, math.log(d), e) for a, b, c, d, e in k]
    d_off, y_off, logw, theta = interp_keys(logk, t)
    # a little hand-held drift
    d_off += 0.6 * math.sin(t * 0.7) + 0.3 * math.sin(t * 1.9 + 1)
    y_off += 0.5 * math.sin(t * 0.5 + 2)
    theta += 0.6 * math.sin(t * 0.43)
    cy = school_y(t) + y_off
    cx = float(shore(cy)) + d_off
    return cx, cy, math.exp(logw), math.radians(theta)


# --------------------------------------------------------------------------
# Fish schools
# --------------------------------------------------------------------------

# alongshore offset from main school (m), cross-shore distance from waterline,
# fish count, length (m), width (m), speed factor
SCHOOLS = [
    (0.0, 18.0, 7000, 24.0, 6.5, 1.0),
    (-120.0, 13.0, 4500, 28.0, 4.5, 1.02),
    (-58.0, 27.0, 2000, 13.0, 4.0, 0.97),
    (62.0, 11.0, 3500, 20.0, 3.5, 1.0),
    (140.0, 23.0, 5500, 32.0, 7.0, 0.98),
    (235.0, 16.0, 4000, 24.0, 5.5, 1.01),
    (310.0, 21.0, 3000, 17.0, 4.5, 1.0),
]

FISH = {}


def init_fish():
    rng = np.random.default_rng(SEED + 10)
    rows = []
    for si, (oy, dd, n, ln, wd, spd) in enumerate(SCHOOLS):
        # mixture of sub-clusters for an irregular, living outline
        k = 5
        cy = rng.normal(0, ln * 0.22, k)
        cx = rng.normal(0, wd * 0.18, k)
        sy = rng.uniform(0.18, 0.3, k) * ln
        sx = rng.uniform(0.15, 0.25, k) * wd
        wts = rng.uniform(0.5, 1.5, k)
        wts /= wts.sum()
        comp = rng.choice(k, size=n, p=wts)
        ay = rng.normal(cy[comp], sy[comp])
        ax = rng.normal(cx[comp], sx[comp])
        # denser, blunter leading (south) edge
        ay = np.where(ay > 0, ay * 0.75, ay)
        size = rng.normal(0.31, 0.04, n).clip(0.2, 0.42)
        rows.append(np.stack([
            np.full(n, si), ax, ay, size,
            rng.uniform(0, 2 * np.pi, n), rng.uniform(0, 2 * np.pi, n),
            rng.normal(0, 0.12, n), rng.uniform(0, 1, n),
        ], axis=1))
    FISH["data"] = np.concatenate(rows).astype(np.float64)


def fish_template(sp):
    """Points (forward, lateral) in units of body length, spacing sp (body lengths)."""
    sp = max(sp, 0.025)
    g = np.arange(-0.5, 0.5 + 1e-9, sp)
    fx, fy = np.meshgrid(g, np.arange(-0.15, 0.15 + 1e-9, sp))
    fx, fy = fx.ravel(), fy.ravel()
    # torpedo body: widest a third back from the head, taper to the tail
    half = 0.095 * np.sqrt(np.clip(1 - ((fx - 0.08) / 0.5) ** 2, 0, 1))
    body = np.abs(fy) <= np.maximum(half, sp * 0.5)
    tail = (fx < -0.36) & (np.abs(fy) <= (-0.36 - fx) * 0.55 + 0.01)
    keep = (body | tail) & (fx > -0.5)
    w = np.where(tail[keep], 0.7, 1.0)
    if keep.sum() == 0:
        return np.array([[0.0, 0.0]]), np.array([1.0])
    return np.stack([fx[keep], fy[keep]], 1), w


SHARK_KEYS = [  # t, cross-shore (m from waterline), alongshore offset from main school
    (9.5, 52.0, 16.0),
    (11.5, 30.0, 9.0),
    (12.8, 20.0, 3.0),
    (13.8, 16.0, -3.0),
    (14.9, 19.5, -9.0),
    (16.3, 32.0, -13.0),
    (18.5, 58.0, -16.0),
]


def shark_pos(t):
    if t < SHARK_KEYS[0][0] or t > SHARK_KEYS[-1][0]:
        return None
    d, oy = interp_keys(SHARK_KEYS, t)
    y = school_y(t) + oy
    return float(shore(y)) + d, y


def shark_heading(t):
    lo, hi = SHARK_KEYS[0][0], SHARK_KEYS[-1][0]
    a = shark_pos(min(max(t - 0.05, lo), hi - 0.1))
    b = shark_pos(min(max(t + 0.05, lo + 0.1), hi))
    return math.atan2(b[1] - a[1], b[0] - a[0])


def fish_state(t):
    D = FISH["data"]
    si = D[:, 0].astype(int)
    oy = np.array([s[0] for s in SCHOOLS])[si]
    dd = np.array([s[1] for s in SCHOOLS])[si]
    spd = np.array([s[5] for s in SCHOOLS])[si]
    ph1, ph2 = D[:, 4], D[:, 5]
    y = school_y(t) * spd + oy + D[:, 2] + 0.35 * np.sin(0.8 * t + ph1)
    lat = D[:, 1] + 0.25 * np.sin(0.55 * t + ph2) + 0.6 * np.sin(y / 9.0 + 0.3 * t)
    x = shore(y) + dd + lat
    head = np.pi / 2 + D[:, 6] + 0.12 * np.cos(0.55 * t + ph2)  # +y = south
    flee = np.zeros_like(x)
    sp = shark_pos(t)
    if sp is not None:
        for lag, sig in ((0.0, 3.0), (0.4, 2.4), (0.8, 1.8)):
            p = shark_pos(t - lag)
            if p is None:
                continue
            dx, dy = x - p[0], y - p[1]
            r = np.sqrt(dx * dx + dy * dy) + 1e-3
            amp = 0.9 * sig
            push = amp * np.exp(-r * r / (2 * sig * sig))
            x = x + dx / r * push
            y = y + dy / r * push
            flee = np.maximum(flee, push / amp)
            if lag == 0.0:
                away = np.arctan2(dy, dx)
                mix = np.clip(push / 1.5, 0, 1)
                head = np.arctan2((1 - mix) * np.sin(head) + mix * np.sin(away),
                                  (1 - mix) * np.cos(head) + mix * np.cos(away))
    return x, y, head, D[:, 3], flee


# --------------------------------------------------------------------------
# Events: fish jumping, nervous water, the shark strike, cast nets
# --------------------------------------------------------------------------

EVENTS = []


def init_events():
    rng = np.random.default_rng(SEED + 20)
    # nervous water: little dimples over the schools the whole time
    for _ in range(420):
        si = rng.integers(len(SCHOOLS))
        oy, dd, n, ln, wd, spd = SCHOOLS[si]
        te = rng.uniform(-1, DURATION)
        EVENTS.append(dict(kind="dimple", t=te, si=si, ax=rng.normal(0, wd * 0.25),
                           ay=rng.normal(0, ln * 0.3), size=rng.uniform(0.25, 0.55)))
    # fish skipping out of the water as the shark comes through
    for _ in range(46):
        te = rng.uniform(11.9, 16.2)
        p = shark_pos(te)
        ang = rng.uniform(0, 2 * np.pi)
        r = rng.uniform(1.6, 4.5)
        EVENTS.append(dict(kind="jump", t=te, x=p[0] + r * math.cos(ang), y=p[1] + r * math.sin(ang),
                           size=rng.uniform(0.35, 0.7)))
    EVENTS.append(dict(kind="strike", t=13.6, x=shark_pos(13.6)[0] + 0.4, y=shark_pos(13.6)[1], size=1.6))
    for p in PEOPLE:
        for tt in p.get("throws", []):
            nx = float(shore(p["y"] - 1.5)) + 3.6
            EVENTS.append(dict(kind="net", t=tt, x=nx, y=p["y"] - 1.5, size=1.9, px=p))


PEOPLE = [
    dict(d=-1.2, y=32.0, throws=[4.2, 18.6]),
    dict(d=-1.6, y=57.0, throws=[9.0]),
    dict(d=-11.0, y=60.0, rods=True),
    dict(d=-1.0, y=96.0, throws=[22.4]),
    dict(d=-13.0, y=102.0, rods=True),
    dict(d=-1.4, y=-62.0, throws=[1.2]),
]
BOARDWALKS = [-150.0, 80.0, 330.0]

PELICANS = [(0.0, 0.0), (5.5, -2.2), (11.0, -1.0), (16.0, -3.0), (21.5, -2.0), (27.0, -3.5)]


# --------------------------------------------------------------------------
# Frame rendering
# --------------------------------------------------------------------------

GRID = {}


def setup(width, height):
    init_noise()
    init_fish()
    init_events()
    u = np.arange(width, dtype=np.float32) - width / 2 + 0.5
    v = np.arange(height, dtype=np.float32) - height / 2 + 0.5
    GRID["u"], GRID["v"] = np.meshgrid(u, v)
    GRID["W"], GRID["H"] = width, height
    yy, xx = np.mgrid[0:height, 0:width].astype(np.float32)
    r = np.sqrt(((xx - width / 2) / (width / 2)) ** 2 + ((yy - height / 2) / (height / 2)) ** 2)
    GRID["vign"] = (1 - 0.22 * sstep(0.55, 1.45, r))[..., None]
    fdir = "/usr/share/fonts/opentype/inter/"
    s = width / 1920
    GRID["font_t"] = ImageFont.truetype(fdir + "InterDisplay-Bold.otf", int(58 * s))
    GRID["font_s"] = ImageFont.truetype(fdir + "Inter-Medium.otf", int(28 * s))
    GRID["font_k"] = ImageFont.truetype(fdir + "Inter-SemiBold.otf", int(20 * s))


def to_screen(cam, x, y):
    cx, cy, w_m, th = cam
    mpp = w_m / GRID["W"]
    dx, dy = np.asarray(x) - cx, np.asarray(y) - cy
    u = (math.cos(th) * dx + math.sin(th) * dy) / mpp + GRID["W"] / 2
    v = (-math.sin(th) * dx + math.cos(th) * dy) / mpp + GRID["H"] / 2
    return u, v


def C(*rgb):
    return np.array(rgb, dtype=np.float32) / 255.0


def mix(a, b, t):
    t = t[..., None] if np.ndim(t) == 2 else t
    return a + (b - a) * t


def render_frame(t):
    W, H = GRID["W"], GRID["H"]
    cam = camera(t)
    cx, cy, w_m, th = cam
    mpp = w_m / W
    u, v = GRID["u"], GRID["v"]
    x = cx + mpp * (math.cos(th) * u - math.sin(th) * v)
    y = cy + mpp * (math.sin(th) * u + math.cos(th) * v)
    x = x.astype(np.float64)
    y = y.astype(np.float64)
    d = x - shore(y)
    aa = mpp * 1.2

    n_big = samp("d", x, y, 40.0)
    n_med = samp("a", x, y, 3.0)
    n_sm = samp("b", x, y, 0.6)

    # ---- land ------------------------------------------------------------
    dry = C(229, 213, 182) * (1 + 0.015 * n_med[..., None] + 0.006 * n_sm[..., None] + 0.03 * n_big[..., None])
    # wind ripples on the dry sand
    rip = np.sin((x * 0.6 + y * 2.4 + 1.5 * n_med) * 2.2)
    dry = dry * (1 + 0.006 * rip[..., None])
    # dunes and sea oats
    dune_edge = -34.0 + 4.0 * samp("d", 3.0, y, 30.0) + 2.0 * n_big
    veg_n = samp("a", x, y, 4.0) + 0.6 * samp("c", x, y, 1.0)
    veg = sstep(-0.2, 0.6, veg_n + (dune_edge - d) * 0.12) * sstep(dune_edge + 3, dune_edge - 2, d)
    veg_col = mix(C(118, 126, 74), C(74, 88, 50), sstep(-1, 1, samp("b", x, y, 2.0)))
    veg_col = veg_col * (1 - 0.25 * sstep(0.2, 1.2, n_sm)[..., None])
    dune_sand = dry * (1 + 0.05 * sstep(-0.5, 1.5, samp("a", x, y, 10.0))[..., None])
    col = mix(dry, dune_sand, sstep(dune_edge + 4, dune_edge - 2, d))
    col = mix(col, veg_col, veg * 0.92)
    # dune toe shadow
    col = col * (1 - 0.06 * np.exp(-((d - dune_edge - 0.5) / 0.6) ** 2))[..., None]
    # boardwalk crossovers
    for by in BOARDWALKS:
        ry = y - by
        on = sstep(-1.0 - aa, -1.0 + aa, ry) * sstep(1.0 + aa, 1.0 - aa, ry) * sstep(-22.0, -24.0, d)
        if not np.any(on > 0):
            continue
        plank = 1 + 0.1 * np.sin(x * 2 * np.pi / 0.16) * min(1.0, 0.05 / mpp) + 0.05 * samp("b", x, y, 1.0)
        wood = C(160, 127, 92) * plank[..., None]
        rail = (np.exp(-((np.abs(ry) - 0.95) / 0.07) ** 2)) * 0.35
        wood = wood * (1 - rail)[..., None]
        shadow = sstep(-1.9, -1.6, ry) * sstep(-0.9, -1.2, ry) * sstep(-21.0, -23.0, d)
        col = col * (1 - 0.3 * shadow)[..., None]
        col = mix(col, wood, on)
    # wrack line: dried weed at the last high tide
    wr = -15.5 + 1.8 * samp("d", 1.0, y, 30.0)
    wrack = np.exp(-((d - wr) / 0.55) ** 2) * sstep(-0.2, 0.9, samp("c", x, y, 0.8)) * sstep(-0.3, 0.6, samp("b", 4.0, y, 12.0))
    col = mix(col, C(118, 96, 66), wrack * 0.75)
    # wet sand
    wet_edge = -8.0 + 1.0 * samp("d", 2.0, y, 25.0)
    wetness = sstep(wet_edge - 2.0, wet_edge + 1.0, d)
    wet = C(170, 152, 123) * (1 + 0.015 * n_med[..., None]) + C(40, 46, 52) * (0.5 + 0.5 * sstep(-1, 1, n_big))[..., None]
    col = mix(col, wet, wetness)

    # ---- swash -----------------------------------------------------------
    T_sw = 8.0
    q = np.mod(t / T_sw + 0.06 * samp("d", 5.0, y, 40.0) - y / 260.0, 1.0)
    runup = -4.5 * np.sin(np.pi * np.clip(q / 0.8, 0, 1)) ** 0.6 * (1 + 0.25 * samp("a", 1.0, y, 20.0))
    in_swash = sstep(runup - aa, runup + aa, d) * sstep(0.5, -0.5, d)
    sheet = mix(C(170, 152, 123), C(150, 170, 150), 0.6)
    col = mix(col, sheet, in_swash * 0.5)
    back = sstep(0.4, 1.2, samp("c", x * 0.6, y + 0.5 * t, 0.9)) * in_swash * sstep(0.35, 0.6, q) * 0.35
    swash_edge = np.exp(-((d - runup) / 0.45) ** 2) * sstep(-0.6, 0.4, samp("c", x, y + t * 0.3, 0.6))
    swash_edge *= sstep(0.0, 0.15, q) * sstep(0.95, 0.6, q)

    # ---- water -----------------------------------------------------------
    dp = np.clip(d, 0, None)
    depth = 0.12 + 0.045 * dp + 0.9 * np.exp(-((dp - 20) / 9) ** 2) - 0.9 * np.exp(-((dp - 46) / 6) ** 2)
    depth = np.clip(depth + 0.15 * n_big, 0.05, None)
    deep = 1 - np.exp(-depth / 1.7)
    water = mix(C(150, 164, 128), C(62, 104, 96), deep)
    water = mix(water, C(42, 84, 92), sstep(55, 95, d))
    water = water * (1 + 0.05 * n_big + 0.02 * samp("d", x + 0.5 * t, y - 0.3 * t, 80.0))[..., None]
    # surface ripples and sparkle
    r1 = samp("a", x + 0.7 * t, y + 0.2 * t, 1.2)
    r2 = samp("b", x - 0.4 * t, y + 0.5 * t, 0.9)
    ripple = r1 - r2
    water = water * (1 + 0.018 * ripple[..., None])
    sparkle = sstep(3.1, 3.6, r1 + 0.8 * r2) * 0.25
    # long swell bands outside the bar
    lam, cwave = 32.0, 4.0
    p = (d + cwave * t + 2.5 * samp("d", 9.0, y, 70.0) + 0.5 * samp("c", x + cwave * t, y, 2.5)) / lam
    fp = np.mod(p, 1.0)
    swell = np.sin(2 * np.pi * p) * sstep(48, 62, d)
    water = water * (1 + 0.05 * swell[..., None])

    is_water = sstep(-0.3, 0.6, d)
    col = mix(col, water, is_water)

    # ---- fish (under the surface) -----------------------------------------
    fx, fy, fh, fs, flee = fish_state(t)
    fu, fv = to_screen(cam, fx, fy)
    margin = 0.6 / mpp + 4
    vis = (fu > -margin) & (fu < W + margin) & (fv > -margin) & (fv < H + margin)
    acc = np.zeros(H * W, dtype=np.float64)
    flash_acc = np.zeros(H * W, dtype=np.float64)
    sp_px = 0.55 * mpp / 0.31
    tpl, tw = fish_template(sp_px)
    D = FISH["data"]

    def splat(buf, pu, pv, wts):
        ok = (pu >= 0) & (pu < W - 1) & (pv >= 0) & (pv < H - 1)
        pu, pv, wts = pu[ok], pv[ok], wts[ok]
        iu = pu.astype(np.int64)
        iv = pv.astype(np.int64)
        au = pu - iu
        av = pv - iv
        base = iv * W + iu
        for off, ww in ((0, (1 - au) * (1 - av)), (1, au * (1 - av)), (W, (1 - au) * av), (W + 1, au * av)):
            buf += np.bincount(base + off, weights=wts * ww, minlength=H * W)

    if vis.any():
        hx = np.cos(fh[vis])[:, None]
        hy = np.sin(fh[vis])[:, None]
        sz = fs[vis][:, None]
        lx = tpl[None, :, 0] * sz
        ly = tpl[None, :, 1] * sz
        wx = fx[vis][:, None] + hx * lx - hy * ly
        wy = fy[vis][:, None] + hy * lx + hx * ly
        pu, pv = to_screen(cam, wx.ravel(), wy.ravel())
        dens = (sp_px * 0.31 / mpp) ** 2  # sample-area correction
        wts = np.broadcast_to(tw[None, :], wx.shape).ravel() * dens
        splat(acc, pu, pv, wts)
        # silver flashes as fish roll on their sides
        ph = D[vis, 7]
        slot = np.floor(t * 3.0 + ph * 7.0)
        hsh = np.mod(np.sin(slot * 12.9898 + ph * 78.233) * 43758.5453, 1.0)
        rate = 0.012 + 0.12 * flee[vis]
        env = np.sin(np.pi * np.mod(t * 3.0 + ph * 7.0, 1.0))
        fw = np.where(hsh < rate, env, 0.0)
        if np.any(fw > 0):
            sel = fw > 0
            splat(flash_acc, pu.reshape(wx.shape)[sel].ravel(), pv.reshape(wx.shape)[sel].ravel(),
                  (np.broadcast_to(tw[None, :], wx.shape)[sel] * fw[sel][:, None] * dens).ravel())

    fish_px = 0.31 / mpp
    blur_r = max(0.6, 0.12 * fish_px)
    m = np.clip(acc.reshape(H, W) * 1.1, 0, 1)
    m_img = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur_r))
    # shark (and its shadow on the bottom) drawn into the same underwater mask
    sp = shark_pos(t)
    under = Image.new("L", (W * 2, H * 2), 0)
    if sp is not None:
        hd = shark_heading(t)
        dr = ImageDraw.Draw(under)
        L = 1.8
        sway = 0.12 * math.sin(t * 9.0)
        outline = [(0.5, 0), (0.44, 0.045), (0.3, 0.075), (0.16, 0.085), (0.08, 0.1), (-0.08, 0.27),
                   (-0.1, 0.25), (0.0, 0.08), (-0.2, 0.06), (-0.36, 0.03), (-0.44, 0.02), (-0.5, 0.06),
                   (-0.47, 0.0), (-0.5, -0.06), (-0.44, -0.02), (-0.36, -0.03), (-0.2, -0.06), (0.0, -0.08),
                   (-0.1, -0.25), (-0.08, -0.27), (0.08, -0.1), (0.16, -0.085), (0.3, -0.075), (0.44, -0.045)]
        pts = []
        for ax_, ay_ in outline:
            ax_ *= L
            ay_ *= L
            if ax_ < -0.1:
                ay_ += sway * (-ax_) * 0.4
            wx_ = sp[0] + math.cos(hd) * ax_ - math.sin(hd) * ay_
            wy_ = sp[1] + math.sin(hd) * ax_ + math.cos(hd) * ay_
            su, sv = to_screen(cam, wx_, wy_)
            pts.append((float(su) * 2, float(sv) * 2))
        dr.polygon(pts, fill=235)
    under = under.resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(max(0.8, 0.05 / mpp)))
    shark_m = np.asarray(under, dtype=np.float32) / 255.0
    fm = np.asarray(m_img, dtype=np.float32) / 255.0
    flash = np.clip(flash_acc.reshape(H, W) * 1.4, 0, 1)
    flash = np.asarray(Image.fromarray((flash * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur_r)),
                       dtype=np.float32) / 255.0
    water_vis = is_water * sstep(0.2, 1.5, d)
    dark = np.clip(fm * 0.78 + shark_m * 0.85, 0, 0.9) * water_vis
    col = mix(col, C(30, 40, 38), dark)
    col = col + (C(205, 214, 206) - col) * (flash * 0.75 * water_vis)[..., None]

    # ---- foam -------------------------------------------------------------
    bar = np.exp(-((d - 47.0) / 6.5) ** 2)
    inner = np.where(d < 47, np.exp(-(47.0 - d) / 16.0), 0.0) * sstep(56, 46, d)
    shorebreak = np.exp(-((d - 2.5) / 2.2) ** 2)
    strength = np.clip(bar * 1.0 + inner * 0.38 + shorebreak * 0.85, 0, 1.2)
    bore = np.exp(-fp * 5.5) * sstep(0.995, 0.97, fp)
    lace = samp("c", x + cwave * t * 0.6, y, 0.7) + 0.7 * samp("a", x + cwave * t * 0.6, y, 3.0)
    fv_ = np.clip(strength * bore, 0, 1)
    thr = 1.0 - fv_
    foam = sstep(thr - 0.12, thr + 0.12, 0.55 + 0.22 * lace) * sstep(0.02, 0.12, fv_)
    # residual foam: thin filaments drifting in the surf zone
    fil = samp("a", x + 0.4 * t, y * 0.6 + 0.15 * t, 12.0) + 0.25 * samp("c", x, y, 2.0)
    resid = sstep(0.78, 0.96, 1 - np.abs(fil) * 0.5) * 0.22
    resid *= sstep(-0.2, 1.0, samp("d", x, y, 25.0)) * sstep(0.5, 3, d) * sstep(62, 48, d)
    foam = np.clip(foam + resid + swash_edge * 0.9 + back, 0, 1) * sstep(-8.0, -6.0, d)
    col = mix(col, C(240, 241, 234), foam * (0.88 + 0.12 * sstep(-1, 1, n_sm)))
    col = col + (sparkle * (1 - foam) * is_water)[..., None] * 0.5

    # ---- splashes, dimples, cast nets ---------------------------------------
    overlay = Image.new("RGB", (W * 2, H * 2), (0, 0, 0))
    o_alpha = Image.new("L", (W * 2, H * 2), 0)
    od = ImageDraw.Draw(overlay)
    oa = ImageDraw.Draw(o_alpha)
    splash_acc = np.zeros((H, W), dtype=np.float32)
    for ev in EVENTS:
        age = t - ev["t"]
        if ev["kind"] == "dimple":
            if age < 0 or age > 1.6:
                continue
            oy, dd, *_ , spd = SCHOOLS[ev["si"]]
            ey = school_y(ev["t"]) * spd + oy + ev["ay"]
            ex = float(shore(ey)) + dd + ev["ax"]
            R = ev["size"] * (0.4 + age * 1.1)
            amp = 0.22 * (1 - age / 1.6)
            width = 0.07
        elif ev["kind"] in ("jump", "strike"):
            if age < 0 or age > 2.4:
                continue
            ex, ey = ev["x"], ev["y"]
            if age > 1.5 and ev["kind"] == "jump":
                continue
            life = 1.5 if ev["kind"] == "jump" else 2.4
            R = ev["size"] * (0.3 + 1.1 * math.sqrt(age))
            amp = 0.55 * (1 - age / life) ** 1.5
            width = 0.1 * ev["size"]
        else:
            continue
        su, sv = to_screen(cam, ex, ey)
        rp = (R + 3 * width) / mpp + 3
        u0, u1 = int(max(0, su - rp)), int(min(W, su + rp + 1))
        v0, v1 = int(max(0, sv - rp)), int(min(H, sv + rp + 1))
        if u0 >= u1 or v0 >= v1:
            continue
        uu = (np.arange(u0, u1) - su)[None, :]
        vv = (np.arange(v0, v1) - sv)[:, None]
        rr = np.sqrt(uu * uu + vv * vv) * mpp
        ring = np.exp(-((rr - R) / width) ** 2) * amp
        if ev["kind"] != "dimple":
            burst = np.exp(-(rr / (ev["size"] * 0.55)) ** 2) * max(0.0, 1 - age / 0.7) ** 1.2
            ring = np.maximum(ring, burst * 1.2)
        else:
            ring = ring * 0.7
        splash_acc[v0:v1, u0:u1] = np.maximum(splash_acc[v0:v1, u0:u1], ring)

    # spray texture so splashes are not perfect rings
    spray = 0.55 + 0.45 * sstep(-1.0, 1.0, samp("c", x, y, 0.5))
    col = mix(col, C(238, 240, 235), np.clip(splash_acc * spray, 0, 1) * is_water)

    s2 = 2.0 / mpp  # meters -> overlay pixels
    for ev in EVENTS:
        if ev["kind"] != "net":
            continue
        age = t - ev["t"]
        if age < -0.6 or age > 3.5:
            continue
        p = ev["px"]
        hx_, hy_ = float(shore(p["y"])) + p["d"], p["y"]
        if age < 0.55:
            k = max(0.0, age) / 0.55
            ex = hx_ + (ev["x"] - hx_) * k
            ey = hy_ + (ev["y"] - hy_) * k
            rad = ev["size"] * (0.25 + 0.75 * k ** 0.7)
            alpha = 1.0
        else:
            ex, ey = ev["x"], ev["y"]
            rad = ev["size"]
            alpha = max(0.0, 1 - (age - 0.55) / 2.9)
        if age < 0:
            continue
        su, sv = to_screen(cam, ex, ey)
        R = rad * s2
        X, Y = float(su) * 2, float(sv) * 2
        lw = max(1, int(0.04 * s2))
        oa.ellipse([X - R, Y - R, X + R, Y + R], fill=int(70 * alpha))
        od.ellipse([X - R, Y - R, X + R, Y + R], fill=(int(70 * alpha * 0.82),) * 3)
        oa.ellipse([X - R, Y - R, X + R, Y + R], outline=int(150 * alpha), width=lw * 2)
        od.ellipse([X - R, Y - R, X + R, Y + R], outline=(int(150 * alpha * 0.32),) * 3, width=lw * 2)
        if 0.55 <= age < 2.0:  # splash where the lead line hits
            k = (age - 0.55) / 1.45
            Rr = (rad + 0.6 * k) * s2
            od.ellipse([X - Rr, Y - Rr, X + Rr, Y + Rr], outline=(int(110 * (1 - k)),) * 3, width=lw * 2)
            oa.ellipse([X - Rr, Y - Rr, X + Rr, Y + Rr], outline=int(110 * (1 - k)), width=lw * 2)

    # ---- people: long morning shadows to the west-northwest ------------------
    shadow = Image.new("L", (W * 2, H * 2), 0)
    sd = ImageDraw.Draw(shadow)
    sun_az = math.radians(200)  # direction shadows point, in the x/y world frame
    sdx, sdy = math.cos(sun_az), math.sin(sun_az)
    for p in PEOPLE:
        px_, py_ = float(shore(p["y"])) + p["d"], p["y"]
        su, sv = to_screen(cam, px_, py_)
        if su < -200 or su > W + 200 or sv < -200 or sv > H + 200:
            continue
        # shadow: a long thin figure
        Ls = 3.6
        quad = []
        for ax_, ay_ in ((0, -0.1), (Ls * 0.45, -0.12), (Ls * 0.55, -0.24), (Ls * 0.8, -0.2), (Ls * 0.84, -0.06),
                         (Ls * 0.84, 0.06), (Ls * 0.8, 0.2), (Ls * 0.55, 0.24), (Ls * 0.45, 0.12), (0, 0.1)):
            wx_ = px_ + sdx * ax_ - sdy * ay_
            wy_ = py_ + sdy * ax_ + sdx * ay_
            a, b = to_screen(cam, wx_, wy_)
            quad.append((float(a) * 2, float(b) * 2))
        sd.polygon(quad, fill=150)
        hd_, hs_ = to_screen(cam, px_ + sdx * Ls, py_ + sdy * Ls)
        rr_ = 0.2 * s2
        sd.ellipse([hd_ * 2 - rr_, hs_ * 2 - rr_, hd_ * 2 + rr_, hs_ * 2 + rr_], fill=150)
        if p.get("rods"):
            for k, off in enumerate((-1.6, 1.4)):
                bx, by_ = px_ + 1.2, py_ + off
                a, b = to_screen(cam, bx, by_)
                c_, d_ = to_screen(cam, bx + 2.2, by_ + 0.3)
                od.line([(a * 2, b * 2), (c_ * 2, d_ * 2)], fill=(70, 60, 50), width=max(1, int(0.03 * s2)))
                oa.line([(a * 2, b * 2), (c_ * 2, d_ * 2)], fill=230, width=max(1, int(0.03 * s2)))
                e_, f_ = to_screen(cam, bx + sdx * 4.5, by_ + sdy * 4.5)
                sd.line([(a * 2, b * 2), (e_ * 2, f_ * 2)], fill=110, width=max(1, int(0.03 * s2)))
            # cooler and chair
            a, b = to_screen(cam, px_ - 0.9, py_ + 0.7)
            r_ = 0.32 * s2
            od.rectangle([a * 2 - r_, b * 2 - r_ * 0.6, a * 2 + r_, b * 2 + r_ * 0.6], fill=(214, 70, 52))
            oa.rectangle([a * 2 - r_, b * 2 - r_ * 0.6, a * 2 + r_, b * 2 + r_ * 0.6], fill=255)
        # body from above: shoulders + hat
        sw = 0.26 * s2
        X, Y = float(su) * 2, float(sv) * 2
        od.ellipse([X - sw, Y - sw * 0.55, X + sw, Y + sw * 0.55], fill=(60, 84, 112) if p.get("rods") else (226, 226, 220))
        oa.ellipse([X - sw, Y - sw * 0.55, X + sw, Y + sw * 0.55], fill=255)
        hr = 0.13 * s2
        od.ellipse([X - hr, Y - hr, X + hr, Y + hr], fill=(196, 170, 120) if not p.get("rods") else (40, 40, 44))
        oa.ellipse([X - hr, Y - hr, X + hr, Y + hr], fill=255)

    # ---- pelicans gliding north over the wash -------------------------------
    birds = Image.new("RGB", (W * 2, H * 2), (0, 0, 0))
    b_alpha = Image.new("L", (W * 2, H * 2), 0)
    bd = ImageDraw.Draw(birds)
    ba = ImageDraw.Draw(b_alpha)
    if t > 15.0:
        lead_y = school_y(t) + 34.0 - 9.0 * (t - 15.5)
        for k, (back, side) in enumerate(PELICANS):
            by_ = lead_y + back
            bx_ = float(shore(by_)) + 6.0 + side
            hd = -math.pi / 2 + 0.05 * math.sin(t * 0.5 + k)
            flap = 1.0 if (int(t * 1.2 + k) % 4) else (0.82 + 0.18 * math.cos(t * 12 + k))
            scale = 1.25  # birds sit between the drone and the water
            span = 1.1 * flap
            half = [(0.3, 0.07), (0.22, 0.12), (0.2, 0.5 * span), (0.1, span), (-0.03, span * 1.04),
                    (-0.13, 0.6 * span), (-0.22, 0.15), (-0.34, 0.08), (-0.5, 0.0)]
            shape = [(0.78, 0.0), (0.55, 0.03)] + half + [(a_, -b_) for a_, b_ in reversed(half[:-1])] + [(0.55, -0.03)]

            def place(ox, oy, s):
                pts = []
                for ax_, ay_ in shape:
                    ax_ *= s
                    ay_ *= s
                    wx_ = ox + math.cos(hd) * ax_ - math.sin(hd) * ay_
                    wy_ = oy + math.sin(hd) * ax_ + math.cos(hd) * ay_
                    a, b = to_screen(cam, wx_, wy_)
                    pts.append((float(a) * 2, float(b) * 2))
                return pts

            sd.polygon(place(bx_ + sdx * 10.0, by_ + sdy * 10.0, 1.0), fill=120)
            pts = place(bx_, by_, scale)
            bd.polygon(pts, fill=(128, 116, 100))
            ba.polygon(pts, fill=255)
            # pale head/neck and the long bill
            neck = place(bx_ + math.cos(hd) * 0.35 * scale, by_ + math.sin(hd) * 0.35 * scale, 0.35)
            bd.polygon(neck, fill=(226, 214, 186))
            ba.polygon(neck, fill=255)
            # dark primaries on the wingtips
            for sgn in (1, -1):
                tip = [(0.1, sgn * span), (-0.03, sgn * span * 1.04), (-0.08, sgn * span * 0.72), (0.14, sgn * span * 0.72)]
                tpts = []
                for ax_, ay_ in tip:
                    ax_ *= scale
                    ay_ *= scale
                    wx_ = bx_ + math.cos(hd) * ax_ - math.sin(hd) * ay_
                    wy_ = by_ + math.sin(hd) * ax_ + math.cos(hd) * ay_
                    a, b = to_screen(cam, wx_, wy_)
                    tpts.append((float(a) * 2, float(b) * 2))
                bd.polygon(tpts, fill=(48, 42, 38))

    sh = np.asarray(shadow.resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32) / 255.0
    col = col * (1 - 0.55 * sh)[..., None]
    ov = np.asarray(overlay.resize((W, H), Image.BOX), dtype=np.float32) / 255.0
    oa_ = np.asarray(o_alpha.resize((W, H), Image.BOX), dtype=np.float32)[..., None] / 255.0
    col = col * (1 - oa_) + ov
    bv = np.asarray(birds.resize((W, H), Image.BOX), dtype=np.float32) / 255.0
    ba_ = np.asarray(b_alpha.resize((W, H), Image.BOX), dtype=np.float32)[..., None] / 255.0
    col = col * (1 - ba_) + bv

    # ---- grade --------------------------------------------------------------
    col = np.clip(col, 0, 1)
    col = col ** np.array([0.96, 1.0, 1.04], dtype=np.float32)  # warm morning light
    lum = col.mean(axis=2, keepdims=True)
    col = lum + (col - lum) * 1.08
    col = (col - 0.5) * 1.05 + 0.5
    col = col * GRID["vign"]
    rng = np.random.default_rng(int(t * 1000))
    col = col + rng.normal(0, 0.008, size=(H, W, 1)).astype(np.float32)
    img = Image.fromarray((np.clip(col, 0, 1) * 255 + 0.5).astype(np.uint8))
    return titles(img, t)


def titles(img, t):
    W, H = img.size
    s = W / 1920
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    dr = ImageDraw.Draw(layer)

    def fade(t0, t1, ramp=0.8):
        return float(np.clip(min((t - t0) / ramp, (t1 - t) / ramp), 0, 1))

    a = fade(1.0, 7.0)
    if a > 0:
        x0, y0 = int(80 * s), int(H - 200 * s)
        dr.rectangle([x0, y0 + int(6 * s), x0 + int(6 * s), y0 + int(118 * s)], fill=(242, 196, 92, int(255 * a)))
        dr.text((x0 + int(26 * s), y0), "THE MULLET RUN", font=GRID["font_t"], fill=(255, 255, 255, int(255 * a)))
        dr.text((x0 + int(28 * s), y0 + int(78 * s)), "Northeast Florida  ·  Atlantic surf, heading south",
                font=GRID["font_s"], fill=(255, 255, 255, int(225 * a)))
    a = fade(11.6, 16.6)
    if a > 0:
        dr.text((int(80 * s), int(70 * s)), "BLACKTIP IN THE BAIT", font=GRID["font_k"], fill=(255, 255, 255, int(230 * a)))
    a = fade(21.5, DURATION + 1)
    if a > 0:
        tx = "floridamulletrun.com"
        sub = "Live scores and sightings for every beach"
        tw = dr.textlength(tx, font=GRID["font_t"])
        sw = dr.textlength(sub, font=GRID["font_s"])
        dr.text(((W - tw) / 2, H / 2 - 60 * s), tx, font=GRID["font_t"], fill=(255, 255, 255, int(255 * a)))
        dr.text(((W - sw) / 2, H / 2 + 22 * s), sub, font=GRID["font_s"], fill=(255, 255, 255, int(230 * a)))
    shadow = layer.filter(ImageFilter.GaussianBlur(3 * s))
    sh_alpha = np.asarray(shadow, dtype=np.float32)[..., 3:] / 255.0
    base = np.asarray(img, dtype=np.float32)
    base = base * (1 - 0.55 * sh_alpha)
    a_end = fade(21.5, DURATION + 1)
    if a_end > 0:
        base = base * (1 - 0.28 * a_end)
    out = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert("RGBA")
    out.alpha_composite(layer)
    return out.convert("RGB")


def worker_init(w, h):
    setup(w, h)


def worker(i_fps):
    i, fps = i_fps
    return render_frame(i / fps).tobytes()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="mullet-run-drone.mp4")
    ap.add_argument("--width", type=int, default=1920)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--preview", default="", help="comma-separated times; writes PNGs instead of a video")
    ap.add_argument("--procs", type=int, default=os.cpu_count())
    args = ap.parse_args()
    W = args.width
    H = int(round(W * 9 / 16 / 2)) * 2

    if args.preview:
        setup(W, H)
        for tt in [float(s) for s in args.preview.split(",")]:
            path = f"{os.path.splitext(args.out)[0]}-t{tt:05.1f}.png"
            render_frame(tt).save(path)
            print("wrote", path)
        return

    n = int(DURATION * args.fps)
    ff = subprocess.Popen([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
        "-r", str(args.fps), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "20",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", args.out,
    ], stdin=subprocess.PIPE)
    with Pool(args.procs, initializer=worker_init, initargs=(W, H)) as pool:
        for k, buf in enumerate(pool.imap(worker, [(i, args.fps) for i in range(n)], chunksize=2)):
            ff.stdin.write(buf)
            if k % 30 == 0:
                print(f"frame {k}/{n}", file=sys.stderr, flush=True)
    ff.stdin.close()
    ff.wait()
    print("wrote", args.out)


if __name__ == "__main__":
    main()

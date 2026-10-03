#!/usr/bin/env node
/**
 * One-off: render an Instagram Reel (1080x1920, 30 fps, H.264 + silent AAC)
 * that highlights the sightings logged on floridamulletrun.com.
 *
 * Pulls every row from mw_sightings with the public anon key, lays the scenes
 * out in an HTML page (hook -> day-by-day migration map -> hot spots -> quotes
 * from the beach -> call to action), then steps a headless Chromium through
 * the timeline frame by frame and pipes the frames into ffmpeg. Every frame is
 * a pure function of time, so re-running gives the same video for the same
 * data. Instagram media is never downloaded; posts are credited by handle.
 *
 *   cd scripts/instagram-reel && npm install && node render.mjs
 *
 * Needs ffmpeg on PATH and Playwright (global install is fine). Writes
 * out/mullet-sightings-reel.mp4 and out/cover.jpg. Pass --frames=N to render
 * only the first N frames, or --still=SECONDS to write one PNG for checking.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT = path.join(HERE, "out");
const W = 1080;
const H = 1920;
const FPS = 30;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")),
);

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

function envDefault(key) {
  if (process.env[key]) return process.env[key];
  const line = fs
    .readFileSync(path.join(ROOT, ".env.example"), "utf8")
    .split("\n")
    .find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : "";
}

async function fetchSightings() {
  const url = envDefault("NEXT_PUBLIC_SUPABASE_URL");
  const key = envDefault("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const res = await fetch(
    `${url}/rest/v1/mw_sightings?select=beach_id,observed_at,school_size,notes,source_type,source_handle,lat,lon&order=observed_at.asc`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

// The station catalog is TypeScript with path aliases; pull just id/name/lat/lon.
function loadBeaches() {
  const src = fs.readFileSync(path.join(ROOT, "src/lib/beaches.ts"), "utf8");
  const re =
    /id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*lat:\s*(-?[\d.]+),\s*lon:\s*(-?[\d.]+)/g;
  const out = {};
  for (const m of src.matchAll(re)) {
    out[m[1]] = { id: m[1], name: m[2], lat: +m[3], lon: +m[4] };
  }
  return out;
}

const fmtDay = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  });

// ---------------------------------------------------------------------------
// Map: Atlantic-coast framing, which suits a vertical frame.
// ---------------------------------------------------------------------------

const MAP_BOX = [
  [40, 400],
  [W - 40, 1590],
];

function buildMap() {
  const us = JSON.parse(
    fs.readFileSync(require.resolve("us-atlas/states-10m.json"), "utf8"),
  );
  const states = feature(us, us.objects.states).features;
  const proj = geoMercator().fitExtent(MAP_BOX, {
    type: "MultiPoint",
    coordinates: [
      [-83.9, 24.5],
      [-79.25, 30.85],
    ],
  });
  const p = geoPath(proj);
  const byId = (id) => states.find((f) => f.id === id);
  return {
    proj,
    florida: p(byId("12")),
    neighbors: ["13", "01"].map((id) => p(byId(id))).join(" "),
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function buildData(rows, beaches, proj) {
  const sightings = rows
    .filter((r) => beaches[r.beach_id])
    .map((r) => {
      const b = beaches[r.beach_id];
      const [x, y] = proj([b.lon, b.lat]);
      return {
        beach: r.beach_id,
        day: fmtDay(r.observed_at),
        size: r.school_size,
        x,
        y,
      };
    });

  const counts = {};
  for (const s of sightings) counts[s.beach] = (counts[s.beach] || 0) + 1;
  const markers = Object.keys(counts).map((id) => {
    const [x, y] = proj([beaches[id].lon, beaches[id].lat]);
    return { id, name: beaches[id].name, x, y };
  });
  const leaderboard = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || beaches[b[0]].lat - beaches[a[0]].lat)
    .map(([id, n]) => ({ name: beaches[id].name, n }));

  // Latest note per beach, four beaches, shown oldest first.
  const seen = new Set();
  const quotes = [];
  for (const r of [...rows].reverse()) {
    if (!r.notes || seen.has(r.beach_id) || !beaches[r.beach_id]) continue;
    seen.add(r.beach_id);
    quotes.push({
      text: r.notes.trim(),
      beach: beaches[r.beach_id].name,
      day: fmtDay(r.observed_at),
      size: r.school_size,
      source:
        r.source_type === "instagram"
          ? r.source_handle
            ? `via @${r.source_handle} on Instagram`
            : "Instagram report"
          : "Eyewitness report",
    });
    if (quotes.length === 4) break;
  }
  quotes.reverse();

  const latest = rows[rows.length - 1];
  return {
    sightings,
    markers,
    leaderboard,
    quotes,
    total: sightings.length,
    beachCount: markers.length,
    first: fmtDay(rows[0].observed_at),
    last: fmtDay(latest.observed_at),
    latest: {
      beach: beaches[latest.beach_id]?.name,
      size: latest.school_size,
      day: fmtDay(latest.observed_at),
    },
  };
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function font(pkg, file) {
  return pathToFileURL(
    path.join(path.dirname(require.resolve(`${pkg}/package.json`)), "files", file),
  ).href;
}

function buildHtml(data, map) {
  const mulletSvg = fs.readFileSync(
    path.join(ROOT, "public/images/mullet-school.svg"),
    "utf8",
  );
  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
@font-face{font-family:Syne;font-weight:700;src:url(${font("@fontsource/syne", "syne-latin-700-normal.woff2")})}
@font-face{font-family:Syne;font-weight:800;src:url(${font("@fontsource/syne", "syne-latin-800-normal.woff2")})}
${[500, 600, 700, 800]
  .map(
    (w) =>
      `@font-face{font-family:Figtree;font-weight:${w};src:url(${font("@fontsource/figtree", `figtree-latin-${w}-normal.woff2`)})}`,
  )
  .join("\n")}
:root{--deep:#0a2d44;--ocean:#0f5479;--sky:#38bdec;--sand:#ffd58a;--coral:#e79a74;--foam:#eefbff}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:var(--deep)}
body{font-family:Figtree,sans-serif;color:var(--foam);-webkit-font-smoothing:antialiased}
.display{font-family:Syne,sans-serif;letter-spacing:-0.02em}
.layer{position:absolute;inset:0}
.bg{background:radial-gradient(120% 70% at 80% 10%,#124766 0%,var(--deep) 60%),var(--deep)}
#waves path{fill:none;stroke:#38bdec;stroke-opacity:.07;stroke-width:3}
.scene{position:absolute;inset:0;opacity:0;will-change:opacity,transform}
.kicker{font-weight:800;font-size:30px;letter-spacing:.22em;text-transform:uppercase;color:var(--sand)}
.title{font-size:76px;font-weight:800;line-height:1.02}
/* hook */
#blitz{position:absolute;left:0;top:0;width:${W}px;height:1180px;overflow:hidden}
#blitz svg{width:100%;height:100%}
#blitz:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,45,68,.15) 0%,rgba(10,45,68,0) 40%,rgba(10,45,68,.85) 82%,var(--deep) 100%)}
#hook .copy{position:absolute;left:72px;right:72px;top:1010px}
#hook h1{font-size:138px;font-weight:800;line-height:.92;margin:22px 0 34px}
#hook h1 em{font-style:normal;color:var(--sand)}
#hook .sub{font-size:46px;font-weight:600;line-height:1.25;color:#d6f3fd}
#hook .sub b{font-weight:800;color:#fff}
/* map */
#map .head{position:absolute;left:72px;right:72px;top:190px;display:flex;justify-content:space-between;align-items:flex-end}
#map .date{font-size:96px;font-weight:800;line-height:1;text-transform:uppercase}
#map .count{text-align:right}
#map .count .n{font-size:120px;font-weight:800;line-height:.9;color:var(--sand)}
#map .count .l{font-size:30px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#b0e8fb}
#map svg.geo{position:absolute;left:0;top:0;width:${W}px;height:${H}px}
.land{fill:#134d6e;stroke:#78d7f7;stroke-opacity:.55;stroke-width:2.5;stroke-linejoin:round}
.land.dim{fill:#0f3f5c;stroke-opacity:.2}
.pill{position:absolute;transform:translate(-100%,-50%);white-space:nowrap;background:rgba(10,45,68,.9);border:2px solid rgba(255,213,138,.55);border-radius:999px;padding:8px 22px 9px;font-size:31px;font-weight:700;color:#fff}
.pill b{color:var(--sand);font-weight:800;margin-left:10px}
#map .foot{position:absolute;left:72px;right:72px;top:1600px}
#map .bar{height:10px;border-radius:5px;background:rgba(238,251,255,.15);overflow:hidden}
#map .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--sky),var(--sand));width:0}
#map .range{display:flex;justify-content:space-between;margin-top:14px;font-size:28px;font-weight:700;color:#b0e8fb;text-transform:uppercase;letter-spacing:.1em}
/* leaderboard */
#hot .wrap{position:absolute;left:72px;right:72px;top:300px}
#hot .rows{margin-top:70px}
.row{display:grid;grid-template-columns:70px 1fr;column-gap:10px;margin-bottom:46px}
.row .rk{font-size:56px;font-weight:800;color:rgba(255,213,138,.65);line-height:1;padding-top:6px}
.row .nm{font-size:44px;font-weight:700;margin-bottom:14px}
.row .track{display:flex;align-items:center;gap:22px}
.row .fill{height:44px;border-radius:12px;background:linear-gradient(90deg,#0fa0d8,#78d7f7)}
.row:first-child .fill{background:linear-gradient(90deg,var(--coral),var(--sand))}
.row .v{font-size:48px;font-weight:800;color:#fff}
/* quotes */
#quotes .wrap{position:absolute;left:64px;right:64px;top:250px}
.card{margin-top:34px;background:rgba(238,251,255,.07);border:2px solid rgba(120,215,247,.25);border-radius:34px;padding:34px 40px 32px}
.card q{display:block;font-family:Syne;font-weight:700;font-size:50px;line-height:1.1;color:#fff;quotes:"\\201C" "\\201D"}
.card .meta{display:flex;align-items:center;gap:16px;margin-top:22px;font-size:30px;font-weight:700;color:#b0e8fb}
.chip{background:var(--sand);color:var(--deep);border-radius:999px;padding:5px 16px 6px;font-size:24px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.card .src{margin-top:8px;font-size:26px;font-weight:600;color:rgba(214,243,253,.65)}
/* cta */
#cta .copy{position:absolute;left:72px;right:72px;top:1000px;text-align:center}
#cta h2{font-size:124px;font-weight:800;line-height:.95;margin:20px 0 26px}
#cta .lead{font-size:44px;font-weight:600;color:#d6f3fd;line-height:1.3}
#cta .url{display:inline-block;margin-top:54px;background:var(--sand);color:var(--deep);border-radius:999px;padding:26px 48px 30px;font-family:Syne;font-weight:800;font-size:46px;letter-spacing:-0.01em}
#cta .latest{margin-top:40px;font-size:30px;font-weight:700;color:#b0e8fb;letter-spacing:.04em}
</style></head><body>
<div class="layer bg"></div>
<svg id="waves" class="layer" width="${W}" height="${H}"></svg>
<div id="blitz">${mulletSvg}</div>

<section id="hook" class="scene">
  <div class="copy">
    <div class="kicker">Florida mullet run · Fall 2026</div>
    <h1 class="display">The run<br>is <em>on.</em></h1>
    <div class="sub"><b><span id="hookN">0</span> sightings</b> across <b>${data.beachCount} beaches</b><br>logged on floridamulletrun.com</div>
  </div>
</section>

<section id="map" class="scene">
  <svg class="geo" viewBox="0 0 ${W} ${H}">
    <path class="land dim" d="${map.neighbors}"/>
    <path class="land" d="${map.florida}"/>
    <g id="rings"></g><g id="dots"></g>
  </svg>
  <div id="pills"></div>
  <div class="head">
    <div><div class="kicker">Sightings by day</div><div class="date display" id="mapDate">${data.first}</div></div>
    <div class="count"><div class="n display" id="mapN">0</div><div class="l">sightings</div></div>
  </div>
  <div class="foot"><div class="bar"><i id="mapBar"></i></div>
    <div class="range"><span>${data.first}</span><span>${data.last}</span></div></div>
</section>

<section id="hot" class="scene"><div class="wrap">
  <div class="kicker">Most sightings</div>
  <div class="title display">Hot spots</div>
  <div class="rows">${data.leaderboard
    .map(
      (r, i) =>
        `<div class="row"><div class="rk">${i + 1}</div><div><div class="nm">${r.name}</div><div class="track"><div class="fill"></div><div class="v">${r.n}</div></div></div></div>`,
    )
    .join("")}</div>
</div></section>

<section id="quotes" class="scene"><div class="wrap">
  <div class="kicker">Reports</div>
  <div class="title display">Straight from<br>the beach</div>
  ${data.quotes
    .map(
      (q) =>
        `<div class="card"><q>${q.text}</q><div class="meta"><span>${q.beach} · ${q.day}</span><span class="chip">${q.size} school</span></div><div class="src">${q.source}</div></div>`,
    )
    .join("")}
</div></section>

<section id="cta" class="scene"><div class="copy">
  <div class="kicker">Seen mullet?</div>
  <h2 class="display">Log your<br>sighting.</h2>
  <div class="lead">Live migration map + daily run scores<br>for both Florida coasts</div>
  <div class="url">floridamulletrun.com</div>
  <div class="latest">Latest: ${cap(data.latest.size)} school · ${data.latest.beach} · ${data.latest.day}</div>
</div></section>

<script>
const D = ${JSON.stringify(data)};
const RADIUS = { small: 13, medium: 17, large: 22, huge: 28 };
// Scene windows, seconds.
const S = { hook: [0, 3.8], map: [3.6, 14.6], hot: [14.4, 19.6], quotes: [19.4, 25.0], cta: [24.8, 29.5] };
const POP0 = 4.7, POP1 = 12.9;
const DURATION = S.cta[1];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const back = (k) => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const NS = "http://www.w3.org/2000/svg";

// Build map marks once.
const dotEls = {}, ringEls = [], pillEls = {};
for (const m of D.markers) {
  const c = document.createElementNS(NS, "circle");
  c.setAttribute("cx", m.x); c.setAttribute("cy", m.y);
  c.setAttribute("fill", "#ffd58a"); c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", 4);
  $("#dots").appendChild(c); dotEls[m.id] = c;
  const p = document.createElement("div");
  p.className = "pill"; p.style.left = (m.x - 44) + "px"; p.style.top = m.y + "px";
  p.innerHTML = m.name + "<b></b>";
  $("#pills").appendChild(p); pillEls[m.id] = p;
}
D.sightings.forEach((s) => {
  const r = document.createElementNS(NS, "circle");
  r.setAttribute("cx", s.x); r.setAttribute("cy", s.y);
  r.setAttribute("fill", "none"); r.setAttribute("stroke", "#ffd58a");
  $("#rings").appendChild(r); ringEls.push(r);
});
const popTime = (i) => lerp(POP0, POP1, D.sightings.length > 1 ? i / (D.sightings.length - 1) : 0);

// Slow swell lines behind everything.
const waves = $("#waves");
const wavePaths = Array.from({ length: 9 }, () => { const p = document.createElementNS(NS, "path"); waves.appendChild(p); return p; });

function sceneFade(el, t, [a, b], { dy = 60, fade = 0.45 } = {}) {
  const kIn = easeOut(prog(t, a, a + fade));
  const kOut = easeInOut(prog(t, b - fade, b));
  const o = a === 0 ? 1 - kOut : kIn * (1 - kOut);
  el.style.opacity = o;
  el.style.transform = "translateY(" + ((1 - kIn) * dy - kOut * dy * 0.6) + "px)";
  return o;
}

function stagger(els, t, start, step, dur, fn) {
  els.forEach((el, i) => fn(el, easeOut(prog(t, start + i * step, start + i * step + dur)), i));
}

window.renderAt = (t) => {
  // Background swell.
  wavePaths.forEach((p, i) => {
    const y0 = 160 + i * 210, amp = 18 + (i % 3) * 8, ph = t * (0.35 + i * 0.04) + i;
    let d = "M -20 " + y0;
    for (let x = -20; x <= ${W} + 20; x += 40) d += " L " + x + " " + (y0 + Math.sin(x / 170 + ph) * amp).toFixed(1);
    p.setAttribute("d", d);
  });

  // Mullet blitz art: on during the hook and the call to action.
  for (const a of document.getAnimations()) { a.pause(); a.currentTime = t * 1000; }
  const blitzIn = 1 - easeInOut(prog(t, S.hook[1] - 0.45, S.hook[1]));
  const blitzBack = easeOut(prog(t, S.cta[0], S.cta[0] + 0.6));
  const blitz = $("#blitz");
  blitz.style.opacity = Math.max(blitzIn, blitzBack);
  blitz.style.transform = "scale(" + (t < S.cta[0] ? lerp(1.06, 1.0, prog(t, 0, S.hook[1])) : lerp(1.08, 1.0, blitzBack)) + ")";

  // Hook.
  sceneFade($("#hook"), t, S.hook, { dy: 0 });
  stagger($$("#hook .copy > *"), t, 0.15, 0.22, 0.6, (el, k) => { el.style.opacity = k; el.style.transform = "translateY(" + (1 - k) * 50 + "px)"; });
  $("#hookN").textContent = Math.round(D.total * easeOut(prog(t, 0.8, 2.4)));

  // Map.
  sceneFade($("#map"), t, S.map, { dy: 0 });
  const geo = $("#map svg.geo");
  geo.style.transform = "scale(" + lerp(1.05, 1, easeOut(prog(t, S.map[0], S.map[0] + 1.2))) + ")";
  geo.style.transformOrigin = "75% 40%";
  let shown = 0;
  const cum = {}, lastSize = {};
  D.sightings.forEach((s, i) => {
    const t0 = popTime(i);
    const ring = ringEls[i];
    const k = prog(t, t0, t0 + 1.1);
    if (t >= t0) {
      shown = i + 1;
      cum[s.beach] = (cum[s.beach] || 0) + 1;
      lastSize[s.beach] = t0;
    }
    ring.setAttribute("r", lerp(RADIUS[s.size] || 16, (RADIUS[s.size] || 16) * 4.2, easeOut(k)));
    ring.setAttribute("stroke-width", lerp(6, 1, k));
    ring.setAttribute("stroke-opacity", t >= t0 && k < 1 ? 1 - k : 0);
  });
  for (const m of D.markers) {
    const n = cum[m.id] || 0;
    const kPop = back(prog(t, lastSize[m.id] ?? 1e9, (lastSize[m.id] ?? 1e9) + 0.4));
    const base = 12 + Math.sqrt(n) * 7;
    dotEls[m.id].setAttribute("r", n ? base * (0.85 + 0.15 * kPop) : 0);
    const p = pillEls[m.id];
    const first = D.sightings.findIndex((s) => s.beach === m.id);
    const kp = easeOut(prog(t, popTime(first), popTime(first) + 0.45));
    p.style.opacity = kp;
    p.style.transform = "translate(-100%,-50%) translateX(" + (1 - kp) * 30 + "px)";
    p.style.left = (m.x - base - 26) + "px";
    p.querySelector("b").textContent = n > 1 ? "×" + n : "";
  }
  $("#mapN").textContent = shown;
  $("#mapDate").textContent = shown ? D.sightings[shown - 1].day : D.first;
  $("#mapBar").style.width = (100 * prog(t, POP0, POP1)) + "%";

  // Hot spots.
  sceneFade($("#hot"), t, S.hot);
  const max = D.leaderboard[0]?.n || 1;
  stagger($$("#hot .row"), t, S.hot[0] + 0.3, 0.13, 0.5, (el, k) => { el.style.opacity = k; el.style.transform = "translateX(" + (1 - k) * -40 + "px)"; });
  $$("#hot .row").forEach((el, i) => {
    const k = easeOut(prog(t, S.hot[0] + 0.5 + i * 0.13, S.hot[0] + 1.4 + i * 0.13));
    el.querySelector(".fill").style.width = Math.max(0.02, k * D.leaderboard[i].n / max) * 640 + "px";
    el.querySelector(".v").textContent = Math.round(k * D.leaderboard[i].n);
  });

  // Quotes.
  sceneFade($("#quotes"), t, S.quotes);
  stagger($$("#quotes .card"), t, S.quotes[0] + 0.45, 0.4, 0.6, (el, k) => { el.style.opacity = k; el.style.transform = "translateY(" + (1 - k) * 70 + "px)"; });

  // Call to action.
  const o = sceneFade($("#cta"), t, [S.cta[0], 1e9]);
  stagger($$("#cta .copy > *"), t, S.cta[0] + 0.2, 0.18, 0.6, (el, k) => { el.style.opacity = k; el.style.transform = "translateY(" + (1 - k) * 50 + "px)"; });
  const url = $("#cta .url");
  const kp = prog(t, S.cta[0] + 1.6, S.cta[0] + 2.4);
  url.style.transform = (url.style.transform || "") + " scale(" + (1 + Math.sin(kp * Math.PI) * 0.06) + ")";
};
window.DURATION = DURATION;
</script></body></html>`;
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const { execSync } = await import("node:child_process");
    const globalRoot = execSync("npm root -g").toString().trim();
    return import(pathToFileURL(path.join(globalRoot, "playwright/index.mjs")).href);
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const rows = await fetchSightings();
  if (!rows.length) throw new Error("No sightings to show.");
  const beaches = loadBeaches();
  const map = buildMap();
  const data = buildData(rows, beaches, map.proj);
  console.log(
    `${data.total} sightings, ${data.beachCount} beaches, ${data.first} – ${data.last}`,
  );

  const htmlPath = path.join(OUT, "reel.html");
  fs.writeFileSync(htmlPath, buildHtml(data, map));

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);

  if (args.still !== undefined) {
    await page.evaluate((t) => window.renderAt(t), +args.still);
    const file = path.join(OUT, `still-${args.still}.png`);
    await page.screenshot({ path: file });
    console.log(file);
    await browser.close();
    return;
  }

  const total = Math.min(Math.round(duration * FPS), +(args.frames ?? Infinity));
  const mp4 = path.join(OUT, "mullet-sightings-reel.mp4");
  const ff = spawn(
    "ffmpeg",
    [
      "-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
      "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
      "-map", "0:v", "-map", "1:a", "-shortest",
      "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high",
      "-pix_fmt", "yuv420p", "-r", String(FPS),
      "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart",
      mp4,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const done = new Promise((ok, fail) =>
    ff.on("close", (code) => (code === 0 ? ok() : fail(new Error(`ffmpeg exited ${code}`)))),
  );

  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.renderAt(t), f / FPS);
    const buf = await page.screenshot({ type: "png" });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 60 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  await done;

  // Cover image: the map once every sighting is on it.
  await page.evaluate((t) => window.renderAt(t), 13.6);
  await page.screenshot({ path: path.join(OUT, "cover.jpg"), type: "jpeg", quality: 92 });
  await browser.close();
  console.log(mp4);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

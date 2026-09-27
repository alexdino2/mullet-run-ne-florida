/**
 * Score integrity checks. Run with:
 *
 *   npx tsx scripts/check-score-integrity.ts          # synthetic + live feeds
 *   npx tsx scripts/check-score-integrity.ts --offline # synthetic only
 *
 * 1. NDBC parsing (synthetic feeds): an offline station is ignored, wave-only
 *    buoys yield no wind, and the recent NE–E pattern covers 18 hours whatever
 *    the station's reporting interval.
 * 2. Snapshot replay (live feeds): every station's cached snapshot, after a
 *    JSON round trip, re-scores to exactly the score the dashboard showed.
 *
 * Writes nothing. Exits non-zero on any failure.
 */
import { getBuoy } from "@/lib/data/ndbc";
import { STATIONS } from "@/lib/beaches";
import { computeBeachConditions, rescoreSnapshot } from "@/lib/conditions";
import type { Conditions } from "@/lib/types";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

const HOUR = 3600 * 1000;

/** One NDBC realtime2 row; `wind` null → "MM" columns like a wave-only buoy. */
function row(t: number, wind: [number, number] | null, wtmpC = 27): string {
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, "0");
  const [wdir, wspd] = wind ? [String(wind[0]), wind[1].toFixed(1)] : ["MM", "MM"];
  return [
    d.getUTCFullYear(), p(d.getUTCMonth() + 1), p(d.getUTCDate()),
    p(d.getUTCHours()), p(d.getUTCMinutes()),
    wdir, wspd, "MM", "0.9", "MM", "MM", "MM", "1012.0", "MM", wtmpC.toFixed(1),
    "MM", "MM", "MM", "MM",
  ].join(" ");
}

function feed(rows: string[]): string {
  return [
    "#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE",
    "#yr  mo dy hr mn degT m/s  m/s     m   sec   sec degT   hPa  degC  degC  degC  nmi  hPa    ft",
    ...rows,
  ].join("\n");
}

async function syntheticChecks() {
  const now = Date.now();
  const feeds: Record<string, string> = {};

  // Station stopped reporting five hours ago, with NE wind in its last rows.
  feeds.STALE1 = feed(
    Array.from({ length: 30 }, (_, i) => row(now - 5 * HOUR - i * HOUR, [45, 6])),
  );
  // Wave-only buoy (like 41117): fresh rows, no wind columns.
  feeds.WAVE1 = feed(
    Array.from({ length: 30 }, (_, i) => row(now - 10 * 60000 - i * 30 * 60000, null)),
  );
  // 6-minute station: last 3 hours westerly, the 15 hours before that easterly.
  feeds.SIXMIN1 = feed(
    Array.from({ length: 18 * 10 }, (_, i) => {
      const t = now - 3 * 60000 - i * 6 * 60000;
      return row(t, now - t < 3 * HOUR ? [270, 5] : [70, 6]);
    }),
  );
  // Newest row is missing wind; the one before it is complete.
  feeds.GAP1 = feed([
    row(now - 6 * 60000, null),
    row(now - 12 * 60000, [80, 7]),
    ...Array.from({ length: 20 }, (_, i) => row(now - (i + 3) * 6 * 60000, [80, 7])),
  ]);

  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const id = url.match(/realtime2\/(\w+)\.txt/)?.[1];
    if (id && feeds[id]) return new Response(feeds[id], { status: 200 });
    return realFetch(input, init);
  }) as typeof fetch;

  try {
    const stale = await getBuoy("stale1");
    check("offline station is ignored", stale === undefined);

    const wave = await getBuoy("wave1");
    check("wave-only buoy reports no wind", wave != null && wave.wind === undefined);
    check(
      "wave-only buoy has no NE–E pattern (model fills it)",
      wave?.recentEasterlyFraction === undefined,
    );
    check("wave-only buoy still reports water temp", wave?.waterTempF === 81);

    const six = await getBuoy("sixmin1");
    const frac = six?.recentEasterlyFraction ?? -1;
    check(
      "6-minute station NE–E pattern spans 18h, not 18 rows",
      Math.abs(frac - 15 / 18) < 0.03,
      `got ${frac.toFixed(2)}, expected ~0.83`,
    );
    check("6-minute station current wind is the newest reading", six?.wind?.directionDeg === 270);

    const gap = await getBuoy("gap1");
    check("wind skips a newest row with missing columns", gap?.wind?.directionDeg === 80);
  } finally {
    globalThis.fetch = realFetch;
  }
}

async function liveChecks() {
  let scored = 0;
  const bySource: Record<string, number> = {};
  for (const beach of STATIONS) {
    const r = await computeBeachConditions(beach, [], { persist: false });
    scored += 1;
    const src = r.conditions.windSource ?? "none";
    bySource[src] = (bySource[src] ?? 0) + 1;

    const stored = JSON.parse(JSON.stringify(r.conditions)) as Conditions;
    const now = new Date(r.generatedAt);
    const replay = rescoreSnapshot(beach, stored, now);
    const same =
      replay.score.score === r.score.score &&
      replay.score.components.every(
        (c, i) => c.points === r.score.components[i].points,
      );
    check(
      `${beach.id} snapshot replays to the live score`,
      same,
      `live ${r.score.score}, replay ${replay.score.score}, wind ${src}`,
    );
  }
  console.log(`\n${scored} stations scored; wind source counts:`, bySource);
}

async function main() {
  await syntheticChecks();
  if (!process.argv.includes("--offline")) await liveChecks();
  console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
  process.exitCode = failures ? 1 : 0;
}

main();

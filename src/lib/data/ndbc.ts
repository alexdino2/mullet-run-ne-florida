import type { WindObservation } from "@/lib/types";
import {
  M_TO_FT,
  MPS_TO_KT,
  cToF,
  degreesToCompass,
  safeFetchText,
} from "./http";
import { easterlyDirectionWeight } from "@/lib/wind";

export interface BuoyResult {
  wind?: WindObservation;
  waterTempF?: number;
  waveHeightFt?: number;
  /** Fraction of recent valid readings blowing from NE through E. */
  recentEasterlyFraction?: number;
  /** Latest sea-level pressure (hPa). */
  pressureHpa?: number;
  /** Largest 24h pressure fall over the last ~48h (hPa, positive = fell). */
  pressureDrop24hHpa?: number;
  /** Water temp change over ~48h in °F (negative = cooling). */
  waterTempChange48hF?: number;
  /** Fraction of the last ~12h of readings with a NW–NE breeze. */
  recentNortherlyFraction?: number;
}

const HOUR_MS = 3600 * 1000;
/** A feed whose newest row is older than this is treated as offline. */
const MAX_FEED_AGE_MS = 3 * HOUR_MS;
/** "Current" values (wind, pressure, water) must be at least this recent. */
const MAX_READING_AGE_MS = 2 * HOUR_MS;

/** North-sector wind (NW through NE) — offshore along the Gulf coast. */
export function isNortherlyDirection(dirDeg: number): boolean {
  const d = ((dirDeg % 360) + 360) % 360;
  return d >= 292.5 || d <= 67.5;
}

interface Reading {
  t: number;
  wdir: number | null;
  wspd: number | null;
  gst: number | null;
  wvht: number | null;
  pres: number | null;
  wtmp: number | null;
}

/** Value of `pick` closest to `targetMs`, within `toleranceMs`. */
function valueNear(
  readings: Reading[],
  targetMs: number,
  pick: (r: Reading) => number | null,
  toleranceMs = 90 * 60 * 1000,
): number | null {
  let best: number | null = null;
  let bestGap = Infinity;
  for (const r of readings) {
    const v = pick(r);
    if (v == null) continue;
    const gap = Math.abs(r.t - targetMs);
    if (gap < bestGap && gap <= toleranceMs) {
      best = v;
      bestGap = gap;
    }
  }
  return best;
}

/**
 * Largest 24-hour pressure fall inside the lookback window, sampled hourly.
 * Returns hPa (positive when pressure dropped).
 */
export function largestPressureDrop(
  readings: Reading[],
  nowMs: number,
  lookbackHours = 48,
): number | undefined {
  let largest: number | undefined;
  for (let h = 0; h <= lookbackHours - 24; h += 1) {
    const end = nowMs - h * HOUR_MS;
    const after = valueNear(readings, end, (r) => r.pres);
    const before = valueNear(readings, end - 24 * HOUR_MS, (r) => r.pres);
    if (after == null || before == null) continue;
    const drop = before - after;
    if (largest == null || drop > largest) largest = drop;
  }
  return largest == null ? undefined : Math.round(largest * 10) / 10;
}

function num(token: string | undefined): number | null {
  if (!token || token === "MM") return null;
  const n = Number(token);
  return Number.isFinite(n) ? n : null;
}

/** NE–E credit (with tapered shoulders) when there is a real breeze. */
function easterlyWeight(dirDeg: number, speedMps: number): number {
  return speedMps >= 2 ? easterlyDirectionWeight(dirDeg) : 0;
}

/**
 * Parse an NDBC realtime2 station feed. The first data row is the most recent.
 * Returns undefined-ish fields for any column reported as missing ("MM").
 */
export async function getBuoy(
  station: string | null,
): Promise<BuoyResult | undefined> {
  if (!station) return undefined;

  const text = await safeFetchText(
    // NDBC serves realtime files under upper-case IDs (e.g. PCLF1.txt); the
    // NOS/C-MAN IDs used on the Gulf are stored lower-case in the catalog.
    `https://www.ndbc.noaa.gov/data/realtime2/${station.toUpperCase()}.txt`,
    { revalidate: 1800 },
  );
  if (!text) return undefined;

  const rows = text
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.trim().split(/\s+/));
  if (rows.length === 0) return undefined;

  const allReadings: Reading[] = rows.map((r) => ({
    t: Date.UTC(
      Number(r[0]),
      Number(r[1]) - 1,
      Number(r[2]),
      Number(r[3]),
      Number(r[4]),
    ),
    wdir: num(r[5]),
    wspd: num(r[6]),
    gst: num(r[7]),
    wvht: num(r[8]),
    pres: num(r[12]),
    wtmp: num(r[14]),
  }));

  // Everything below is anchored to the wall clock, not to the newest row: a
  // station that stopped reporting still serves its last 45 days of data, and
  // treating that as "now" would score yesterday's wind as today's.
  const nowMs = Date.now();
  const latestMs = allReadings[0]?.t;
  if (latestMs == null || !Number.isFinite(latestMs)) return undefined;
  if (nowMs - latestMs > MAX_FEED_AGE_MS) return undefined; // station offline

  // Only the last ~2.5 days matter for fronts and cooling; the feed holds 45.
  const readings = allReadings.filter((r) => r.t >= nowMs - 60 * HOUR_MS);

  // Latest reading that actually has wind (wave-only buoys such as 41117
  // never do, and C-MAN rows often skip a column).
  const windRow = readings.find(
    (r) => r.wdir != null && r.wspd != null && nowMs - r.t <= MAX_READING_AGE_MS,
  );
  let wind: WindObservation | undefined;
  if (windRow) {
    wind = {
      directionDeg: windRow.wdir!,
      directionLabel: degreesToCompass(windRow.wdir!),
      speedKt: Math.round(windRow.wspd! * MPS_TO_KT),
      gustKt: windRow.gst != null ? Math.round(windRow.gst * MPS_TO_KT) : undefined,
    };
  }

  // Recent NE-through-E pattern over the last 18 hours. Counting rows would
  // cover only ~2 hours on 6-minute stations versus 18 hours on hourly buoys.
  let easterlyCredit = 0;
  let validCount = 0;
  for (const r of readings) {
    if (r.t < nowMs - 18 * HOUR_MS) break;
    if (r.wdir == null || r.wspd == null) continue;
    validCount += 1;
    easterlyCredit += easterlyWeight(r.wdir, r.wspd);
  }

  // Latest non-missing pressure / water temp / waves, if recent enough.
  const recent = (pick: (r: Reading) => number | null) =>
    valueNear(readings, nowMs, pick, MAX_READING_AGE_MS);
  const pressureHpa = recent((r) => r.pres);
  const wvht = recent((r) => r.wvht);
  const wtmpNow = recent((r) => r.wtmp);
  const wtmpThen = valueNear(
    readings,
    nowMs - 48 * HOUR_MS,
    (r) => r.wtmp,
    3 * HOUR_MS,
  );

  // North-sector pattern over the last 12 hours (a front's offshore flush).
  let northCount = 0;
  let northValid = 0;
  for (const r of readings) {
    if (r.t < nowMs - 12 * HOUR_MS) break;
    if (r.wdir == null || r.wspd == null) continue;
    northValid += 1;
    if (isNortherlyDirection(r.wdir) && r.wspd >= 3) northCount += 1;
  }

  return {
    wind,
    pressureHpa: pressureHpa ?? undefined,
    pressureDrop24hHpa: largestPressureDrop(readings, nowMs),
    waterTempChange48hF:
      wtmpNow != null && wtmpThen != null
        ? Math.round((wtmpNow - wtmpThen) * 1.8 * 10) / 10
        : undefined,
    recentNortherlyFraction:
      northValid >= 3 ? northCount / northValid : undefined,
    waterTempF: wtmpNow != null ? Math.round(cToF(wtmpNow)) : undefined,
    waveHeightFt: wvht != null ? Math.round(wvht * M_TO_FT * 10) / 10 : undefined,
    recentEasterlyFraction:
      validCount > 0 ? easterlyCredit / validCount : undefined,
  };
}

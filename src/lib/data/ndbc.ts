import type { WindObservation } from "@/lib/types";
import {
  M_TO_FT,
  MPS_TO_KT,
  cToF,
  degreesToCompass,
  safeFetchText,
} from "./http";
import { isFavorableEasterlyDirection } from "@/lib/wind";

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

/** North-sector wind (NW through NE) — offshore along the Gulf coast. */
export function isNortherlyDirection(dirDeg: number): boolean {
  const d = ((dirDeg % 360) + 360) % 360;
  return d >= 292.5 || d <= 67.5;
}

interface Reading {
  t: number;
  wdir: number | null;
  wspd: number | null;
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

/** Include the full NE, ENE, and E compass bins when there is a real breeze. */
function isFavorableEasterly(dirDeg: number, speedMps: number): boolean {
  return isFavorableEasterlyDirection(dirDeg) && speedMps >= 2;
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
    pres: num(r[12]),
    wtmp: num(r[14]),
  }));
  const latestMs = allReadings[0]?.t ?? Date.now();
  // Only the last ~2.5 days matter for fronts and cooling; the feed holds 45.
  const readings = allReadings.filter((r) => r.t >= latestMs - 60 * HOUR_MS);

  const latest = rows[0];
  const wdir = num(latest[5]);
  const wspd = num(latest[6]);
  const gst = num(latest[7]);
  const wvht = num(latest[8]);
  const wtmp = num(latest[14]);

  let wind: WindObservation | undefined;
  if (wdir != null && wspd != null) {
    wind = {
      directionDeg: wdir,
      directionLabel: degreesToCompass(wdir),
      speedKt: Math.round(wspd * MPS_TO_KT),
      gustKt: gst != null ? Math.round(gst * MPS_TO_KT) : undefined,
    };
  }

  // Recent NE-through-E pattern over the last ~18 valid readings.
  let easterlyCount = 0;
  let validCount = 0;
  for (const r of rows.slice(0, 18)) {
    const d = num(r[5]);
    const s = num(r[6]);
    if (d == null || s == null) continue;
    validCount += 1;
    if (isFavorableEasterly(d, s)) easterlyCount += 1;
  }

  // Latest non-missing pressure / water temp within the last 3 hours.
  const pressureHpa = valueNear(readings, latestMs, (r) => r.pres, 3 * HOUR_MS);
  const wtmpNow = wtmp ?? valueNear(readings, latestMs, (r) => r.wtmp, 3 * HOUR_MS);
  const wtmpThen = valueNear(
    readings,
    latestMs - 48 * HOUR_MS,
    (r) => r.wtmp,
    3 * HOUR_MS,
  );

  // North-sector pattern over the last 12 hours (a front's offshore flush).
  let northCount = 0;
  let northValid = 0;
  for (const r of readings) {
    if (r.t < latestMs - 12 * HOUR_MS) break;
    if (r.wdir == null || r.wspd == null) continue;
    northValid += 1;
    if (isNortherlyDirection(r.wdir) && r.wspd >= 3) northCount += 1;
  }

  return {
    wind,
    pressureHpa: pressureHpa ?? undefined,
    pressureDrop24hHpa: largestPressureDrop(readings, latestMs),
    waterTempChange48hF:
      wtmpNow != null && wtmpThen != null
        ? Math.round((wtmpNow - wtmpThen) * 1.8 * 10) / 10
        : undefined,
    recentNortherlyFraction:
      northValid >= 3 ? northCount / northValid : undefined,
    waterTempF: wtmpNow != null ? Math.round(cToF(wtmpNow)) : undefined,
    waveHeightFt: wvht != null ? Math.round(wvht * M_TO_FT * 10) / 10 : undefined,
    recentEasterlyFraction:
      validCount > 0 ? easterlyCount / validCount : undefined,
  };
}

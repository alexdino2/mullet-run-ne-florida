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
    `https://www.ndbc.noaa.gov/data/realtime2/${station}.txt`,
    { revalidate: 1800 },
  );
  if (!text) return undefined;

  const rows = text
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.trim().split(/\s+/));
  if (rows.length === 0) return undefined;

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

  return {
    wind,
    waterTempF: wtmp != null ? Math.round(cToF(wtmp)) : undefined,
    waveHeightFt: wvht != null ? Math.round(wvht * M_TO_FT * 10) / 10 : undefined,
    recentEasterlyFraction:
      validCount > 0 ? easterlyCount / validCount : undefined,
  };
}

import type { WindObservation } from "@/lib/types";
import {
  M_TO_FT,
  MPS_TO_KT,
  cToF,
  degreesToCompass,
  safeFetchText,
} from "./http";

export interface BuoyResult {
  wind?: WindObservation;
  waterTempF?: number;
  waveHeightFt?: number;
  /** Fraction of recent valid readings blowing out of the NE quadrant. */
  recentNeFraction?: number;
}

function num(token: string | undefined): number | null {
  if (!token || token === "MM") return null;
  const n = Number(token);
  return Number.isFinite(n) ? n : null;
}

/** NE quadrant here means roughly N through E (10°–100°) with real breeze. */
function isNe(dirDeg: number, speedMps: number): boolean {
  return dirDeg >= 10 && dirDeg <= 100 && speedMps >= 2;
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

  // Recent NE pattern over the last ~18 valid readings.
  let neCount = 0;
  let validCount = 0;
  for (const r of rows.slice(0, 18)) {
    const d = num(r[5]);
    const s = num(r[6]);
    if (d == null || s == null) continue;
    validCount += 1;
    if (isNe(d, s)) neCount += 1;
  }

  return {
    wind,
    waterTempF: wtmp != null ? Math.round(cToF(wtmp)) : undefined,
    waveHeightFt: wvht != null ? Math.round(wvht * M_TO_FT * 10) / 10 : undefined,
    recentNeFraction: validCount > 0 ? neCount / validCount : undefined,
  };
}

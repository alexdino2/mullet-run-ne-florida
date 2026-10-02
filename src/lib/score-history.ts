import { getServerSupabase } from "@/lib/supabase/server";
import { degreesToCompass } from "@/lib/data/http";
import type { ScoreResult, Sighting } from "@/lib/types";

/**
 * A station's recent score history, read from the hourly feature log the
 * Railway refresh writes. Rendered on the beach pages so each one carries
 * its own measured record, not just shared template copy.
 */

export interface ScoreHour {
  observedHour: string;
  score: number;
  rating: ScoreResult["rating"];
  windKt: number | null;
  windDirDeg: number | null;
  waterTempF: number | null;
  tideStage: string | null;
}

export interface ScoreDay {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  high: number;
  average: number;
  /** Hour of the day's high score (the first, if tied). */
  best: ScoreHour;
  waterTempF: number | null;
}

/**
 * West of the Apalachicola River the Panhandle keeps Central time; these are
 * the stations there. Every other station is on Eastern time.
 */
const CENTRAL_TIME_STATIONS = new Set([
  "pensacola-pass",
  "navarre-beach",
  "destin-east-pass",
  "st-andrew-pass",
]);

export function stationTimeZone(beachId: string): string {
  return CENTRAL_TIME_STATIONS.has(beachId)
    ? "America/Chicago"
    : "America/New_York";
}

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Hourly history via the `mw_score_history` function (anon-key safe). */
export async function getScoreHistory(
  beachId: string,
  days = 14,
): Promise<ScoreHour[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.rpc("mw_score_history", {
      p_beach_id: beachId,
      p_days: days,
    });
    // Before migration 0007 is applied the function doesn't exist; the
    // pages simply leave the history out.
    if (error || !Array.isArray(data)) return [];
    return (data as Record<string, unknown>[]).map((row) => ({
      observedHour: String(row.observed_hour),
      score: Number(row.score),
      rating: row.rating as ScoreResult["rating"],
      windKt: num(row.wind_kt),
      windDirDeg: num(row.wind_dir_deg),
      waterTempF: num(row.water_temp_f),
      tideStage:
        typeof row.tide_stage === "string" && row.tide_stage !== "unknown"
          ? row.tide_stage
          : null,
    }));
  } catch {
    return [];
  }
}

function localDate(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone });
}

/** Roll the hourly rows up into one row per local day, newest first. */
export function summarizeByDay(
  hours: ScoreHour[],
  timeZone: string,
): ScoreDay[] {
  const byDate = new Map<string, ScoreHour[]>();
  for (const h of hours) {
    const date = localDate(h.observedHour, timeZone);
    const list = byDate.get(date);
    if (list) list.push(h);
    else byDate.set(date, [h]);
  }

  return [...byDate.entries()]
    .map(([date, list]) => {
      const best = list.reduce((a, b) => (b.score > a.score ? b : a));
      const temps = list
        .map((h) => h.waterTempF)
        .filter((t): t is number => t !== null);
      return {
        date,
        high: best.score,
        average: Math.round(
          list.reduce((sum, h) => sum + h.score, 0) / list.length,
        ),
        best,
        waterTempF: temps.length
          ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
          : null,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** The logged hour closest to a sighting, if one is within 90 minutes. */
export function conditionsAt(
  hours: ScoreHour[],
  sighting: Pick<Sighting, "observed_at">,
): ScoreHour | null {
  const t = new Date(sighting.observed_at).getTime();
  let closest: ScoreHour | null = null;
  let gap = Infinity;
  for (const h of hours) {
    const d = Math.abs(new Date(h.observedHour).getTime() - t);
    if (d < gap) {
      gap = d;
      closest = h;
    }
  }
  return gap <= 90 * 60 * 1000 ? closest : null;
}

export function windText(h: ScoreHour): string | null {
  if (h.windKt === null) return null;
  const dir = h.windDirDeg !== null ? `${degreesToCompass(h.windDirDeg)} ` : "";
  return `${dir}${Math.round(h.windKt)} kt`;
}

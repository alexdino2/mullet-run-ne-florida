import type {
  Beach,
  Conditions,
  MoonState,
  RiverState,
  ScoreComponent,
  ScoreResult,
  TideStage,
  WindObservation,
} from "@/lib/types";
import {
  NEUTRAL,
  buildSummary,
  clamp01,
  clampScore,
  dayOfYear,
  pts,
  ratingFor,
  relTime,
} from "@/lib/score";
import { isNortherlyDirection } from "@/lib/data/ndbc";

/**
 * Gulf Coast "exit" score.
 *
 * On the Atlantic side the run is a parade of bait along the beach, so the
 * score asks whether onshore NE wind and moving water will push pods tight to
 * the surf. On the Gulf side mullet stage in bays, rivers, and marsh, then
 * leave through passes and river mouths. The research behind the site points
 * to the triggers that line up before a mass exit:
 *
 *   1. A cold front — a sharp barometric pressure fall.
 *   2. North-sector (offshore) wind behind it that flushes water out of the
 *      bays ("meteorological ebb").
 *   3. Cooling water — a drop over two days, and temps falling out of the 80s.
 *   4. A strong outgoing tide, strongest near spring tides.
 *   5. Days near a new or full moon.
 *   6. For passes fed by a river, a freshwater pulse (flow up or salinity
 *      down) that pushes fish out of the staging areas.
 *
 * All factors are 0..1 quality figures × weight, like the Atlantic score, so
 * the "why this score" breakdown reads the same on both coasts. Weights are a
 * research-based starting point, to be recalibrated against sightings and the
 * hourly feature log once a season of outcomes exists.
 */

export const GULF_WEIGHTS = {
  season: 18,
  front: 20,
  northWind: 14,
  water: 20,
  tide: 18,
  moon: 10,
} as const;

/** Used where a USGS gauge feeds the pass or river mouth. */
export const GULF_WEIGHTS_WITH_RIVER = {
  season: 16,
  front: 18,
  northWind: 12,
  water: 18,
  tide: 16,
  moon: 8,
  river: 12,
} as const;

/**
 * Gulf timing runs later than Northeast Florida: October–November in the
 * Panhandle and Big Bend, sliding toward late November–December around
 * Charlotte Harbor and Naples. Baseline is for ~30.4°N and shifts ~5 days per
 * degree south.
 */
const GULF_SEASON = {
  plateauStart: 278, // ~Oct 5
  plateauEnd: 318, //   ~Nov 14
  riseSigma: 18,
  fallSigma: 24,
  floor: 0.08,
  baseLatitude: 30.4,
} as const;

export function gulfSeasonFactor(date: Date, latitude: number): number {
  const doy = dayOfYear(date);
  const delay = Math.round(
    Math.max(0, Math.min(25, (GULF_SEASON.baseLatitude - latitude) * 5)),
  );
  const start = GULF_SEASON.plateauStart + delay;
  const end = GULF_SEASON.plateauEnd + delay;
  let g: number;
  if (doy < start) {
    const d = start - doy;
    g = Math.exp(-(d * d) / (2 * GULF_SEASON.riseSigma ** 2));
  } else if (doy > end) {
    const d = doy - end;
    g = Math.exp(-(d * d) / (2 * GULF_SEASON.fallSigma ** 2));
  } else {
    g = 1;
  }
  return Math.max(GULF_SEASON.floor, g);
}

/** Largest 24h pressure fall (hPa). ~6 hPa in a day is a strong front. */
export function frontFactor(dropHpa: number | undefined): number {
  if (dropHpa == null) return NEUTRAL;
  if (dropHpa <= 0.5) return 0.15;
  if (dropHpa >= 6) return 1;
  return 0.15 + (0.85 * (dropHpa - 0.5)) / 5.5;
}

function northDirQuality(deg: number): number {
  if (isNortherlyDirection(deg)) return 1; // NW through NE
  const d = ((deg % 360) + 360) % 360;
  if (d > 67.5 && d < 112.5) return 0.45; // easterly: neutral-ish
  if (d > 247.5 && d < 292.5) return 0.4; // westerly
  return 0.1; // southerly: onshore, holds water in the bays
}

function northSpeedQuality(kt: number): number {
  if (kt < 4) return 0.3;
  if (kt < 8) return 0.3 + (0.7 * (kt - 4)) / 4;
  if (kt <= 22) return 1;
  if (kt <= 30) return 1 - (0.3 * (kt - 22)) / 8;
  return 0.4;
}

export function northWindFactor(
  wind: WindObservation | undefined,
  recentFraction: number | undefined,
): number {
  if (!wind) return recentFraction != null ? clamp01(0.1 + 0.9 * recentFraction) : NEUTRAL;
  const now = northDirQuality(wind.directionDeg) * northSpeedQuality(wind.speedKt);
  if (recentFraction == null) return now;
  return clamp01(0.6 * now + 0.4 * (0.1 + 0.9 * recentFraction));
}

/** Absolute water temperature: out of the 80s and into the low 70s is prime. */
function waterLevelQuality(tempF: number): number {
  if (tempF >= 84) return 0.15;
  if (tempF >= 76) return 0.15 + (0.55 * (84 - tempF)) / 8;
  if (tempF >= 70) return 0.7 + (0.3 * (76 - tempF)) / 6;
  if (tempF >= 62) return 1;
  return 0.75; // cold snaps late in the season: the run is tailing off
}

/** Two-day change: a 3 °F drop or more is a strong cooling push. */
function coolingQuality(changeF: number): number {
  if (changeF <= -3) return 1;
  if (changeF >= 0.5) return 0.1;
  return 0.1 + (0.9 * (0.5 - changeF)) / 3.5;
}

export function waterFactor(
  tempF: number | undefined,
  change48hF: number | undefined,
): { factor: number; available: boolean } {
  if (tempF == null && change48hF == null) return { factor: NEUTRAL, available: false };
  if (tempF == null) return { factor: coolingQuality(change48hF!), available: true };
  if (change48hF == null) return { factor: waterLevelQuality(tempF), available: false };
  return {
    factor: clamp01(0.55 * coolingQuality(change48hF) + 0.45 * waterLevelQuality(tempF)),
    available: true,
  };
}

function ebbQuality(stage: TideStage): number {
  switch (stage) {
    case "falling":
      return 1; // outgoing water carries the schools through the pass
    case "low":
      return 0.55;
    case "high":
      return 0.45;
    case "rising":
      return 0.35;
    default:
      return NEUTRAL;
  }
}

export function gulfTideFactor(stage: TideStage, rangeRatio: number | undefined): number {
  const spring = rangeRatio ?? 0.6;
  if (stage === "unknown") return NEUTRAL;
  return clamp01(ebbQuality(stage) * (0.55 + 0.45 * spring));
}

export function moonFactor(moon: MoonState | undefined): number {
  if (!moon) return NEUTRAL;
  const d = moon.daysFromSyzygy;
  if (d <= 1.5) return 1;
  if (d <= 3) return 0.8;
  if (d <= 5) return 0.45;
  return 0.2;
}

export function riverFactor(river: RiverState | undefined): number {
  if (!river) return NEUTRAL;
  let f: number | undefined;
  if (river.dischargeRatio != null) {
    const r = river.dischargeRatio;
    f =
      r >= 1.8
        ? 1
        : r >= 1
          ? 0.45 + (0.55 * (r - 1)) / 0.8
          : r >= 0.7
            ? 0.25 + (0.2 * (r - 0.7)) / 0.3
            : 0.25;
  }
  if (river.conductanceChange != null) {
    const c = river.conductanceChange;
    const cf = c <= -0.3 ? 1 : c >= 0.1 ? 0.25 : 0.25 + (0.75 * (0.1 - c)) / 0.4;
    f = f == null ? cf : Math.max(f, cf);
  }
  return f ?? NEUTRAL;
}

function seasonReason(factor: number): string {
  if (factor >= 0.85) return "Inside the Gulf run window for this stretch of coast.";
  if (factor >= 0.4) return "Shoulder of the Gulf run window here.";
  if (factor <= 0.15) return "Well outside the Gulf run window.";
  return "The Gulf run is still weeks off here.";
}

function frontReason(drop: number | undefined): string {
  if (drop == null) return "No pressure history available; used a neutral value.";
  if (drop >= 4) return `Pressure fell ${drop} hPa in 24h — a cold front is moving through.`;
  if (drop >= 1.5) return `Pressure fell ${drop} hPa in 24h — a weak front or trough.`;
  return "Pressure has been steady — no front in the last two days.";
}

function waterReason(tempF: number | undefined, change: number | undefined): string {
  if (tempF == null && change == null) return "No water temperature available; used a neutral value.";
  const parts: string[] = [];
  if (tempF != null) parts.push(`${tempF}°F`);
  if (change != null) {
    parts.push(
      change <= -0.5
        ? `down ${Math.abs(change)}°F in 48h`
        : change >= 0.5
          ? `up ${change}°F in 48h`
          : "steady over 48h",
    );
  }
  return `${parts.join(", ")} — cooling out of the 80s toward the low 70s triggers exits.`;
}

function tideReason(
  stage: TideStage,
  rangeRatio: number | undefined,
  next: Conditions["tide"],
  now: Date,
): string {
  if (stage === "unknown") return "No tide data available; used a neutral value.";
  const nextTxt = next?.nextEvent
    ? ` — next ${next.nextEvent.type === "H" ? "high" : "low"} ${relTime(next.nextEvent.time, now)}`
    : "";
  const spring =
    rangeRatio == null
      ? ""
      : rangeRatio >= 0.8
        ? "; near spring-tide range"
        : rangeRatio <= 0.45
          ? "; neap-tide range (weak currents)"
          : "; mid-cycle range";
  const flow = stage === "falling" ? "outgoing" : stage === "rising" ? "incoming" : `slack ${stage}`;
  return `Tide is ${flow}${spring}${nextTxt}.`;
}

function riverReason(river: RiverState | undefined): string {
  if (!river) return "River gauge unavailable; used a neutral value.";
  const parts: string[] = [];
  if (river.dischargeRatio != null) {
    parts.push(`${river.label} flow at ${Math.round(river.dischargeRatio * 100)}% of its two-week median`);
  } else if (river.dischargeCfs != null) {
    parts.push(`${river.label} flowing ${river.dischargeCfs.toLocaleString()} cfs`);
  }
  if (river.conductanceChange != null && river.conductanceChange <= -0.15) {
    parts.push(`salinity down ${Math.round(Math.abs(river.conductanceChange) * 100)}% in 48h`);
  }
  return parts.length ? `${parts.join("; ")}.` : `${river.label} reading available.`;
}

export interface GulfScoreInputs {
  beach: Beach;
  conditions: Conditions;
  now?: Date;
}

export function computeGulfScore(input: GulfScoreInputs): ScoreResult {
  const now = input.now ?? new Date();
  const { beach, conditions } = input;
  const hasRiver = !!beach.usgs_site;
  const W: Record<string, number> = hasRiver ? GULF_WEIGHTS_WITH_RIVER : GULF_WEIGHTS;
  const components: ScoreComponent[] = [];
  const push = (
    key: string,
    label: string,
    factor: number,
    available: boolean,
    reason: string,
  ) =>
    components.push({
      key,
      label,
      weight: W[key],
      factor,
      points: pts(W[key], factor),
      available,
      reason,
    });

  const season = gulfSeasonFactor(now, beach.lat);
  push("season", "Season window", season, true, seasonReason(season));

  const drop = conditions.pressureDrop24hHpa;
  push("front", "Cold front (pressure drop)", frontFactor(drop), drop != null, frontReason(drop));

  const wind = conditions.wind;
  push(
    "northWind",
    "North-wind flush",
    northWindFactor(wind, conditions.recentNortherlyFraction),
    !!wind,
    wind
      ? `${wind.directionLabel} ${wind.speedKt} kt${
          conditions.recentNortherlyFraction != null
            ? ` · ${Math.round(conditions.recentNortherlyFraction * 100)}% of the last 12h from NW–NE`
            : ""
        } — north winds push water (and fish) out of the bays.`
      : "No wind reading available; used a neutral value.",
  );

  const water = waterFactor(conditions.waterTempF, conditions.waterTempChange48hF);
  push(
    "water",
    "Water cooling",
    water.factor,
    water.available,
    waterReason(conditions.waterTempF, conditions.waterTempChange48hF),
  );

  const stage = conditions.tide?.stage ?? "unknown";
  const rangeRatio = conditions.tide?.rangeRatio;
  push(
    "tide",
    "Outgoing tide strength",
    gulfTideFactor(stage, rangeRatio),
    stage !== "unknown",
    tideReason(stage, rangeRatio, conditions.tide, now),
  );

  const moon = conditions.moon;
  push(
    "moon",
    "Moon phase",
    moonFactor(moon),
    !!moon,
    moon
      ? `${moon.name}, ${moon.daysFromSyzygy} days from the nearest new/full moon — exits cluster around both.`
      : "Moon phase unavailable.",
  );

  if (hasRiver) {
    push("river", "River flush", riverFactor(conditions.river), !!conditions.river, riverReason(conditions.river));
  }

  const score = clampScore(components.reduce((acc, c) => acc + c.weight * c.factor, 0));
  return {
    model: "gulf-trigger",
    score,
    rating: ratingFor(score),
    components,
    summary: buildSummary(components, score),
  };
}

/** Per-hour Gulf score for the next-best-window lookahead. */
export function hourlyGulfScore(params: {
  beach: Beach;
  when: Date;
  wind: WindObservation | undefined;
  stage: TideStage;
  rangeRatio: number | undefined;
  pressureDropHpa: number | undefined;
  moon: MoonState;
  /** Held at the current value — there is no water-temp forecast. */
  waterF: number;
  /** Held at the current value. */
  riverF: number;
}): number {
  const { beach } = params;
  const hasRiver = !!beach.usgs_site;
  const W: Record<string, number> = hasRiver ? GULF_WEIGHTS_WITH_RIVER : GULF_WEIGHTS;
  let total =
    W.season * gulfSeasonFactor(params.when, beach.lat) +
    W.front * frontFactor(params.pressureDropHpa) +
    W.northWind * northWindFactor(params.wind, undefined) +
    W.water * params.waterF +
    W.tide * gulfTideFactor(params.stage, params.rangeRatio) +
    W.moon * moonFactor(params.moon);
  if (hasRiver) total += W.river * params.riverF;
  return clampScore(total);
}

import type {
  Conditions,
  ScoreComponent,
  ScoreResult,
  TideStage,
  WindObservation,
} from "@/lib/types";

/**
 * Mullet opportunity score.
 *
 * A transparent, weighted 0–100 score built from five PUBLIC-DATA factors, each
 * returning a 0..1 quality figure that is multiplied by its weight. The factors
 * are pure functions so the same logic drives both the "now" score and the
 * hourly lookahead used for the next-best-window forecast.
 *
 * Weights (sum to 100):
 *   season 25 · windDir 24 · recentNE 18 · tide 18 · windSpeed 15
 *
 * Manually logged sightings are intentionally NOT part of the score: the score
 * is derived from public sources only (NWS, NOAA CO-OPS, NDBC, season). Sightings
 * are still recorded and displayed, and can be folded back in as a factor once
 * enough have been collected to be predictive.
 */

const NEUTRAL = 0.45;

export const WEIGHTS = {
  season: 25,
  windDir: 24,
  recentNe: 18,
  tide: 18,
  windSpeed: 15,
} as const;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
}

/** Fall mullet run in NE Florida peaks around mid/late October. */
export function seasonFactor(date: Date): number {
  const doy = dayOfYear(date);
  const peak = 293; // ~Oct 20
  const sigma = 34;
  let diff = Math.abs(doy - peak);
  diff = Math.min(diff, 365 - diff); // wrap around the year
  const g = Math.exp(-(diff * diff) / (2 * sigma * sigma));
  return Math.max(0.08, g);
}

/** Angular distance (0..180) between two compass bearings. */
function angDiff(a: number, b: number): number {
  const d = Math.abs(((a - b + 180) % 360) - 180);
  return d;
}

/** NE (45°) is ideal; N and E are decent; onshore-S/offshore-W are poor. */
export function windDirFactor(deg: number): number {
  return clamp01(1 - angDiff(deg, 45) / 90);
}

/** Moderate wind (roughly 10–17 kt) is ideal; calm or blown-out is poor. */
export function windSpeedFactor(kt: number): number {
  if (kt <= 1) return 0.25;
  if (kt <= 10) return 0.4 + (0.6 * (kt - 1)) / 9; // 0.4 -> 1.0
  if (kt <= 17) return 1.0;
  if (kt <= 25) return 1.0 - (0.5 * (kt - 17)) / 8; // 1.0 -> 0.5
  if (kt <= 32) return 0.5 - (0.2 * (kt - 25)) / 7; // 0.5 -> 0.3
  return 0.3;
}

export function tideFactor(stage: TideStage): number {
  switch (stage) {
    case "falling":
      return 1.0; // outgoing water pulls bait along the beach and inlets
    case "rising":
      return 0.9;
    case "high":
    case "low":
      return 0.55; // slack water
    default:
      return NEUTRAL;
  }
}

export function recentNeFactor(
  fraction: number | undefined,
  currentWind: WindObservation | undefined,
): { factor: number; estimated: boolean } {
  if (fraction != null) {
    return { factor: clamp01(0.15 + 0.85 * fraction), estimated: false };
  }
  if (currentWind) {
    const ne = windDirFactor(currentWind.directionDeg) > 0.6;
    return { factor: ne ? 0.5 : 0.2, estimated: true };
  }
  return { factor: NEUTRAL, estimated: true };
}

function ratingFor(score: number): ScoreResult["rating"] {
  if (score >= 80) return "prime";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

function pts(weight: number, factor: number): number {
  return Math.round(weight * factor);
}

export interface ScoreInputs {
  conditions: Conditions;
  now?: Date;
}

export function computeScore(input: ScoreInputs): ScoreResult {
  const now = input.now ?? new Date();
  const { conditions } = input;
  const wind = conditions.wind;
  const components: ScoreComponent[] = [];

  // Season
  const season = seasonFactor(now);
  components.push({
    key: "season",
    label: "Season window",
    weight: WEIGHTS.season,
    factor: season,
    points: pts(WEIGHTS.season, season),
    available: true,
    reason: seasonReason(now, season),
  });

  // Wind direction
  const dirFactor = wind ? windDirFactor(wind.directionDeg) : NEUTRAL;
  components.push({
    key: "windDir",
    label: "Wind direction",
    weight: WEIGHTS.windDir,
    factor: dirFactor,
    points: pts(WEIGHTS.windDir, dirFactor),
    available: !!wind,
    reason: wind
      ? `${wind.directionLabel} (${Math.round(wind.directionDeg)}°) — NE is ideal.`
      : "No wind reading available; used a neutral value.",
  });

  // Recent NE pattern
  const ne = recentNeFactor(conditions.recentNeFraction, wind);
  components.push({
    key: "recentNe",
    label: "Recent NE pattern",
    weight: WEIGHTS.recentNe,
    factor: ne.factor,
    points: pts(WEIGHTS.recentNe, ne.factor),
    available: conditions.recentNeFraction != null,
    reason:
      conditions.recentNeFraction != null
        ? `${Math.round(conditions.recentNeFraction * 100)}% of recent hourly readings blew out of the NE.`
        : "Estimated from current wind (no recent history).",
  });

  // Tide
  const stage = conditions.tide?.stage ?? "unknown";
  const tFactor = tideFactor(stage);
  components.push({
    key: "tide",
    label: "Tide stage",
    weight: WEIGHTS.tide,
    factor: tFactor,
    points: pts(WEIGHTS.tide, tFactor),
    available: stage !== "unknown",
    reason:
      stage === "unknown"
        ? "No tide data available; used a neutral value."
        : `Tide is ${stage}${
            conditions.tide?.nextEvent
              ? ` — next ${conditions.tide.nextEvent.type === "H" ? "high" : "low"} ${relTime(conditions.tide.nextEvent.time, now)}`
              : ""
          }.`,
  });

  // Wind speed
  const spdFactor = wind ? windSpeedFactor(wind.speedKt) : NEUTRAL;
  components.push({
    key: "windSpeed",
    label: "Wind speed",
    weight: WEIGHTS.windSpeed,
    factor: spdFactor,
    points: pts(WEIGHTS.windSpeed, spdFactor),
    available: !!wind,
    reason: wind
      ? `${wind.speedKt} kt — moderate breeze (10–17 kt) is best.`
      : "No wind reading available; used a neutral value.",
  });

  const score = clampScore(
    components.reduce((acc, c) => acc + c.weight * c.factor, 0),
  );

  return {
    score,
    rating: ratingFor(score),
    components,
    summary: buildSummary(components, score),
  };
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Lightweight per-hour score used for the next-window forecast. */
export function hourlyScore(params: {
  when: Date;
  wind: WindObservation | undefined;
  stage: TideStage;
  recentNeF: number;
}): number {
  const { when, wind, stage, recentNeF } = params;
  const season = seasonFactor(when);
  const dir = wind ? windDirFactor(wind.directionDeg) : NEUTRAL;
  const spd = wind ? windSpeedFactor(wind.speedKt) : NEUTRAL;
  const tide = tideFactor(stage);
  const total =
    WEIGHTS.season * season +
    WEIGHTS.windDir * dir +
    WEIGHTS.recentNe * recentNeF +
    WEIGHTS.tide * tide +
    WEIGHTS.windSpeed * spd;
  return clampScore(total);
}

function seasonReason(now: Date, factor: number): string {
  const month = now.getUTCMonth(); // 0=Jan
  if (factor >= 0.85) return "Peak of the fall mullet run.";
  if (month >= 8 && month <= 10) return "Fall run is building/tapering.";
  if (factor <= 0.15) return "Well outside the fall run window.";
  return "Shoulder of the fall run window.";
}

function relTime(iso: string, now: Date): string {
  const mins = Math.round((new Date(iso).getTime() - now.getTime()) / 60000);
  if (mins <= 0) return "now";
  if (mins < 60) return `in ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `in ${h}h ${m}m` : `in ${h}h`;
}

function buildSummary(components: ScoreComponent[], score: number): string {
  const sorted = [...components].sort((a, b) => b.points - a.points);
  const drivers = sorted.filter((c) => c.factor >= 0.7).slice(0, 2);
  const limiter = [...components]
    .filter((c) => c.available)
    .sort((a, b) => a.factor - b.factor)[0];

  const label =
    score >= 80
      ? "Prime"
      : score >= 60
        ? "Good"
        : score >= 40
          ? "Fair"
          : "Slow";

  const parts: string[] = [];
  if (drivers.length) {
    parts.push(
      `${label} — helped by ${drivers.map((d) => d.label.toLowerCase()).join(" and ")}`,
    );
  } else {
    parts.push(`${label} conditions overall`);
  }
  if (limiter && limiter.factor < 0.5) {
    parts.push(`held back by ${limiter.label.toLowerCase()}`);
  }
  return parts.join("; ") + ".";
}

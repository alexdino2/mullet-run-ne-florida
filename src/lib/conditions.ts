import type {
  Beach,
  BeachConditions,
  BeachSummary,
  Coast,
  Conditions,
  HourlyForecast,
  OpportunityWindow,
  ScoreResult,
  Sighting,
} from "@/lib/types";
import { getBeaches, getStation } from "@/lib/beaches";
import { getRecentSightings } from "@/lib/sightings";
import { getNwsForecast, type NwsResult } from "@/lib/data/nws";
import { getOpenMeteo, maxPressureDrop } from "@/lib/data/openmeteo";
import { getTides, stageAt, tideRangeRatio } from "@/lib/data/coops";
import { getBuoy } from "@/lib/data/ndbc";
import { getRiver } from "@/lib/data/usgs";
import { moonAt } from "@/lib/moon";
import {
  computeScore,
  hourlyScore,
  recentEasterlyFactor,
} from "@/lib/score";
import {
  computeGulfScore,
  hourlyGulfScore,
  riverFactor,
  waterFactor,
} from "@/lib/score-gulf";
import { getServerSupabase, hasServiceRole } from "@/lib/supabase/server";

interface Assembled {
  conditions: Conditions;
  hourly: HourlyForecast[];
  pressureSeries: { t: number; hpa: number }[];
}

const NO_NWS: NwsResult = { hourly: [] };

/**
 * Fetch every source for a station and assemble the merged conditions.
 *
 * Source precedence is fixed and does not depend on where the code runs, so
 * the Railway refresh job and the Vercel app score a station from the same
 * inputs: wind prefers a fresh station observation, then the Open-Meteo model,
 * then the NWS forecast. NWS is only called when Open-Meteo has nothing —
 * api.weather.gov blocks Vercel's egress but not Railway's, and preferring it
 * whenever reachable made the same beach score differently in each place.
 * Pressure history prefers the station's own barometer and falls back to the
 * Open-Meteo model. Gulf stations also pull a river gauge and, when the primary
 * station has no water sensor, a second buoy for temp.
 */
async function assembleConditions(beach: Beach): Promise<Assembled> {
  const gulf = beach.coast === "gulf";
  const [om, tide, buoy, windStation, tempBuoy, river] = await Promise.all([
    getOpenMeteo(beach.lat, beach.lon),
    getTides(beach.tide_station),
    getBuoy(beach.buoy_station),
    getBuoy(beach.wind_station ?? null),
    gulf ? getBuoy(beach.temp_buoy_station) : Promise.resolve(undefined),
    gulf ? getRiver(beach.usgs_site) : Promise.resolve(undefined),
  ]);
  const needNws = !om.current?.wind || om.hourly.length < 2;
  const nws = needNws ? await getNwsForecast(beach.lat, beach.lon) : NO_NWS;

  const waterTempF = buoy?.waterTempF ?? tempBuoy?.waterTempF;
  const waterTempChange48hF =
    buoy?.waterTempF != null
      ? buoy.waterTempChange48hF
      : tempBuoy?.waterTempChange48hF;

  const stationWind = windStation?.wind ?? buoy?.wind;
  const wind = stationWind ?? om.current?.wind ?? nws.current?.wind;
  const windSource: Conditions["windSource"] = stationWind
    ? "station"
    : om.current?.wind
      ? "model"
      : nws.current?.wind
        ? "forecast"
        : undefined;

  const sources: string[] = [];
  if (om.current?.wind || om.hourly.length) sources.push("Open-Meteo");
  if (nws.hourly.length) sources.push("NWS");
  if (tide) sources.push("NOAA CO-OPS");
  if (buoy) sources.push(`NDBC ${beach.buoy_station?.toUpperCase()}`);
  if (windStation) sources.push(`NDBC ${beach.wind_station?.toUpperCase()}`);
  if (tempBuoy && buoy?.waterTempF == null) {
    sources.push(`NDBC ${beach.temp_buoy_station?.toUpperCase()}`);
  }
  if (river) sources.push(`USGS ${river.site}`);

  const conditions: Conditions = {
    wind,
    windSource,
    airTempF: om.current?.airTempF ?? nws.current?.airTempF,
    waterTempF,
    waveHeightFt: buoy?.waveHeightFt,
    tide,
    recentEasterlyFraction:
      windStation?.recentEasterlyFraction ??
      buoy?.recentEasterlyFraction ??
      om.recentEasterlyFraction,
    pressureHpa: buoy?.pressureHpa ?? om.pressureHpa,
    pressureDrop24hHpa: buoy?.pressureDrop24hHpa ?? om.pressureDrop24hHpa,
    waterTempChange48hF,
    recentNortherlyFraction:
      buoy?.recentNortherlyFraction ?? om.recentNortherlyFraction,
    moon: moonAt(new Date()),
    river,
    sources,
    observedAt: new Date().toISOString(),
  };

  // Same order for the forecast: Open-Meteo (which also carries pressure),
  // then NWS with Open-Meteo pressure merged in where the hours line up.
  const omPressure = new Map(
    om.hourly.map((h) => [Math.round(new Date(h.time).getTime() / 3600000), h.pressureHpa]),
  );
  const base = om.hourly.length >= 2 ? om.hourly : nws.hourly;
  const hourly = base.map((h) => ({
    ...h,
    pressureHpa:
      h.pressureHpa ??
      omPressure.get(Math.round(new Date(h.time).getTime() / 3600000)),
  }));
  return { conditions, hourly, pressureSeries: om.pressureSeries };
}

/** Score a station with the model for its coast. */
export function scoreStation(
  beach: Beach,
  conditions: Conditions,
  now?: Date,
): ScoreResult {
  return beach.coast === "gulf"
    ? computeGulfScore({ beach, conditions, now })
    : computeScore({ conditions, now, latitude: beach.lat });
}

function pickWindow(
  scored: { when: Date; score: number }[],
): OpportunityWindow | null {
  if (scored.length === 0) return null;

  let peakIdx = 0;
  for (let i = 1; i < scored.length; i++) {
    if (scored[i].score > scored[peakIdx].score) peakIdx = i;
  }
  const peak = scored[peakIdx];
  const threshold = Math.max(55, peak.score - 12);

  let start = peakIdx;
  while (start > 0 && scored[start - 1].score >= threshold) start--;
  let end = peakIdx;
  while (end < scored.length - 1 && scored[end + 1].score >= threshold) end++;

  const endTime = new Date(scored[end].when.getTime() + 3600 * 1000);

  return {
    start: scored[start].when.toISOString(),
    end: endTime.toISOString(),
    peakTime: peak.when.toISOString(),
    peakScore: peak.score,
  };
}

function computeNextWindow(
  beach: Beach,
  assembled: Assembled,
  now: Date,
): OpportunityWindow | null {
  const { conditions, hourly, pressureSeries } = assembled;
  if (hourly.length < 2) return null;

  const events = conditions.tide?.events ?? [];
  const future = hourly.filter((h) => new Date(h.time).getTime() > now.getTime());

  if (beach.coast === "gulf") {
    const waterF = waterFactor(
      conditions.waterTempF,
      conditions.waterTempChange48hF,
    ).factor;
    const riverF = riverFactor(conditions.river);
    return pickWindow(
      future.map((h) => {
        const when = new Date(h.time);
        const ms = when.getTime();
        return {
          when,
          score: hourlyGulfScore({
            beach,
            when,
            wind: h.wind,
            stage: events.length ? stageAt(events, ms) : "unknown",
            rangeRatio: events.length ? tideRangeRatio(events, ms) : undefined,
            // Forecast pressure: a front on its way shows up here before it
            // shows up in the station barometer.
            pressureDropHpa:
              maxPressureDrop(pressureSeries, ms, 48) ??
              conditions.pressureDrop24hHpa,
            moon: moonAt(when),
            waterF,
            riverF,
          }),
        };
      }),
    );
  }

  const recentEasterlyF = recentEasterlyFactor(
    conditions.recentEasterlyFraction,
    conditions.wind,
  ).factor;
  return pickWindow(
    future.map((h) => {
      const when = new Date(h.time);
      return {
        when,
        score: hourlyScore({
          when,
          wind: h.wind,
          stage: events.length ? stageAt(events, when.getTime()) : "unknown",
          recentEasterlyF,
          latitude: beach.lat,
        }),
      };
    }),
  );
}

/**
 * Bump whenever the way inputs are gathered changes (source precedence, feed
 * parsing, new condition fields). Snapshots with another version are ignored,
 * so a deploy never mixes old-pipeline numbers into the rankings.
 */
export const SNAPSHOT_VERSION = 2;

export interface CachedPayload {
  /** Snapshot format/pipeline version; see SNAPSHOT_VERSION. */
  v?: number;
  /** Feed IDs the snapshot was built from; see stationFingerprint. */
  station?: string;
  conditions: Conditions;
  score: ScoreResult;
  nextWindow: OpportunityWindow | null;
}

/** Changes whenever a station's coast, location, or data feeds change. */
function stationFingerprint(b: Beach): string {
  return [
    b.coast,
    b.lat,
    b.lon,
    b.tide_station,
    b.buoy_station,
    b.temp_buoy_station,
    b.wind_station ?? "",
    b.usgs_site,
  ].join("|");
}

/**
 * Re-derive everything that depends only on the clock — tide stage, next tide,
 * spring/neap range, moon, season — and score with the current model. Lets a
 * cached snapshot be served without a stale tide stage or an old scorer.
 */
export function rescoreSnapshot(
  beach: Beach,
  snapshot: Conditions,
  now: Date,
): { conditions: Conditions; score: ScoreResult } {
  const nowMs = now.getTime();
  const events = snapshot.tide?.events ?? [];
  const tide =
    snapshot.tide && events.length
      ? {
          ...snapshot.tide,
          stage: stageAt(events, nowMs),
          nextEvent: events.find((e) => new Date(e.time).getTime() > nowMs),
          rangeRatio: tideRangeRatio(events, nowMs),
        }
      : snapshot.tide;
  const conditions: Conditions = { ...snapshot, tide, moon: moonAt(now) };
  return { conditions, score: scoreStation(beach, conditions, now) };
}

async function persistCache(
  beach: Beach,
  now: Date,
  score: ScoreResult,
  conditions: Conditions,
  nextWindow: OpportunityWindow | null,
) {
  if (!hasServiceRole()) return; // avoid RLS write failures with the anon key
  const supabase = getServerSupabase();
  if (!supabase) return;

  // Self-check: the stored snapshot must reproduce this exact score after a
  // JSON round trip. If it can't, readers would serve a different number than
  // the one computed here, so don't write it.
  const stored = JSON.parse(JSON.stringify(conditions)) as Conditions;
  const replayed = rescoreSnapshot(beach, stored, now).score.score;
  if (replayed !== score.score) {
    console.error(
      JSON.stringify({
        event: "snapshot_mismatch",
        station: beach.id,
        score: score.score,
        replayed,
      }),
    );
    return;
  }

  const payload: CachedPayload = {
    v: SNAPSHOT_VERSION,
    station: stationFingerprint(beach),
    conditions,
    score,
    nextWindow,
  };
  await supabase
    .from("mw_conditions_cache")
    .upsert({
      beach_id: beach.id,
      fetched_at: now.toISOString(),
      score: score.score,
      payload,
    })
    .then(
      () => undefined,
      () => undefined,
    );
}

export async function computeBeachConditions(
  beach: Beach,
  allSightings?: Sighting[],
  opts: { persist?: boolean } = {},
): Promise<BeachConditions> {
  const now = new Date();
  const sightings = allSightings ?? (await getRecentSightings(100));
  const assembled = await assembleConditions(beach);

  // Score is computed from public sources only — sightings are not a factor.
  // It goes through the same function that re-scores cached snapshots, so the
  // dashboard and the map can never disagree about what inputs mean.
  const { conditions, score } = rescoreSnapshot(beach, assembled.conditions, now);
  const nextWindow = computeNextWindow(beach, { ...assembled, conditions }, now);
  // Sightings are still fetched purely for display alongside the score.
  const recentSightings = sightings
    .filter((s) => s.beach_id === beach.id)
    .slice(0, 10);

  const result: BeachConditions = {
    beach,
    conditions,
    score,
    nextWindow,
    recentSightings,
    generatedAt: now.toISOString(),
  };

  if (opts.persist !== false) {
    await persistCache(beach, now, score, conditions, nextWindow);
  }

  return result;
}

function toSummary(beach: Beach, conditions: Conditions, score: ScoreResult): BeachSummary {
  return {
    beach,
    score: score.score,
    rating: score.rating,
    summary: score.summary,
    wind: conditions.wind,
    waterTempF: conditions.waterTempF,
  };
}

/**
 * Snapshots older than this are recomputed. The Railway refresh runs hourly;
 * the extra 15 minutes covers a slow run without serving a skipped one.
 */
const CACHE_MAX_AGE_MS = 75 * 60 * 1000;

/**
 * Re-scored summaries for every station with a valid, recent snapshot.
 * Snapshots come from the hourly Railway refresh (and every dashboard view)
 * and are re-scored for the current moment, so they use the same model and
 * tide stage as the live dashboard. Stations without one are left out.
 */
async function readCachedSummaries(
  beaches: Beach[],
  now: Date,
): Promise<Map<string, BeachSummary>> {
  const cached = new Map<string, BeachSummary>();
  const supabase = getServerSupabase();
  if (!supabase) return cached;

  const since = new Date(now.getTime() - CACHE_MAX_AGE_MS).toISOString();
  const { data } = await supabase
    .from("mw_conditions_cache")
    .select("beach_id, fetched_at, payload")
    .in(
      "beach_id",
      beaches.map((b) => b.id),
    )
    .gte("fetched_at", since);
  for (const row of (data ?? []) as {
    beach_id: string;
    payload: CachedPayload | null;
  }[]) {
    const beach = getStation(row.beach_id);
    const payload = row.payload;
    // Only trust snapshots from the current pipeline, for this station's
    // current feeds. Anything else is recomputed live by the caller.
    if (!beach || !payload?.conditions) continue;
    if (payload.v !== SNAPSHOT_VERSION) continue;
    if (payload.station !== stationFingerprint(beach)) continue;
    const { conditions, score } = rescoreSnapshot(beach, payload.conditions, now);
    cached.set(beach.id, toSummary(beach, conditions, score));
  }
  return cached;
}

/**
 * Summaries for the map and rankings, from cached snapshots. Only stations
 * without a valid, recent snapshot are fetched live — keeping this request
 * short even with 30+ stations.
 */
export async function computeAllSummaries(coast?: Coast): Promise<BeachSummary[]> {
  const beaches = await getBeaches(coast);
  const cached = await readCachedSummaries(beaches, new Date());

  const summaries = await Promise.all(
    beaches.map(async (beach) => {
      const hit = cached.get(beach.id);
      if (hit) return hit;
      // A miss also writes a snapshot, so the next request is a hit.
      const r = await computeBeachConditions(beach, []);
      return toSummary(beach, r.conditions, r.score);
    }),
  );

  return summaries.sort((a, b) => b.score - a.score);
}

/**
 * Cached summaries only, for server-rendering the rankings into the page
 * HTML without waiting on live feeds. `complete` is false when some stations
 * had no usable snapshot; the client then fetches `/api/summaries` to fill
 * them in.
 */
export async function getCachedSummaries(
  coast?: Coast,
): Promise<{ summaries: BeachSummary[]; complete: boolean }> {
  const beaches = await getBeaches(coast);
  try {
    const cached = await readCachedSummaries(beaches, new Date());
    return {
      summaries: [...cached.values()].sort((a, b) => b.score - a.score),
      complete: cached.size === beaches.length,
    };
  } catch {
    return { summaries: [], complete: false };
  }
}

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
import { getNwsForecast } from "@/lib/data/nws";
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

/**
 * Fetch every source for a station in parallel and assemble the merged
 * conditions. Wind/temp prefer the buoy, then NWS, then Open-Meteo — the last
 * guarantees coverage when api.weather.gov is unreachable (e.g. from Vercel's
 * serverless egress). Pressure history prefers the station's own barometer and
 * falls back to the Open-Meteo model. Gulf stations also pull a river gauge
 * and, when the primary station has no water sensor, a second buoy for temp.
 */
async function assembleConditions(beach: Beach): Promise<Assembled> {
  const gulf = beach.coast === "gulf";
  const [nws, om, tide, buoy, tempBuoy, river] = await Promise.all([
    getNwsForecast(beach.lat, beach.lon),
    getOpenMeteo(beach.lat, beach.lon),
    getTides(beach.tide_station),
    getBuoy(beach.buoy_station),
    gulf ? getBuoy(beach.temp_buoy_station) : Promise.resolve(undefined),
    gulf ? getRiver(beach.usgs_site) : Promise.resolve(undefined),
  ]);

  const waterTempF = buoy?.waterTempF ?? tempBuoy?.waterTempF;
  const waterTempChange48hF =
    buoy?.waterTempF != null
      ? buoy.waterTempChange48hF
      : tempBuoy?.waterTempChange48hF;

  const sources: string[] = [];
  if (nws.hourly.length) sources.push("NWS");
  if (om.current?.wind || om.hourly.length) sources.push("Open-Meteo");
  if (tide) sources.push("NOAA CO-OPS");
  if (buoy) sources.push(`NDBC ${beach.buoy_station?.toUpperCase()}`);
  if (tempBuoy && buoy?.waterTempF == null) {
    sources.push(`NDBC ${beach.temp_buoy_station?.toUpperCase()}`);
  }
  if (river) sources.push(`USGS ${river.site}`);

  const conditions: Conditions = {
    wind: buoy?.wind ?? nws.current?.wind ?? om.current?.wind,
    airTempF: nws.current?.airTempF ?? om.current?.airTempF,
    waterTempF,
    waveHeightFt: buoy?.waveHeightFt,
    tide,
    recentEasterlyFraction:
      buoy?.recentEasterlyFraction ?? om.recentEasterlyFraction,
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

  // Prefer the NWS hourly series for the forecast; fall back to Open-Meteo.
  // Open-Meteo is the only hourly source with pressure, so merge it in.
  const omPressure = new Map(
    om.hourly.map((h) => [Math.round(new Date(h.time).getTime() / 3600000), h.pressureHpa]),
  );
  const base = nws.hourly.length >= 2 ? nws.hourly : om.hourly;
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

export interface CachedPayload {
  conditions: Conditions;
  score: ScoreResult;
  nextWindow: OpportunityWindow | null;
}

async function persistCache(beachId: string, score: number, payload: CachedPayload) {
  if (!hasServiceRole()) return; // avoid RLS write failures with the anon key
  const supabase = getServerSupabase();
  if (!supabase) return;
  await supabase
    .from("mw_conditions_cache")
    .upsert({
      beach_id: beachId,
      fetched_at: new Date().toISOString(),
      score,
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
  const { conditions } = assembled;

  // Score is computed from public sources only — sightings are not a factor.
  const score = scoreStation(beach, conditions, now);
  const nextWindow = computeNextWindow(beach, assembled, now);
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
    await persistCache(beach.id, score.score, { conditions, score, nextWindow });
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

/** Cached rows newer than this are served as-is; older ones are recomputed. */
const CACHE_MAX_AGE_MS = 2 * 60 * 60 * 1000;

/**
 * Summaries for the map and rankings. Reads the hourly cache the Railway
 * refresh job writes, and computes live only for stations with no fresh row —
 * keeping this request short even with 30+ stations.
 */
export async function computeAllSummaries(coast?: Coast): Promise<BeachSummary[]> {
  const beaches = await getBeaches(coast);
  const cached = new Map<string, BeachSummary>();

  const supabase = getServerSupabase();
  if (supabase) {
    const since = new Date(Date.now() - CACHE_MAX_AGE_MS).toISOString();
    const { data } = await supabase
      .from("mw_conditions_cache")
      .select("beach_id, fetched_at, score, payload")
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
      // Only trust rows written by a scorer that knows this station's coast.
      if (!beach || !payload?.score || !payload.conditions) continue;
      const expected = beach.coast === "gulf" ? "gulf-trigger" : "atlantic-surf";
      if (payload.score.model && payload.score.model !== expected) continue;
      if (beach.coast === "gulf" && !payload.score.model) continue;
      cached.set(beach.id, toSummary(beach, payload.conditions, payload.score));
    }
  }

  const summaries = await Promise.all(
    beaches.map(async (beach) => {
      const hit = cached.get(beach.id);
      if (hit) return hit;
      const { conditions } = await assembleConditions(beach);
      return toSummary(beach, conditions, scoreStation(beach, conditions));
    }),
  );

  return summaries.sort((a, b) => b.score - a.score);
}

import type {
  Beach,
  BeachConditions,
  BeachSummary,
  Conditions,
  OpportunityWindow,
  Sighting,
} from "@/lib/types";
import { getBeaches } from "@/lib/beaches";
import { getRecentSightings } from "@/lib/sightings";
import { getNwsForecast } from "@/lib/data/nws";
import { getTides, stageAt } from "@/lib/data/coops";
import { getBuoy } from "@/lib/data/ndbc";
import { computeScore, hourlyScore, recentNeFactor } from "@/lib/score";
import { getServerSupabase, hasServiceRole } from "@/lib/supabase/server";

function computeNextWindow(
  conditions: Conditions,
  nwsHourly: Awaited<ReturnType<typeof getNwsForecast>>["hourly"],
  now: Date,
): OpportunityWindow | null {
  if (nwsHourly.length < 2) return null;

  const events = conditions.tide?.events ?? [];
  const recentNeF = recentNeFactor(
    conditions.recentNeFraction,
    conditions.wind,
  ).factor;

  const scored = nwsHourly
    .map((h) => {
      const when = new Date(h.time);
      return {
        when,
        score: hourlyScore({
          when,
          wind: h.wind,
          stage: events.length ? stageAt(events, when.getTime()) : "unknown",
          recentNeF,
        }),
      };
    })
    .filter((h) => h.when.getTime() > now.getTime());

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

async function persistCache(beachId: string, score: number, payload: unknown) {
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
): Promise<BeachConditions> {
  const now = new Date();
  const sightings = allSightings ?? (await getRecentSightings(100));
  const nws = await getNwsForecast(beach.lat, beach.lon);
  const [tide, buoy] = await Promise.all([
    getTides(beach.tide_station),
    getBuoy(beach.buoy_station),
  ]);

  const sources: string[] = [];
  if (nws.hourly.length) sources.push("NWS");
  if (tide) sources.push("NOAA CO-OPS");
  if (buoy) sources.push(`NDBC ${beach.buoy_station}`);

  const conditions: Conditions = {
    wind: buoy?.wind ?? nws.current?.wind,
    airTempF: nws.current?.airTempF,
    waterTempF: buoy?.waterTempF,
    waveHeightFt: buoy?.waveHeightFt,
    tide,
    recentNeFraction: buoy?.recentNeFraction,
    sources,
    observedAt: now.toISOString(),
  };

  // Score is computed from public sources only — sightings are not a factor.
  const score = computeScore({ conditions, now });
  const nextWindow = computeNextWindow(conditions, nws.hourly, now);
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

  await persistCache(beach.id, score.score, {
    conditions,
    score,
    nextWindow,
  });

  return result;
}

/** Lightweight summaries for the map and beach selector (parallel fetch). */
export async function computeAllSummaries(): Promise<BeachSummary[]> {
  const beaches = await getBeaches();

  const summaries = await Promise.all(
    beaches.map(async (beach) => {
      const [nws, tide, buoy] = await Promise.all([
        getNwsForecast(beach.lat, beach.lon),
        getTides(beach.tide_station),
        getBuoy(beach.buoy_station),
      ]);
      const conditions: Conditions = {
        wind: buoy?.wind ?? nws.current?.wind,
        airTempF: nws.current?.airTempF,
        waterTempF: buoy?.waterTempF,
        waveHeightFt: buoy?.waveHeightFt,
        tide,
        recentNeFraction: buoy?.recentNeFraction,
        sources: [],
        observedAt: new Date().toISOString(),
      };
      const score = computeScore({ conditions });
      const summary: BeachSummary = {
        beach,
        score: score.score,
        rating: score.rating,
        summary: score.summary,
        wind: conditions.wind,
        waterTempF: conditions.waterTempF,
      };
      return summary;
    }),
  );

  return summaries.sort((a, b) => b.score - a.score);
}

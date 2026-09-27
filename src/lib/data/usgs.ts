import type { RiverState } from "@/lib/types";
import { safeFetchJson } from "./http";

/**
 * USGS river gauges via the Water Data OGC API (api.waterdata.usgs.gov), which
 * replaces the legacy NWIS waterservices endpoints. Free, no key required for
 * this volume.
 *
 * Returns a "flush" picture for the river that feeds a pass: how today's flow
 * compares to the previous two weeks, and (at tidal gauges) whether the water
 * is freshening. Daily means smooth out tidal reversals at coastal gauges.
 */
const BASE = "https://api.waterdata.usgs.gov/ogcapi/v1/collections/continuous/items";
const DAY_MS = 86400000;

interface Feature {
  properties: { time: string; value: string | null };
}
interface FeatureCollection {
  features?: Feature[];
}

const RIVER_LABEL: Record<string, string> = {
  "02376033": "Escambia River",
  "02366500": "Choctawhatchee River",
  "02358700": "Apalachicola River",
  "02326900": "St. Marks River",
  "02324170": "Steinhatchee River",
  "02323500": "Suwannee River",
  "02310750": "Crystal River",
  "02310700": "Homosassa River",
  "02296750": "Peace River",
};

async function series(
  site: string,
  parameter: "00060" | "00095",
  period: string,
): Promise<{ t: number; v: number }[]> {
  const url =
    `${BASE}?f=json&monitoring_location_id=USGS-${site}` +
    `&parameter_code=${parameter}&time=${period}&limit=5000&properties=time,value`;
  const data = await safeFetchJson<FeatureCollection>(url, {
    revalidate: 3600,
    timeoutMs: 12000,
  });
  return (data?.features ?? [])
    .map((f) => ({
      t: new Date(f.properties.time).getTime(),
      v: f.properties.value == null ? NaN : Number(f.properties.value),
    }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v))
    .sort((a, b) => a.t - b.t);
}

function mean(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Daily means ending at the latest reading (day 0 = the most recent 24h). */
function dailyMeans(points: { t: number; v: number }[]): number[] {
  if (points.length === 0) return [];
  const end = points[points.length - 1].t;
  const buckets = new Map<number, number[]>();
  for (const p of points) {
    const day = Math.floor((end - p.t) / DAY_MS);
    const list = buckets.get(day) ?? [];
    list.push(p.v);
    buckets.set(day, list);
  }
  const out: number[] = [];
  for (let d = 0; d < 15; d++) {
    const m = mean(buckets.get(d) ?? []);
    if (m != null) out[d] = m;
  }
  return out;
}

export async function getRiver(
  site: string | null,
): Promise<RiverState | undefined> {
  if (!site) return undefined;

  const [flow, cond] = await Promise.all([
    series(site, "00060", "P15D"),
    series(site, "00095", "P3D"),
  ]);

  const state: RiverState = { site, label: RIVER_LABEL[site] ?? `USGS ${site}` };

  const days = dailyMeans(flow);
  if (days[0] != null && days[0] > 0) {
    state.dischargeCfs = Math.round(days[0]);
    const prior = days.slice(1).filter((v) => v != null);
    const base = median(prior);
    // Tidal gauges can average out near zero or negative (net upstream flow);
    // a ratio against that is meaningless, so only compare positive flows.
    if (base != null && base > 1 && days[0] > 0) {
      state.dischargeRatio = Math.round((days[0] / base) * 100) / 100;
    }
  }

  if (cond.length > 0) {
    const latest = cond[cond.length - 1];
    state.conductance = Math.round(latest.v);
    // Coastal gauges swing with every tide, so compare 24-hour means rather
    // than two instantaneous readings.
    const last = mean(cond.filter((p) => p.t > latest.t - DAY_MS).map((p) => p.v));
    const prior = mean(
      cond
        .filter((p) => p.t <= latest.t - DAY_MS && p.t > latest.t - 2 * DAY_MS)
        .map((p) => p.v),
    );
    if (last != null && prior != null && prior > 0) {
      state.conductanceChange = Math.round(((last - prior) / prior) * 100) / 100;
    }
  }

  if (state.dischargeCfs == null && state.conductance == null) return undefined;
  return state;
}

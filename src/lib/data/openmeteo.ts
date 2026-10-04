import type { HourlyForecast, WindObservation } from "@/lib/types";
import { easterlyDirectionWeight } from "@/lib/wind";
import { isNortherlyDirection } from "./ndbc";
import { degreesToCompass, safeFetchJson } from "./http";

/**
 * Open-Meteo fallback (free, no API key, serverless-friendly).
 *
 * Used to guarantee wind/temp coverage when api.weather.gov is unreachable
 * (its Akamai edge blocks some datacenter egress, e.g. Vercel's serverless
 * IPs). Returns knots + Fahrenheit + meteorological degrees directly.
 */

interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m?: number[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
    pressure_msl?: number[];
  };
}

export interface OpenMeteoResult {
  current?: { wind?: WindObservation; airTempF?: number };
  hourly: HourlyForecast[];
  /** Fraction of the last ~18 hours blowing from NE through E. */
  recentEasterlyFraction?: number;
  /** Fraction of the last ~12 hours with a NW–NE breeze. */
  recentNortherlyFraction?: number;
  /** Modeled sea-level pressure now (hPa). */
  pressureHpa?: number;
  /** Largest modeled 24h pressure fall over the last ~48h (hPa). */
  pressureDrop24hHpa?: number;
  /** Hourly pressure for the past 48h and next 48h, used to spot fronts. */
  pressureSeries: { t: number; hpa: number }[];
}

function toWind(
  speedKn?: number,
  dirDeg?: number,
  gustKn?: number,
): WindObservation | undefined {
  if (speedKn == null || dirDeg == null) return undefined;
  return {
    directionDeg: dirDeg,
    directionLabel: degreesToCompass(dirDeg),
    speedKt: Math.round(speedKn),
    gustKt: gustKn != null ? Math.round(gustKn) : undefined,
  };
}

/** Parse Open-Meteo UTC timestamps ("YYYY-MM-DDTHH:MM") into an ISO instant. */
function parseUtc(t: string): string {
  return new Date(t + ":00Z").toISOString();
}

export async function getOpenMeteo(
  lat: number,
  lon: number,
): Promise<OpenMeteoResult> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
    `&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,pressure_msl` +
    `&past_hours=48&forecast_hours=48` +
    `&wind_speed_unit=kn&temperature_unit=fahrenheit&timezone=UTC`;

  const data = await safeFetchJson<OpenMeteoResponse>(url, { revalidate: 900 });
  if (!data) return { hourly: [], pressureSeries: [] };

  const current = data.current
    ? {
        wind: toWind(
          data.current.wind_speed_10m,
          data.current.wind_direction_10m,
          data.current.wind_gusts_10m,
        ),
        airTempF: data.current.temperature_2m,
      }
    : undefined;

  const h = data.hourly;
  const hourly: HourlyForecast[] = [];
  const nowMs = Date.now();
  let easterlyCredit = 0;
  let validCount = 0;
  let northCount = 0;
  let northValid = 0;
  const pressureSeries: { t: number; hpa: number }[] = [];

  if (h?.time) {
    for (let i = 0; i < h.time.length; i++) {
      const t = new Date(h.time[i] + ":00Z").getTime();
      const dir = h.wind_direction_10m?.[i];
      const spd = h.wind_speed_10m?.[i];
      const temp = h.temperature_2m?.[i];
      const pres = h.pressure_msl?.[i];
      if (pres != null) pressureSeries.push({ t, hpa: pres });

      if (t <= nowMs) {
        if (dir != null && spd != null && t >= nowMs - 12 * 3600 * 1000) {
          northValid += 1;
          if (isNortherlyDirection(dir) && spd >= 6) northCount += 1;
        }
        // Past hour → contributes to the recent NE-through-E pattern.
        if (dir != null && spd != null && t >= nowMs - 18 * 3600 * 1000) {
          validCount += 1;
          if (spd >= 4) easterlyCredit += easterlyDirectionWeight(dir);
        }
      } else {
        // Future hour → next-window forecast.
        hourly.push({
          time: parseUtc(h.time[i]),
          wind: toWind(spd ?? undefined, dir ?? undefined),
          airTempF: temp ?? undefined,
          pressureHpa: pres ?? undefined,
        });
      }
    }
  }

  const past = pressureSeries.filter((p) => p.t <= nowMs);
  const latest = past[past.length - 1];

  return {
    current,
    hourly,
    recentEasterlyFraction:
      validCount > 0 ? easterlyCredit / validCount : undefined,
    recentNortherlyFraction:
      northValid > 0 ? northCount / northValid : undefined,
    pressureHpa: latest?.hpa,
    pressureDrop24hHpa: latest
      ? maxPressureDrop(pressureSeries, latest.t, 48)
      : undefined,
    pressureSeries,
  };
}

/**
 * Largest 24h pressure fall in the `lookbackHours` ending at `endMs`, from an
 * hourly series. Used for both "now" and forecast hours (a front on the way).
 */
export function maxPressureDrop(
  series: { t: number; hpa: number }[],
  endMs: number,
  lookbackHours: number,
): number | undefined {
  const byHour = new Map(series.map((p) => [Math.round(p.t / 3600000), p.hpa]));
  const endH = Math.round(endMs / 3600000);
  let largest: number | undefined;
  for (let h = endH - lookbackHours + 24; h <= endH; h++) {
    const after = byHour.get(h);
    const before = byHour.get(h - 24);
    if (after == null || before == null) continue;
    const drop = before - after;
    if (largest == null || drop > largest) largest = drop;
  }
  return largest == null ? undefined : Math.round(largest * 10) / 10;
}

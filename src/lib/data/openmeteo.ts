import type { HourlyForecast, WindObservation } from "@/lib/types";
import { isFavorableEasterlyDirection } from "@/lib/wind";
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
  };
}

export interface OpenMeteoResult {
  current?: { wind?: WindObservation; airTempF?: number };
  hourly: HourlyForecast[];
  /** Fraction of the last ~18 hours blowing from NE through E. */
  recentEasterlyFraction?: number;
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
    `&hourly=temperature_2m,wind_speed_10m,wind_direction_10m` +
    `&past_hours=18&forecast_hours=48` +
    `&wind_speed_unit=kn&temperature_unit=fahrenheit&timezone=UTC`;

  const data = await safeFetchJson<OpenMeteoResponse>(url, { revalidate: 900 });
  if (!data) return { hourly: [] };

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
  let easterlyCount = 0;
  let validCount = 0;

  if (h?.time) {
    for (let i = 0; i < h.time.length; i++) {
      const t = new Date(h.time[i] + ":00Z").getTime();
      const dir = h.wind_direction_10m?.[i];
      const spd = h.wind_speed_10m?.[i];
      const temp = h.temperature_2m?.[i];

      if (t <= nowMs) {
        // Past hour → contributes to the recent NE-through-E pattern.
        if (dir != null && spd != null) {
          validCount += 1;
          if (isFavorableEasterlyDirection(dir) && spd >= 4) {
            easterlyCount += 1;
          }
        }
      } else {
        // Future hour → next-window forecast.
        hourly.push({
          time: parseUtc(h.time[i]),
          wind: toWind(spd ?? undefined, dir ?? undefined),
          airTempF: temp ?? undefined,
        });
      }
    }
  }

  return {
    current,
    hourly,
    recentEasterlyFraction:
      validCount > 0 ? easterlyCount / validCount : undefined,
  };
}

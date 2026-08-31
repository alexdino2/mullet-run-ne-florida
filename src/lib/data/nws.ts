import type { HourlyForecast, WindObservation } from "@/lib/types";
import {
  MPH_TO_KT,
  compassToDegrees,
  degreesToCompass,
  safeFetchJson,
} from "./http";

const UA =
  process.env.NWS_USER_AGENT ?? "(mullet-watch-nefl, contact@example.com)";

interface PointsResponse {
  properties?: { forecastHourly?: string };
}

interface HourlyResponse {
  properties?: {
    periods?: Array<{
      startTime: string;
      temperature: number;
      temperatureUnit: string;
      windSpeed: string; // e.g. "10 mph" or "5 to 10 mph"
      windDirection: string; // compass label
    }>;
  };
}

function parseWindSpeedMph(raw: string): number | null {
  // Handles "10 mph" and "5 to 10 mph" (uses the upper bound).
  const nums = raw.match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  return Number(nums[nums.length - 1]);
}

function toWind(speedRaw: string, dirRaw: string): WindObservation | undefined {
  const mph = parseWindSpeedMph(speedRaw);
  const deg = compassToDegrees(dirRaw);
  if (mph == null || deg == null) return undefined;
  return {
    directionDeg: deg,
    directionLabel: degreesToCompass(deg),
    speedKt: Math.round(mph * MPH_TO_KT),
  };
}

export interface NwsResult {
  current?: { wind?: WindObservation; airTempF?: number };
  hourly: HourlyForecast[];
}

/**
 * Fetch the NWS hourly forecast for a coordinate. Uses api.weather.gov's
 * two-step points -> forecastHourly flow. Returns an empty hourly list on any
 * failure so callers can proceed with the data they do have.
 */
export async function getNwsForecast(
  lat: number,
  lon: number,
): Promise<NwsResult> {
  const headers = { "User-Agent": UA };
  const point = await safeFetchJson<PointsResponse>(
    `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
    { headers, revalidate: 86400 },
  );
  const hourlyUrl = point?.properties?.forecastHourly;
  if (!hourlyUrl) return { hourly: [] };

  const data = await safeFetchJson<HourlyResponse>(hourlyUrl, {
    headers,
    revalidate: 900,
  });
  const periods = data?.properties?.periods ?? [];
  if (periods.length === 0) return { hourly: [] };

  const hourly: HourlyForecast[] = periods.slice(0, 48).map((p) => ({
    time: p.startTime,
    wind: toWind(p.windSpeed, p.windDirection),
    airTempF:
      p.temperatureUnit === "F" ? p.temperature : (p.temperature * 9) / 5 + 32,
  }));

  return {
    current: { wind: hourly[0]?.wind, airTempF: hourly[0]?.airTempF },
    hourly,
  };
}

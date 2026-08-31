export interface FetchOpts {
  timeoutMs?: number;
  headers?: Record<string, string>;
  /** Next.js revalidation window in seconds for the fetch cache. */
  revalidate?: number;
}

/**
 * fetch wrapper with a hard timeout. Never throws for network/HTTP issues —
 * returns null so upstream data pipelines can degrade gracefully.
 */
export async function safeFetchText(
  url: string,
  opts: FetchOpts = {},
): Promise<string | null> {
  const { timeoutMs = 8000, headers = {}, revalidate = 900 } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers,
      signal: controller.signal,
      next: { revalidate },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function safeFetchJson<T = unknown>(
  url: string,
  opts: FetchOpts = {},
): Promise<T | null> {
  const text = await safeFetchText(url, {
    ...opts,
    headers: { Accept: "application/json", ...(opts.headers ?? {}) },
  });
  if (text == null) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Compass label -> meteorological degrees (direction wind comes FROM). */
export function compassToDegrees(dir: string): number | null {
  const map: Record<string, number> = {
    N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
    E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
    S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
    W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
  };
  const key = dir.trim().toUpperCase();
  return key in map ? map[key] : null;
}

export function degreesToCompass(deg: number): string {
  const dirs = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  const idx = Math.round(((deg % 360) / 22.5)) % 16;
  return dirs[idx];
}

export const MPH_TO_KT = 0.868976;
export const MPS_TO_KT = 1.943844;
export const M_TO_FT = 3.28084;
export const cToF = (c: number) => (c * 9) / 5 + 32;

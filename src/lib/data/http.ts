export interface FetchOpts {
  timeoutMs?: number;
  headers?: Record<string, string>;
  /** Next.js revalidation window in seconds for the fetch cache. */
  revalidate?: number;
}

/**
 * Short-lived in-process memo so a refresh run that scores 30+ stations does
 * not re-download the same buoy or tide feed for every station that shares it.
 * (Next.js dedupes via its fetch cache on Vercel; the Railway worker has none.)
 */
const MEMO_TTL_MS = 10 * 60 * 1000;
const memo = new Map<string, { at: number; value: Promise<string | null> }>();

/**
 * fetch wrapper with a hard timeout. Never throws for network/HTTP issues —
 * returns null so upstream data pipelines can degrade gracefully.
 */
export async function safeFetchText(
  url: string,
  opts: FetchOpts = {},
): Promise<string | null> {
  const { revalidate = 900 } = opts;
  if (revalidate > 0) {
    const key = `${url}|${JSON.stringify(opts.headers ?? {})}`;
    const hit = memo.get(key);
    const now = Date.now();
    if (hit && now - hit.at < Math.min(MEMO_TTL_MS, revalidate * 1000)) {
      return hit.value;
    }
    const value = fetchText(url, opts);
    memo.set(key, { at: now, value });
    if (memo.size > 500) memo.delete(memo.keys().next().value as string);
    return value;
  }
  return fetchText(url, opts);
}

async function fetchText(
  url: string,
  opts: FetchOpts,
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

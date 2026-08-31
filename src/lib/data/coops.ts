import type { TideEvent, TideStage, TideState } from "@/lib/types";
import { safeFetchJson } from "./http";

interface CoopsPredictions {
  predictions?: Array<{ t: string; v: string; type: "H" | "L" }>;
  error?: { message: string };
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/** Parse CO-OPS GMT timestamps ("YYYY-MM-DD HH:MM") into a Date. */
function parseGmt(t: string): Date {
  return new Date(t.replace(" ", "T") + ":00Z");
}

/**
 * Derive the tide stage at an arbitrary moment from a list of high/low events.
 * Within 40 minutes of an extreme is treated as slack ("high"/"low").
 */
export function stageAt(events: TideEvent[], whenMs: number): TideStage {
  let prev: TideEvent | undefined;
  let next: TideEvent | undefined;
  for (const e of events) {
    const ms = new Date(e.time).getTime();
    if (ms <= whenMs) prev = e;
    else {
      next = e;
      break;
    }
  }
  if (!next) return "unknown";

  const minsToNext = (new Date(next.time).getTime() - whenMs) / 60000;
  const minsFromPrev = prev
    ? (whenMs - new Date(prev.time).getTime()) / 60000
    : Infinity;

  if (minsToNext <= 40 || minsFromPrev <= 40) {
    const atHigh =
      (minsToNext <= 40 && next.type === "H") ||
      (minsFromPrev <= 40 && prev?.type === "H");
    return atHigh ? "high" : "low";
  }
  return next.type === "H" ? "rising" : "falling";
}

/**
 * Fetch high/low tide predictions and derive the current tide stage and the
 * next event. Requests a window of yesterday..+2 days so we always have events
 * bracketing "now" and enough lookahead for the next-window forecast.
 */
export async function getTides(
  station: string | null,
): Promise<TideState | undefined> {
  if (!station) return undefined;

  const now = new Date();
  const start = new Date(now.getTime() - 24 * 3600 * 1000);
  const end = new Date(now.getTime() + 48 * 3600 * 1000);

  const url =
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` +
    `?product=predictions&application=mullet-watch-nefl` +
    `&begin_date=${ymd(start)}&end_date=${ymd(end)}` +
    `&datum=MLLW&station=${station}&time_zone=gmt&units=english` +
    `&interval=hilo&format=json`;

  const data = await safeFetchJson<CoopsPredictions>(url, { revalidate: 3600 });
  const raw = data?.predictions;
  if (!raw || raw.length === 0) return undefined;

  const events: TideEvent[] = raw.map((p) => ({
    time: parseGmt(p.t).toISOString(),
    type: p.type,
    heightFt: Number(p.v),
  }));

  const nowMs = now.getTime();
  const next = events.find((e) => new Date(e.time).getTime() > nowMs);

  return { stage: stageAt(events, nowMs), nextEvent: next, events };
}

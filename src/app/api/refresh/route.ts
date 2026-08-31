import { NextResponse } from "next/server";
import { getBeaches } from "@/lib/beaches";
import { computeBeachConditions } from "@/lib/conditions";
import { getRecentSightings } from "@/lib/sightings";
import { getServerSupabase } from "@/lib/supabase/server";
import type { AlertRule, BeachConditions } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron-ready refresh endpoint.
 *
 * Vercel Cron (see vercel.json) calls this hourly. When CRON_SECRET is set the
 * caller must present `Authorization: Bearer <CRON_SECRET>` — Vercel Cron sends
 * this automatically. It recomputes and caches conditions for every beach and
 * evaluates the alert rules, returning which rules WOULD fire. Actually sending
 * notifications is intentionally left for a future paid channel (email/SMS/push).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const [beaches, sightings] = await Promise.all([
    getBeaches(),
    getRecentSightings(100),
  ]);

  const results: BeachConditions[] = [];
  for (const beach of beaches) {
    try {
      results.push(await computeBeachConditions(beach, sightings));
    } catch {
      // Skip a failing beach rather than failing the whole refresh.
    }
  }

  const rules = await loadAlertRules();
  const triggered = evaluateAlerts(rules, results);

  return NextResponse.json({
    refreshedAt: new Date().toISOString(),
    beaches: results.map((r) => ({
      id: r.beach.id,
      name: r.beach.name,
      score: r.score.score,
      rating: r.score.rating,
      wind: r.conditions.wind ?? null,
    })),
    triggeredAlerts: triggered,
    note: "Notifications are not sent yet — wire a channel to act on triggeredAlerts.",
  });
}

async function loadAlertRules(): Promise<AlertRule[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("mw_alert_rules")
    .select("*")
    .eq("enabled", true);
  return (data as AlertRule[]) ?? [];
}

function evaluateAlerts(rules: AlertRule[], results: BeachConditions[]) {
  const triggered: Array<{ rule: string; beach: string; score: number }> = [];
  for (const rule of rules) {
    for (const r of results) {
      if (rule.beach_id && rule.beach_id !== r.beach.id) continue;
      if (r.score.score < rule.min_score) continue;
      const wind = r.conditions.wind;
      if (rule.wind_dir_min != null && rule.wind_dir_max != null) {
        if (!wind) continue;
        const d = wind.directionDeg;
        if (d < rule.wind_dir_min || d > rule.wind_dir_max) continue;
      }
      if (rule.max_wind_kt != null && wind && wind.speedKt > rule.max_wind_kt) {
        continue;
      }
      triggered.push({
        rule: rule.name,
        beach: r.beach.name,
        score: r.score.score,
      });
    }
  }
  return triggered;
}

import { getBeaches } from "@/lib/beaches";
import { computeBeachConditions } from "@/lib/conditions";
import { getRecentSightings } from "@/lib/sightings";
import { getAlertRules } from "@/lib/alerts";
import { evaluateAlerts, type AlertMatch } from "@/lib/alert-eval";
import { alertEmail } from "@/lib/email/templates";
import { alertRecipients, emailConfigured, sendEmail } from "@/lib/email/resend";
import { getServerSupabase, hasServiceRole } from "@/lib/supabase/server";
import type { BeachConditions } from "@/lib/types";
import { jobLog, mapLimit } from "./log";

const JOB = "refresh";

export interface RefreshReport {
  stations: number;
  scored: number;
  failed: string[];
  featureRowsWritten: number;
  alertsMatched: number;
  alertsSent: number;
  alertErrors: string[];
}

/** Start of the current UTC hour — the feature log's idempotency key. */
function hourKey(d: Date): string {
  const h = new Date(d);
  h.setUTCMinutes(0, 0, 0);
  return h.toISOString();
}

/** One row per station per hour: inputs + score, the training set for a model. */
function featureRow(r: BeachConditions, observedHour: string) {
  const c = r.conditions;
  return {
    beach_id: r.beach.id,
    observed_hour: observedHour,
    coast: r.beach.coast,
    model: r.score.model ?? null,
    score: r.score.score,
    rating: r.score.rating,
    features: {
      wind_dir_deg: c.wind?.directionDeg ?? null,
      wind_kt: c.wind?.speedKt ?? null,
      gust_kt: c.wind?.gustKt ?? null,
      air_temp_f: c.airTempF ?? null,
      water_temp_f: c.waterTempF ?? null,
      water_temp_change_48h_f: c.waterTempChange48hF ?? null,
      wave_ft: c.waveHeightFt ?? null,
      pressure_hpa: c.pressureHpa ?? null,
      pressure_drop_24h_hpa: c.pressureDrop24hHpa ?? null,
      recent_easterly_fraction: c.recentEasterlyFraction ?? null,
      recent_northerly_fraction: c.recentNortherlyFraction ?? null,
      tide_stage: c.tide?.stage ?? null,
      tide_range_ratio: c.tide?.rangeRatio ?? null,
      moon_phase: c.moon?.phase ?? null,
      moon_days_from_syzygy: c.moon?.daysFromSyzygy ?? null,
      river_discharge_cfs: c.river?.dischargeCfs ?? null,
      river_discharge_ratio: c.river?.dischargeRatio ?? null,
      river_conductance: c.river?.conductance ?? null,
      river_conductance_change: c.river?.conductanceChange ?? null,
      components: Object.fromEntries(
        r.score.components.map((x) => [x.key, Math.round(x.factor * 1000) / 1000]),
      ),
      sources: c.sources,
    },
  };
}

/** Send each matching rule at most once per station per Eastern calendar day. */
async function deliverAlerts(matches: AlertMatch[]): Promise<{ sent: number; errors: string[] }> {
  const errors: string[] = [];
  const emailMatches = matches.filter((m) => m.rule.channel === "email");
  for (const m of matches) {
    if (m.rule.channel === "sms" || m.rule.channel === "push") {
      jobLog(JOB, "alert_channel_unsupported", { rule: m.rule.name, channel: m.rule.channel });
    }
  }
  if (emailMatches.length === 0) return { sent: 0, errors };

  const recipients = alertRecipients();
  if (!emailConfigured() || recipients.length === 0) {
    jobLog(JOB, "alert_email_skipped", { reason: "RESEND_API_KEY / ALERT_EMAIL_FROM / ALERT_EMAIL_TO not set", matches: emailMatches.length });
    return { sent: 0, errors };
  }

  const supabase = getServerSupabase();
  if (!supabase || !hasServiceRole()) {
    errors.push("Alert dedupe needs SUPABASE_SERVICE_ROLE_KEY; not sending to avoid repeats.");
    return { sent: 0, errors };
  }

  const windowKey = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  // Claim each (rule, station, day) first; a conflict means it was already sent.
  const fresh: AlertMatch[] = [];
  for (const m of emailMatches) {
    const { data, error } = await supabase
      .from("mw_alert_log")
      .upsert(
        {
          rule_id: m.rule.id,
          beach_id: m.result.beach.id,
          window_key: windowKey,
          score: m.result.score.score,
          status: "pending",
        },
        { onConflict: "rule_id,beach_id,window_key", ignoreDuplicates: true },
      )
      .select("id");
    if (error) {
      errors.push(`alert log: ${error.message}`);
      continue;
    }
    if (data && data.length > 0) fresh.push(m);
  }
  if (fresh.length === 0) return { sent: 0, errors };

  const email = alertEmail(
    fresh.map((m) => ({
      ruleName: m.rule.name,
      beach: m.result.beach,
      score: m.result.score,
      peakWindow: m.result.nextWindow,
    })),
  );
  const res = await sendEmail({ to: recipients, ...email });
  const status = res.ok ? "sent" : "failed";
  for (const m of fresh) {
    await supabase
      .from("mw_alert_log")
      .update({ status, sent_at: new Date().toISOString(), provider_id: res.ok ? res.id : null })
      .eq("rule_id", m.rule.id)
      .eq("beach_id", m.result.beach.id)
      .eq("window_key", windowKey);
  }
  if (!res.ok) {
    // Release the claims so the next hourly run retries delivery.
    for (const m of fresh) {
      await supabase
        .from("mw_alert_log")
        .delete()
        .eq("rule_id", m.rule.id)
        .eq("beach_id", m.result.beach.id)
        .eq("window_key", windowKey)
        .eq("status", "failed");
    }
    errors.push(`Resend: ${res.error}`);
    return { sent: 0, errors };
  }
  jobLog(JOB, "alert_email_sent", { id: res.id, alerts: fresh.length, recipients: recipients.length });
  return { sent: fresh.length, errors };
}

/**
 * Hourly refresh: score every station on both coasts, write the conditions
 * cache and the feature log, then evaluate and deliver alerts. Safe to re-run:
 * the cache is an upsert, the feature log is keyed by (station, hour), and
 * alerts are claimed once per rule, station, and day.
 */
export async function runRefresh(): Promise<RefreshReport> {
  const started = new Date();
  const observedHour = hourKey(started);
  const [beaches, sightings, rules] = await Promise.all([
    getBeaches(),
    getRecentSightings(100),
    getAlertRules(),
  ]);
  jobLog(JOB, "start", { stations: beaches.length, rules: rules.length, observedHour });

  const failed: string[] = [];
  const results = (
    await mapLimit(beaches, 4, async (beach) => {
      const t0 = Date.now();
      try {
        const r = await computeBeachConditions(beach, sightings);
        jobLog(JOB, "station_scored", {
          station: beach.id,
          coast: beach.coast,
          score: r.score.score,
          sources: r.conditions.sources.length,
          ms: Date.now() - t0,
        });
        return r;
      } catch (err) {
        failed.push(beach.id);
        jobLog(JOB, "station_failed", { station: beach.id, error: (err as Error).message });
        return null;
      }
    })
  ).filter((r): r is BeachConditions => r !== null);

  let featureRowsWritten = 0;
  const supabase = getServerSupabase();
  if (supabase && hasServiceRole() && results.length) {
    const { error } = await supabase
      .from("mw_feature_log")
      .upsert(results.map((r) => featureRow(r, observedHour)), {
        onConflict: "beach_id,observed_hour",
      });
    if (error) {
      jobLog(JOB, "feature_log_failed", { error: error.message });
    } else {
      featureRowsWritten = results.length;
    }
  } else {
    jobLog(JOB, "feature_log_skipped", { reason: "no service role key" });
  }

  const matches = evaluateAlerts(rules, results);
  const delivery = await deliverAlerts(matches);

  const report: RefreshReport = {
    stations: beaches.length,
    scored: results.length,
    failed,
    featureRowsWritten,
    alertsMatched: matches.length,
    alertsSent: delivery.sent,
    alertErrors: delivery.errors,
  };
  jobLog(JOB, "done", { ...report, ms: Date.now() - started.getTime() });
  return report;
}

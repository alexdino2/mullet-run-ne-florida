/**
 * Railway job runner. Each Railway cron service runs one job and exits
 * (service settings are documented in the README):
 *
 *   npx tsx worker/run.ts refresh          # hourly: scores, cache, feature log, alerts
 *   npx tsx worker/run.ts sighting-checks  # daily: public news scan
 *   npx tsx worker/run.ts instagram-hashtags  # hourly: queue #mulletrun posts for review
 *   npx tsx worker/run.ts probe [ids]      # score stations and print; writes nothing
 *
 * Shares src/lib with the Vercel app (types, scoring, email templates,
 * Supabase client). On failure it logs, emails ALERT_EMAIL_TO through Resend,
 * and exits non-zero so Railway marks the run failed. Every job is safe to
 * re-run.
 */
import { runRefresh } from "@/lib/jobs/refresh";
import { runSightingChecks } from "@/lib/jobs/sighting-checks";
import { runInstagramHashtags } from "@/lib/jobs/instagram-hashtags";
import { GraphApiError } from "@/lib/instagram-graph";
import { jobLog } from "@/lib/jobs/log";
import { jobFailureEmail } from "@/lib/email/templates";
import { alertRecipients, emailConfigured, sendEmail } from "@/lib/email/resend";
import { STATIONS } from "@/lib/beaches";
import { computeBeachConditions } from "@/lib/conditions";

async function notifyFailure(job: string, startedAt: string, error: string, details: string[] = []) {
  const to = alertRecipients();
  if (!emailConfigured() || to.length === 0) {
    jobLog(job, "failure_email_skipped", { reason: "Resend env not set" });
    return;
  }
  const res = await sendEmail({ to, ...jobFailureEmail({ job, error, details, startedAt }) });
  jobLog(job, res.ok ? "failure_email_sent" : "failure_email_failed", res.ok ? { id: res.id } : { error: res.error });
}

async function probe(ids: string[]) {
  const list = ids.length ? STATIONS.filter((s) => ids.includes(s.id)) : STATIONS;
  for (const b of list) {
    const r = await computeBeachConditions(b, [], { persist: false });
    const c = r.conditions;
    jobLog("probe", "station", {
      station: b.id,
      coast: b.coast,
      model: r.score.model,
      score: r.score.score,
      summary: r.score.summary,
      parts: r.score.components.map((x) => `${x.key}:${x.points}/${x.weight}${x.available ? "" : "~"}`).join(" "),
      wind: c.wind ? `${c.wind.directionLabel} ${c.wind.speedKt}kt` : null,
      water: c.waterTempF,
      water48h: c.waterTempChange48hF,
      pressure: c.pressureHpa,
      drop24h: c.pressureDrop24hHpa,
      north: c.recentNortherlyFraction,
      tide: c.tide?.stage,
      range: c.tide?.rangeRatio,
      moon: c.moon ? `${c.moon.name} ${c.moon.daysFromSyzygy}d` : null,
      river: c.river ?? null,
      window: r.nextWindow,
      sources: c.sources,
    });
  }
}

async function main() {
  const [job, ...args] = process.argv.slice(2);
  const startedAt = new Date().toISOString();
  try {
    if (job === "refresh") {
      const report = await runRefresh();
      // Treat a mostly-failed run as a failure worth an email.
      if (report.scored < report.stations / 2) {
        await notifyFailure(job, startedAt, `Only ${report.scored}/${report.stations} stations scored`, report.failed);
        process.exitCode = 1;
      } else if (report.alertErrors.length) {
        await notifyFailure(job, startedAt, "Alert delivery had errors", report.alertErrors);
      }
    } else if (job === "sighting-checks") {
      const result = await runSightingChecks();
      if (!result.persisted) {
        await notifyFailure(job, startedAt, "Sighting checks ran but were not saved (service role key or table missing)");
        process.exitCode = 1;
      }
    } else if (job === "instagram-hashtags") {
      const report = await runInstagramHashtags();
      if (report.newPosts > 0 && report.aiErrors === report.newPosts) {
        await notifyFailure(
          job,
          startedAt,
          `The AI location step failed for all ${report.newPosts} new posts. They were still queued with caption-based locations; check ANTHROPIC_API_KEY and the job logs.`,
        );
      }
    } else if (job === "probe") {
      await probe(args.join(",").split(",").filter(Boolean));
    } else {
      console.error(`Unknown job "${job}". Use: refresh | sighting-checks | instagram-hashtags | probe [ids]`);
      process.exitCode = 2;
    }
  } catch (err) {
    const e = err as Error;
    jobLog(job ?? "unknown", "crashed", { error: e.message, stack: e.stack });
    const hint =
      err instanceof GraphApiError && err.isAuthError
        ? ["The Instagram token was rejected (expired or revoked). Generate a new one and update INSTAGRAM_GRAPH_TOKEN on Railway; re-running will not help until then."]
        : [];
    await notifyFailure(job ?? "unknown", startedAt, e.stack ?? e.message, hint);
    process.exitCode = 1;
  }
}

main();

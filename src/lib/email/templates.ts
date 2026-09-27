import { SITE_URL } from "@/lib/site";
import { COAST_LABEL } from "@/lib/regions";
import type { Beach, ScoreResult } from "@/lib/types";

/** Email templates, kept in code and shared by the web app and the jobs. */

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<div style="font-size:13px;font-weight:700;color:#0f5479;letter-spacing:.04em;text-transform:uppercase">🐟 Florida Mullet Run</div>
<h1 style="font-size:20px;line-height:1.3;margin:8px 0 16px">${escape(title)}</h1>
${bodyHtml}
<p style="margin-top:24px;font-size:12px;color:#64748b">Scores are heuristics from public NOAA, NWS and USGS data — not a guarantee. <a href="${SITE_URL}" style="color:#0f5479">floridamulletrun.com</a></p>
</div></body></html>`;
}

export interface TriggeredAlert {
  ruleName: string;
  beach: Beach;
  score: ScoreResult;
  peakWindow?: { start: string; end: string; peakScore: number } | null;
}

function fmtEt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function alertEmail(alerts: TriggeredAlert[]) {
  const top = [...alerts].sort((a, b) => b.score.score - a.score.score)[0];
  const subject =
    alerts.length === 1
      ? `${top.beach.name} is scoring ${top.score.score} — mullet run alert`
      : `${alerts.length} stations firing — ${top.beach.name} leads at ${top.score.score}`;

  const rows = alerts
    .map((a) => {
      const reasons = [...a.score.components]
        .sort((x, y) => y.points - x.points)
        .slice(0, 3)
        .map((c) => `<li>${escape(c.label)}: ${escape(c.reason)}</li>`)
        .join("");
      const window = a.peakWindow
        ? `<p style="margin:6px 0 0;font-size:13px;color:#334155">Next window: ${escape(fmtEt(a.peakWindow.start))} – ${escape(fmtEt(a.peakWindow.end))} (peaks ${a.peakWindow.peakScore})</p>`
        : "";
      return `<div style="background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:12px;border:1px solid #e2e8f0">
<div style="font-size:12px;color:#64748b">${escape(COAST_LABEL[a.beach.coast])} · ${escape(a.ruleName)}</div>
<div style="font-size:17px;font-weight:700;margin-top:2px"><a href="${SITE_URL}/?beach=${a.beach.id}" style="color:#0f172a;text-decoration:none">${escape(a.beach.name)}</a> — ${a.score.score}/100</div>
<p style="margin:6px 0 0;font-size:14px">${escape(a.score.summary)}</p>
<ul style="margin:8px 0 0;padding-left:18px;font-size:13px;color:#334155">${reasons}</ul>
${window}
</div>`;
    })
    .join("");

  const text = alerts
    .map(
      (a) =>
        `${a.beach.name} (${COAST_LABEL[a.beach.coast]}) — ${a.score.score}/100 — ${a.score.summary}\n${SITE_URL}/?beach=${a.beach.id}`,
    )
    .join("\n\n");

  return {
    subject,
    html: layout(subject, rows),
    text: `${text}\n\nScores are heuristics, not a guarantee.`,
  };
}

export function jobFailureEmail(params: {
  job: string;
  error: string;
  details?: string[];
  startedAt: string;
}) {
  const subject = `[mullet-run] ${params.job} job failed`;
  const details = (params.details ?? [])
    .map((d) => `<li>${escape(d)}</li>`)
    .join("");
  const html = layout(
    subject,
    `<p style="font-size:14px">The <b>${escape(params.job)}</b> job on Railway failed (started ${escape(params.startedAt)}).</p>
<pre style="white-space:pre-wrap;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;font-size:12px">${escape(params.error)}</pre>
${details ? `<ul style="font-size:13px">${details}</ul>` : ""}
<p style="font-size:13px">It is safe to re-run from the Railway dashboard. The site keeps serving live scores; only the hourly cache and alerts are affected.</p>`,
  );
  return {
    subject,
    html,
    text: `${params.job} failed (started ${params.startedAt}).\n${params.error}\n${(params.details ?? []).join("\n")}`,
  };
}

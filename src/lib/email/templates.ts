import { SITE_URL } from "@/lib/site";
import { COAST_LABEL } from "@/lib/regions";
import { getStation } from "@/lib/beaches";
import type { CharterLead } from "@/lib/charter-leads";
import type { Beach, InstagramCandidate, ScoreResult } from "@/lib/types";

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
<p style="font-size:13px">It is safe to re-run from the Railway dashboard. The site keeps serving live scores; only this job's output (cache, alerts, sighting checks, or the Instagram review queue) is delayed.</p>`,
  );
  return {
    subject,
    html,
    text: `${params.job} failed (started ${params.startedAt}).\n${params.error}\n${(params.details ?? []).join("\n")}`,
  };
}

/** Sent to the listings inbox for each captain request from /charters. */
export function charterLeadEmail(lead: CharterLead, region: string) {
  const rows: [string, string | null][] = [
    ["Region", region],
    ["Captain", lead.captain_name],
    ["Business", lead.business_name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Website / booking", lead.website],
    ["USCG license #", lead.uscg_license],
    ["Notes", lead.notes],
  ];
  const filled = rows.filter((row): row is [string, string] => !!row[1]);
  const footer =
    "Reply to this email to reach the captain. Verify the USCG license before listing.";

  const subject = `Charter listing request: ${lead.business_name ?? lead.captain_name} (${region})`;
  const table = `<table cellpadding="6" style="border-collapse:collapse;background:#fff;border-radius:12px;border:1px solid #e2e8f0;width:100%">
${filled
  .map(
    ([k, v]) =>
      `<tr><td style="color:#64748b;vertical-align:top;white-space:nowrap">${escape(k)}</td><td style="white-space:pre-wrap">${escape(v)}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="margin-top:16px;font-size:13px;color:#334155">${footer}</p>`;
  const text = [
    `New charter listing request from ${SITE_URL}/charters`,
    "",
    ...filled.map(([k, v]) => `${k}: ${v}`),
    "",
    footer,
  ].join("\n");

  return { subject, html: layout("New charter listing request", table), text };
}

/** Sent by the Instagram hashtag job when new posts are waiting for review. */
export function instagramReviewEmail(params: {
  posts: Pick<
    InstagramCandidate,
    "permalink" | "caption" | "location_name" | "location_confidence" | "beach_id" | "ai_is_report" | "ai_reason"
  >[];
  pending: number;
}) {
  const { posts, pending } = params;
  const reviewUrl = `${SITE_URL}/admin/instagram`;
  const subject = `${posts.length} new #mulletrun post${posts.length === 1 ? "" : "s"} to review`;

  const describe = (p: (typeof posts)[number]) => {
    const station = p.beach_id ? getStation(p.beach_id)?.name : null;
    const where = p.location_name
      ? `${p.location_name} (${p.location_confidence} confidence${station ? `, nearest station ${station}` : ""})`
      : "Location unknown";
    const flag = p.ai_is_report === false ? `Likely not a Florida sighting: ${p.ai_reason ?? ""}` : null;
    const caption = (p.caption ?? "").replace(/\s+/g, " ").slice(0, 160);
    return { where, flag, caption };
  };

  const rows = posts
    .slice(0, 20)
    .map((p) => {
      const d = describe(p);
      return `<div style="background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:10px;border:1px solid #e2e8f0">
<div style="font-size:14px;font-weight:700">${escape(d.where)}</div>
${d.flag ? `<div style="font-size:12px;color:#b45309;margin-top:2px">${escape(d.flag)}</div>` : ""}
<p style="margin:6px 0 0;font-size:13px;color:#334155">${escape(d.caption)}</p>
<a href="${escape(p.permalink)}" style="font-size:12px;color:#0f5479">View on Instagram</a>
</div>`;
    })
    .join("");
  const more = posts.length > 20 ? `<p style="font-size:13px">…and ${posts.length - 20} more.</p>` : "";
  const button = `<p style="margin:16px 0"><a href="${reviewUrl}" style="background:#0f5479;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Review ${pending} pending post${pending === 1 ? "" : "s"}</a></p>`;

  const text = [
    `${posts.length} new post${posts.length === 1 ? "" : "s"} tagged #mulletrun / #floridamulletrun. ${pending} pending in total.`,
    `Review: ${reviewUrl}`,
    "",
    ...posts.slice(0, 20).map((p) => {
      const d = describe(p);
      return [d.where, d.flag, d.caption, p.permalink].filter(Boolean).join("\n");
    }),
  ].join("\n\n");

  return { subject, html: layout(subject, button + rows + more), text };
}

/** One-time sign-in link for /admin, sent through Resend. */
export function adminSignInEmail(link: string) {
  const subject = "Your Florida Mullet Run admin sign-in link";
  const html = layout(
    "Sign in to review sightings",
    `<p style="font-size:14px">Use this link to sign in. It works once and expires in an hour.</p>
<p style="margin:16px 0"><a href="${escape(link)}" style="background:#0f5479;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Sign in</a></p>
<p style="font-size:12px;color:#64748b">If you didn't ask for this, ignore this email.</p>`,
  );
  return {
    subject,
    html,
    text: `Sign in to Florida Mullet Run admin (works once, expires in an hour):\n${link}\n\nIf you didn't ask for this, ignore this email.`,
  };
}

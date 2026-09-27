import type { CharterLead } from "@/lib/charter-leads";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Notification sent to the listings inbox for each new captain lead. */
export function renderCharterLeadEmail(
  lead: CharterLead,
  region: string,
): { subject: string; html: string; text: string } {
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

  const subject = `Charter listing request: ${lead.business_name ?? lead.captain_name} (${region})`;
  const text = [
    "New charter listing request from floridamulletrun.com/charters",
    "",
    ...filled.map(([k, v]) => `${k}: ${v}`),
    "",
    "Reply to this email to reach the captain. Verify the USCG license before listing.",
  ].join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#0f172a">
<h2 style="margin:0 0 12px;font-size:18px">New charter listing request</h2>
<table cellpadding="6" style="border-collapse:collapse">
${filled
  .map(
    ([k, v]) =>
      `<tr><td style="color:#64748b;vertical-align:top">${escapeHtml(k)}</td><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="margin-top:16px;color:#64748b">Reply to this email to reach the captain. Verify the USCG license before listing.</p>
</div>`;

  return { subject, html, text };
}

/**
 * Resend delivery. Templates live in `./templates.ts` and are shared by the
 * Vercel app and the Railway jobs. Uses the REST API directly (no SDK).
 */
export interface OutgoingEmail {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Where replies go, e.g. the captain who submitted a charter lead. */
  replyTo?: string;
}

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.ALERT_EMAIL_FROM;
}

export function alertRecipients(): string[] {
  return (process.env.ALERT_EMAIL_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function sendEmail(
  email: OutgoingEmail,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_EMAIL_FROM;
  if (!key || !from) {
    return { ok: false, error: "RESEND_API_KEY or ALERT_EMAIL_FROM is not set" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
    const body = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (!res.ok) return { ok: false, error: body.message ?? `HTTP ${res.status}` };
    return { ok: true, id: body.id ?? "" };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

import { CHARTER_REGIONS } from "@/lib/content/charters";
import { sendEmail } from "@/lib/email/resend";
import { charterLeadEmail } from "@/lib/email/templates";
import { monetization } from "@/lib/monetization";

/**
 * Captain listing requests from the /charters form.
 *
 * Every lead is stored in Supabase (`mw_charter_leads`). Two optional
 * integrations run alongside it when configured: a Resend email to the
 * listings inbox, and a HubSpot contact so the lead lands in the CRM.
 */

export interface CharterLead {
  region_id: string;
  captain_name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  uscg_license: string | null;
  notes: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v ? v.slice(0, max) : null;
}

/** Validate a raw request body. Returns the lead or a user-facing error. */
export function parseCharterLead(
  body: Record<string, unknown>,
): { lead: CharterLead } | { error: string } {
  const region_id = text(body.region_id, 64) ?? "";
  const captain_name = text(body.captain_name, 120);
  const email = text(body.email, 254);

  if (!CHARTER_REGIONS.some((r) => r.id === region_id)) {
    return { error: "Pick the region you fish." };
  }
  if (!captain_name) return { error: "Captain name is required." };
  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

  return {
    lead: {
      region_id,
      captain_name,
      business_name: text(body.business_name, 160),
      email,
      phone: text(body.phone, 40),
      website: text(body.website, 300),
      uscg_license: text(body.uscg_license, 60),
      notes: text(body.notes, 1000),
    },
  };
}

export function regionName(regionId: string): string {
  return CHARTER_REGIONS.find((r) => r.id === regionId)?.name ?? regionId;
}

const TIMEOUT_MS = 8_000;

/** Email the listings inbox via Resend. Returns false when unset or failed. */
export async function notifyCharterLead(lead: CharterLead): Promise<boolean> {
  const to =
    process.env.CHARTER_LEADS_NOTIFY_EMAIL?.trim() ||
    monetization.charterContactEmail;
  const result = await sendEmail({
    ...charterLeadEmail(lead, regionName(lead.region_id)),
    to,
    replyTo: lead.email,
  });
  if (!result.ok)
    console.error(`[charter-leads] email not sent: ${result.error}`);
  return result.ok;
}

/** Create the captain as a HubSpot contact. No-op when unset. */
export async function syncCharterLeadToHubSpot(
  lead: CharterLead,
): Promise<boolean> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN?.trim();
  if (!token) return false;

  const [firstname, ...rest] = lead.captain_name.split(/\s+/);
  const properties: Record<string, string> = {
    email: lead.email,
    firstname,
    lastname: rest.join(" "),
    lifecyclestage: "lead",
  };
  if (lead.business_name) properties.company = lead.business_name;
  if (lead.phone) properties.phone = lead.phone;
  if (lead.website) properties.website = lead.website;

  try {
    const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // 409 = contact already exists, which is fine for a repeat submission.
    if (!res.ok && res.status !== 409) {
      console.error(
        `[charter-leads] HubSpot failed: ${res.status} ${await res.text()}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[charter-leads] HubSpot error", err);
    return false;
  }
}

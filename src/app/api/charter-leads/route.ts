import { NextResponse } from "next/server";
import {
  notifyCharterLead,
  parseCharterLead,
  syncCharterLeadToHubSpot,
} from "@/lib/charter-leads";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (typeof body.nickname === "string" && body.nickname.trim()) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const parsed = parseCharterLead(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { lead } = parsed;

  // Insert without reading back: the public roles can write leads but not
  // read them, so `.select()` would fail when only the anon key is set.
  const supabase = getServerSupabase();
  let stored = false;
  if (supabase) {
    const { error } = await supabase.from("mw_charter_leads").insert(lead);
    if (error) console.error("[charter-leads] Supabase insert failed", error);
    stored = !error;
  }

  const [emailed] = await Promise.all([
    notifyCharterLead(lead),
    syncCharterLeadToHubSpot(lead),
  ]);

  if (!stored && !emailed) {
    return NextResponse.json(
      { error: "We couldn’t save your request." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

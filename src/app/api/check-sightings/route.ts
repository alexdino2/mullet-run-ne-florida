import { NextResponse } from "next/server";
import { getBeaches } from "@/lib/beaches";
import {
  checkBeachForSightings,
  saveSightingChecks,
} from "@/lib/sighting-checks";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily cron job that checks every tracked beach for recent online reports. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const beaches = await getBeaches();
  const checkedAt = new Date();
  const checks = await Promise.all(
    beaches.map((beach) => checkBeachForSightings(beach, checkedAt)),
  );
  const persisted = await saveSightingChecks(checks);

  return NextResponse.json({
    checkedAt: checkedAt.toISOString(),
    persisted,
    beaches: checks.map((check) => ({
      id: check.beach_id,
      status: check.status,
      reportCount: check.reports.length,
      reports: check.reports,
    })),
    note: persisted
      ? "Online reports are unverified signals and remain separate from eyewitness sightings."
      : "Checks completed but were not saved. Configure SUPABASE_SERVICE_ROLE_KEY and apply migration 0003.",
  });
}

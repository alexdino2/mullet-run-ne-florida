import { NextResponse } from "next/server";
import { getLatestSightingChecks } from "@/lib/sighting-checks";

export const dynamic = "force-dynamic";

/** Public read endpoint for the latest daily check at each beach. */
export async function GET() {
  const checks = await getLatestSightingChecks();
  return NextResponse.json({ checks });
}

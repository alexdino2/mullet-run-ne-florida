import { NextResponse } from "next/server";
import { computeAllSummaries } from "@/lib/conditions";
import { parseCoast } from "@/lib/regions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const coast = parseCoast(new URL(request.url).searchParams.get("coast"));
  try {
    const summaries = await computeAllSummaries(coast ?? undefined);
    return NextResponse.json({ summaries });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to compute summaries", detail: String(err) },
      { status: 500 },
    );
  }
}

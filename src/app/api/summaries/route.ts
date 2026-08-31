import { NextResponse } from "next/server";
import { computeAllSummaries } from "@/lib/conditions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summaries = await computeAllSummaries();
    return NextResponse.json({ summaries });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to compute summaries", detail: String(err) },
      { status: 500 },
    );
  }
}

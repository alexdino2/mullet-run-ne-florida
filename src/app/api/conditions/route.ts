import { NextResponse } from "next/server";
import { getBeach, getPrimaryBeach } from "@/lib/beaches";
import { computeBeachConditions } from "@/lib/conditions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const beachId = searchParams.get("beach");

  const beach = beachId ? await getBeach(beachId) : await getPrimaryBeach();
  if (!beach) {
    return NextResponse.json({ error: "Unknown beach" }, { status: 404 });
  }

  try {
    const result = await computeBeachConditions(beach);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to compute conditions", detail: String(err) },
      { status: 500 },
    );
  }
}

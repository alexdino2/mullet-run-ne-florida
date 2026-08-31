import { NextResponse } from "next/server";
import { getBeaches } from "@/lib/beaches";

export const dynamic = "force-dynamic";

export async function GET() {
  const beaches = await getBeaches();
  return NextResponse.json({ beaches });
}

import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { getRecentSightings } from "@/lib/sightings";
import type { SchoolSize } from "@/lib/types";

export const dynamic = "force-dynamic";

const SIZES: SchoolSize[] = ["small", "medium", "large", "huge"];

export async function GET() {
  const sightings = await getRecentSightings(50);
  return NextResponse.json({ sightings });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Set the env vars in .env.local." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const beach_id = typeof body.beach_id === "string" ? body.beach_id : "";
  const school_size = body.school_size as SchoolSize;
  const notes =
    typeof body.notes === "string" && body.notes.trim().length > 0
      ? body.notes.trim().slice(0, 500)
      : null;
  const observed_at =
    typeof body.observed_at === "string" && body.observed_at.length > 0
      ? new Date(body.observed_at).toISOString()
      : new Date().toISOString();

  if (!beach_id) {
    return NextResponse.json({ error: "beach_id is required" }, { status: 400 });
  }
  if (!SIZES.includes(school_size)) {
    return NextResponse.json(
      { error: `school_size must be one of ${SIZES.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("mw_sightings")
    .insert({ beach_id, school_size, notes, observed_at })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sighting: data }, { status: 201 });
}

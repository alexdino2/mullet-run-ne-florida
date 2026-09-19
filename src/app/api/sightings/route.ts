import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { getRecentSightings } from "@/lib/sightings";
import { getBeach } from "@/lib/beaches";
import type { SchoolSize } from "@/lib/types";

export const dynamic = "force-dynamic";

const SIZES: SchoolSize[] = ["small", "medium", "large", "huge"];
const FLORIDA_BOUNDS = {
  minLat: 24,
  maxLat: 31.2,
  minLon: -88,
  maxLon: -79.5,
};

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
      ? body.observed_at
      : new Date().toISOString();
  const observedDate = new Date(observed_at);
  const lat = typeof body.lat === "number" ? body.lat : null;
  const lon = typeof body.lon === "number" ? body.lon : null;
  const location_accuracy_m =
    typeof body.location_accuracy_m === "number"
      ? Math.max(0, body.location_accuracy_m)
      : null;

  if (!beach_id) {
    return NextResponse.json({ error: "beach_id is required" }, { status: 400 });
  }
  if (!(await getBeach(beach_id))) {
    return NextResponse.json({ error: "Unknown beach" }, { status: 400 });
  }
  if (!SIZES.includes(school_size)) {
    return NextResponse.json(
      { error: `school_size must be one of ${SIZES.join(", ")}` },
      { status: 400 },
    );
  }
  if (Number.isNaN(observedDate.getTime())) {
    return NextResponse.json({ error: "Invalid observed_at" }, { status: 400 });
  }
  if ((lat === null) !== (lon === null)) {
    return NextResponse.json(
      { error: "lat and lon must be provided together" },
      { status: 400 },
    );
  }
  if (
    lat !== null &&
    lon !== null &&
    (lat < FLORIDA_BOUNDS.minLat ||
      lat > FLORIDA_BOUNDS.maxLat ||
      lon < FLORIDA_BOUNDS.minLon ||
      lon > FLORIDA_BOUNDS.maxLon)
  ) {
    return NextResponse.json(
      { error: "Location must be within Florida waters" },
      { status: 400 },
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("mw_sightings")
    .insert({
      beach_id,
      school_size,
      notes,
      observed_at: observedDate.toISOString(),
      lat,
      lon,
      location_accuracy_m,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sighting: data }, { status: 201 });
}

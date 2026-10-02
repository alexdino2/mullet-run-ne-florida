import { getStation } from "@/lib/beaches";
import { normalizeInstagramHandle, normalizeInstagramPostUrl } from "@/lib/instagram";
import { getServerSupabase, hasServiceRole } from "@/lib/supabase/server";
import type { CandidateStatus, InstagramCandidate, SchoolSize } from "@/lib/types";

/**
 * Storage for the Instagram review queue (mw_instagram_candidates). Server-only:
 * the table has no public policies, so every call needs the service role key.
 */

const TABLE = "mw_instagram_candidates";
const SIZES: SchoolSize[] = ["small", "medium", "large", "huge"];
const FLORIDA = { minLat: 24, maxLat: 31.2, minLon: -88, maxLon: -79.5 };

export type NewCandidate = Omit<
  InstagramCandidate,
  "id" | "status" | "sighting_id" | "reviewed_at" | "reviewed_by" | "created_at"
> & { status?: CandidateStatus; sighting_id?: string | null };

function db() {
  const supabase = getServerSupabase();
  if (!supabase || !hasServiceRole()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for the Instagram review queue");
  }
  return supabase;
}

/** Media ids already in the queue, so re-runs skip them (and their AI cost). */
export async function knownMediaIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const { data, error } = await db().from(TABLE).select("media_id").in("media_id", ids);
  if (error) throw new Error(`Reading ${TABLE}: ${error.message}`);
  return new Set((data ?? []).map((r) => r.media_id as string));
}

/** Posts someone already logged by hand, keyed by normalized permalink. */
export async function sightingsBySourceUrl(urls: string[]): Promise<Map<string, string>> {
  if (urls.length === 0) return new Map();
  const { data, error } = await db()
    .from("mw_sightings")
    .select("id, source_url")
    .in("source_url", urls);
  if (error) throw new Error(`Reading mw_sightings: ${error.message}`);
  return new Map((data ?? []).map((r) => [r.source_url as string, r.id as string]));
}

/** Insert new posts; rows whose media_id is already stored are left untouched. */
export async function insertCandidates(rows: NewCandidate[]): Promise<number> {
  if (rows.length === 0) return 0;
  const { data, error } = await db()
    .from(TABLE)
    .upsert(rows, { onConflict: "media_id", ignoreDuplicates: true })
    .select("id");
  if (error) throw new Error(`Writing ${TABLE}: ${error.message}`);
  return data?.length ?? 0;
}

export async function listCandidates(
  status: CandidateStatus,
  limit = 50,
): Promise<InstagramCandidate[]> {
  const { data, error } = await db()
    .from(TABLE)
    .select("*")
    .eq("status", status)
    .order("posted_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Reading ${TABLE}: ${error.message}`);
  return (data ?? []) as InstagramCandidate[];
}

export async function countPending(): Promise<number> {
  const { count, error } = await db()
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw new Error(`Reading ${TABLE}: ${error.message}`);
  return count ?? 0;
}

export interface ApproveInput {
  id: string;
  beach_id: string;
  school_size: string;
  observed_at: string;
  lat: number | null;
  lon: number | null;
  source_handle: string;
  notes: string;
}

/**
 * Publish a reviewed post as a verified Instagram sighting. Safe to repeat: if
 * the permalink is already a sighting, the candidate is linked to it instead.
 */
export async function approveCandidate(
  input: ApproveInput,
  reviewer: string,
): Promise<{ ok: true; sightingId: string } | { ok: false; error: string }> {
  const supabase = db();
  const { data: candidate, error: readError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", input.id)
    .maybeSingle<InstagramCandidate>();
  if (readError) return { ok: false, error: readError.message };
  if (!candidate) return { ok: false, error: "Post not found" };
  if (candidate.status === "approved") return { ok: false, error: "Already approved" };

  const sourceUrl = normalizeInstagramPostUrl(candidate.permalink);
  if (!sourceUrl) return { ok: false, error: "Permalink is not a public post or Reel URL" };
  if (!getStation(input.beach_id)) return { ok: false, error: "Pick a station" };
  if (!SIZES.includes(input.school_size as SchoolSize)) {
    return { ok: false, error: "Pick a school size" };
  }
  const observed = new Date(input.observed_at);
  if (Number.isNaN(observed.getTime())) return { ok: false, error: "Invalid time" };
  if ((input.lat === null) !== (input.lon === null)) {
    return { ok: false, error: "Latitude and longitude go together" };
  }
  if (
    input.lat !== null &&
    input.lon !== null &&
    (input.lat < FLORIDA.minLat ||
      input.lat > FLORIDA.maxLat ||
      input.lon < FLORIDA.minLon ||
      input.lon > FLORIDA.maxLon)
  ) {
    return { ok: false, error: "Location must be in Florida waters" };
  }
  const handle = input.source_handle.trim()
    ? normalizeInstagramHandle(input.source_handle)
    : null;
  if (input.source_handle.trim() && !handle) {
    return { ok: false, error: "Enter a valid Instagram handle" };
  }

  let sightingId: string;
  const { data: inserted, error: insertError } = await supabase
    .from("mw_sightings")
    .insert({
      beach_id: input.beach_id,
      school_size: input.school_size,
      observed_at: observed.toISOString(),
      notes: input.notes.trim().slice(0, 500) || null,
      lat: input.lat,
      lon: input.lon,
      location_accuracy_m: null,
      source_type: "instagram",
      source_url: sourceUrl,
      source_handle: handle,
      verification_status: "verified",
    })
    .select("id")
    .single();

  if (insertError?.code === "23505") {
    const existing = await sightingsBySourceUrl([sourceUrl]);
    const id = existing.get(sourceUrl);
    if (!id) return { ok: false, error: insertError.message };
    sightingId = id;
  } else if (insertError || !inserted) {
    return { ok: false, error: insertError?.message ?? "Could not save the sighting" };
  } else {
    sightingId = inserted.id as string;
  }

  const { error: updateError } = await supabase
    .from(TABLE)
    .update({
      status: "approved",
      sighting_id: sightingId,
      beach_id: input.beach_id,
      source_handle: handle,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewer,
    })
    .eq("id", input.id);
  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true, sightingId };
}

export async function setCandidateStatus(
  id: string,
  status: Extract<CandidateStatus, "pending" | "rejected">,
  reviewer: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await db()
    .from(TABLE)
    .update({
      status,
      reviewed_at: status === "pending" ? null : new Date().toISOString(),
      reviewed_by: status === "pending" ? null : reviewer,
    })
    .eq("id", id)
    .neq("status", "approved");
  return error ? { ok: false, error: error.message } : { ok: true };
}

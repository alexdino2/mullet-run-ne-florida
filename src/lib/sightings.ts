import type { Sighting } from "@/lib/types";
import { getServerSupabase } from "@/lib/supabase/server";

export async function getRecentSightings(limit = 50): Promise<Sighting[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("mw_sightings")
    .select("*")
    .order("observed_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Sighting[];
}

export async function getSightingsForBeach(
  beachId: string,
  limit = 20,
): Promise<Sighting[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("mw_sightings")
    .select("*")
    .eq("beach_id", beachId)
    .order("observed_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Sighting[];
}

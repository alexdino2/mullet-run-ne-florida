import type { Beach } from "@/lib/types";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Static fallback that mirrors the seeded `mw_beaches` rows. Keeps the app
 * usable (map, selector, scoring) even if the database is unreachable.
 * Mickler's Landing is prioritized highest.
 */
export const FALLBACK_BEACHES: Beach[] = [
  {
    id: "micklers",
    name: "Mickler's Landing",
    lat: 30.2016,
    lon: -81.3702,
    priority: 100,
    tide_station: "8720218",
    buoy_station: "41117",
    nws_note: "Ponte Vedra Beach; tide via Mayport station",
  },
  {
    id: "jax-beach",
    name: "Jacksonville Beach",
    lat: 30.2775,
    lon: -81.3933,
    priority: 60,
    tide_station: "8720218",
    buoy_station: "41117",
    nws_note: "Tide via Mayport station",
  },
  {
    id: "st-augustine",
    name: "St. Augustine Beach",
    lat: 29.8497,
    lon: -81.2653,
    priority: 55,
    tide_station: "8720587",
    buoy_station: "41117",
    nws_note: "St. Augustine Beach station",
  },
  {
    id: "mayport",
    name: "Mayport",
    lat: 30.3936,
    lon: -81.4137,
    priority: 50,
    tide_station: "8720218",
    buoy_station: "41112",
    nws_note: "Mayport / St. Johns River entrance",
  },
];

export async function getBeaches(): Promise<Beach[]> {
  const supabase = getServerSupabase();
  if (!supabase) return FALLBACK_BEACHES;
  const { data, error } = await supabase
    .from("mw_beaches")
    .select("*")
    .order("priority", { ascending: false });
  if (error || !data || data.length === 0) return FALLBACK_BEACHES;
  return data as Beach[];
}

export async function getBeach(id: string): Promise<Beach | null> {
  const beaches = await getBeaches();
  return beaches.find((b) => b.id === id) ?? null;
}

/** The highest-priority beach (Mickler's by default). */
export async function getPrimaryBeach(): Promise<Beach> {
  const beaches = await getBeaches();
  return beaches[0] ?? FALLBACK_BEACHES[0];
}

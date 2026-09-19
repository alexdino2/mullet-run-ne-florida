import type { Beach } from "@/lib/types";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Static fallback that mirrors the seeded `mw_beaches` rows. Keeps the app
 * usable (map, selector, scoring) even if the database is unreachable.
 * Mickler's Landing is prioritized highest. Stations continue south along the
 * Atlantic migration corridor so the public tracker works statewide.
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
  {
    id: "ponce-inlet",
    name: "Ponce Inlet",
    lat: 29.0808,
    lon: -80.925,
    priority: 45,
    tide_station: "8721147",
    buoy_station: "41009",
    nws_note: "Ponce de Leon Inlet; offshore conditions via Canaveral buoy",
  },
  {
    id: "cocoa-beach",
    name: "Cocoa Beach",
    lat: 28.3206,
    lon: -80.6076,
    priority: 40,
    tide_station: "8721604",
    buoy_station: "41009",
    nws_note: "Space Coast; tide via Trident Pier",
  },
  {
    id: "sebastian-inlet",
    name: "Sebastian Inlet",
    lat: 27.8609,
    lon: -80.4483,
    priority: 35,
    tide_station: "8722004",
    buoy_station: "41114",
    nws_note: "Sebastian Inlet; nearshore conditions via Fort Pierce buoy",
  },
  {
    id: "fort-pierce",
    name: "Fort Pierce",
    lat: 27.4467,
    lon: -80.3256,
    priority: 30,
    tide_station: "8722212",
    buoy_station: "41114",
    nws_note: "Fort Pierce Inlet",
  },
  {
    id: "jupiter-inlet",
    name: "Jupiter Inlet",
    lat: 26.9434,
    lon: -80.073,
    priority: 25,
    tide_station: "8722495",
    buoy_station: "41122",
    nws_note: "Jupiter Inlet; nearshore conditions via Hollywood buoy",
  },
  {
    id: "fort-lauderdale",
    name: "Fort Lauderdale",
    lat: 26.1224,
    lon: -80.104,
    priority: 20,
    tide_station: "8722956",
    buoy_station: "41122",
    nws_note: "South Florida; tide via South Port Everglades",
  },
  {
    id: "miami-beach",
    name: "Miami Beach",
    lat: 25.7907,
    lon: -80.13,
    priority: 15,
    tide_station: "8723170",
    buoy_station: "41122",
    nws_note: "Miami Beach; tide via Miami Beach Government Cut",
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

import { DEFAULT_STATION, getBeaches, getStation } from "@/lib/beaches";
import { parseCoast } from "@/lib/regions";
import type { Beach, Coast } from "@/lib/types";

/**
 * Resolve the coast and station a dashboard should show from `?beach=` and
 * `?coast=`. A beach wins (its coast is implied); otherwise the coast's
 * default station; otherwise Atlantic.
 */
export async function resolveSelection(params: {
  beach?: string;
  coast?: string;
}): Promise<{ coast: Coast; selected: Beach; beaches: Beach[] }> {
  const byId = params.beach ? getStation(params.beach) : null;
  const coast: Coast = byId?.coast ?? parseCoast(params.coast) ?? "atlantic";
  const beaches = await getBeaches(coast);
  const selected =
    byId ?? getStation(DEFAULT_STATION[coast]) ?? beaches[0];
  return { coast, selected, beaches };
}

import type { Coast, RegionId } from "@/lib/types";

export interface Region {
  id: RegionId;
  label: string;
  coast: Coast;
  /** Display order within its coast (north to south / west to east). */
  order: number;
  blurb: string;
}

export const REGIONS: Region[] = [
  {
    id: "northeast-florida",
    label: "Northeast Florida",
    coast: "atlantic",
    order: 1,
    blurb: "The First Coast sees the run first as pods push south out of Georgia.",
  },
  {
    id: "space-coast",
    label: "Space Coast",
    coast: "atlantic",
    order: 2,
    blurb: "Ponce Inlet to Cocoa Beach — long beaches and busy inlets.",
  },
  {
    id: "treasure-coast",
    label: "Treasure Coast",
    coast: "atlantic",
    order: 3,
    blurb: "Sebastian, Fort Pierce, and Jupiter inlets funnel the bait.",
  },
  {
    id: "southeast-florida",
    label: "Southeast Florida",
    coast: "atlantic",
    order: 4,
    blurb: "The tail of the Atlantic run, often lingering into November.",
  },
  {
    id: "panhandle",
    label: "Panhandle",
    coast: "gulf",
    order: 1,
    blurb: "Passes from Pensacola to Apalachicola, where bays empty on north winds.",
  },
  {
    id: "big-bend",
    label: "Big Bend",
    coast: "gulf",
    order: 2,
    blurb: "Marsh and spring-fed rivers — mullet stage upriver, then exit offshore.",
  },
  {
    id: "tampa-bay",
    label: "Tampa Bay",
    coast: "gulf",
    order: 3,
    blurb: "Schools leave the bay through Egmont Key and Passage Key Inlet.",
  },
  {
    id: "sarasota-charlotte",
    label: "Sarasota & Charlotte Harbor",
    coast: "gulf",
    order: 4,
    blurb: "The heart of Florida's mullet landings, from Longboat Pass to Boca Grande.",
  },
  {
    id: "southwest-florida",
    label: "Southwest Florida",
    coast: "gulf",
    order: 5,
    blurb: "Captiva to Marco Island — the latest leg of the Gulf run.",
  },
];

const byId = new Map(REGIONS.map((r) => [r.id, r]));

export function getRegion(id: RegionId): Region {
  return byId.get(id) ?? REGIONS[0];
}

export function regionsForCoast(coast: Coast): Region[] {
  return REGIONS.filter((r) => r.coast === coast).sort(
    (a, b) => a.order - b.order,
  );
}

export const COAST_LABEL: Record<Coast, string> = {
  atlantic: "Atlantic",
  gulf: "Gulf",
};

export function parseCoast(value: string | null | undefined): Coast | null {
  return value === "gulf" || value === "atlantic" ? value : null;
}

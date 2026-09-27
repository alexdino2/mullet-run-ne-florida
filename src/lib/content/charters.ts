/**
 * Charter directory data (Phase 2 lead generation).
 *
 * Atlantic regions follow the same inlet choke points the site scores; Gulf
 * regions follow the major passes where roe mullet exit to spawn.
 * Listings are populated by verified captains who claim a spot — we don't
 * invent businesses. Each region shows what the fishery is known for and an
 * open call for captains to get listed, which is the lead-gen product.
 */

/** Anchor id of the captain listing form on /charters. */
export const CHARTER_FORM_ID = "list-your-charter";

export type CharterCoast = "atlantic" | "gulf";

export const CHARTER_COASTS: {
  id: CharterCoast;
  name: string;
  blurb: string;
}[] = [
  {
    id: "atlantic",
    name: "Atlantic Coast",
    blurb:
      "The classic fall run: bait pours south along the beach from Jacksonville to Miami.",
  },
  {
    id: "gulf",
    name: "Gulf Coast",
    blurb:
      "Big roe mullet stage in the bays and bayous, then pour out the passes to spawn offshore as fronts cool the water.",
  },
];

export interface CharterRegion {
  id: string;
  coast: CharterCoast;
  name: string;
  /** What the run fishes like here — the pitch to anglers. */
  fishery: string;
  /** Highlighted species clients book for. */
  targets: string[];
}

export const CHARTER_REGIONS: CharterRegion[] = [
  {
    id: "ne-florida",
    coast: "atlantic",
    name: "Northeast Florida (Mickler's, Jax, St. Augustine)",
    fishery:
      "The run loads up early here. Long clean surf and the St. Johns jetties put clients on bait before the rest of the coast lights up.",
    targets: ["Redfish", "Tarpon", "Jacks", "Flounder"],
  },
  {
    id: "ponce-space-coast",
    coast: "atlantic",
    name: "Ponce Inlet & the Space Coast",
    fishery:
      "Ponce is a legendary funnel and Cocoa's surf runs for miles. Peak-season blitzes with predators pinning bait against the beach.",
    targets: ["Snook", "Tarpon", "Redfish", "Sharks"],
  },
  {
    id: "sebastian-treasure",
    coast: "atlantic",
    name: "Sebastian & the Treasure Coast",
    fishery:
      "Sebastian and Fort Pierce inlets are among the state's best snook and tarpon corridors when the mullet push through.",
    targets: ["Snook", "Tarpon", "Spanish mackerel"],
  },
  {
    id: "jupiter-south",
    coast: "atlantic",
    name: "Jupiter to South Florida",
    fishery:
      "Clear water and a deep tarpon corridor at Jupiter, with the run pushing into Fort Lauderdale and Miami later in fall.",
    targets: ["Tarpon", "Snook", "Bonito"],
  },
  {
    id: "panhandle",
    coast: "gulf",
    name: "Panhandle (Pensacola, Destin, Panama City)",
    fishery:
      "Roe mullet funnel out Pensacola Pass, East Pass and St. Andrews Pass in late fall, and bull reds stack up at the jetties to meet them.",
    targets: ["Redfish", "Flounder", "Speckled trout", "King mackerel"],
  },
  {
    id: "big-bend-nature-coast",
    coast: "gulf",
    name: "Big Bend & Nature Coast (Apalachicola, Cedar Key, Crystal River)",
    fishery:
      "Shallow grass flats and oyster bars hold huge schools of mullet, with redfish and trout tailing right alongside them on the fall tides.",
    targets: ["Redfish", "Speckled trout", "Flounder"],
  },
  {
    id: "tampa-bay-sarasota",
    coast: "gulf",
    name: "Tampa Bay & Sarasota",
    fishery:
      "Mullet schools work the bay mouth and beaches from Clearwater to Sarasota, drawing snook to the passes and kingfish onto the nearshore reefs.",
    targets: ["Snook", "Redfish", "Spanish mackerel", "King mackerel"],
  },
  {
    id: "boca-grande-southwest",
    coast: "gulf",
    name: "Boca Grande, Fort Myers & Naples",
    fishery:
      "Charlotte Harbor, Boca Grande Pass and the Ten Thousand Islands see mullet spill out every pass, with snook and tarpon waiting at the mouths.",
    targets: ["Snook", "Tarpon", "Redfish", "Spanish mackerel"],
  },
];

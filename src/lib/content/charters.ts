/**
 * Charter directory data (Phase 2 lead generation).
 *
 * The directory is organized by the same inlet choke points the site scores.
 * Listings are populated by verified captains who claim a spot — we don't
 * invent businesses. Each region shows what the fishery is known for and an
 * open call for captains to get listed, which is the lead-gen product.
 */

export interface CharterRegion {
  id: string;
  name: string;
  /** What the run fishes like here — the pitch to anglers. */
  fishery: string;
  /** Highlighted species clients book for. */
  targets: string[];
}

export const CHARTER_REGIONS: CharterRegion[] = [
  {
    id: "ne-florida",
    name: "Northeast Florida (Mickler's, Jax, St. Augustine)",
    fishery:
      "The run loads up early here. Long clean surf and the St. Johns jetties put clients on bait before the rest of the coast lights up.",
    targets: ["Redfish", "Tarpon", "Jacks", "Flounder"],
  },
  {
    id: "ponce-space-coast",
    name: "Ponce Inlet & the Space Coast",
    fishery:
      "Ponce is a legendary funnel and Cocoa's surf runs for miles. Peak-season blitzes with predators pinning bait against the beach.",
    targets: ["Snook", "Tarpon", "Redfish", "Sharks"],
  },
  {
    id: "sebastian-treasure",
    name: "Sebastian & the Treasure Coast",
    fishery:
      "Sebastian and Fort Pierce inlets are among the state's best snook and tarpon corridors when the mullet push through.",
    targets: ["Snook", "Tarpon", "Spanish mackerel"],
  },
  {
    id: "jupiter-south",
    name: "Jupiter to South Florida",
    fishery:
      "Clear water and a deep tarpon corridor at Jupiter, with the run pushing into Fort Lauderdale and Miami later in fall.",
    targets: ["Tarpon", "Snook", "Bonito"],
  },
];

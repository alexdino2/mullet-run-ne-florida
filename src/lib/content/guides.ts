/**
 * Editorial content for the guide hub — the topical cluster that gives the
 * site its E-E-A-T backbone (biology, locations, regulations, tactics).
 *
 * Content lives here as structured data so pages stay server-rendered,
 * fast, and easy to expand into long-tail articles later.
 */

export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  video?: {
    youtubeId: string;
    title: string;
    description: string;
    creator: string;
  };
}

export interface Guide {
  slug: string;
  title: string;
  /** Pillar category for topical clustering. */
  category: "Biology" | "Locations" | "Regulations" | "Tactics";
  emoji: string;
  summary: string;
  /** Last content review date (ISO). */
  updated: string;
  readMinutes: number;
  sections: GuideSection[];
  /** Slugs of related guides for internal linking. */
  related: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: "biology",
    title: "What Triggers the Florida Mullet Run",
    category: "Biology",
    emoji: "🔬",
    summary:
      "The migration biology behind the run — the species, the environmental cues, and the north-to-south timing that drives everything else on this site.",
    updated: "2026-09-19",
    readMinutes: 6,
    sections: [
      {
        paragraphs: [
          "The \"mullet run\" is the annual fall migration of baitfish along Florida's coast — a moving wall of forage that pulls nearly every gamefish in the state into the surf zone. Understanding what drives it is the difference between chasing rumors and reading the coast yourself.",
        ],
      },
      {
        heading: "The fish: striped mullet (Mugil cephalus)",
        paragraphs: [
          "The main event is the striped mullet, joined by silver mullet (Mugil curema) and fantail mullet (Mugil gyrans). Striped mullet are euryhaline — they tolerate a wide range of salinity — so they spend their juvenile and summer months in rivers, tidal creeks, and brackish estuaries, grazing on algae, detritus, and bottom microorganisms.",
        ],
      },
      {
        heading: "The trigger: cooling water and cold fronts",
        paragraphs: [
          "As summer ends, falling water temperature is the primary catalyst. When nearshore water drops toward the upper 60s Fahrenheit — roughly 68°F — mullet begin aggregating and moving seaward. The first autumn cold fronts amplify it: a sharp drop in barometric pressure and a shift to north/northeast wind tends to push the biggest pods against the beach.",
        ],
        bullets: [
          "Water temperature cooling toward ~68°F",
          "Passage of autumn cold fronts",
          "Falling barometric pressure",
          "North / northeast wind stacking bait on the beach",
        ],
      },
      {
        heading: "The route: north to south",
        paragraphs: [
          "The run generally starts in northern and central Florida in late August to early September, builds through mid-September and October, and can stretch into late November depending on how fast the water cools. Schools push south along the Atlantic beaches and through the inlets — the Space Coast, Sebastian, Jupiter, and on toward South Florida — before mature adults move well offshore to spawn.",
          "That north-to-south progression is exactly why this site's opportunity score weights the season window differently by latitude: the Northeast Florida beaches peak earlier than Miami.",
        ],
      },
      {
        heading: "The spectacle and the predators",
        paragraphs: [
          "Pods can run hundreds of yards long and tens of feet wide, temporarily linking separated habitats into one dense food web. Tarpon, snook, redfish, jack crevalle, Spanish mackerel, bluefish, flounder, and sharks follow the bait, corralling it against beaches, jetties, and inlet mouths — the surface-blowup feeding frenzies the run is famous for.",
        ],
        video: {
          youtubeId: "zA5mn423F9g",
          title: "Epic Drone Footage of the Florida Mullet Run — 4K",
          description:
            "See the scale of migrating mullet schools and the predators working their edges from above.",
          creator: "BlacktipH",
        },
      },
    ],
    related: ["locations", "tactics", "regulations"],
  },
  {
    slug: "locations",
    title: "Florida Mullet Run Inlets & Beaches Guide",
    category: "Locations",
    emoji: "📍",
    summary:
      "Inlet-by-inlet breakdown of the Atlantic migration corridor, from Mickler's Landing down to Miami Beach — the choke points where predators pin the bait.",
    updated: "2026-09-01",
    readMinutes: 7,
    sections: [
      {
        paragraphs: [
          "Inlets are choke points. Moving water funnels bait through a narrow gap, and gamefish stack up to ambush it. These are the corridor's highest-percentage stops, roughly north to south — the same stations this site scores live on the home page.",
        ],
      },
      {
        heading: "Northeast Florida",
        bullets: [
          "Mickler's Landing (Ponte Vedra) — the site's priority beach; long, clean surf that loads up early in the season.",
          "Jacksonville Beach & Mayport — pier and jetty structure at the St. Johns River mouth.",
          "St. Augustine Beach — approachable surf with consistent early-season pods.",
        ],
      },
      {
        heading: "The Space Coast",
        bullets: [
          "Ponce Inlet — a legendary funnel where bait bottlenecks and predators wait.",
          "Cocoa Beach — miles of wadeable surf; watch the bird activity.",
          "Sebastian Inlet — one of the state's most famous snook and tarpon inlets during the run.",
        ],
      },
      {
        heading: "Treasure Coast & Southeast",
        bullets: [
          "Fort Pierce Inlet — strong current and deep cuts hold big predators.",
          "Jupiter Inlet — clear water and a well-known tarpon corridor.",
          "Fort Lauderdale & Miami Beach — the tail end of the run as pods push south later in fall.",
        ],
      },
      {
        heading: "How to read a spot in real time",
        paragraphs: [
          "Bait location changes daily. Use the live map and crowdsourced sightings on this site to see where pods are right now, then cross-check the opportunity score for wind, tide, and season before you commit to a drive. Falling tide near an inlet on a northeast wind is the classic setup.",
        ],
      },
    ],
    related: ["tactics", "biology", "charters-guide"],
  },
  {
    slug: "regulations",
    title: "Florida Mullet & Gamefish Regulations",
    category: "Regulations",
    emoji: "📋",
    summary:
      "A plain-English overview of FWC mullet rules and the catch-and-release ethics that keep the run healthy. Always confirm current limits before you fish.",
    updated: "2026-09-01",
    readMinutes: 5,
    sections: [
      {
        paragraphs: [
          "Florida's mullet run is a genuine conservation success story — the population rebounded strongly after the state's ban on entangling gill nets. Keeping it that way means knowing the rules. This is a general overview, not legal advice: regulations change, and zones differ. Always verify current limits with the Florida Fish and Wildlife Conservation Commission (FWC) before you fish.",
        ],
      },
      {
        heading: "Harvesting mullet",
        bullets: [
          "Striped mullet are managed by the FWC as a restricted species.",
          "Recreational bag limit is commonly 50 fish per person per day in Atlantic and Gulf state waters, with no minimum size — but this varies by zone and season.",
          "Legal recreational gear includes cast nets and beach seines; gill and other entangling nets are prohibited.",
          "Some zones (e.g. parts of Tampa Bay and the Manatee River) carry much tighter, seasonal vessel limits.",
        ],
      },
      {
        heading: "The predators you'll actually target",
        paragraphs: [
          "Most anglers fishing the run are after the gamefish chasing the bait, and those have their own strict rules. Snook and tarpon in particular are tightly regulated and often catch-and-release only, requiring a permit for tarpon over a certain size. Redfish and trout have their own slot and bag limits that vary by management region.",
        ],
        bullets: [
          "Snook — seasonal, slot limit, requires a snook permit; often closed in fall.",
          "Tarpon — catch-and-release; a tag is required to possess one for a record.",
          "Redfish & trout — region-specific slot and bag limits.",
        ],
      },
      {
        heading: "Handle big fish for the future",
        paragraphs: [
          "During a hot bite it's easy to over-handle fish. Keep tarpon and snook in the water, use single barbless hooks where practical, revive fish fully before release, and never drag a big fish up dry sand for a photo. The run is only as good next year as the spawning stock you release this year.",
        ],
      },
    ],
    related: ["biology", "tactics", "locations"],
  },
  {
    slug: "tactics",
    title: "Mullet Run Tactics & Gear",
    category: "Tactics",
    emoji: "🎣",
    summary:
      "How to fish the blitz — matching the bait, working the edges of a pod, and the surf setup that lands tarpon, snook, and sharks from the beach.",
    updated: "2026-09-19",
    readMinutes: 7,
    sections: [
      {
        paragraphs: [
          "When the run is on, the fish are already fed — so presentation and position beat brute force. The core idea: find the bait, then fish the edges and the panicked stragglers, not the dense middle of the pod.",
        ],
      },
      {
        heading: "Reading the blitz",
        bullets: [
          "Watch for nervous water, showering bait, and diving birds — that's a pod under attack.",
          "Cast to the edges and behind the pod where predators pick off stragglers.",
          "On a falling tide, work the down-current side of an inlet or trough.",
          "First and last light, and the hours around a moving tide, concentrate the action.",
        ],
      },
      {
        heading: "Match the bait",
        paragraphs: [
          "A live or fresh mullet is the deadliest bait during the run, free-lined or fished on a fish-finder rig in the surf. When you're covering water, big topwater plugs, swimbaits, and pencil poppers that mimic a fleeing mullet draw explosive strikes.",
        ],
        bullets: [
          "Live/fresh mullet, free-lined or on a fish-finder rig",
          "Large topwater plugs and pencil poppers",
          "Paddle-tail swimbaits and soft jerkbaits (5–7\")",
          "Casting spoons for mackerel and jacks on the fringes",
        ],
      },
      {
        heading: "Throwing a cast net for live bait",
        paragraphs: [
          "A cast net lets you catch fresh mullet and other baitfish where harvest is legal. Start by practicing on grass, make sure the mesh and lead line are clear before every throw, and never throw over people, submerged structure, or protected wildlife. Check current FWC rules for the water you are fishing before keeping bait.",
        ],
        video: {
          youtubeId: "YcTUyswezwE",
          title: "How to Throw a Cast Net",
          description:
            "Florida Sportsman demonstrates how to load, rotate, and release a cast net so it opens cleanly.",
          creator: "Florida Sportsman",
        },
      },
      {
        heading: "A surf setup that handles the run",
        paragraphs: [
          "Predators in the run are big and the surf is heavy, so scale up. A 9–10' surf rod, a 6000–8000 series spinning reel, and 30–50 lb braid with a heavy leader lets you turn a tarpon or shark before it reaches the next sandbar. Keep a lighter 4000-class combo rigged for jacks and mackerel on the edges.",
        ],
      },
      {
        heading: "Get the exact gear",
        paragraphs: [
          "Our gear guide breaks down rods, reels, line, and lures for the run with picks at a few price points, so you can build a surf kit that won't get spooled by a beach tarpon.",
        ],
      },
    ],
    related: ["locations", "biology", "gear-shop"],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/** Resolve a related-slug into a link target + label, spanning guides + hub pages. */
export function relatedLink(
  slug: string,
): { href: string; label: string } | null {
  const guide = getGuide(slug);
  if (guide) return { href: `/guide/${guide.slug}`, label: guide.title };
  switch (slug) {
    case "gear-shop":
      return { href: "/gear", label: "Mullet Run Gear Guide" };
    case "charters-guide":
      return { href: "/charters", label: "Find a Mullet Run Charter" };
    default:
      return null;
  }
}

/**
 * Editorial content for beach landing pages — one entry per map station.
 *
 * Update copy, SEO fields, tips, and image credit here. Pages are statically
 * generated from this file so content changes ship without a database edit.
 * Beach IDs must match `FALLBACK_BEACHES` / `mw_beaches`.
 */

import { FALLBACK_BEACHES } from "@/lib/beaches";
import type { Beach } from "@/lib/types";

export interface BeachImage {
  /** Path under /public, e.g. /images/beaches/micklers.jpg */
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  license: string;
  sourceUrl: string;
}

export interface BeachContent {
  /** Matches Beach.id */
  id: string;
  /** URL segment — usually the same as id */
  slug: string;
  /** SEO <title> (template appends "| Florida Mullet Run") */
  title: string;
  /** Meta description (~150–160 chars) */
  description: string;
  /** Open Graph / social title override */
  ogTitle?: string;
  /** H1 on the page */
  headline: string;
  /** Short lede under the H1 */
  summary: string;
  /** Region label for clustering */
  region:
    | "Northeast Florida"
    | "Space Coast"
    | "Treasure Coast"
    | "Southeast Florida";
  /** Last content review date (ISO) */
  updated: string;
  /** Keywords for meta + internal topical signals */
  keywords: string[];
  image: BeachImage;
  /** Intro paragraphs */
  about: string[];
  /** Why this spot matters during the run */
  whyFish: string[];
  /** Practical tips for anglers */
  tips: string[];
  /** Nearby access / structure notes */
  access: string[];
  /** Related beach ids for internal linking */
  nearby: string[];
}

export const BEACH_CONTENT: BeachContent[] = [
  {
    id: "micklers",
    slug: "micklers",
    title: "Mickler's Landing Mullet Run — Ponte Vedra Beach Guide",
    description:
      "Mickler's Landing mullet run guide: early-season bait on Ponte Vedra Beach, how to fish the clean NEFL surf, live conditions, and tips for tarpon and snook.",
    headline: "Mickler's Landing Mullet Run",
    summary:
      "Ponte Vedra's priority beach — long, clean Atlantic surf that loads up early when the fall migration pushes out of Northeast Florida.",
    region: "Northeast Florida",
    updated: "2026-09-26",
    keywords: [
      "mickler's landing mullet run",
      "ponte vedra mullet",
      "micklers landing fishing",
      "northeast florida mullet run",
    ],
    image: {
      src: "/images/beaches/micklers.jpg",
      alt: "Atlantic shoreline at Ponte Vedra Beach near Mickler's Landing",
      width: 1200,
      height: 900,
      credit: "Doncram",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:FL_Ponte_Vedra_Beach_ocean01.jpg",
    },
    about: [
      "Mickler's Landing sits on Ponte Vedra Beach in St. Johns County — a wide, gently sloping Atlantic beach with public parking and a short walk to the water. It is this site's highest-priority station because Northeast Florida typically sees the mullet run first.",
      "Schools often hug the troughs outside the first sandbar on northeast and east winds. When birds work and the water looks nervous, predators are usually already on the edges of the bait.",
    ],
    whyFish: [
      "Early-season timing: NEFL water cools first, so Mickler's often lights up before Space Coast and South Florida stations.",
      "Clean surf structure with long troughs that hold bait without heavy rock or pier crowds.",
      "Easy beach access with room to spread out and follow a moving pod.",
    ],
    tips: [
      "Watch the first sandbar trough at first light and around moving tides.",
      "A falling tide on a northeast breeze is the classic Mickler's setup.",
      "Keep a cast net ready where harvest is legal, then free-line a fresh mullet on the edges of the pod.",
      "Check the live score on the home page before you drive — wind and tide shift daily.",
    ],
    access: [
      "Public beach access with parking near Mickler's Landing Road, Ponte Vedra Beach.",
      "Wadeable surf; no inlet jetty on-site — fish the open beach and nearby troughs.",
      "Tide reference uses the Mayport CO-OPS station; nearshore conditions draw from local buoys.",
    ],
    nearby: ["jax-beach", "st-augustine", "mayport"],
  },
  {
    id: "jax-beach",
    slug: "jax-beach",
    title: "Jacksonville Beach Mullet Run — Pier & Surf Guide",
    description:
      "Jacksonville Beach mullet run: pier and surf fishing when bait pushes south from Mayport. Live conditions, tactics, and where predators pin mullet.",
    headline: "Jacksonville Beach Mullet Run",
    summary:
      "Pier structure and open Atlantic surf just south of the St. Johns River — a high-traffic corridor when early-season pods push through Duval County.",
    region: "Northeast Florida",
    updated: "2026-09-26",
    keywords: [
      "jacksonville beach mullet run",
      "jax beach fishing mullet",
      "jacksonville pier mullet",
    ],
    image: {
      src: "/images/beaches/jax-beach.jpg",
      alt: "Aerial view of Jacksonville Beach along the Atlantic coast",
      width: 1200,
      height: 800,
      credit: "Jonathan Cutrer",
      license: "CC BY 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Jacksonville_Beach,_Florida.jpg",
    },
    about: [
      "Jacksonville Beach sits on the Atlantic just south of Mayport and the St. Johns River mouth. The fishing pier and adjacent surf give mullet and their predators multiple ambush edges as schools migrate south.",
      "Expect action to build after Mickler's and Mayport start reporting bait, then continue as pods slide toward St. Augustine.",
    ],
    whyFish: [
      "Pier and jetty-adjacent structure concentrates bait and gamefish.",
      "Strong early-to-mid season window for Northeast Florida.",
      "Plenty of public access, parking, and room to cover water on foot.",
    ],
    tips: [
      "Fish the pier shadows and troughs on either side when birds dive.",
      "Match the hatch with large topwaters or free-lined mullet along the pod edges.",
      "Morning and evening tides with an onshore NE–E component are prime.",
    ],
    access: [
      "Jacksonville Beach Pier and multiple public beach walkovers.",
      "Urban beach amenities; expect weekend crowds during peak season.",
      "Tide via Mayport; buoy conditions from nearshore NEFL stations.",
    ],
    nearby: ["micklers", "mayport", "st-augustine"],
  },
  {
    id: "st-augustine",
    slug: "st-augustine",
    title: "St. Augustine Beach Mullet Run — Surf & Pier Guide",
    description:
      "St. Augustine Beach mullet run guide: approachable Atlantic surf, pier access, early-season pods, and live opportunity scores for NEFL anglers.",
    headline: "St. Augustine Beach Mullet Run",
    summary:
      "Approachable surf and pier fishing in St. Johns County — consistent early-season mullet pods on the migration's northern leg.",
    region: "Northeast Florida",
    updated: "2026-09-26",
    keywords: [
      "st augustine beach mullet run",
      "st augustine mullet fishing",
      "st johns county mullet",
    ],
    image: {
      src: "/images/beaches/st-augustine.jpg",
      alt: "St. Johns County Ocean and Fishing Pier at St. Augustine Beach",
      width: 1200,
      height: 1199,
      credit: "Jud McCranie",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:St._Johns_County_Ocean_%26_Fishing_Pier.jpg",
    },
    about: [
      "St. Augustine Beach offers a friendly, wadeable Atlantic surf with a county fishing pier that acts as a visible bait magnet during the run. It sits between Mickler's and the Space Coast corridor, so timing often overlaps the Northeast Florida peak.",
      "Look for schools sliding along the beach face and pausing near pier pilings when predators push them in.",
    ],
    whyFish: [
      "Reliable early-season feed with simpler access than busy inlets.",
      "Pier structure creates current edges that hold bait.",
      "Good midpoint between Ponte Vedra and Daytona/Ponce for day trips.",
    ],
    tips: [
      "Work both sides of the pier on a moving tide.",
      "Scan for diving birds south of the pier when wind is northeast.",
      "Carry a lighter combo for jacks and mackerel on the fringes.",
    ],
    access: [
      "St. Johns County Ocean & Fishing Pier and nearby public walkovers.",
      "Local tide station (St. Augustine Beach) for more accurate stage.",
      "Parking near the pier; arrive early on weekends in October.",
    ],
    nearby: ["micklers", "jax-beach", "ponce-inlet"],
  },
  {
    id: "mayport",
    slug: "mayport",
    title: "Mayport Mullet Run — St. Johns River Mouth Guide",
    description:
      "Mayport mullet run fishing at the St. Johns River entrance: jetties, moving water, and how bait funnels predators during the fall migration.",
    headline: "Mayport Mullet Run",
    summary:
      "The St. Johns River mouth — jetty current and inlet-style structure that funnels migrating mullet and the fish that hunt them.",
    region: "Northeast Florida",
    updated: "2026-09-26",
    keywords: [
      "mayport mullet run",
      "mayport fishing mullet",
      "st johns river mullet",
    ],
    image: {
      src: "/images/beaches/mayport.jpg",
      alt: "Beach at Hanna Park near Mayport, Florida",
      width: 1200,
      height: 900,
      credit: "Jud McCranie",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Hanna_Park_Mayport_Poles.jpg",
    },
    about: [
      "Mayport marks the St. Johns River entrance north of Jacksonville Beach. Moving water through the jetties creates a classic inlet choke point — bait stacks, and tarpon, snook (in season), jacks, and sharks wait on the edges.",
      "Nearby Hanna Park beaches also see schools push along the open coast when wind pins bait against the sand.",
    ],
    whyFish: [
      "True inlet dynamics: current, depth changes, and predator ambush lanes.",
      "Often among the first NEFL spots to show heavy bait early in the run.",
      "Options for jetty, boat, and nearby beach approaches.",
    ],
    tips: [
      "Time casts for the down-current side of the jetties on a falling tide.",
      "Respect vessel traffic and restricted naval areas.",
      "Heavy leaders — inlet fish hit hard and use current to their advantage.",
    ],
    access: [
      "Mayport jetties, nearby parks, and charter docks at the river mouth.",
      "Primary tide station for much of NEFL scoring (CO-OPS 8720218).",
      "Check park hours and any temporary closures before you go.",
    ],
    nearby: ["jax-beach", "micklers", "st-augustine"],
  },
  {
    id: "ponce-inlet",
    slug: "ponce-inlet",
    title: "Ponce Inlet Mullet Run — Bait Bottleneck Guide",
    description:
      "Ponce Inlet mullet run: a legendary Space Coast funnel where bait bottlenecks and predators wait. Live scores, tactics, and access tips.",
    headline: "Ponce Inlet Mullet Run",
    summary:
      "A legendary Atlantic funnel near New Smyrna and Daytona — bait bottlenecks through the inlet while predators stack the edges.",
    region: "Space Coast",
    updated: "2026-09-26",
    keywords: [
      "ponce inlet mullet run",
      "ponce inlet fishing",
      "new smyrna mullet run",
    ],
    image: {
      src: "/images/beaches/ponce-inlet.jpg",
      alt: "Ponce de Leon Inlet beach viewed from Lighthouse Point Park",
      width: 1200,
      height: 388,
      credit: "Clyde May",
      license: "CC BY 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Ponce_de_Leon_Inlet_Beach_as_viewed_from_the_Lighthouse_Point_Park_-_panoramio.jpg",
    },
    about: [
      "Ponce de Leon Inlet is one of Florida's classic mullet-run choke points. Migrating schools compress through the pass, and the surrounding beaches — including Lighthouse Point Park — give shore anglers a front-row seat when the blitz is on.",
      "Peak timing usually trails Northeast Florida by a bit and overlaps the broader Space Coast window through October.",
    ],
    whyFish: [
      "Natural bottleneck that concentrates forage and gamefish.",
      "Beach, jetty, and boat options around a well-known lighthouse landmark.",
      "Strong mid-season reputation for snook, tarpon, and sharks.",
    ],
    tips: [
      "Fish the down-tide jetty corner when water is moving.",
      "Scan the adjacent beach for birds working pods that haven't entered the pass yet.",
      "Scale up: inlet current plus big predators demand stout gear.",
    ],
    access: [
      "Lighthouse Point Park, nearby Volusia beaches, and inlet boat ramps.",
      "Offshore conditions often reference the Canaveral buoy corridor.",
      "Expect strong current — know your footing on the rocks.",
    ],
    nearby: ["cocoa-beach", "st-augustine", "sebastian-inlet"],
  },
  {
    id: "cocoa-beach",
    slug: "cocoa-beach",
    title: "Cocoa Beach Mullet Run — Space Coast Surf Guide",
    description:
      "Cocoa Beach mullet run guide: miles of wadeable Space Coast surf, pier access, bird-watching for pods, and live opportunity scores.",
    headline: "Cocoa Beach Mullet Run",
    summary:
      "Miles of wadeable Space Coast surf — watch the birds, walk the beach, and intercept pods as the migration threads the mid-latitude corridor.",
    region: "Space Coast",
    updated: "2026-09-26",
    keywords: [
      "cocoa beach mullet run",
      "cocoa beach fishing mullet",
      "space coast mullet run",
    ],
    image: {
      src: "/images/beaches/cocoa-beach.jpg",
      alt: "Cocoa Beach Pier extending into the Atlantic Ocean",
      width: 1200,
      height: 900,
      credit: "Michael Rivera",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Cocoa_Beach_Pier_(Cocoa_Beach,_Florida)_001.jpg",
    },
    about: [
      "Cocoa Beach gives you long stretches of open Atlantic sand and a landmark pier. During the run, pods can appear anywhere along the beachface — bird activity is often the fastest tell.",
      "It sits between Ponce and Sebastian, so it catches the mid-season pulse as bait works south along the Space Coast.",
    ],
    whyFish: [
      "Huge amount of walkable water to cover when schools are moving.",
      "Pier creates a fixed bait magnet for shore and pier anglers.",
      "Classic mid-fall timing for the statewide corridor.",
    ],
    tips: [
      "Bring binoculars — find diving terns before you commit to a stretch.",
      "Fish the pier edges at dawn when bait is stacked.",
      "Topwater walkers and paddle-tails shine when fish are herding mullet in the shallows.",
    ],
    access: [
      "Cocoa Beach Pier and numerous public beach accesses along A1A.",
      "Tide reference via Trident Pier; nearshore buoy coverage from the Canaveral corridor.",
      "Tourist crowds — fish early or late for better room to cast.",
    ],
    nearby: ["ponce-inlet", "sebastian-inlet", "fort-pierce"],
  },
  {
    id: "sebastian-inlet",
    slug: "sebastian-inlet",
    title: "Sebastian Inlet Mullet Run — Snook & Tarpon Guide",
    description:
      "Sebastian Inlet mullet run: one of Florida's most famous snook and tarpon inlets. How to fish the pass when bait bottlenecks in fall.",
    headline: "Sebastian Inlet Mullet Run",
    summary:
      "One of the state's most famous snook and tarpon inlets — a hard-charging pass where the mullet run turns into a feeding frenzy.",
    region: "Space Coast",
    updated: "2026-09-26",
    keywords: [
      "sebastian inlet mullet run",
      "sebastian inlet snook",
      "sebastian inlet tarpon",
    ],
    image: {
      src: "/images/beaches/sebastian-inlet.jpg",
      alt: "Sebastian Inlet and bridge at Sebastian Inlet State Park",
      width: 1200,
      height: 900,
      credit: "Wikimedia Commons contributor",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Sebastian_inlet_bridge.JPG",
    },
    about: [
      "Sebastian Inlet State Park straddles Brevard and Indian River counties. The pass is a premier choke point: bait pours through, and snook, tarpon, jacks, and sharks set up on the rocks and beach corners.",
      "When the run is hot here, it is one of the highest-percentage shore destinations on the Atlantic coast.",
    ],
    whyFish: [
      "Legendary reputation for big snook and beach tarpon during the run.",
      "State park access on both north and south shores of the inlet.",
      "Strong mid-to-late Space Coast timing as pods push south.",
    ],
    tips: [
      "North and south jetties fish differently by tide — rotate with the flow.",
      "Live mullet or large swimbaits on stout leaders are the standard.",
      "Park early; peak October weekends fill up fast.",
    ],
    access: [
      "Sebastian Inlet State Park — day-use fees, parking, and jetty walkways.",
      "Nearshore conditions via the Fort Pierce buoy corridor.",
      "Watch footing on wet rocks and respect park fishing rules.",
    ],
    nearby: ["cocoa-beach", "fort-pierce", "jupiter-inlet"],
  },
  {
    id: "fort-pierce",
    slug: "fort-pierce",
    title: "Fort Pierce Mullet Run — Inlet & Jetty Guide",
    description:
      "Fort Pierce mullet run fishing: strong inlet current, deep cuts, and jetty access where migrating bait meets Treasure Coast predators.",
    headline: "Fort Pierce Mullet Run",
    summary:
      "Treasure Coast inlet fishing with strong current and deep cuts — a natural staging area as pods leave the Space Coast and push south.",
    region: "Treasure Coast",
    updated: "2026-09-26",
    keywords: [
      "fort pierce mullet run",
      "fort pierce inlet fishing",
      "treasure coast mullet",
    ],
    image: {
      src: "/images/beaches/fort-pierce.jpg",
      alt: "Fort Pierce beach looking north toward Jetty Park",
      width: 1200,
      height: 900,
      credit: "Wikimedia Commons contributor",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Fort_Pierce_beach_looking_north_at_Jetty_Park.jpeg",
    },
    about: [
      "Fort Pierce Inlet and the adjacent Jetty Park beaches give anglers both rock and sand options. Deep cuts and moving water hold big predators when mullet schools arrive from the north.",
      "This stretch bridges Space Coast timing and the later Southeast Florida pulse.",
    ],
    whyFish: [
      "Inlet current and jetty structure concentrate bait.",
      "Less tourist density than Miami while still seeing solid late-season pods.",
      "Flexible shore approaches along Jetty Park.",
    ],
    tips: [
      "Fish the beach looking toward the jetty when birds work the trough.",
      "Moving tide + northeast wind remains the high-percentage pattern.",
      "Heavy braid and abrasion-resistant leaders for rocks and sharks.",
    ],
    access: [
      "Jetty Park and Fort Pierce Inlet public access points.",
      "Local tide station and Fort Pierce buoy for nearshore seas.",
      "Confirm park hours and any jetty closures after storms.",
    ],
    nearby: ["sebastian-inlet", "jupiter-inlet", "cocoa-beach"],
  },
  {
    id: "jupiter-inlet",
    slug: "jupiter-inlet",
    title: "Jupiter Inlet Mullet Run — Clear-Water Tarpon Guide",
    description:
      "Jupiter Inlet mullet run: clear water, inlet structure, and a well-known tarpon corridor as the fall migration reaches Palm Beach County.",
    headline: "Jupiter Inlet Mullet Run",
    summary:
      "Clear water and a well-known tarpon corridor — inlet structure where late-season pods and predators meet in Palm Beach County.",
    region: "Treasure Coast",
    updated: "2026-09-26",
    keywords: [
      "jupiter inlet mullet run",
      "jupiter inlet tarpon",
      "jupiter beach mullet",
    ],
    image: {
      src: "/images/beaches/jupiter-inlet.jpg",
      alt: "Jupiter Inlet Lighthouse Outstanding Natural Area overlooking the inlet",
      width: 1200,
      height: 900,
      credit: "Bureau of Land Management",
      license: "Public domain",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Jupiter_Inlet_Lighthouse_ONA_(9315438856).jpg",
    },
    about: [
      "Jupiter Inlet is a scenic, clear-water pass marked by the historic lighthouse and Outstanding Natural Area. During the mullet run it becomes a tarpon and snook highway as bait funnels through Palm Beach County.",
      "Timing typically runs later than NEFL — often mid-to-late fall as the migration's leading edge arrives from the Treasure Coast.",
    ],
    whyFish: [
      "Clear water lets you sight-fish pods and rolling tarpon.",
      "Inlet + beach combo with iconic landmark access.",
      "Strong late-corridor opportunity before South Florida's peak.",
    ],
    tips: [
      "Polarized glasses help track bait and fish in clear water.",
      "Fish inlet corners on the falling tide; don't ignore adjacent beaches.",
      "Catch-and-release ethics matter — keep big tarpon in the water.",
    ],
    access: [
      "Jupiter Inlet Lighthouse ONA, DuBois Park, and nearby beach accesses.",
      "Nearshore conditions often reference the Hollywood buoy corridor.",
      "Respect natural-area rules and limited parking on busy weekends.",
    ],
    nearby: ["fort-pierce", "fort-lauderdale", "sebastian-inlet"],
  },
  {
    id: "fort-lauderdale",
    slug: "fort-lauderdale",
    title: "Fort Lauderdale Mullet Run — South Florida Surf Guide",
    description:
      "Fort Lauderdale mullet run: late-season South Florida surf and inlet edges as migrating pods push toward Miami. Live scores and tactics.",
    headline: "Fort Lauderdale Mullet Run",
    summary:
      "Late-season South Florida surf — inlet edges and beach troughs as the migration's tail end loads the Broward coast.",
    region: "Southeast Florida",
    updated: "2026-09-26",
    keywords: [
      "fort lauderdale mullet run",
      "fort lauderdale surf fishing mullet",
      "broward mullet run",
    ],
    image: {
      src: "/images/beaches/fort-lauderdale.jpg",
      alt: "Central Beach at Fort Lauderdale along the Atlantic coast",
      width: 1200,
      height: 767,
      credit: "Wikimedia Commons contributor",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Central_Beach_Fort_Lauderdale_Beach_Florida_Atlantic_Coast.jpg",
    },
    about: [
      "Fort Lauderdale's Central Beach and nearby inlet/jetty stretches see the mullet run later than northern stations. When Northeast Florida is cooling down, South Florida is often just heating up.",
      "Urban beach access means you can check multiple walkovers quickly when birds or social reports tip you off.",
    ],
    whyFish: [
      "Late-season timing fills the gap after Space Coast peaks.",
      "Beach and inlet options along a continuous Atlantic frontage.",
      "Predators follow bait into shallow, fishable troughs.",
    ],
    tips: [
      "Monitor sightings map reports — South Florida pods can be patchy day to day.",
      "Fish early to beat swimmers and beach traffic.",
      "Scale leaders for sharks that shadow late-season bait schools.",
    ],
    access: [
      "Fort Lauderdale Beach public accesses and nearby inlet jetties.",
      "Tide via South Port Everglades; nearshore seas from Hollywood buoy.",
      "Metered parking and seasonal crowds — plan sunrise sessions.",
    ],
    nearby: ["jupiter-inlet", "miami-beach", "fort-pierce"],
  },
  {
    id: "miami-beach",
    slug: "miami-beach",
    title: "Miami Beach Mullet Run — End-of-Corridor Guide",
    description:
      "Miami Beach mullet run: the southern end of Florida's Atlantic migration corridor. Late-fall bait, surf tactics, and live opportunity scores.",
    headline: "Miami Beach Mullet Run",
    summary:
      "The southern end of the Atlantic corridor — late-fall pods and predators as the migration's leading edge reaches Miami Beach.",
    region: "Southeast Florida",
    updated: "2026-09-26",
    keywords: [
      "miami beach mullet run",
      "miami mullet fishing",
      "south beach mullet run",
    ],
    image: {
      src: "/images/beaches/miami-beach.jpg",
      alt: "Atlantic Ocean shoreline at South Beach, Miami Beach",
      width: 1200,
      height: 900,
      credit: "Wikimedia Commons contributor",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:South_beach_Miami.jpg",
    },
    about: [
      "Miami Beach is the tail of this site's tracked corridor. Pods that started in Northeast Florida weeks earlier often show here later in fall, keeping the bite alive when northern water has already cooled past the peak.",
      "Government Cut and the open South Beach surf both play roles when bait and predators stage along the coast.",
    ],
    whyFish: [
      "Latest timing on the north-to-south progression — extends your season.",
      "High predator density when bait finally arrives.",
      "Iconic beach access with multiple public entry points.",
    ],
    tips: [
      "Don't write off November — Miami's window can run later than NEFL.",
      "Fish quieter stretches away from the densest tourist zones when possible.",
      "Cross-check live scores and crowd sightings before fighting traffic.",
    ],
    access: [
      "South Beach and Miami Beach public walkovers; Government Cut nearby for boat traffic awareness.",
      "Tide via Miami Beach Government Cut station.",
      "Heavy recreational use — prioritize weekday dawns.",
    ],
    nearby: ["fort-lauderdale", "jupiter-inlet", "fort-pierce"],
  },
];

const bySlug = new Map(BEACH_CONTENT.map((b) => [b.slug, b]));
const byId = new Map(BEACH_CONTENT.map((b) => [b.id, b]));

export function getBeachContent(slug: string): BeachContent | undefined {
  return bySlug.get(slug);
}

export function getBeachContentById(id: string): BeachContent | undefined {
  return byId.get(id);
}

/** All content entries that still exist in the live beach catalog. */
export function listBeachContent(beaches?: Beach[]): BeachContent[] {
  const ids = new Set((beaches ?? FALLBACK_BEACHES).map((b) => b.id));
  return BEACH_CONTENT.filter((b) => ids.has(b.id));
}

export function beachPath(slug: string): string {
  return `/beaches/${slug}`;
}

export function beachesByRegion(
  beaches?: Beach[],
): { region: BeachContent["region"]; beaches: BeachContent[] }[] {
  const order: BeachContent["region"][] = [
    "Northeast Florida",
    "Space Coast",
    "Treasure Coast",
    "Southeast Florida",
  ];
  const list = listBeachContent(beaches);
  return order
    .map((region) => ({
      region,
      beaches: list.filter((b) => b.region === region),
    }))
    .filter((g) => g.beaches.length > 0);
}

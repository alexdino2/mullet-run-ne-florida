/**
 * Editorial content for the guide hub — the topical cluster that gives the
 * site its E-E-A-T backbone (biology, locations, regulations, tactics).
 *
 * Content lives here as structured data so pages stay server-rendered,
 * fast, and easy to expand into long-tail articles later.
 */

export interface GuideSection {
  heading?: string;
  /** Paragraphs and bullets accept inline `[label](/path)` internal links. */
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
          "That north-to-south progression is exactly why this site's opportunity score weights the season window differently by latitude: the Northeast Florida beaches peak earlier than Miami. The Gulf coast runs on a different pattern — see the Gulf Coast guide.",
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
    updated: "2026-09-26",
    readMinutes: 7,
    sections: [
      {
        paragraphs: [
          "Inlets are choke points. Moving water funnels bait through a narrow gap, and gamefish stack up to ambush it. These are the corridor's highest-percentage stops, roughly north to south — the same stations this site scores live on the home page. Each one links to its full beach guide, or browse [all beach guides](/beaches) by region.",
        ],
      },
      {
        heading: "Northeast Florida",
        paragraphs: [
          "Start with the dedicated beach guides for early-season timing:",
        ],
        bullets: [
          "[Mickler's Landing](/beaches/micklers) (Ponte Vedra) — long, clean surf that loads up early in the season.",
          "[Jacksonville Beach](/beaches/jax-beach) & [Mayport](/beaches/mayport) — pier and jetty structure at the St. Johns River mouth.",
          "[St. Augustine Beach](/beaches/st-augustine) — approachable surf with consistent early-season pods.",
        ],
      },
      {
        heading: "The Space Coast",
        paragraphs: [
          "Mid-corridor choke points — open each beach page for photos, access, and tactics:",
        ],
        bullets: [
          "[Ponce Inlet](/beaches/ponce-inlet) — a legendary funnel where bait bottlenecks and predators wait.",
          "[Cocoa Beach](/beaches/cocoa-beach) — miles of wadeable surf; watch the bird activity.",
          "[Sebastian Inlet](/beaches/sebastian-inlet) — one of the state's most famous snook and tarpon inlets during the run.",
        ],
      },
      {
        heading: "Treasure Coast & Southeast",
        paragraphs: [
          "Later-season stations as pods push south — guides cover Fort Pierce through Miami Beach.",
        ],
        bullets: [
          "[Fort Pierce Inlet](/beaches/fort-pierce) — strong current and deep cuts hold big predators.",
          "[Jupiter Inlet](/beaches/jupiter-inlet) — clear water and a well-known tarpon corridor.",
          "[Lake Worth Inlet](/beaches/lake-worth-inlet) — Palm Beach Inlet's jetties, where pods cross a deep ship channel.",
          "[Fort Lauderdale](/beaches/fort-lauderdale) & [Miami Beach](/beaches/miami-beach) — the tail end of the run as pods push south later in fall.",
        ],
      },
      {
        heading: "Beach-by-beach guides",
        paragraphs: [
          "Every station on the live map has its own page with a photo, SEO-ready overview, access notes, and angler tips. Browse the full list on the beaches hub, or jump from a map pin.",
        ],
      },
      {
        heading: "How to read a spot in real time",
        paragraphs: [
          "Bait location changes daily. Use the live map and crowdsourced sightings on this site to see where pods are right now, then cross-check the opportunity score for wind, tide, and season before you commit to a drive. Falling tide near an inlet on a northeast wind is the classic setup.",
        ],
      },
    ],
    related: ["tactics", "biology", "beaches-hub"],
  },
  {
    slug: "gulf-coast",
    title: "The Gulf Coast Mullet Run: How It Differs and How We Score It",
    category: "Locations",
    emoji: "🌅",
    summary:
      "On the Gulf, mullet don't parade down the beach — they stage in bays and rivers, then leave through the passes. Here's what triggers the exit, where it happens, and how the Gulf score works.",
    updated: "2026-09-27",
    readMinutes: 7,
    sections: [
      {
        paragraphs: [
          "On Florida's Atlantic side the fall run is a moving river of bait that slides south along one long beach after another. The Gulf side is built differently: shallow bays, barrier islands, marsh, and spring-fed rivers. Mullet spend the summer feeding in that protected water, and the run is really a series of exits — schools leaving bays and river mouths through a handful of passes on their way to spawn far offshore over the continental shelf.",
          "That is why the Gulf stations on this site are mostly passes and river mouths, and why they use a different score from the Atlantic beaches.",
        ],
      },
      {
        heading: "What triggers a Gulf exit",
        paragraphs: [
          "No single cue sends the fish out. The biggest movements tend to come when several line up at once:",
        ],
        bullets: [
          "A cold front: pressure drops sharply ahead of it, and fishermen have long called these fall fronts \"northers.\"",
          "North wind behind the front, which blows offshore along the Gulf coast and pushes water out of the bays — a wind-driven ebb the fish can ride through the passes.",
          "Cooling water: shallow bays that sat in the upper 80s in late summer drop fast once the first strong fronts arrive.",
          "A strong outgoing tide, strongest around the spring tides that come with new and full moons.",
          "A freshwater pulse: heavy rain before or with a front can freshen a river mouth quickly and flush staged fish downstream.",
          "Shorter days, which set the season: they bring the fish into spawning condition weeks before the weather gives the final push.",
        ],
      },
      {
        heading: "Region by region",
        paragraphs: [
          "Panhandle (Pensacola to Apalachicola): deep passes drain big river-fed bays — Pensacola Bay, Choctawhatchee Bay through Destin's East Pass, St. Andrew Bay, and Apalachicola Bay. North winds behind a front are easy to see here in the outflow.",
          "Big Bend (St. Marks to Homosassa): there are no long sandy beaches. Mullet hold in the deep holes and lower reaches of rivers like the St. Marks, Steinhatchee, Suwannee, Crystal, and Homosassa, then leave together, straight offshore, when temperature and moon line up.",
          "Tampa Bay to Charlotte Harbor: schools work through the bays and leave through high-current passes such as Egmont Key, Longboat Pass, Venice, and Boca Grande Pass, often hugging the barrier islands south before turning offshore. This stretch produces the large majority of Florida's commercial striped mullet landings.",
          "Southwest Florida (Captiva to Marco Island): the latest leg of the run, with passes draining Pine Island Sound, mangrove backwaters, and the edge of the Ten Thousand Islands.",
        ],
      },
      {
        heading: "How the Gulf score works",
        paragraphs: [
          "Each Gulf station gets a 0–100 exit score from free public data, updated hourly. Like the Atlantic score, every part is shown in the \"why this score\" breakdown:",
        ],
        bullets: [
          "Season window — the Panhandle and Big Bend peak in October and November; the window slides later the farther south you go.",
          "Cold front — the largest 24-hour pressure fall in the last two days, from the station's own barometer (with a weather-model fallback).",
          "North-wind flush — current wind and the share of the last 12 hours from NW through NE.",
          "Water cooling — the two-day water temperature change plus how far the water has fallen out of the 80s.",
          "Outgoing tide strength — tide stage from NOAA predictions, weighted by how close today's range is to the next spring tide.",
          "Moon phase — days from the nearest new or full moon.",
          "River flush — at passes and river mouths with a USGS gauge, today's flow against the two-week median, or a sudden drop in salinity.",
        ],
      },
      {
        paragraphs: [
          "The \"next best window\" looks two days ahead using forecast wind and forecast pressure, so a front on its way shows up before it arrives. Water temperature and river flow are held at today's values because there is no reliable forecast for them.",
          "These weights are a research-based starting point, not a trained model. The site logs every station's inputs every hour; once a season of sightings has built up, the weights will be checked against what actually happened. Your reports on the sightings page are what make that possible.",
        ],
      },
      {
        heading: "Rules still apply",
        paragraphs: [
          "Mullet are managed by the Florida Fish and Wildlife Conservation Commission, with gear limits, size and bag rules, and commercial closures that protect the spawning run. Check the regulations guide and confirm current limits with the FWC before you throw a net.",
        ],
      },
    ],
    related: ["locations", "biology", "regulations", "tactics"],
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
          "A cast net lets you catch fresh mullet and other baitfish where harvest is legal. Start by practicing on grass, make sure the mesh and lead line are clear before every throw, and never throw over people, submerged structure, or protected wildlife. Check current FWC rules for the water you are fishing before keeping bait. The full [cast net guide](/guide/cast-net) walks through choosing a net, loading it, and fixing a throw that won't open.",
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
    related: ["cast-net", "run-timing", "locations", "gear-shop"],
  },
  {
    slug: "run-timing",
    title: "Mullet Run Timing by Coast: When the Run Peaks Where You Fish",
    category: "Locations",
    emoji: "📅",
    summary:
      "Station-by-station peak windows for the Atlantic and Gulf runs, why the Gulf runs later, and how weather can move the dates in any given year.",
    updated: "2026-10-13",
    readMinutes: 8,
    sections: [
      {
        paragraphs: [
          "\"When is the mullet run?\" sounds like it should have one answer. It doesn't. Florida has two runs that work in different ways, and each one moves along the coast over about two months. Mickler's Landing in Ponte Vedra can be past its peak by the time Miami Beach is just getting going, and the passes around Naples are still producing well after the Atlantic beaches have gone quiet.",
          "This guide lists the peak window this site uses for every station it scores, explains where those dates come from, and covers what can push a given year earlier or later. If you only want today's answer, the [live tracker](/florida-mullet-tracker) already has this timing built into every score.",
        ],
      },
      {
        heading: "Two coasts, two different runs",
        paragraphs: [
          "On the Atlantic side, the run moves along the beach. Mullet leave the rivers and estuaries of Georgia and Northeast Florida and work south through the surf zone, close to shore, past one inlet after another. A pod you see at Jacksonville Beach can be at Ponce Inlet days later. Timing there comes down to latitude: the farther south you are, the later the fish arrive.",
          "The Gulf side is a series of departures. Mullet spend the summer feeding in protected bays, marshes, and river mouths, then leave through the passes to spawn far offshore. Fish in each bay go when their own conditions line up, usually a strong cold front with a big outgoing tide. Latitude still sets the season, but individual fronts set the days. The [Gulf Coast guide](/guide/gulf-coast) covers those triggers in detail.",
        ],
      },
      {
        heading: "Atlantic coast: peak windows by station",
        paragraphs: [
          "The Atlantic season model starts with a core window of roughly September 25 to October 20 in Northeast Florida. It shifts about four days later for every degree of latitude you move south, with a cap of 20 days. Inside the core window the season factor is at its maximum. September ramps up toward it, and November tapers off a little more slowly, because the tail of the run lingers.",
        ],
        bullets: [
          "[Mickler's Landing](/beaches/micklers), [Jacksonville Beach](/beaches/jax-beach) and [Mayport](/beaches/mayport): about Sep 25 – Oct 20",
          "[St. Augustine Beach](/beaches/st-augustine): about Sep 26 – Oct 21",
          "[Ponce Inlet](/beaches/ponce-inlet): about Sep 29 – Oct 24",
          "[Cocoa Beach](/beaches/cocoa-beach): about Oct 3 – Oct 28",
          "[Sebastian Inlet](/beaches/sebastian-inlet): about Oct 4 – Oct 29",
          "[Fort Pierce Inlet](/beaches/fort-pierce): about Oct 6 – Oct 31",
          "[Jupiter Inlet](/beaches/jupiter-inlet): about Oct 8 – Nov 2",
          "[Fort Lauderdale](/beaches/fort-lauderdale): about Oct 11 – Nov 5",
          "[Miami Beach](/beaches/miami-beach): about Oct 13 – Nov 7",
        ],
      },
      {
        paragraphs: [
          "Do the math on that list and the whole Atlantic run covers about seven weeks, from late September in Ponte Vedra to early November in Miami. That's more than 300 miles of coast, with the core window moving south around 18 days end to end. If you can travel, you can follow the run. If you can't, the shoulder weeks at your home beach are still worth fishing: early September pods and the November stragglers both draw predators.",
        ],
      },
      {
        heading: "Gulf coast: peak windows by region",
        paragraphs: [
          "The Gulf model starts later. Its core window runs from about October 5 to November 14 in the western Panhandle, and it shifts about five days later for every degree south, with a cap of 25 days. The Gulf window is also wider than the Atlantic one, because fish leave the bays in waves, one front at a time, rather than in one steady procession.",
        ],
        bullets: [
          "Panhandle (Pensacola Pass, Navarre, Destin East Pass, St. Andrew Pass): about Oct 5 – Nov 14",
          "Forgotten Coast (Cape San Blas, St. George Island): about Oct 8 – Nov 18",
          "Big Bend (St. Marks, Steinhatchee): about Oct 7 – Nov 18",
          "Nature Coast (Cedar Key and the Suwannee, Crystal River, Homosassa): about Oct 11 – Nov 22",
          "Tampa Bay (Egmont Key and Fort De Soto, Anna Maria Island, Longboat Pass): about Oct 19 – Nov 29",
          "Venice to Charlotte Harbor (Venice Inlet, Stump Pass, Boca Grande Pass): about Oct 21 – Dec 2",
          "Southwest Florida (Redfish Pass, Blind Pass, Wiggins Pass, Naples, Marco Island): about Oct 24 – Dec 6",
        ],
      },
      {
        paragraphs: [
          "Put the two coasts side by side and the pattern is clear. When the Atlantic run winds down in Miami in early November, the Gulf is only halfway through, and Southwest Florida has its best weeks still ahead. If you live in Central Florida and can drive to either coast, October belongs to the Atlantic beaches and November belongs to the Gulf passes.",
        ],
      },
      {
        heading: "What moves the dates in a given year",
        paragraphs: [
          "Calendar windows are a starting point, not a promise. The fish respond to conditions, and conditions change from year to year. These are the things that can push a run early or late:",
        ],
        bullets: [
          "Water temperature: mullet start moving as nearshore water cools toward the upper 60s. A warm fall delays the run. An early cool snap can bring it forward by a week or more.",
          "The first real cold front: the first strong front of the fall, with a sharp pressure drop and a hard north or northeast wind behind it, often sets off the first big push.",
          "Wind on the Atlantic side: a run of northeast to east wind stacks bait against the beach. A stretch of west or offshore wind can push pods out past casting range, so the fish are there but harder to find.",
          "Tide and moon on the Gulf side: exits cluster around strong outgoing tides, which are biggest near new and full moons. A front that lands on a spring tide tends to be the one that empties a bay.",
          "Hurricanes and big storms: a late-season storm can scatter bait and muddy the water for days, then a cleaner, cooler pattern afterward can bring a strong push.",
        ],
      },
      {
        heading: "How this site turns timing into a score",
        paragraphs: [
          "Season timing is one part of each station's 0–100 opportunity score. On the Atlantic it carries 30 of 100 points, the biggest single factor, because the beach run follows the calendar so closely. On the Gulf it carries less, because fronts, tides, and river flow decide which days the fish actually leave. Every score has a \"why this score\" breakdown, so you can see how much of today's number comes from the season and how much from the weather.",
          "These windows are a research-based starting point, not a trained model. Each station's inputs are logged every hour. Once a full season of sightings is in, the windows will be checked against what actually happened on the water. If you see bait, [log a sighting](/sightings). Every report makes next year's dates more accurate.",
        ],
      },
      {
        heading: "Planning a trip around the run",
        bullets: [
          "Pick your window from the lists above, then watch the 7-day forecast for the first strong front inside it.",
          "On the Atlantic, plan for the morning after a front, when the wind has swung north to northeast.",
          "On the Gulf, plan around a falling tide close to a new or full moon, ideally right behind a front.",
          "Check the [live map](/sightings) the day before you drive. Recent sightings beat any calendar.",
          "Confirm current [regulations](/guide/regulations) before you keep bait or gamefish.",
        ],
      },
    ],
    related: ["locations", "gulf-coast", "biology", "beaches-hub"],
  },
  {
    slug: "cast-net",
    title: "How to Throw a Cast Net for Mullet: A Step-by-Step Guide",
    category: "Tactics",
    emoji: "🕸️",
    summary:
      "Choosing a net, loading it, and throwing a clean, full circle from the beach or a seawall. Includes the common mistakes that cause pancakes, plus how to fish a pod of mullet during the run.",
    updated: "2026-10-13",
    readMinutes: 9,
    sections: [
      {
        paragraphs: [
          "During the fall run, the best bait on the beach is the mullet swimming past your feet. A cast net turns that bait into a livewell full of fresh mullet in a few throws, but only if the net opens. Most new throwers spend the first few sessions landing a tangled ball of mesh, which anglers call a \"banana\" or a \"taco.\" The good news is that a clean throw comes from a few repeatable habits, not raw strength.",
          "This guide covers how to pick a net, how to load it, how to throw it, and how to fish a moving pod of mullet once you have the throw down.",
        ],
      },
      {
        heading: "Why I wrote this one",
        paragraphs: [
          "I learned to throw a cast net one lopsided throw at a time. Nobody hands you a clean circle. Now my fall weekends are at [Mickler's Landing](/beaches/micklers), teaching my son the same thing: load it, turn your hips, let go in order. He's working through the same pile of tacos and bananas I did, and that's fine. When the net finally opens full over a pod of mullet, you can see it click. It's not something you can buy. You earn it on the beach.",
          "Everything below is what we've worked out on that beach, passed along to you. Go practice on the grass, then come find the bait.",
        ],
      },
      {
        heading: "Parts of a cast net",
        paragraphs: [
          "Know the parts first, because every step below refers to them:",
        ],
        bullets: [
          "Hand line: the long rope you tie to your wrist. It pulls the net closed and brings it back.",
          "Horn: the ring at the top of the net that the hand line runs through.",
          "Brail lines: thin lines running from the horn down to the lead line. When you pull the hand line, they draw the bottom of the net up and trap the fish.",
          "Mesh (or webbing): the net itself.",
          "Lead line: the weighted line around the bottom edge. The weight is what spreads the net and sinks it fast.",
        ],
      },
      {
        heading: "Choosing a net for mullet",
        paragraphs: [
          "Net size is measured by radius, the distance from the horn to the lead line. A bigger net covers more water but is heavier and harder to open. Mesh size is the gap between knots: small mesh catches small bait but sinks slowly, and larger mesh sinks faster but lets small fish through.",
        ],
        bullets: [
          "First net: a 5- or 6-foot radius is a common place to start. It is light enough to learn on and big enough to catch bait.",
          "Finger mullet (3 to 5 inches): small mesh, around 3/8 inch, holds them without gilling them.",
          "Larger run mullet: bigger mesh sinks faster, which matters when a pod is moving quickly. Many anglers use 1/2-inch mesh or larger.",
          "Weight: more lead per foot sinks the net faster in surf and current, and a heavier net is harder to throw. Match the weight to where you fish most.",
        ],
      },
      {
        paragraphs: [
          "Before you buy, check the Florida Fish and Wildlife Conservation Commission (FWC) rules on cast net size and the waters where cast nets are allowed. Some areas have their own limits. The [regulations guide](/guide/regulations) has an overview, but FWC is the final word.",
        ],
      },
      {
        heading: "Loading the net",
        paragraphs: [
          "Most bad throws are decided before the net leaves your hands. Take your time loading it until the steps are automatic.",
        ],
        bullets: [
          "Slip the hand-line loop over the wrist of your throwing hand and cinch it. Never wrap the line around your fingers or hand, because a big fish or a snag can trap them.",
          "Coil the hand line in neat, even loops in that same hand, working toward the horn.",
          "Hold the net at the horn and shake it so it hangs straight, with no twists and the brail lines clear.",
          "Grab the net about a third of the way down from the horn, near your waist, and hold the gathered net and the coiled line together in your throwing hand.",
          "Reach down and pick up a section of the lead line, roughly a third of it, with your other hand. Some throwers drape that section over their throwing shoulder instead.",
          "Many throwers hold one point of the lead line lightly in their teeth to keep the shape. It works, but it's optional, and it only makes sense with a clean net.",
        ],
      },
      {
        heading: "The throw, step by step",
        paragraphs: [
          "Right-handed directions are below. Reverse them if you throw left-handed.",
        ],
        bullets: [
          "Stand with your feet about shoulder width apart, left shoulder pointed roughly at your target.",
          "Rotate your upper body to the right and load your weight on your back foot, as if you were winding up for a sidearm throw.",
          "Swing back through toward the target, leading with your hips. The power comes from turning your body, not from your arms.",
          "Let go in sequence: your throwing hand releases first, then your other hand releases the lead line a split second later. If you're holding the lead line in your teeth, open your mouth as the net leaves.",
          "Follow through in a flat, sweeping motion and keep the hand line free. The spin you put on the net is what makes it open into a circle.",
          "Let the net sink all the way to the bottom. In the surf, give it a couple of seconds longer than you think.",
          "Pull the hand line steadily, hand over hand, to close the net, then bring it in. Lift it by the horn and open the lead line over a bucket to drop the bait.",
        ],
      },
      {
        heading: "Learn on grass first",
        paragraphs: [
          "Practice in a yard or a park before you take the net to the beach. A dry net on grass shows you exactly what shape you're making. Aim for a full circle every time, then work on distance. Twenty throws a day for a week will do more than one long afternoon. Rinse the grass and dirt out of the net before it goes in the water.",
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
        heading: "Common mistakes and fixes",
        bullets: [
          "Net lands as a banana or half-moon: you released both hands at once, or you threw with your arms only. Turn your hips more and let the lead line go a beat after the main net.",
          "Net lands in a ball: there was a twist or tangle in the mesh before you threw. Shake the net out fully and look for crossed brail lines each time you load it.",
          "Net opens but falls short: you're throwing up into the air. Keep the throw flat and low. A net thrown high stalls and closes before it lands.",
          "Fish escape before you pull: you started pulling while the net was still sinking. Wait for the lead line to touch bottom.",
          "Rope burns or a stuck hand: the hand line was wrapped around your hand instead of looped on your wrist. Fix the loop every time you load.",
        ],
      },
      {
        heading: "Throwing on a pod of mullet",
        paragraphs: [
          "During the run, mullet move along the beach in pods. You'll see them as dark patches, flickering silver, or nervous water on the surface. A few habits make a big difference:",
        ],
        bullets: [
          "Throw ahead of the pod, not on top of it. The school will swim into the net as it sinks. If you throw straight on top of a moving pod, most of the fish will be past it before it hits bottom.",
          "Throw toward the edge of the pod. The edges are thinner and easier to cover, and that's where the stragglers are.",
          "Wade only as deep as you're comfortable in moving surf. A cast net is heavy when it's full and wet, and the waves still keep coming.",
          "Watch for what's chasing the bait. Snook, tarpon, jacks, and sharks follow the run, and a fish hitting your net or bucket is a real risk. Keep your bait bucket out of the wash.",
          "Keep only what you'll use. A dozen lively mullet in an aerated bucket fish better than fifty half-dead ones.",
        ],
      },
      {
        heading: "Safety and etiquette",
        bullets: [
          "Look behind you and to the sides before every throw. Never throw near swimmers, other anglers, or anyone walking past.",
          "Don't throw over rocks, pilings, or debris you can't see. A snagged net costs you the net and often time in the water to free it.",
          "Avoid sea turtles, manatees, and birds. If a protected animal gets in your net, keep it in the water and release it as carefully as you can.",
          "Respect posted closures and pier rules. Many fishing piers don't allow cast nets during busy hours, or at all.",
        ],
      },
      {
        heading: "Taking care of the net",
        paragraphs: [
          "Saltwater, sand, and sun wear a net out fast. Rinse it in fresh water after every trip, let it dry hanging up rather than in a bucket, and store it out of direct sunlight. Look over the brail lines and horn every so often. A frayed brail line usually snaps on the throw that matters most. A net cared for this way can last several seasons.",
        ],
      },
      {
        heading: "Putting it to work",
        paragraphs: [
          "Once your bucket is full, the next question is where to fish it. The [tactics guide](/guide/tactics) covers rigging live mullet for the predators that follow the run, and the [timing guide](/guide/run-timing) shows when the run should be at your beach. To find out where the bait is today, check the [live sightings map](/sightings).",
        ],
      },
    ],
    related: ["tactics", "regulations", "run-timing", "gear-shop"],
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
    case "beaches-hub":
      return { href: "/beaches", label: "All Mullet Run Beach Guides" };
    default:
      return null;
  }
}

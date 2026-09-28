/**
 * Editorial content for the Gulf Coast and Panhandle station pages.
 *
 * Gulf stations are mostly passes and river mouths rather than surf beaches:
 * mullet stage in the bays and rivers, then leave through these gaps when a
 * front, cooling water, and a strong outgoing tide line up. Photos are
 * Wikimedia Commons images under CC BY / CC BY-SA, credited on each page.
 */
import type { BeachContent } from "@/lib/content/beaches";

const UPDATED = "2026-09-27";

export const GULF_BEACH_CONTENT: BeachContent[] = [
  {
    id: "pensacola-pass",
    slug: "pensacola-pass",
    title: "Pensacola Pass Mullet Run — Fort Pickens & Bay Outflow Guide",
    description:
      "Pensacola Pass mullet run guide: when Pensacola Bay empties on north winds, how to fish the Fort Pickens side, and live exit scores for the western Panhandle.",
    headline: "Pensacola Pass Mullet Run",
    summary:
      "The westernmost station on the map — the deep pass where Pensacola and Escambia bays pour into the Gulf between Perdido Key and Santa Rosa Island.",
    region: "Panhandle",
    updated: UPDATED,
    keywords: ["pensacola mullet run", "pensacola pass fishing", "fort pickens fishing", "panhandle mullet run"],
    image: {
      src: "/images/beaches/pensacola-pass.jpg",
      alt: "White sand and Gulf water on the Fort Pickens end of Santa Rosa Island near Pensacola Pass",
      width: 1200,
      height: 900,
      credit: "Ebyabe",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:GINS_FL_Fort_Pickens_beach02.jpg",
    },
    about: [
      "Pensacola Pass is the main exit for a large bay system fed by the Escambia, Blackwater, and Yellow rivers. When fall fronts push north wind down the bay, the outgoing water carries staged mullet through the pass and along the Fort Pickens shoreline.",
      "The Fort Pickens area of Gulf Islands National Seashore gives shore anglers access to the east side of the pass; the Perdido Key side is reached from the west. Boat traffic and current are both heavy here.",
    ],
    whyFish: [
      "A narrow, deep pass concentrates bait leaving a large bay system.",
      "Redfish, jacks, and sharks patrol the edges of the channel during the fall push.",
      "North winds behind a front make the outflow — and the bait — easy to read.",
    ],
    tips: [
      "Fish the first strong outgoing tide after a front clears and the wind swings north.",
      "Watch for nervous water and birds along the Fort Pickens side of the channel.",
      "Current is fierce at mid-ebb; heavier leads or jigs keep baits where fish are holding.",
    ],
    access: [
      "Fort Pickens is inside Gulf Islands National Seashore; an entrance fee applies.",
      "Wind and pressure come from the NOAA Pensacola station; when its wind sensor is down the score uses forecast-model wind.",
      "River flow is read from the Escambia River gauge near Molino.",
    ],
    nearby: ["navarre-beach", "destin-east-pass"],
  },
  {
    id: "navarre-beach",
    slug: "navarre-beach",
    title: "Navarre Beach Mullet Run — Pier & Surf Guide",
    description:
      "Navarre Beach mullet run guide: fishing the pier and Santa Rosa Island surf as fall bait moves along the Panhandle, plus live scores and sightings.",
    headline: "Navarre Beach Mullet Run",
    summary:
      "A long, open stretch of Santa Rosa Island surf with one of the longest fishing piers on the Gulf — a classic place to watch fall bait move along the beach.",
    region: "Panhandle",
    updated: UPDATED,
    keywords: ["navarre beach mullet run", "navarre pier fishing", "santa rosa island fishing", "panhandle surf fishing mullet"],
    image: {
      src: "/images/beaches/navarre-beach.jpg",
      alt: "Navarre Beach Fishing Pier reaching into the Gulf of Mexico",
      width: 1200,
      height: 803,
      credit: "Taminar",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Navarre_Beach_Pier_IGP2095.jpg",
    },
    about: [
      "Navarre sits between Pensacola Pass and Destin's East Pass. Mullet leaving either bay system move along this surf, and the pier gives a high vantage point over the bar and trough.",
      "Unlike the passes, Navarre is a beach station: the fish are moving along the shoreline rather than exiting a single gap, so wind and tide timing matter as much as the front itself.",
    ],
    whyFish: [
      "The pier reaches past the bars where bait schools travel.",
      "Clear Panhandle water makes schools and feeding predators easy to spot.",
      "Sits on the travel lane between two major bay exits.",
    ],
    tips: [
      "Scan from the pier deck for dark bait clouds before you cast.",
      "Morning after a front, with north wind laying the surf down, is often the cleanest window.",
      "Cast nets work in the trough when schools push tight to the beach.",
    ],
    access: [
      "The Navarre Beach Fishing Pier charges a fee; public beach access runs along the island road.",
      "Wind and pressure come from the NOAA Pensacola station, with forecast-model wind as a fallback.",
    ],
    nearby: ["pensacola-pass", "destin-east-pass"],
  },
  {
    id: "destin-east-pass",
    slug: "destin-east-pass",
    title: "Destin East Pass Mullet Run — Choctawhatchee Bay Outflow",
    description:
      "Destin East Pass mullet run guide: fishing the jetties and Norriego Point as Choctawhatchee Bay empties, with live exit scores and river flow.",
    headline: "Destin East Pass Mullet Run",
    summary:
      "The single outlet for Choctawhatchee Bay — when the bay drains on a fall front, bait and predators crowd the jetties and the pass.",
    region: "Panhandle",
    updated: UPDATED,
    keywords: ["destin mullet run", "east pass destin fishing", "destin jetties fishing", "choctawhatchee bay mullet"],
    image: {
      src: "/images/beaches/destin-east-pass.jpg",
      alt: "Okaloosa Island surf just west of Destin's East Pass",
      width: 1200,
      height: 800,
      credit: "logopop",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Okaloosa_Island,_FL,_USA_-_panoramio_(1).jpg",
    },
    about: [
      "East Pass is the only connection between Choctawhatchee Bay and the Gulf, so everything leaving the bay funnels through it. The Choctawhatchee River feeds the bay from the east, and a rise in river flow after heavy rain adds to the outflow.",
      "Jetties line the pass, and Norriego Point sits on the harbor side. Expect heavy boat traffic in season.",
    ],
    whyFish: [
      "One bay, one exit — the flow is concentrated.",
      "Jetty rocks hold redfish, sheepshead, and jacks waiting on bait.",
      "The score includes Choctawhatchee River flow, a sign of how hard the bay is flushing.",
    ],
    tips: [
      "Fish the ebb; the incoming tide brings clear Gulf water but less bait movement.",
      "Work the tips of the jetties where the current seam forms.",
      "Be ready for fast current and boat wakes near the channel.",
    ],
    access: [
      "Shore access is along the jetties and the Norriego Point area; parking fills quickly on fall weekends.",
      "Wind, pressure, and water temperature come from the NOAA Panama City Beach station.",
      "River flow is read from the Choctawhatchee River gauge near Bruce.",
    ],
    nearby: ["navarre-beach", "st-andrew-pass"],
  },
  {
    id: "st-andrew-pass",
    slug: "st-andrew-pass",
    title: "St. Andrew Pass Mullet Run — Panama City Beach Jetties",
    description:
      "St. Andrew Pass mullet run guide: fishing the St. Andrews State Park jetties as St. Andrew Bay empties, with live Gulf exit scores.",
    headline: "St. Andrew Pass Mullet Run",
    summary:
      "The jetty-lined entrance to St. Andrew Bay at St. Andrews State Park, where Panama City's bays meet the Gulf.",
    region: "Panhandle",
    updated: UPDATED,
    keywords: ["panama city beach mullet run", "st andrews state park jetties", "st andrew pass fishing", "panama city mullet"],
    image: {
      src: "/images/beaches/st-andrew-pass.jpg",
      alt: "Emerald Gulf water off St. Andrews State Park near St. Andrew Pass",
      width: 1200,
      height: 800,
      credit: "Royalbroil",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Emerald_Coast_Waters_from_St_Andrews_State_Park.jpg",
    },
    about: [
      "St. Andrew Pass drains St. Andrew Bay and its arms. The state park jetties on the west side give anglers a walkable platform right over moving water.",
      "Shell Island lies across the pass to the east and is reached by boat or shuttle.",
    ],
    whyFish: [
      "Jetties put shore anglers directly on the outflow.",
      "Clear water makes it easy to see schools rounding the rocks.",
      "Redfish and jacks set up along the jetty seams in the fall.",
    ],
    tips: [
      "Time the strongest ebb after a front; slack water is usually slow.",
      "Walk the jetty and look for bait showering at the tip.",
      "Wear good footwear — the rocks are uneven and slick.",
    ],
    access: [
      "St. Andrews State Park charges an entrance fee.",
      "Wind, pressure, and water temperature come from the NOAA Panama City Beach station.",
    ],
    nearby: ["destin-east-pass", "cape-san-blas"],
  },
  {
    id: "cape-san-blas",
    slug: "cape-san-blas",
    title: "Cape San Blas Mullet Run — St. Joseph Peninsula Surf Guide",
    description:
      "Cape San Blas mullet run guide: fall bait along the St. Joseph Peninsula surf and the mouth of St. Joseph Bay, with live scores and sightings.",
    headline: "Cape San Blas Mullet Run",
    summary:
      "The hooked tip of the St. Joseph Peninsula, where St. Joseph Bay opens to the Gulf and quiet surf runs for miles.",
    region: "Panhandle",
    updated: UPDATED,
    keywords: ["cape san blas mullet run", "st joseph peninsula fishing", "port st joe mullet", "cape san blas surf fishing"],
    image: {
      src: "/images/beaches/cape-san-blas.jpg",
      alt: "Dunes and surf at St. Joseph Peninsula State Park, north of Cape San Blas",
      width: 1200,
      height: 900,
      credit: "Ebyabe",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:St_Joseph_Peninsula_FL_SP_beach_north01.jpg",
    },
    about: [
      "Cape San Blas wraps around St. Joseph Bay, a clear, grass-lined bay without a big river feeding it. Mullet leaving the bay and moving along the coast pass the cape and the peninsula surf.",
      "It is a beach station on the map: the fish travel the shoreline, so tide and wind timing matter alongside the front.",
    ],
    whyFish: [
      "Remote, uncrowded surf with long sight lines.",
      "The cape shoals concentrate moving bait.",
      "Predators follow schools along the peninsula in the fall.",
    ],
    tips: [
      "Look for schools moving along the first trough on calm mornings after a front.",
      "The bay side can fish well on a falling tide when bait drains off the flats.",
      "Bring everything you need — services are spread out.",
    ],
    access: [
      "St. Joseph Peninsula State Park charges an entrance fee; public beach accesses line the cape road.",
      "Wind, pressure, and water temperature come from the NOAA Apalachicola station.",
    ],
    nearby: ["st-andrew-pass", "st-george-island"],
  },
  {
    id: "st-george-island",
    slug: "st-george-island",
    title: "St. George Island Mullet Run — Sikes Cut & Apalachicola Bay",
    description:
      "St. George Island mullet run guide: fishing Bob Sikes Cut as Apalachicola Bay drains, with live exit scores tied to Apalachicola River flow.",
    headline: "St. George Island Mullet Run",
    summary:
      "Bob Sikes Cut, the man-made pass at the west end of St. George Island, is the fast exit for Apalachicola Bay — Florida's biggest river-fed bay on the Panhandle.",
    region: "Panhandle",
    updated: UPDATED,
    keywords: ["st george island mullet run", "sikes cut fishing", "apalachicola bay mullet", "forgotten coast mullet run"],
    image: {
      src: "/images/beaches/st-george-island.jpg",
      alt: "Gulf surf along the beach at St. George Island State Park",
      width: 1200,
      height: 900,
      credit: "Ebyabe",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:PC_St_George_Island_SP07.jpg",
    },
    about: [
      "Apalachicola Bay is fed by the Apalachicola River, the largest river in Florida by flow. When a front drives north wind down the bay, a lot of water leaves through Sikes Cut and the other passes around the barrier islands.",
      "The cut sits at the gated west end of the island and is mostly fished by boat. Shore anglers use the bridge, the island's public accesses, and the state park on the east end.",
    ],
    whyFish: [
      "Big river, big bay, narrow cut — strong, concentrated outflow.",
      "The score includes Apalachicola River flow, which shapes how hard the bay flushes.",
      "Redfish, trout, and sharks key on bait exiting the cut.",
    ],
    tips: [
      "Boaters: set up on the edges of the cut during the ebb and let the bait come to you.",
      "Shore anglers: fish the bay-side flats on a falling tide as bait drains off.",
      "After heavy rain upriver, expect dirty water and an earlier push.",
    ],
    access: [
      "Sikes Cut is inside a private gated community at the island's west end; boat access is easiest.",
      "Wind, pressure, and water temperature come from the NOAA Apalachicola station.",
      "River flow is read from the Apalachicola River gauge near Blountstown.",
    ],
    nearby: ["cape-san-blas", "st-marks"],
  },
  {
    id: "st-marks",
    slug: "st-marks",
    title: "St. Marks Mullet Run — Apalachee Bay River Mouth",
    description:
      "St. Marks mullet run guide: the historic mullet town where the St. Marks and Wakulla rivers meet Apalachee Bay, with live exit scores and river flow.",
    headline: "St. Marks Mullet Run",
    summary:
      "A historic mullet-fishing community where the St. Marks and Wakulla rivers meet and run out to Apalachee Bay past the St. Marks Lighthouse.",
    region: "Big Bend",
    updated: UPDATED,
    keywords: ["st marks mullet run", "st marks river fishing", "apalachee bay mullet", "wakulla mullet"],
    image: {
      src: "/images/beaches/st-marks.jpg",
      alt: "Sunrise over Apalachee Bay at St. Marks National Wildlife Refuge",
      width: 1200,
      height: 711,
      credit: "James Leon Young",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Red_clouds_at_sunrise_over_Apalachee_Bay_St._Marks_NWR_2020-07-22.jpg",
    },
    about: [
      "St. Marks marks the start of the Big Bend's marsh coast. Mullet gather in the lower rivers and the marsh creeks through the summer, then leave for Apalachee Bay and the Gulf when fall fronts and cooling water arrive.",
      "The town is part of the story of Florida's mullet fishery — commercial netting families here were among those most affected by the 1994 net limitation amendment.",
    ],
    whyFish: [
      "River-mouth staging: fish hold upriver, then exit together.",
      "The score includes St. Marks River flow as a freshwater-flush signal.",
      "The refuge shoreline is wild, shallow, and full of feeding birds in the fall.",
    ],
    tips: [
      "Watch the river mouth and the lighthouse flats on falling tides after a front.",
      "Birds working the shallows are the fastest way to find a moving school.",
      "Shallow water: check the tide before you launch or wade.",
    ],
    access: [
      "The lighthouse area is inside St. Marks National Wildlife Refuge (entrance fee).",
      "Wind, pressure, and water temperature come from the NOAA Apalachicola station — distant, so local wind can differ.",
      "River flow is read from the St. Marks River gauge near Newport.",
    ],
    nearby: ["st-george-island", "steinhatchee"],
  },
  {
    id: "steinhatchee",
    slug: "steinhatchee",
    title: "Steinhatchee Mullet Run — Deadman Bay River Mouth",
    description:
      "Steinhatchee mullet run guide: fall mullet leaving the Steinhatchee River for Deadman Bay, with live exit scores and river salinity.",
    headline: "Steinhatchee Mullet Run",
    summary:
      "A quiet Big Bend river town where the Steinhatchee River empties into Deadman Bay across miles of grass flats.",
    region: "Big Bend",
    updated: UPDATED,
    keywords: ["steinhatchee mullet run", "steinhatchee river fishing", "deadman bay mullet", "big bend mullet run"],
    image: {
      src: "/images/beaches/steinhatchee.jpg",
      alt: "Boats along the Steinhatchee River",
      width: 1200,
      height: 900,
      credit: "Ebyabe",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Steinhatchee_FL_River_west01.jpg",
    },
    about: [
      "Steinhatchee is best known for summer scallops, but the river and its marsh hold mullet well into fall. Fish stage in the lower river and move out over the flats when the water cools and a front passes.",
      "The river gauge here is tidal, so the score watches salinity: a sudden freshening after rain is one of the flush triggers.",
    ],
    whyFish: [
      "Classic Big Bend river-mouth staging.",
      "Huge grass flats hold bait and the trout and redfish that follow it.",
      "Low fishing pressure in the fall.",
    ],
    tips: [
      "Fish the river mouth and the first flats outside it on a falling tide.",
      "Look for mullet jumping at the river mouth in the evening before a front.",
      "Mind the shallow bars at low tide.",
    ],
    access: [
      "Public ramps and marinas line the river in town.",
      "Wind and pressure come from the Keaton Beach station; water temperature from Cedar Key.",
      "Salinity is read from the USGS gauge at Steinhatchee.",
    ],
    nearby: ["st-marks", "cedar-key-suwannee"],
  },
  {
    id: "cedar-key-suwannee",
    slug: "cedar-key-suwannee",
    title: "Cedar Key & Suwannee River Mullet Run Guide",
    description:
      "Cedar Key and Suwannee River mullet run guide: fall mullet leaving the Suwannee and the Cedar Keys flats, with live exit scores and river flow.",
    headline: "Cedar Key & Suwannee River Mullet Run",
    summary:
      "The Suwannee River mouth and the island town of Cedar Key — marsh, oyster bars, and a big river that sets the pace of the Big Bend run.",
    region: "Big Bend",
    updated: UPDATED,
    keywords: ["cedar key mullet run", "suwannee river mullet", "cedar key fishing", "big bend mullet"],
    image: {
      src: "/images/beaches/cedar-key-suwannee.jpg",
      alt: "Beach and Dock Street waterfront at Cedar Key",
      width: 1200,
      height: 900,
      credit: "Ebyabe",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Cedar_Key_Dock_Street01.jpg",
    },
    about: [
      "The Suwannee is one of Florida's largest rivers, and its mouth north of Cedar Key is prime Big Bend staging water. Here mullet do not run a beach; they hold in the river and its creeks, then leave for the Gulf when temperature and moon line up.",
      "Cedar Key's piers and bridges give shore anglers a view over the surrounding flats and channels.",
    ],
    whyFish: [
      "Big-river staging with a clear exit signal when the water cools.",
      "The score includes Suwannee River flow at Wilcox.",
      "Cedar Key's NOAA station provides local wind, pressure, and water temperature.",
    ],
    tips: [
      "Watch the moon: Big Bend exits cluster around new and full moons.",
      "Fish channel edges near oyster bars on the ebb.",
      "Town of Suwannee ramps put you right at the river mouth.",
    ],
    access: [
      "Cedar Key has a public pier and waterfront; Suwannee has public boat ramps.",
      "Wind, pressure, and water temperature come from the NOAA Cedar Key station.",
      "River flow is read from the Suwannee River gauge near Wilcox.",
    ],
    nearby: ["steinhatchee", "crystal-river"],
  },
  {
    id: "crystal-river",
    slug: "crystal-river",
    title: "Crystal River Mullet Run — Spring-Fed River Mouth Guide",
    description:
      "Crystal River mullet run guide: mullet leaving a spring-fed river for Crystal Bay in the fall, with live exit scores and river data.",
    headline: "Crystal River Mullet Run",
    summary:
      "A spring-fed river famous for manatees, running out through marsh and islands to Crystal Bay and the Gulf.",
    region: "Big Bend",
    updated: UPDATED,
    keywords: ["crystal river mullet run", "crystal river fishing", "crystal bay mullet", "citrus county mullet"],
    image: {
      src: "/images/beaches/crystal-river.jpg",
      alt: "Walkway and bridge over the water at Crystal River Preserve State Park",
      width: 1200,
      height: 900,
      credit: "LittleT889",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Crystal_River_Preserve_State_Park_2.jpg",
    },
    about: [
      "Springs keep Crystal River's water temperature steady year-round, which makes the Gulf side the thing to watch. As fall fronts chill the shallow bay outside, mullet that summered in the river and marsh move offshore.",
      "The river is heavily used by manatees and paddlers; slow down and follow the posted zones.",
    ],
    whyFish: [
      "Big schools of mullet summer in the river and its marsh.",
      "The contrast between warm spring water and a cooling bay sharpens the exit.",
      "Redfish and trout feed along the islands at the river mouth.",
    ],
    tips: [
      "Focus on the river mouth and bay islands rather than upriver.",
      "Falling tides after a front are the best bet.",
      "Respect manatee zones — they are enforced.",
    ],
    access: [
      "Public ramps are available in town and near the river mouth.",
      "Wind, pressure, and water temperature come from the NOAA Cedar Key station.",
      "River data is read from the USGS Crystal River gauge (tidally averaged).",
    ],
    nearby: ["cedar-key-suwannee", "homosassa"],
  },
  {
    id: "homosassa",
    slug: "homosassa",
    title: "Homosassa River Mullet Run — Big Bend River Mouth Guide",
    description:
      "Homosassa mullet run guide: the spring-fed Homosassa River and its marsh mouth, with live Gulf exit scores and river flow.",
    headline: "Homosassa River Mullet Run",
    summary:
      "A spring-fed river winding through marsh to the Gulf — the southern end of the Big Bend, and a famous name in fall and spring tarpon lore.",
    region: "Big Bend",
    updated: UPDATED,
    keywords: ["homosassa mullet run", "homosassa river fishing", "homosassa bay mullet", "big bend mullet run"],
    image: {
      src: "/images/beaches/homosassa.jpg",
      alt: "Monkey Island on the Homosassa River",
      width: 1200,
      height: 900,
      credit: "ChrisNovak",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Monkey_Island_on_Homosassa_River,_Florida_USA,_Jan_2013.jpg",
    },
    about: [
      "Homosassa is the southern edge of the Big Bend's marsh coast. Mullet stage in the deep holes of the river and the bay's creeks, then leave together when the water cools and a strong tide pulls them out.",
      "The river mouth opens onto shallow, rocky flats, so the tide matters for both the fish and your boat.",
    ],
    whyFish: [
      "Deep river holes where mullet hold before exiting.",
      "The score includes Homosassa River flow.",
      "Marsh edges hold redfish and trout feeding on the move.",
    ],
    tips: [
      "Fish the mouth and the first rocky flats on the ebb after a front.",
      "Pay close attention to the tide — rocks and bars are unforgiving at low water.",
      "Evenings around new and full moons are worth watching for mass movements.",
    ],
    access: [
      "Public and marina ramps are available along the lower river.",
      "Wind, pressure, and water temperature come from the NOAA Cedar Key station.",
      "River flow is read from the USGS Homosassa River gauge (tidally averaged).",
    ],
    nearby: ["crystal-river", "egmont-fort-desoto"],
  },
  {
    id: "egmont-fort-desoto",
    slug: "egmont-fort-desoto",
    title: "Egmont Key & Fort De Soto Mullet Run — Tampa Bay Mouth",
    description:
      "Egmont Key and Fort De Soto mullet run guide: where Tampa Bay's mullet exit to the Gulf, with pier and pass tips plus live exit scores.",
    headline: "Egmont Key & Fort De Soto Mullet Run",
    summary:
      "The mouth of Tampa Bay — Egmont Key, the shipping channel, and Fort De Soto's piers — where one of Florida's largest estuaries empties into the Gulf.",
    region: "Tampa Bay",
    updated: UPDATED,
    keywords: ["tampa bay mullet run", "egmont key fishing", "fort de soto fishing", "tampa bay mullet"],
    image: {
      src: "/images/beaches/egmont-fort-desoto.jpg",
      alt: "Aerial view of Fort De Soto Park at the mouth of Tampa Bay",
      width: 1200,
      height: 675,
      credit: "Catherine Amoo",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Fort_de_Soto_Beach.jpg",
    },
    about: [
      "Tampa Bay's mullet leave through the bay mouth around Egmont Key and the passes of Fort De Soto. From there many hug the barrier islands south before heading offshore.",
      "Fort De Soto Park's Gulf and Bay piers are the main shore access; Egmont Key itself is reached only by boat or ferry.",
    ],
    whyFish: [
      "A huge bay draining through a handful of gaps.",
      "The piers put you over deep, moving water.",
      "Tarpon, snook, and sharks stack up on the bay mouth in the fall.",
    ],
    tips: [
      "Fish the Gulf Pier on a strong ebb after a front.",
      "Watch Bunces Pass and the park's shorelines for bait moving south.",
      "Boaters: stay clear of the shipping channel.",
    ],
    access: [
      "Fort De Soto Park has a parking fee; piers are open daily.",
      "Egmont Key State Park is boat or ferry access only.",
      "Wind, pressure, and water temperature come from the NOAA St. Petersburg station.",
    ],
    nearby: ["homosassa", "anna-maria"],
  },
  {
    id: "anna-maria",
    slug: "anna-maria",
    title: "Anna Maria Island Mullet Run — Passage Key Inlet Guide",
    description:
      "Anna Maria Island mullet run guide: Passage Key Inlet and the north end beaches as Tampa Bay's mullet move south, with live scores.",
    headline: "Anna Maria Island Mullet Run",
    summary:
      "The north tip of Anna Maria Island at Passage Key Inlet, on the south side of Tampa Bay's mouth.",
    region: "Tampa Bay",
    updated: UPDATED,
    keywords: ["anna maria island mullet run", "passage key inlet fishing", "bean point fishing", "anna maria mullet"],
    image: {
      src: "/images/beaches/anna-maria.jpg",
      alt: "Gulf beach on Anna Maria Island",
      width: 1200,
      height: 900,
      credit: "Bfpage",
      license: "CC BY 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:My_Day_on_Anna_Maria_Island_-_Nov_30_2009_028.JPG",
    },
    about: [
      "Passage Key Inlet is the southern exit from lower Tampa Bay. Mullet leaving the bay and those hugging the barrier islands southbound both pass the north end of the island.",
      "Bean Point and the island's piers give shore anglers several ways to watch the inlet.",
    ],
    whyFish: [
      "Two traffic lanes meet here: bay exits and island-hugging schools.",
      "Clear beach water makes schools easy to see from shore.",
      "Snook and redfish work the inlet edges in the fall.",
    ],
    tips: [
      "Walk Bean Point on a falling tide and look for bait along the beach.",
      "Cast nets along the beach trough when schools push close.",
      "Mornings after a front are usually the calmest.",
    ],
    access: [
      "Public beach accesses line the island; parking is limited.",
      "Wind, pressure, and water temperature come from the NOAA St. Petersburg station.",
    ],
    nearby: ["egmont-fort-desoto", "longboat-pass"],
  },
  {
    id: "longboat-pass",
    slug: "longboat-pass",
    title: "Longboat Pass Mullet Run — Coquina Beach & Bridge Guide",
    description:
      "Longboat Pass mullet run guide: fishing the pass between Anna Maria Island and Longboat Key as Sarasota Bay drains, with live exit scores.",
    headline: "Longboat Pass Mullet Run",
    summary:
      "The pass between Anna Maria Island and Longboat Key, where upper Sarasota Bay drains past Coquina Beach.",
    region: "Sarasota & Charlotte Harbor",
    updated: UPDATED,
    keywords: ["longboat pass fishing", "longboat pass mullet", "coquina beach fishing", "sarasota mullet run"],
    image: {
      src: "/images/beaches/longboat-pass.jpg",
      alt: "Coquina Beach jetty at Longboat Pass, south end of Anna Maria Island",
      width: 1200,
      height: 675,
      credit: "Gregory Urbano",
      license: "CC BY 2.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Longboat_Pass_Coquina_Jetty_(38954573295).jpg",
    },
    about: [
      "Longboat Pass carries water between Sarasota Bay and the Gulf. On strong fall ebbs, bait leaving the bay and schools traveling the beaches meet at the pass.",
      "Coquina Beach and the bridge area give shore access on the north side.",
    ],
    whyFish: [
      "A compact pass with strong ebb currents.",
      "Beach-traveling schools and bay exits overlap here.",
      "Snook and jacks feed along the pass edges.",
    ],
    tips: [
      "Fish the strongest part of the ebb after a front.",
      "Work the beach just north of the pass when schools stack against it.",
      "Be careful of fast water off the point.",
    ],
    access: [
      "Coquina Beach has a large parking area.",
      "Wind, pressure, and water temperature come from the NOAA St. Petersburg station.",
    ],
    nearby: ["anna-maria", "venice-inlet"],
  },
  {
    id: "venice-inlet",
    slug: "venice-inlet",
    title: "Venice Inlet Mullet Run — North & South Jetty Guide",
    description:
      "Venice Inlet mullet run guide: fishing the Venice jetties as fall mullet move south along the Sarasota County coast, with live exit scores.",
    headline: "Venice Inlet Mullet Run",
    summary:
      "The jetties at Venice Inlet, one of the busiest shore-fishing spots on the southwest coast and a pinch point for bait moving south.",
    region: "Sarasota & Charlotte Harbor",
    updated: UPDATED,
    keywords: ["venice jetty fishing", "venice inlet mullet", "venice mullet run", "sarasota county mullet run"],
    image: {
      src: "/images/beaches/venice-inlet.jpg",
      alt: "Angler on the Venice Inlet jetty as a boat heads out at sunset",
      width: 1200,
      height: 900,
      credit: "Yinzer1",
      license: "CC BY 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Venice_Jettys.jpg",
    },
    about: [
      "Venice Inlet connects Roberts Bay and the Intracoastal to the Gulf. Its North and South jetties give shore anglers direct access to moving water.",
      "In the fall, mullet traveling the beaches from the north and schools leaving the local bays both pass the jetties.",
    ],
    whyFish: [
      "Walkable jetties right over the current.",
      "Heavy bait traffic draws snook, redfish, and jacks.",
      "Easy to reach, easy to check before work.",
    ],
    tips: [
      "Watch for bait rounding the jetty tips on the ebb.",
      "Try the beach just south of the south jetty when schools push tight.",
      "Crowds build fast on good mornings — arrive early.",
    ],
    access: [
      "Parking at both jetties; the south jetty has a larger lot.",
      "Wind and pressure come from the Venice station; water temperature from the offshore WFS C10 buoy, which can lag cooling close to shore.",
    ],
    nearby: ["longboat-pass", "stump-pass"],
  },
  {
    id: "stump-pass",
    slug: "stump-pass",
    title: "Stump Pass Mullet Run — Englewood & Lemon Bay Guide",
    description:
      "Stump Pass mullet run guide: fishing the pass at Stump Pass Beach State Park as Lemon Bay drains, with live Gulf exit scores.",
    headline: "Stump Pass Mullet Run",
    summary:
      "A natural pass at the south tip of Manasota Key that drains Lemon Bay near Englewood.",
    region: "Sarasota & Charlotte Harbor",
    updated: UPDATED,
    keywords: ["stump pass fishing", "stump pass mullet", "englewood mullet run", "lemon bay mullet"],
    image: {
      src: "/images/beaches/stump-pass.jpg",
      alt: "Sea oats and Gulf water at Stump Pass Beach State Park",
      width: 1200,
      height: 900,
      credit: "Ebyabe",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Stump_Pass_Beach_SP_beach02.jpg",
    },
    about: [
      "Stump Pass is the outlet for much of Lemon Bay. It shifts with storms and dredging, so its bars change from year to year.",
      "Shore access is through Stump Pass Beach State Park, with a walk to the pass itself.",
    ],
    whyFish: [
      "A smaller, quieter pass than its neighbors.",
      "Lemon Bay's mullet exit here on the fall ebbs.",
      "Snook and redfish work the pass edges.",
    ],
    tips: [
      "Plan for the walk — bring only what you can carry.",
      "Fish the ebb after a front, focusing on the bar edges.",
      "Watch the beach north of the pass for traveling schools.",
    ],
    access: [
      "Stump Pass Beach State Park charges an entrance fee.",
      "Tide predictions come from the Don Pedro Island station; wind from the Venice station; water temperature from the offshore WFS C10 buoy.",
    ],
    nearby: ["venice-inlet", "boca-grande-pass"],
  },
  {
    id: "boca-grande-pass",
    slug: "boca-grande-pass",
    title: "Boca Grande Pass Mullet Run — Charlotte Harbor Outflow Guide",
    description:
      "Boca Grande Pass mullet run guide: Charlotte Harbor's deep outflow at Gasparilla Island, in the heart of Florida's mullet country, with live exit scores.",
    headline: "Boca Grande Pass Mullet Run",
    summary:
      "The deep pass at the south end of Gasparilla Island where Charlotte Harbor meets the Gulf — in the stretch of coast that produces most of Florida's mullet landings.",
    region: "Sarasota & Charlotte Harbor",
    updated: UPDATED,
    keywords: ["boca grande mullet run", "boca grande pass fishing", "charlotte harbor mullet", "gasparilla island fishing"],
    image: {
      src: "/images/beaches/boca-grande-pass.jpg",
      alt: "Port Boca Grande Lighthouse on Gasparilla Island beside Boca Grande Pass",
      width: 1200,
      height: 900,
      credit: "Ebyabe",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Gasparilla_Island_SP_lighthouse02.jpg",
    },
    about: [
      "Charlotte Harbor is fed by the Peace and Myakka rivers and drains mainly through Boca Grande Pass. The coast from Tampa Bay to Charlotte Harbor accounts for the large majority of Florida's commercial striped mullet landings, so fall mullet movement here is heavy.",
      "The pass is deep and fast, and it is best known worldwide for tarpon. Gasparilla Island State Park sits at the south tip beside the lighthouse.",
    ],
    whyFish: [
      "The main exit for one of Florida's largest estuaries.",
      "The score includes Peace River flow, a driver of how hard the harbor flushes.",
      "Big predators — tarpon, sharks, and jacks — hold in the pass.",
    ],
    tips: [
      "From shore, fish the beach near the lighthouse on the ebb.",
      "Boaters: the pass is deep with strong current — know the rules and the traffic.",
      "After heavy rain on the Peace River, expect a stronger, earlier push.",
    ],
    access: [
      "Gasparilla Island has a causeway toll; the state park charges an entrance fee.",
      "Wind, pressure, and water temperature come from the NOAA Fort Myers station, about 25 miles away.",
      "River flow is read from the Peace River gauge at Arcadia.",
    ],
    nearby: ["stump-pass", "redfish-pass"],
  },
  {
    id: "redfish-pass",
    slug: "redfish-pass",
    title: "Redfish Pass Mullet Run — Captiva & North Captiva Guide",
    description:
      "Redfish Pass mullet run guide: fishing the pass between Captiva and North Captiva as Pine Island Sound drains, with live exit scores.",
    headline: "Redfish Pass Mullet Run",
    summary:
      "A deep pass between Captiva and North Captiva that drains Pine Island Sound.",
    region: "Southwest Florida",
    updated: UPDATED,
    keywords: ["redfish pass fishing", "captiva mullet run", "pine island sound mullet", "southwest florida mullet run"],
    image: {
      src: "/images/beaches/redfish-pass.jpg",
      alt: "Captiva Pass and North Captiva Island seen from Cayo Costa; Redfish Pass is at North Captiva's southern tip",
      width: 1200,
      height: 858,
      credit: "James St. John",
      license: "CC BY 2.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Captiva_Pass_%26_North_Captiva_Island_(view_from_Cayo_Costa_Island,_Florida,_USA)_2_(23769694284).jpg",
    },
    about: [
      "Redfish Pass links Pine Island Sound to the Gulf. On fall ebbs the sound's mullet leave through it and the neighboring passes.",
      "The north tip of Captiva gives limited shore access; most anglers fish it by boat.",
    ],
    whyFish: [
      "Deep water close to the beach concentrates bait and predators.",
      "Pine Island Sound holds big numbers of mullet before the run.",
      "Snook and tarpon feed along the pass.",
    ],
    tips: [
      "Boat anglers do best drifting the edges on the ebb.",
      "From shore, fish the Captiva side at the tip.",
      "Current is strong — plan anchoring carefully.",
    ],
    access: [
      "Captiva has very limited parking.",
      "Wind, pressure, and water temperature come from the NOAA Fort Myers station.",
    ],
    nearby: ["boca-grande-pass", "sanibel"],
  },
  {
    id: "sanibel",
    slug: "sanibel",
    title: "Sanibel Mullet Run — Blind Pass & Island Beaches Guide",
    description:
      "Sanibel mullet run guide: fishing Blind Pass and the Sanibel-Captiva beaches as fall bait moves south, with live scores and sightings.",
    headline: "Sanibel Mullet Run",
    summary:
      "Blind Pass between Sanibel and Captiva, and the island's west-facing beaches where schools travel south.",
    region: "Southwest Florida",
    updated: UPDATED,
    keywords: ["sanibel mullet run", "blind pass fishing", "sanibel fishing", "captiva beach fishing"],
    image: {
      src: "/images/beaches/sanibel.jpg",
      alt: "Sanibel Lighthouse at the east end of Sanibel Island",
      width: 1200,
      height: 800,
      credit: "Pete Markham",
      license: "CC BY-SA 2.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Florida_Trip_-_March_2019_-_Sanibel_Lighthouse_(33724041868).jpg",
    },
    about: [
      "Sanibel's Gulf beaches face the traffic lane for schools moving south from Charlotte Harbor and Pine Island Sound. Blind Pass, between Sanibel and Captiva, is the local exit.",
      "It is treated as a beach station on the map: watch the shoreline as much as the pass.",
    ],
    whyFish: [
      "Clear water and long beaches make schools easy to spot.",
      "Blind Pass adds a local outflow on the ebb.",
      "Snook cruise the beach trough in the fall.",
    ],
    tips: [
      "Walk the beach early and look for dark bait clouds just off the sand.",
      "Fish Blind Pass on falling tides after a front.",
      "Check local rules — parts of the island restrict parking and fishing areas.",
    ],
    access: [
      "Sanibel charges a causeway toll and parking fees.",
      "Wind, pressure, and water temperature come from the NOAA Fort Myers station.",
    ],
    nearby: ["redfish-pass", "wiggins-pass"],
  },
  {
    id: "wiggins-pass",
    slug: "wiggins-pass",
    title: "Wiggins Pass Mullet Run — Delnor-Wiggins State Park Guide",
    description:
      "Wiggins Pass mullet run guide: fishing the pass at Delnor-Wiggins Pass State Park as the Cocohatchee River drains, with live exit scores.",
    headline: "Wiggins Pass Mullet Run",
    summary:
      "A small pass at the north end of Naples where the Cocohatchee River and its backwaters meet the Gulf.",
    region: "Southwest Florida",
    updated: UPDATED,
    keywords: ["wiggins pass fishing", "wiggins pass mullet", "delnor wiggins fishing", "naples mullet run"],
    image: {
      src: "/images/beaches/wiggins-pass.jpg",
      alt: "Beach at Delnor-Wiggins Pass State Park",
      width: 1200,
      height: 900,
      credit: "Ebyabe",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Delnor-Wiggins_SP_beach01.jpg",
    },
    about: [
      "Wiggins Pass drains a mangrove-lined backwater system. In the fall its local mullet leave on the ebb, and schools moving down the beaches pass the state park shoreline.",
      "Delnor-Wiggins Pass State Park gives walkable access to the pass on the south side.",
    ],
    whyFish: [
      "Compact pass that is easy to read.",
      "Mangrove backwaters hold mullet until the water cools.",
      "Snook are a staple along the pass in the fall.",
    ],
    tips: [
      "Fish the park's north end on the ebb.",
      "Watch the beach south of the pass for traveling schools.",
      "Mornings are calmer and less crowded.",
    ],
    access: [
      "Delnor-Wiggins Pass State Park charges an entrance fee.",
      "Wind, pressure, and water temperature come from the NOAA Fort Myers station.",
    ],
    nearby: ["sanibel", "naples"],
  },
  {
    id: "naples",
    slug: "naples",
    title: "Naples Mullet Run — Naples Pier & Beach Guide",
    description:
      "Naples mullet run guide: fishing the Naples Pier and beaches as fall mullet move down the southwest coast, with live scores and sightings.",
    headline: "Naples Mullet Run",
    summary:
      "The Naples Pier and the city's long Gulf beaches, late in the southwest Florida run.",
    region: "Southwest Florida",
    updated: UPDATED,
    keywords: ["naples mullet run", "naples pier fishing", "naples beach fishing", "southwest florida mullet"],
    image: {
      src: "/images/beaches/naples.jpg",
      alt: "Anglers at the end of the Naples Pier",
      width: 1200,
      height: 900,
      credit: "quadell",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:End_of_the_Naples_Pier.jpeg",
    },
    about: [
      "Naples sits near the southern end of the Gulf run. Schools that left the bays to the north move along these beaches, usually later in the season than the Panhandle and Big Bend.",
      "The Naples Pier gives a high view over the bar, and the beaches run for miles in both directions.",
    ],
    whyFish: [
      "The pier puts you over the travel lane.",
      "Late-season timing gives a second shot after northern spots slow down.",
      "Snook, jacks, and sharks follow the bait along the beach.",
    ],
    tips: [
      "Scan from the pier for bait clouds and birds before fishing.",
      "Calm mornings after a front are the easiest to read.",
      "Cast nets work along the beach trough when schools come close.",
    ],
    access: [
      "The Naples Pier is free to fish; parking is metered nearby.",
      "Wind, pressure, and water temperature come from the NOAA Fort Myers station.",
    ],
    nearby: ["wiggins-pass", "marco-island"],
  },
  {
    id: "marco-island",
    slug: "marco-island",
    title: "Marco Island Mullet Run — Caxambas Pass Guide",
    description:
      "Marco Island mullet run guide: Caxambas Pass at the south end of the island, the last Gulf station before the Ten Thousand Islands, with live scores.",
    headline: "Marco Island Mullet Run",
    summary:
      "Caxambas Pass at the south end of Marco Island — the southernmost Gulf station on the map, at the edge of the Ten Thousand Islands.",
    region: "Southwest Florida",
    updated: UPDATED,
    keywords: ["marco island mullet run", "caxambas pass fishing", "marco island fishing", "ten thousand islands mullet"],
    image: {
      src: "/images/beaches/marco-island.jpg",
      alt: "Wide Gulf beach on Marco Island",
      width: 1200,
      height: 803,
      credit: "olekinderhook",
      license: "CC BY 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Marco_Island_Beach,_Marco_Island,_Florida_-_panoramio.jpg",
    },
    about: [
      "Caxambas Pass drains the bays and mangrove islands at the south end of Marco. It is one of the last stops for the Gulf run before the Ten Thousand Islands.",
      "Timing here is late: the score's season window runs weeks behind the Panhandle.",
    ],
    whyFish: [
      "Late-season action after the northern stations quiet down.",
      "Mangrove backcountry holds large numbers of mullet.",
      "Snook, redfish, and tarpon feed around the pass.",
    ],
    tips: [
      "Fish the ebb at the pass edges after a front.",
      "Explore the backcountry creek mouths on falling tides.",
      "Current and shoals change often — go slow in a boat.",
    ],
    access: [
      "Caxambas Park has a public boat ramp.",
      "Wind, pressure, and water temperature come from the NOAA Fort Myers station, about 50 miles north.",
    ],
    nearby: ["naples", "wiggins-pass"],
  },
];

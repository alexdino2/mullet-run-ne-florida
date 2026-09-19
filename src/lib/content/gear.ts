/**
 * Affiliate gear catalog for the mullet run.
 *
 * Items are described generically (type + search query) rather than as fake
 * SKUs, and links resolve through `amazonSearch()` so they carry the
 * Associates tag when one is configured and still work when it isn't. Swap in
 * direct retailer/Impact-Radius links per item as partnerships are signed.
 */

export interface GearItem {
  name: string;
  /** Search query used to build the affiliate link. */
  query: string;
  blurb: string;
  /** Rough price band for scannability. */
  tier: "$" | "$$" | "$$$";
}

export interface GearCategory {
  id: string;
  title: string;
  intent: string;
  items: GearItem[];
}

export const GEAR: GearCategory[] = [
  {
    id: "rods",
    title: "Surf & Inlet Rods",
    intent:
      "Length to reach past the first bar and backbone to turn a beach tarpon.",
    items: [
      {
        name: "9–10' Surf Spinning Rod (medium-heavy)",
        query: "10 foot surf spinning rod medium heavy",
        blurb:
          "The all-rounder for the run — long enough to cast over the trough, stiff enough for big predators.",
        tier: "$$",
      },
      {
        name: "8' Inshore Rod (medium)",
        query: "8 foot inshore spinning rod medium",
        blurb:
          "For inlets, jetties, and working plugs where you don't need max casting distance.",
        tier: "$",
      },
      {
        name: "11'+ Heavy Surf Rod",
        query: "12 foot heavy surf casting rod",
        blurb:
          "When sharks are on the bait and you're fishing big cut baits far out.",
        tier: "$$$",
      },
    ],
  },
  {
    id: "reels",
    title: "Spinning Reels",
    intent:
      "Line capacity and drag for fish that dump you into the next sandbar.",
    items: [
      {
        name: "6000–8000 Series Saltwater Spinning Reel",
        query: "8000 saltwater spinning reel sealed drag",
        blurb:
          "The workhorse size for surf tarpon, big jacks, and sharks. Look for a sealed drag.",
        tier: "$$$",
      },
      {
        name: "4000–5000 Series Reel",
        query: "5000 inshore spinning reel saltwater",
        blurb:
          "Lighter combo for snook, reds, and mackerel picking off the edges of a pod.",
        tier: "$$",
      },
    ],
  },
  {
    id: "line",
    title: "Line & Leader",
    intent: "Braid to cut through current; abrasion-resistant leader for structure.",
    items: [
      {
        name: "30–50 lb Braided Line",
        query: "50 lb braided fishing line saltwater",
        blurb:
          "Thin diameter for distance and zero stretch for hooksets at range.",
        tier: "$$",
      },
      {
        name: "40–80 lb Fluorocarbon Leader",
        query: "60 lb fluorocarbon leader saltwater",
        blurb:
          "Heavy leader survives a mullet's abrasive mouth and inlet structure.",
        tier: "$",
      },
      {
        name: "Single-Strand / Knottable Wire",
        query: "knottable wire leader toothy fish",
        blurb: "Add a short bite tippet when mackerel and sharks show up.",
        tier: "$",
      },
    ],
  },
  {
    id: "lures",
    title: "Lures That Match the Mullet",
    intent: "Big profiles that imitate a fleeing or wounded baitfish.",
    items: [
      {
        name: "Large Topwater Walking Plugs",
        query: "large saltwater topwater walking plug",
        blurb:
          "Big spook-style plugs draw ferocious blowups when fish are corralling bait on top.",
        tier: "$",
      },
      {
        name: "Pencil Poppers",
        query: "pencil popper saltwater surf",
        blurb: "Long casts and a splashy retrieve to call fish up from distance.",
        tier: "$",
      },
      {
        name: "5–7\" Paddle-Tail Swimbaits",
        query: "7 inch paddle tail swimbait saltwater",
        blurb:
          "Sub-surface option for picking off stragglers under a pod on a jig head.",
        tier: "$",
      },
      {
        name: "Casting Spoons",
        query: "saltwater casting spoon mackerel",
        blurb: "Distance and flash for Spanish mackerel and jacks on the fringes.",
        tier: "$",
      },
    ],
  },
  {
    id: "bait-terminal",
    title: "Bait & Terminal Tackle",
    intent: "Everything to fish live or fresh mullet in the surf.",
    items: [
      {
        name: "Cast Net (8–10 ft radius)",
        query: "10 foot cast net saltwater bait",
        blurb:
          "Catch your own mullet — legal recreational gear and the cheapest live bait there is.",
        tier: "$$",
      },
      {
        name: "Circle Hooks (5/0–8/0)",
        query: "7/0 circle hooks saltwater",
        blurb:
          "Better hookups and cleaner releases when free-lining or fishing on the bottom.",
        tier: "$",
      },
      {
        name: "Fish-Finder Surf Rig Kit",
        query: "fish finder surf rig kit",
        blurb:
          "Sliding-sinker rigs to hold a bait in the trough on a moving tide.",
        tier: "$",
      },
    ],
  },
];

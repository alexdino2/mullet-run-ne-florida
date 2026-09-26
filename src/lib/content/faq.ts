/**
 * Frequently-asked questions about the Florida mullet run.
 *
 * These answer the highest-volume seasonal searches directly — above all
 * "where are the mullet right now" — so the site can win featured snippets and
 * People-Also-Ask placements. The same data feeds both the on-page FAQ UI and
 * the FAQPage structured data (JSON-LD), keeping the two in sync.
 *
 * Answers are plain text (no markup) so they can be reused verbatim inside
 * schema.org `acceptedAnswer.text` without escaping surprises.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = [
  {
    question: "Where are the mullet right now in Florida?",
    answer:
      "The mullet run moves north to south down Florida's Atlantic coast through the fall, so the freshest answer is the live sightings map on this site. Anglers report schools as they spot them, station by station — from Mickler's Landing and Jacksonville Beach in Northeast Florida down through Ponce Inlet, Cocoa Beach, Sebastian Inlet, Fort Pierce, and Jupiter to Fort Lauderdale and Miami Beach. Check the map plus each beach's live opportunity score to see where bait and predators are stacking up today.",
  },
  {
    question: "When is the Florida mullet run in 2026?",
    answer:
      "The run usually starts in late August to early September in Northeast and Central Florida, peaks from mid-September through October, and can linger into late November in South Florida. The exact timing shifts every year with the weather — cooling nearshore water toward the upper 60s Fahrenheit and the first autumn cold fronts are the main triggers.",
  },
  {
    question: "What are the best places to see the mullet run?",
    answer:
      "Inlets are the highest-percentage spots because moving water funnels the bait through a narrow gap and gamefish stack up to ambush it. Going roughly north to south: Mickler's Landing, the St. Johns River mouth at Mayport, St. Augustine Beach, Ponce Inlet, Cocoa Beach, Sebastian Inlet, Fort Pierce Inlet, Jupiter Inlet, and on to Fort Lauderdale and Miami Beach late in the season.",
  },
  {
    question: "What triggers the mullet run?",
    answer:
      "Falling water temperature is the primary catalyst — mullet begin moving seaward as nearshore water drops toward about 68 Fahrenheit. The first autumn cold fronts amplify it: a sharp drop in barometric pressure and a shift to north or northeast wind tends to push the biggest pods tight against the beach on a falling tide.",
  },
  {
    question: "How do I know if the mullet run is happening at my beach?",
    answer:
      "Watch the water and the sky: nervous, showering bait at the surface and diving birds mean a pod is under attack. On this site, cross-check the live opportunity score for wind, tide, water temperature, and season, then read the crowdsourced sightings for your stretch of coast before you commit to a drive.",
  },
];

/**
 * FAQ tuned for the "Florida mullet tracker" landing page — same facts as
 * the core FAQ, worded around the live tracker product and how to use it.
 */
export const TRACKER_FAQ: FaqItem[] = [
  {
    question: "What is the Florida mullet tracker?",
    answer:
      "The Florida mullet tracker is a live dashboard for the fall bait migration along Florida's Atlantic coast. It scores each beach from public wind, tide, and buoy data, plots crowdsourced school sightings on a map, and highlights the next best fishing window — from Northeast Florida through the Space Coast and south to Miami.",
  },
  {
    question: "How does the Florida mullet tracker score a beach?",
    answer:
      "Each station gets a transparent 0–100 opportunity score built from season timing, wind direction and speed, recent NE-to-E wind pattern, and tide stage. Sightings are shown next to the score but are not part of it yet, so the rating stays grounded in free public data even when reports are sparse.",
  },
  {
    question: "Where are the mullet right now in Florida?",
    answer:
      "Open the live migration map on the tracker and scan recent crowd reports station by station. The run moves north to south, so Northeast Florida beaches usually light up first, then Ponce Inlet, Cocoa Beach, Sebastian Inlet, Fort Pierce, Jupiter, and eventually Fort Lauderdale and Miami Beach. Pair the map with each beach's opportunity score before you drive.",
  },
  {
    question: "When should I check the Florida mullet tracker during the run?",
    answer:
      "Check in the morning before you leave and again after the first cold front or wind shift. The tracker refreshes coastal conditions throughout the day and surfaces the next best window over the coming ~48 hours, so you can time falling tides and favorable NE-through-E wind instead of guessing from social media alone.",
  },
];

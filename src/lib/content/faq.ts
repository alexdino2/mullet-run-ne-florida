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

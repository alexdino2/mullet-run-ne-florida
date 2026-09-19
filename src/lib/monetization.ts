/**
 * Monetization configuration.
 *
 * Every revenue integration is opt-in and driven by public environment
 * variables so the site runs cleanly with nothing configured. When an ID is
 * absent the UI degrades to an honest, labeled placeholder (ads) or an
 * un-tagged link (affiliate) rather than shipping a fake credential.
 *
 * Phases mirror the growth roadmap:
 *   1. Audience   — free content, display ads, affiliate gear links.
 *   2. Lead-gen   — charter captain directory + sponsored placements.
 *   3. Membership — the "Insider" subscription waitlist.
 */

/** Trim + drop empty strings so `""` behaves like "unset". */
function opt(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

export const monetization = {
  /**
   * Display-ad publisher/client ID (e.g. Google AdSense `ca-pub-…`, or a
   * Raptive/Mediavine site id once the traffic threshold is crossed). When
   * unset, ad slots render as labeled placeholders.
   */
  adsClient: opt(process.env.NEXT_PUBLIC_ADS_CLIENT),

  /** Amazon Associates store tag appended to product/search links. */
  amazonTag: opt(process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG),

  /** Where captains ask to be listed in the charter directory. */
  charterContactEmail:
    opt(process.env.NEXT_PUBLIC_CHARTER_CONTACT_EMAIL) ??
    "captains@floridamulletrun.com",

  /** Optional external URL for the Insider membership waitlist form. */
  insiderWaitlistUrl: opt(process.env.NEXT_PUBLIC_INSIDER_WAITLIST_URL),

  /** Where Insider waitlist signups go when no external form is configured. */
  insiderContactEmail:
    opt(process.env.NEXT_PUBLIC_INSIDER_CONTACT_EMAIL) ??
    "insider@floridamulletrun.com",
} as const;

export const adsEnabled = Boolean(monetization.adsClient);

export const AFFILIATE_DISCLOSURE =
  "Some links on this page are affiliate links. If you buy through them we may " +
  "earn a small commission at no extra cost to you. It helps keep Florida " +
  "Mullet Run free. We only list gear we'd actually throw during the run.";

/**
 * Build an Amazon search deep-link for a product query, tagged with the
 * Associates store id when configured. Returns a plain (untagged) search URL
 * otherwise so the link still works.
 */
export function amazonSearch(query: string): string {
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  return monetization.amazonTag
    ? `${base}&tag=${encodeURIComponent(monetization.amazonTag)}`
    : base;
}

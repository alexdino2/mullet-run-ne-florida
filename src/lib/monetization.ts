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

/** The site's approved Google AdSense publisher (client) id. */
export const ADSENSE_CLIENT = "ca-pub-4183912956441070";

/** AdSense ad unit "FMR – In-content responsive" (responsive display). */
export const ADSENSE_IN_CONTENT_SLOT = "2953754323";

export const monetization = {
  /**
   * Display-ad publisher/client ID. Defaults to the approved AdSense account;
   * `NEXT_PUBLIC_ADS_CLIENT` overrides it (e.g. for a fork or a future
   * Raptive/Mediavine migration).
   */
  // Keep public env accesses static so Next.js replaces them at build time.
  // Aliasing `process.env` leaves a runtime `process` reference in browser
  // bundles, where the Node.js global does not exist.
  adsClient: opt(process.env.NEXT_PUBLIC_ADS_CLIENT) ?? ADSENSE_CLIENT,

  /**
   * Default AdSense ad-unit id (`data-ad-slot`) for in-page `<AdSlot>` units.
   * `NEXT_PUBLIC_ADS_SLOT` overrides it; individual placements can pass their
   * own `slot` to report separately in AdSense.
   */
  adsSlot: opt(process.env.NEXT_PUBLIC_ADS_SLOT) ?? ADSENSE_IN_CONTENT_SLOT,

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

/** AdSense loader URL; loading it on every page also powers Auto ads. */
export const adsScriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${monetization.adsClient}`;

/**
 * Pages that must not request ads, including Auto ads. Insider is still a
 * pre-launch waitlist. Mirror this list under AdSense → Ads → Auto ads →
 * Page exclusions, which also covers anchor ads that persist across
 * client-side navigation.
 */
export const AD_FREE_PATHS = ["/insider"] as const;

export function isAdFreePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return AD_FREE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/** Publisher id as `ads.txt` expects it (`pub-…`, without the `ca-` prefix). */
export const adsPublisherId = monetization.adsClient.replace(/^ca-/, "");

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

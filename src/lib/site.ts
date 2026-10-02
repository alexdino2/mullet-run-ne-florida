/**
 * Canonical origin for the site. Vercel serves production from the www host
 * and 308-redirects the apex to it, so canonical tags, JSON-LD, robots.txt and
 * the sitemap must all use www or search engines see every URL as a redirect.
 */
export const SITE_URL = "https://www.floridamulletrun.com";

/**
 * General inbox for readers, privacy requests and corrections, shown on the
 * Contact and Privacy pages. `NEXT_PUBLIC_CONTACT_EMAIL` overrides it.
 */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "hello@floridamulletrun.com";

/** Public Instagram account, linked from the footer, About and Contact. */
export const INSTAGRAM_URL = "https://www.instagram.com/floridamulletrun/";

/**
 * Google Tag Manager container loaded on every page; it carries the GA4 tag
 * for property 556083705. `NEXT_PUBLIC_GTM_ID` overrides it.
 */
export const GTM_CONTAINER_ID =
  process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-PMG6VKNN";

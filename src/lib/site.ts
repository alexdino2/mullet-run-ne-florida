/**
 * Canonical origin for the site. Vercel serves production from the www host
 * and 308-redirects the apex to it, so canonical tags, JSON-LD, robots.txt and
 * the sitemap must all use www or search engines see every URL as a redirect.
 */
export const SITE_URL = "https://www.floridamulletrun.com";

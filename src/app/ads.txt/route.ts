/**
 * Authorized Digital Sellers file (`/ads.txt`).
 *
 * Google AdSense (and other programmatic sellers) require a valid `ads.txt`
 * at the site root declaring which accounts are authorized to sell this
 * site's inventory — without it, AdSense throttles or refuses to serve.
 *
 * Keep this declaration available independently of display-ad configuration:
 * AdSense must be able to crawl it while the site is being verified, before
 * ad units are enabled.
 */
export function GET() {
  // f08c47fec0942fa0 is Google's fixed ads.txt certification authority id.
  const body =
    "google.com, pub-4183912956441070, DIRECT, f08c47fec0942fa0\n";

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

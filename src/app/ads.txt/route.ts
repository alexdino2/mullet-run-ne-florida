import { monetization } from "@/lib/monetization";

/**
 * Authorized Digital Sellers file (`/ads.txt`).
 *
 * Google AdSense (and other programmatic sellers) require a valid `ads.txt`
 * at the site root declaring which accounts are authorized to sell this
 * site's inventory — without it, AdSense throttles or refuses to serve.
 *
 * The publisher line is derived from the same `NEXT_PUBLIC_ADS_CLIENT` that
 * drives the ad units, so there is a single source of truth. When no publisher
 * id is configured we return 404 rather than an empty/placeholder file, so we
 * never publish a claim we can't back.
 *
 * `NEXT_PUBLIC_ADS_CLIENT` is typically `ca-pub-…`; ads.txt wants the bare
 * `pub-…` seller id, so the `ca-` prefix is stripped.
 */
export function GET() {
  const client = monetization.adsClient;

  if (!client) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const sellerId = client.replace(/^ca-/, "");
  // f08c47fec0942fa0 is Google's fixed ads.txt certification authority id.
  const body = `google.com, ${sellerId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

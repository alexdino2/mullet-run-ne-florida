/**
 * Preview image for an Instagram post or Reel connected to a sighting
 * (`/api/instagram-thumbnail/<shortcode>`).
 *
 * Instagram's image URLs are signed and expire within days, so they can't be
 * stored with the sighting. Instead this route looks the post up on demand —
 * only for shortcodes that are attached to a sighting, so it is not an open
 * proxy — reads the `og:image` preview from the public permalink, and returns
 * the image with long CDN cache headers. Nothing is written to storage.
 *
 * Any failure (Instagram unreachable, post deleted, unexpected markup) returns
 * a small branded placeholder so an `<img>` never shows as broken.
 */
import { getServerSupabase } from "@/lib/supabase/server";
import { isInstagramShortcode } from "@/lib/instagram";

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 6000;
/** `og:image` sits in the first ~12 KB of the ~700 KB permalink page. */
const MAX_HTML_BYTES = 96 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
/** Instagram serves Open Graph tags to link-preview crawlers. */
const PREVIEW_USER_AGENT =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
const IMAGE_HOST = /(^|\.)(cdninstagram\.com|fbcdn\.net)$/i;

const HIT_CACHE =
  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800";
const MISS_CACHE = "public, max-age=600, s-maxage=3600";

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a21caf"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs><rect width="360" height="640" fill="url(#g)"/><circle cx="180" cy="320" r="56" fill="#fff" fill-opacity=".22"/><path d="M162 290v60l50-30z" fill="#fff"/></svg>`;

export async function GET(
  _request: Request,
  { params }: { params: { shortcode: string } },
) {
  const { shortcode } = params;
  if (!isInstagramShortcode(shortcode)) return placeholder(404);

  const postUrl = await findSightingPostUrl(shortcode);
  if (!postUrl) return placeholder(404);

  const imageUrl = await fetchPreviewImageUrl(postUrl);
  if (!imageUrl) {
    console.warn(`[instagram-thumbnail] no og:image for ${shortcode}`);
    return placeholder(200);
  }

  const image = await fetchImage(imageUrl);
  if (!image) {
    console.warn(`[instagram-thumbnail] image fetch failed for ${shortcode}`);
    return placeholder(200);
  }

  return new Response(image.body, {
    status: 200,
    headers: {
      "content-type": image.contentType,
      "cache-control": HIT_CACHE,
      "x-content-type-options": "nosniff",
    },
  });
}

async function findSightingPostUrl(shortcode: string): Promise<string | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("mw_sightings")
    .select("source_url")
    .in("source_url", [
      `https://www.instagram.com/reel/${shortcode}/`,
      `https://www.instagram.com/p/${shortcode}/`,
    ])
    .limit(1)
    .maybeSingle();
  if (error || !data?.source_url) return null;
  return data.source_url as string;
}

async function fetchPreviewImageUrl(postUrl: string): Promise<string | null> {
  const res = await timedFetch(postUrl, {
    headers: { "user-agent": PREVIEW_USER_AGENT, accept: "text/html" },
  });
  if (!res?.ok || !res.body) return null;

  const html = await readHead(res.body, MAX_HTML_BYTES);
  const match =
    /<meta\s+property="og:image"\s+content="([^"]+)"/i.exec(html) ??
    /<meta\s+content="([^"]+)"\s+property="og:image"/i.exec(html);
  if (!match) return null;

  try {
    const url = new URL(decodeHtmlEntities(match[1]));
    return url.protocol === "https:" && IMAGE_HOST.test(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

async function fetchImage(
  url: string,
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const res = await timedFetch(url, { headers: { accept: "image/*" } });
  if (!res?.ok) return null;
  const contentType = res.headers.get("content-type") ?? "";
  if (!/^image\/(jpeg|png|webp)$/i.test(contentType.split(";")[0].trim())) {
    return null;
  }
  const body = await res.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > MAX_IMAGE_BYTES) return null;
  return { body, contentType };
}

async function timedFetch(
  url: string,
  init: RequestInit,
): Promise<Response | null> {
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return null;
  }
}

/** Read at most `limit` bytes of a response body, then stop the download. */
async function readHead(
  body: ReadableStream<Uint8Array>,
  limit: number,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    while (bytes < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      text += decoder.decode(value, { stream: true });
      if (/property="og:image"[^>]*>/i.test(text)) break;
    }
  } catch {
    // A partial page is fine as long as it contained the meta tag.
  } finally {
    reader.cancel().catch(() => {});
  }
  return text;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)));
}

function placeholder(status: number): Response {
  return new Response(PLACEHOLDER_SVG, {
    status,
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": MISS_CACHE,
      "x-content-type-options": "nosniff",
    },
  });
}

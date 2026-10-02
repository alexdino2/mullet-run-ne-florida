const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com"]);
const INSTAGRAM_POST_PATH = /^\/(?:p|reel)\/[A-Za-z0-9_-]+\/?$/;
const INSTAGRAM_HANDLE = /^[A-Za-z0-9._]{1,30}$/;

/**
 * Accept only public post and Reel permalinks that Instagram can embed.
 * Tracking parameters and fragments are discarded before storage.
 */
export function normalizeInstagramPostUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      !INSTAGRAM_HOSTS.has(url.hostname.toLowerCase()) ||
      !INSTAGRAM_POST_PATH.test(url.pathname)
    ) {
      return null;
    }

    url.hostname = "www.instagram.com";
    url.search = "";
    url.hash = "";
    if (!url.pathname.endsWith("/")) url.pathname += "/";
    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeInstagramHandle(value: string): string | null {
  const handle = value.trim().replace(/^@/, "");
  return INSTAGRAM_HANDLE.test(handle) ? handle.toLowerCase() : null;
}

/**
 * Instagram's iframe player for a normalized post or Reel permalink, so the
 * video plays on our page instead of sending visitors to instagram.com.
 */
export function instagramEmbedUrl(postUrl: string): string {
  return `${postUrl.endsWith("/") ? postUrl : `${postUrl}/`}embed/`;
}

const INSTAGRAM_SHORTCODE = /^[A-Za-z0-9_-]{5,64}$/;

/** The post or Reel id from a stored permalink, e.g. `Dd4JOcrRgEO`. */
export function instagramShortcode(postUrl: string): string | null {
  const match = /^\/(?:p|reel)\/([A-Za-z0-9_-]+)\/?$/.exec(
    safePathname(postUrl) ?? "",
  );
  return match && isInstagramShortcode(match[1]) ? match[1] : null;
}

export function isInstagramShortcode(value: string): boolean {
  return INSTAGRAM_SHORTCODE.test(value);
}

/** Same-origin URL that serves a cached preview image for a post or Reel. */
export function instagramThumbnailPath(postUrl: string): string | null {
  const shortcode = instagramShortcode(postUrl);
  return shortcode ? `/api/instagram-thumbnail/${shortcode}` : null;
}

function safePathname(value: string): string | null {
  try {
    return new URL(value).pathname;
  } catch {
    return null;
  }
}

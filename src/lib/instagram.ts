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

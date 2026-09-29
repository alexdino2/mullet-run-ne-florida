/**
 * Instagram Graph API (Instagram API with Facebook Login) hashtag search.
 *
 * Requirements, all on Meta's side:
 * - An Instagram professional (Business or Creator) account linked to a
 *   Facebook Page; its IG user id is INSTAGRAM_BUSINESS_ACCOUNT_ID.
 * - A Meta app approved for the "Instagram Public Content Access" feature plus
 *   `instagram_basic`, and a long-lived token (a system-user token does not
 *   expire) in INSTAGRAM_GRAPH_TOKEN.
 *
 * Limits worth knowing: 30 unique hashtags per account per rolling 7 days,
 * `recent_media` only returns posts from the last 24 hours, and hashtag media
 * never includes the author's username or a location.
 */

const DEFAULT_VERSION = "v24.0";
const DEFAULT_HASHTAGS = ["mulletrun", "floridamulletrun"];
const PAGE_SIZE = 50;
const MAX_PAGES = 6;

export interface HashtagMedia {
  id: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  children?: { data: { id: string; media_type?: string; media_url?: string }[] };
}

export interface GraphConfig {
  token: string;
  userId: string;
  version: string;
  hashtags: string[];
}

export class GraphApiError extends Error {
  constructor(
    message: string,
    readonly code?: number,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GraphApiError";
  }

  /** Expired or revoked token: the fix is a new token, not a re-run. */
  get isAuthError(): boolean {
    return this.code === 190 || this.status === 401;
  }
}

export function graphConfig(): GraphConfig | null {
  const token = process.env.INSTAGRAM_GRAPH_TOKEN;
  const userId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!token || !userId) return null;
  const hashtags = (process.env.INSTAGRAM_HASHTAGS ?? "")
    .split(",")
    .map((h) => h.trim().replace(/^#/, "").toLowerCase())
    .filter(Boolean);
  return {
    token,
    userId,
    version: process.env.META_GRAPH_API_VERSION || DEFAULT_VERSION,
    hashtags: hashtags.length ? hashtags : DEFAULT_HASHTAGS,
  };
}

async function graphGet<T>(url: URL, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: { message?: string; code?: number };
  } & T;
  if (!res.ok || body.error) {
    throw new GraphApiError(
      body.error?.message ?? `HTTP ${res.status}`,
      body.error?.code,
      res.status,
    );
  }
  return body;
}

export async function findHashtagId(
  config: GraphConfig,
  hashtag: string,
): Promise<string | null> {
  const url = new URL(`https://graph.facebook.com/${config.version}/ig_hashtag_search`);
  url.searchParams.set("user_id", config.userId);
  url.searchParams.set("q", hashtag);
  const body = await graphGet<{ data?: { id: string }[] }>(url, config.token);
  return body.data?.[0]?.id ?? null;
}

/** Every post tagged with the hashtag in the last 24 hours, newest pages first. */
export async function fetchRecentHashtagMedia(
  config: GraphConfig,
  hashtagId: string,
): Promise<HashtagMedia[]> {
  const first = new URL(`https://graph.facebook.com/${config.version}/${hashtagId}/recent_media`);
  first.searchParams.set("user_id", config.userId);
  first.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,permalink,timestamp,children{id,media_type,media_url}",
  );
  first.searchParams.set("limit", String(PAGE_SIZE));

  const media: HashtagMedia[] = [];
  let next: URL | null = first;
  for (let page = 0; next && page < MAX_PAGES; page++) {
    const body: { data?: HashtagMedia[]; paging?: { next?: string } } =
      await graphGet(next, config.token);
    media.push(...(body.data ?? []));
    next = body.paging?.next ? new URL(body.paging.next) : null;
  }
  return media;
}

/** First still image in a post, for the AI location step. Videos have none. */
export function firstImageUrl(media: HashtagMedia): string | null {
  if (media.media_type === "IMAGE") return media.media_url ?? null;
  if (media.media_type === "CAROUSEL_ALBUM") {
    const image = media.children?.data.find((c) => c.media_type === "IMAGE");
    return image?.media_url ?? null;
  }
  return null;
}

import { normalizeInstagramPostUrl } from "@/lib/instagram";
import {
  fetchRecentHashtagMedia,
  findHashtagId,
  firstImageUrl,
  graphConfig,
  type HashtagMedia,
} from "@/lib/instagram-graph";
import { aiConfigured, readPostWithClaude, type AiResult } from "@/lib/instagram-ai";
import {
  countPending,
  insertCandidates,
  knownMediaIds,
  sightingsBySourceUrl,
  type NewCandidate,
} from "@/lib/instagram-candidates";
import { extractHashtags, inferLocationFromCaption, nearestStation } from "@/lib/instagram-places";
import { alertRecipients, emailConfigured, sendEmail } from "@/lib/email/resend";
import { instagramReviewEmail } from "@/lib/email/templates";
import { jobLog, mapLimit } from "./log";

const JOB = "instagram-hashtags";

export interface InstagramJobReport {
  hashtags: string[];
  fetched: number;
  newPosts: number;
  inserted: number;
  located: number;
  aiErrors: number;
  pending: number;
  emailed: boolean;
}

/** Where the "posts to review" email goes; defaults to the alert recipients. */
function reviewRecipients(): string[] {
  const list = (process.env.INSTAGRAM_REVIEW_EMAIL_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : alertRecipients();
}

/**
 * Pull the last 24 hours of posts for each hashtag, infer where each new post
 * was taken, and queue it for review. Media already in the queue is skipped,
 * so re-running (or overlapping hourly runs) never duplicates rows or AI calls.
 */
export async function runInstagramHashtags(): Promise<InstagramJobReport> {
  const config = graphConfig();
  if (!config) {
    throw new Error("INSTAGRAM_GRAPH_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID must be set");
  }
  jobLog(JOB, "start", { hashtags: config.hashtags, ai: aiConfigured() });

  // 1. Fetch, merging posts that carry more than one of our hashtags.
  const byId = new Map<string, { media: HashtagMedia; hashtags: Set<string> }>();
  for (const tag of config.hashtags) {
    const hashtagId = await findHashtagId(config, tag);
    if (!hashtagId) {
      jobLog(JOB, "hashtag_not_found", { hashtag: tag });
      continue;
    }
    const media = await fetchRecentHashtagMedia(config, hashtagId);
    jobLog(JOB, "hashtag_fetched", { hashtag: tag, posts: media.length });
    for (const m of media) {
      const entry = byId.get(m.id) ?? { media: m, hashtags: new Set<string>() };
      entry.hashtags.add(tag);
      byId.set(m.id, entry);
    }
  }

  // 2. Skip posts already queued.
  const known = await knownMediaIds([...byId.keys()]);
  const fresh = [...byId.values()].filter(
    (e) => !known.has(e.media.id) && e.media.permalink && e.media.timestamp,
  );
  const alreadyPosted = await sightingsBySourceUrl(
    fresh
      .map((e) => normalizeInstagramPostUrl(e.media.permalink!))
      .filter((u): u is string => !!u),
  );

  // 3. Locate each new post: known place names first, then Claude.
  let aiErrors = 0;
  const rows = await mapLimit(fresh, 3, async ({ media, hashtags }): Promise<NewCandidate> => {
    const caption = media.caption ?? "";
    const captionMatch = inferLocationFromCaption(caption);

    let ai: AiResult | null = null;
    let aiError: string | null = null;
    if (aiConfigured()) {
      try {
        ai = await readPostWithClaude({
          caption,
          postedAt: media.timestamp!,
          imageUrl: firstImageUrl(media),
          captionMatch,
        });
      } catch (err) {
        aiErrors++;
        aiError = (err as Error).message.slice(0, 500);
        jobLog(JOB, "ai_failed", { media_id: media.id, error: aiError });
      }
    }

    const location = captionMatch ?? ai?.location ?? null;
    const method = captionMatch ? "caption" : ai?.location ? "ai" : "none";
    const station = location ? nearestStation(location) : null;
    const url = normalizeInstagramPostUrl(media.permalink!);
    const existingSighting = url ? alreadyPosted.get(url) : undefined;

    jobLog(JOB, "post", {
      media_id: media.id,
      permalink: media.permalink,
      method,
      place: location?.name ?? null,
      confidence: location?.confidence ?? "none",
      station: station?.station.id ?? null,
      ai_is_report: ai?.isReport ?? null,
    });

    return {
      media_id: media.id,
      permalink: url ?? media.permalink!,
      media_type: media.media_type ?? null,
      media_url: firstImageUrl(media) ?? media.media_url ?? null,
      caption: caption || null,
      hashtags: [...new Set([...hashtags, ...extractHashtags(caption)])].slice(0, 30),
      posted_at: new Date(media.timestamp!).toISOString(),
      source_handle: null,
      location_method: method,
      location_name: location?.name ?? null,
      lat: location?.lat ?? null,
      lon: location?.lon ?? null,
      location_confidence: location?.confidence ?? "none",
      location_evidence: location?.evidence ?? null,
      beach_id: station?.station.id ?? null,
      station_distance_km: station ? Math.round(station.km * 10) / 10 : null,
      ai_is_report: ai?.isReport ?? null,
      ai_reason: ai?.reason ?? null,
      ai_summary: ai?.summary ?? null,
      ai_school_size: ai?.schoolSize ?? null,
      ai_error: aiError,
      status: existingSighting ? "duplicate" : "pending",
      sighting_id: existingSighting ?? null,
    };
  });

  const inserted = await insertCandidates(rows);
  const pending = await countPending();

  // 4. Tell the reviewer, once per run and only when something new arrived.
  const newPending = rows.filter((r) => r.status === "pending");
  let emailed = false;
  const to = reviewRecipients();
  if (inserted > 0 && newPending.length > 0 && emailConfigured() && to.length > 0) {
    const res = await sendEmail({ to, ...instagramReviewEmail({ posts: newPending, pending }) });
    emailed = res.ok;
    jobLog(JOB, res.ok ? "review_email_sent" : "review_email_failed", res.ok ? { id: res.id } : { error: res.error });
  }

  const report: InstagramJobReport = {
    hashtags: config.hashtags,
    fetched: byId.size,
    newPosts: fresh.length,
    inserted,
    located: rows.filter((r) => r.location_method !== "none").length,
    aiErrors,
    pending,
    emailed,
  };
  jobLog(JOB, "done", { ...report });
  return report;
}

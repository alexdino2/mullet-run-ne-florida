import { instagramThumbnailPath } from "@/lib/instagram";
import { DeferredImage } from "@/components/DeferredImage";

/**
 * Lazy-loaded preview of a connected Instagram post or Reel, linking to the
 * original. The image comes from our cached `/api/instagram-thumbnail` route
 * and is only requested after the page has loaded and the card scrolls near
 * the viewport, so it never competes with the page's first render.
 */
export function InstagramThumbnail({
  postUrl,
  handle,
  beachId,
  className = "",
}: {
  postUrl: string;
  handle: string | null;
  beachId: string;
  className?: string;
}) {
  const src = instagramThumbnailPath(postUrl);
  if (!src) return null;
  const label = handle
    ? `Watch @${handle}'s mullet sighting on Instagram`
    : "Watch this mullet sighting on Instagram";

  return (
    <a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-analytics-event="instagram_sighting_opened"
      data-analytics-property-beach-id={beachId}
      className={`group relative block overflow-hidden rounded-lg bg-gradient-to-br from-fuchsia-700 to-orange-500 ${className}`}
    >
      <DeferredImage
        src={src}
        width={180}
        height={320}
        className="h-full w-full object-cover group-hover:scale-105"
      />
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-xs text-white ring-1 ring-white/60 backdrop-blur-sm">
          ▶
        </span>
      </span>
    </a>
  );
}

import { instagramThumbnailPath } from "@/lib/instagram";
import { DeferredImage } from "@/components/DeferredImage";

/**
 * Lazy-loaded preview of a connected Instagram post or Reel. The image comes
 * from our cached `/api/instagram-thumbnail` route and is only requested after
 * the page has loaded and the card scrolls near the viewport, so it never
 * competes with the page's first render.
 *
 * Decorative only: the surrounding card is the click target (it opens the
 * post in the on-site player), so this renders no link of its own.
 */
export function InstagramThumbnail({
  postUrl,
  className = "",
}: {
  postUrl: string;
  className?: string;
}) {
  const src = instagramThumbnailPath(postUrl);
  if (!src) return null;

  return (
    <span
      aria-hidden
      className={`relative block overflow-hidden rounded-lg bg-gradient-to-br from-fuchsia-700 to-orange-500 ${className}`}
    >
      <DeferredImage
        src={src}
        width={180}
        height={320}
        className="h-full w-full object-cover transition group-hover:scale-105"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-xs text-white ring-1 ring-white/60 backdrop-blur-sm">
          ▶
        </span>
      </span>
    </span>
  );
}

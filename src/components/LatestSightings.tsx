import Link from "next/link";
import { getStation } from "@/lib/beaches";
import { beachPath, getBeachContentById } from "@/lib/content/beaches";
import type { Sighting } from "@/lib/types";
import { SIZE_META, timeAgo } from "@/lib/ui";
import { InstagramSightingCard } from "@/components/InstagramPlayer";
import { InstagramThumbnail } from "@/components/InstagramThumbnail";

const CARD =
  "block h-full w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100";

/**
 * Horizontally scrolling strip of the newest sightings on every coast. Reel
 * previews load lazily, so cards scrolled out of view cost nothing up front.
 */
export function LatestSightings({ sightings }: { sightings: Sighting[] }) {
  if (sightings.length === 0) return null;

  return (
    <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {sightings.map((s) => {
        const size = SIZE_META[s.school_size];
        const name = getStation(s.beach_id)?.name ?? s.beach_id;
        const content = getBeachContentById(s.beach_id);
        const instagramUrl =
          s.source_type === "instagram" ? s.source_url : null;

        const caption = (
          <span className="block p-2">
            <span className="block truncate text-xs font-bold text-slate-800">
              {name}
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              {size.label} · {timeAgo(s.observed_at)}
            </span>
          </span>
        );

        // The whole card is the click target: Instagram cards play the post
        // in the on-site player, eyewitness cards open the beach guide.
        return (
          <li key={s.id} className="w-32 shrink-0 snap-start">
            {instagramUrl ? (
              <InstagramSightingCard
                post={{
                  url: instagramUrl,
                  handle: s.source_handle,
                  beachId: s.beach_id,
                  title: `${size.label} school · ${name}`,
                }}
                surface="latest"
                className={CARD}
              >
                <InstagramThumbnail
                  postUrl={instagramUrl}
                  className="aspect-[4/5] w-full rounded-none"
                />
                {caption}
              </InstagramSightingCard>
            ) : content ? (
              <Link
                href={beachPath(content.slug)}
                data-analytics-event="sighting_card_clicked"
                data-analytics-property-beach-id={s.beach_id}
                className={`${CARD} transition hover:shadow-md hover:ring-ocean-200`}
              >
                <EyewitnessTile emoji={size.emoji} />
                {caption}
              </Link>
            ) : (
              <div className={CARD}>
                <EyewitnessTile emoji={size.emoji} />
                {caption}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function EyewitnessTile({ emoji }: { emoji: string }) {
  return (
    <span className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-ocean-600 to-ocean-900 text-white">
      <span aria-hidden className="text-lg">
        {emoji}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-ocean-200">
        Eyewitness
      </span>
    </span>
  );
}

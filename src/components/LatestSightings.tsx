import Link from "next/link";
import { getStation } from "@/lib/beaches";
import { beachPath, getBeachContentById } from "@/lib/content/beaches";
import type { Sighting } from "@/lib/types";
import { SIZE_META, timeAgo } from "@/lib/ui";
import { InstagramThumbnail } from "@/components/InstagramThumbnail";

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

        return (
          <li
            key={s.id}
            className="w-32 shrink-0 snap-start overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100"
          >
            {instagramUrl ? (
              <InstagramThumbnail
                postUrl={instagramUrl}
                handle={s.source_handle}
                beachId={s.beach_id}
                className="aspect-[4/5] w-full rounded-none"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-ocean-600 to-ocean-900 text-white">
                <span aria-hidden className="text-lg">
                  {size.emoji}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-ocean-200">
                  Eyewitness
                </span>
              </div>
            )}
            <div className="p-2">
              {content ? (
                <Link
                  href={beachPath(content.slug)}
                  className="block truncate text-xs font-bold text-slate-800 hover:text-ocean-700"
                >
                  {name}
                </Link>
              ) : (
                <p className="truncate text-xs font-bold text-slate-800">
                  {name}
                </p>
              )}
              <p className="mt-0.5 text-[11px] text-slate-500">
                {size.label} · {timeAgo(s.observed_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

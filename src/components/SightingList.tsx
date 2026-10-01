import type { Beach, Sighting } from "@/lib/types";
import { SIZE_META, timeAgo } from "@/lib/ui";
import { InstagramThumbnail } from "@/components/InstagramThumbnail";

export function SightingList({
  sightings,
  beaches,
  emptyHint = "No sightings logged yet.",
}: {
  sightings: Sighting[];
  beaches: Beach[];
  emptyHint?: string;
}) {
  const beachName = (id: string) =>
    beaches.find((b) => b.id === id)?.name ?? id;

  if (sightings.length === 0) {
    return (
      <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
        {emptyHint}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {sightings.map((s) => {
        const size = SIZE_META[s.school_size];
        const instagramUrl =
          s.source_type === "instagram" ? s.source_url : null;
        return (
          <li
            key={s.id}
            className="flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
          >
            {instagramUrl && (
              <InstagramThumbnail
                postUrl={instagramUrl}
                handle={s.source_handle}
                beachId={s.beach_id}
                className="aspect-[9/16] w-16 shrink-0 self-start"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-800">
                  {beachName(s.beach_id)}
                </span>
                <span className="text-xs text-slate-400">
                  {timeAgo(s.observed_at)}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-slate-600">
                <span aria-hidden>{size.emoji}</span>
                <span className="font-medium">{size.label} school</span>
                {s.verification_status === "verified" && (
                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Verified
                  </span>
                )}
              </div>
              {s.notes && (
                <p className="mt-1 text-sm text-slate-500">“{s.notes}”</p>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics-event="instagram_sighting_opened"
                  data-analytics-property-beach-id={s.beach_id}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-700 hover:text-fuchsia-800"
                >
                  <span aria-hidden>◎</span>
                  {s.source_handle
                    ? `View @${s.source_handle} on Instagram`
                    : "View original on Instagram"}
                  <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

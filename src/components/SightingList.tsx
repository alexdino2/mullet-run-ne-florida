import type { Beach, Sighting } from "@/lib/types";
import { SIZE_META, timeAgo } from "@/lib/ui";

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
        return (
          <li
            key={s.id}
            className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
          >
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
            </div>
            {s.notes && (
              <p className="mt-1 text-sm text-slate-500">“{s.notes}”</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

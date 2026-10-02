import Link from "next/link";
import {
  InstagramSightingCard,
  InstagramWatchLabel,
  type InstagramPost,
} from "@/components/InstagramPlayer";
import { InstagramThumbnail } from "@/components/InstagramThumbnail";
import { beachPath, getBeachContentById } from "@/lib/content/beaches";
import type { Beach, Sighting } from "@/lib/types";
import { SIZE_META, timeAgo } from "@/lib/ui";

const CARD =
  "block w-full rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100";

/**
 * Every card is a single click target: Instagram sightings play their post in
 * an on-site player, and eyewitness sightings open that beach's guide (unless
 * the list is already on that beach's page).
 */
export function SightingList({
  sightings,
  beaches,
  emptyHint = "No sightings logged yet.",
  linkBeaches = true,
}: {
  sightings: Sighting[];
  beaches: Beach[];
  emptyHint?: string;
  /** Link eyewitness cards to their beach guide. Off on a beach's own page. */
  linkBeaches?: boolean;
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
        const name = beachName(s.beach_id);
        const body = <SightingBody sighting={s} beachName={name} />;

        if (s.source_type === "instagram" && s.source_url) {
          const post: InstagramPost = {
            url: s.source_url,
            handle: s.source_handle,
            beachId: s.beach_id,
            title: `${SIZE_META[s.school_size].label} school · ${name}`,
          };
          return (
            <li key={s.id}>
              <InstagramSightingCard
                post={post}
                surface="list"
                className={`${CARD} flex gap-3`}
              >
                <InstagramThumbnail
                  postUrl={s.source_url}
                  className="aspect-[9/16] w-16 shrink-0 self-start"
                />
                <span className="block min-w-0 flex-1">
                  {body}
                  <InstagramWatchLabel post={post} />
                </span>
              </InstagramSightingCard>
            </li>
          );
        }

        const guide = linkBeaches ? getBeachContentById(s.beach_id) : undefined;
        return (
          <li key={s.id}>
            {guide ? (
              <Link
                href={beachPath(guide.slug)}
                data-analytics-event="sighting_card_clicked"
                data-analytics-property-beach-id={s.beach_id}
                className={`${CARD} transition hover:shadow-md hover:ring-ocean-200`}
              >
                {body}
                <span className="mt-2 block text-xs font-bold text-ocean-600">
                  {name} guide & conditions →
                </span>
              </Link>
            ) : (
              <div className={CARD}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Card contents; spans only, so it can sit inside a <button>. */
function SightingBody({
  sighting: s,
  beachName,
}: {
  sighting: Sighting;
  beachName: string;
}) {
  const size = SIZE_META[s.school_size];
  return (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="font-semibold text-slate-800">{beachName}</span>
        <span className="text-xs text-slate-400">
          {timeAgo(s.observed_at)}
        </span>
      </span>
      <span className="mt-0.5 flex items-center gap-2 text-sm text-slate-600">
        <span aria-hidden>{size.emoji}</span>
        <span className="font-medium">{size.label} school</span>
        {s.verification_status === "verified" && (
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            Verified
          </span>
        )}
      </span>
      {s.notes && (
        <span className="mt-1 block text-sm text-slate-500">“{s.notes}”</span>
      )}
    </>
  );
}

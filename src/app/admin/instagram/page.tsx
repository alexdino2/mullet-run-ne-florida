import Link from "next/link";
import { STATIONS, getStation } from "@/lib/beaches";
import { requireAdmin } from "@/lib/admin";
import { listCandidates } from "@/lib/instagram-candidates";
import { COAST_LABEL } from "@/lib/regions";
import { hasServiceRole } from "@/lib/supabase/server";
import type { CandidateStatus, InstagramCandidate, LocationConfidence } from "@/lib/types";
import { approvePost, rejectPost, restorePost, signOut } from "./actions";

export const dynamic = "force-dynamic";

const TABS: { status: CandidateStatus; label: string }[] = [
  { status: "pending", label: "To review" },
  { status: "approved", label: "Posted" },
  { status: "rejected", label: "Rejected" },
  { status: "duplicate", label: "Already on site" },
];

const CONFIDENCE_CLASSES: Record<LocationConfidence, string> = {
  high: "bg-emerald-100 text-emerald-800",
  medium: "bg-lime-100 text-lime-800",
  low: "bg-amber-100 text-amber-800",
  none: "bg-slate-100 text-slate-600",
};

const METHOD_LABEL = { caption: "from caption", ai: "from Claude", none: "" } as const;

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500";

function fmtPosted(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function embedUrl(permalink: string): string {
  return `${permalink.replace(/\/?$/, "/")}embed/`;
}

function ReviewForm({ post }: { post: InstagramCandidate }) {
  return (
    <form action={approvePost} className="mt-3 space-y-3 border-t border-slate-100 pt-3">
      <input type="hidden" name="id" value={post.id} />
      <input type="hidden" name="observed_at" value={post.posted_at} />

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Station</label>
        <select name="beach_id" defaultValue={post.beach_id ?? ""} required className={input}>
          <option value="" disabled>
            Pick the nearest station…
          </option>
          {(["atlantic", "gulf"] as const).map((coast) => (
            <optgroup key={coast} label={COAST_LABEL[coast]}>
              {STATIONS.filter((s) => s.coast === coast).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Latitude</label>
          <input name="lat" type="number" step="any" defaultValue={post.lat ?? ""} className={input} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Longitude</label>
          <input name="lon" type="number" step="any" defaultValue={post.lon ?? ""} className={input} />
        </div>
      </div>
      <p className="-mt-1 text-xs text-slate-400">
        Leave blank to plot the sighting at the station.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">School size</label>
          <select name="school_size" defaultValue={post.ai_school_size ?? "medium"} className={input}>
            {["small", "medium", "large", "huge"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Account</label>
          <input
            name="source_handle"
            defaultValue={post.source_handle ?? ""}
            placeholder="@handle"
            maxLength={31}
            className={input}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Public notes
        </label>
        <textarea
          name="notes"
          rows={2}
          maxLength={500}
          defaultValue={post.ai_summary ?? ""}
          className={`${input} resize-none`}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-ocean-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-ocean-700"
        >
          Approve &amp; post
        </button>
        <button
          type="submit"
          formAction={rejectPost}
          formNoValidate
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Reject
        </button>
      </div>
    </form>
  );
}

function PostCard({ post }: { post: InstagramCandidate }) {
  const station = post.beach_id ? getStation(post.beach_id) : null;
  return (
    <li className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Posted {fmtPosted(post.posted_at)}</span>
        <a
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-fuchsia-700 hover:text-fuchsia-800"
        >
          Open on Instagram ↗
        </a>
      </div>

      {post.ai_is_report === false && (
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800 ring-1 ring-amber-200">
          <b>Likely not a Florida sighting.</b> {post.ai_reason}
        </p>
      )}

      <iframe
        src={embedUrl(post.permalink)}
        title="Instagram post"
        loading="lazy"
        className="mt-3 h-[460px] w-full rounded-lg border border-slate-100 bg-slate-50"
      />

      {post.caption && (
        <details className="mt-2 text-sm text-slate-700">
          <summary className="cursor-pointer text-xs font-semibold text-slate-500">Caption</summary>
          <p className="mt-1 whitespace-pre-line">{post.caption}</p>
        </details>
      )}

      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-800">
            {post.location_name ?? "Location unknown"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${CONFIDENCE_CLASSES[post.location_confidence]}`}
          >
            {post.location_confidence === "none" ? "no location" : `${post.location_confidence} confidence`}
          </span>
          {METHOD_LABEL[post.location_method] && (
            <span className="text-xs text-slate-400">{METHOD_LABEL[post.location_method]}</span>
          )}
        </div>
        {post.location_evidence && (
          <p className="mt-1 text-xs text-slate-500">{post.location_evidence}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          {station
            ? `Nearest station: ${station.name} (${post.station_distance_km} km)`
            : "No station within 100 km. Pick one if it's a Florida sighting."}
          {post.lat !== null && post.lon !== null && (
            <>
              {" · "}
              <a
                href={`https://www.google.com/maps?q=${post.lat},${post.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ocean-600 hover:text-ocean-700"
              >
                Map
              </a>
            </>
          )}
        </p>
        {post.ai_error && (
          <p className="mt-1 text-xs text-red-600">AI step failed: {post.ai_error}</p>
        )}
      </div>

      {post.status === "pending" && <ReviewForm post={post} />}
      {post.status === "rejected" && (
        <form action={restorePost} className="mt-3">
          <input type="hidden" name="id" value={post.id} />
          <button className="text-xs font-semibold text-ocean-600 hover:text-ocean-700">
            Move back to review
          </button>
        </form>
      )}
      {(post.status === "approved" || post.status === "duplicate") && (
        <p className="mt-3 text-xs text-slate-500">
          {post.status === "approved"
            ? `Posted by ${post.reviewed_by ?? "a reviewer"}.`
            : "This post was already logged as a sighting."}{" "}
          <Link href="/sightings" className="font-semibold text-ocean-600">
            View sightings
          </Link>
        </p>
      )}
    </li>
  );
}

export default async function InstagramReviewPage({
  searchParams,
}: {
  searchParams?: { status?: string; notice?: string; error?: string };
}) {
  const admin = await requireAdmin();
  const status =
    TABS.find((t) => t.status === searchParams?.status)?.status ?? "pending";
  const posts = hasServiceRole() ? await listCandidates(status) : [];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold leading-tight text-slate-900">
            Instagram sightings review
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Posts tagged #mulletrun or #floridamulletrun in the last day, checked
            hourly. Approving one publishes it to the sightings map with a link
            back to the original post.
          </p>
        </div>
        <form action={signOut} className="shrink-0 pt-1">
          <button className="text-xs font-semibold text-slate-400 hover:text-slate-600" title={admin}>
            Sign out
          </button>
        </form>
      </div>

      <nav className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.status}
            href={`/admin/instagram?status=${t.status}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              t.status === status
                ? "bg-ocean-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {!hasServiceRole() && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
          Set SUPABASE_SERVICE_ROLE_KEY on this deployment to read the review queue.
        </p>
      )}
      {searchParams?.notice && (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
          {searchParams.notice}
        </p>
      )}
      {searchParams?.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          {searchParams.error}
        </p>
      )}

      {posts.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Nothing here right now.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}

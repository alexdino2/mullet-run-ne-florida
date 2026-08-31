import type { OpportunityWindow } from "@/lib/types";
import { ratingClasses } from "@/lib/ui";
import { ratingFromScore } from "@/lib/ui";

function fmtRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = start.toLocaleDateString(undefined, { weekday: "short" });
  const t = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} ${t(start)} – ${t(end)}`;
}

export function NextWindowCard({
  window,
}: {
  window: OpportunityWindow | null;
}) {
  if (!window) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Next best window
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Not enough forecast data to project a window right now.
        </p>
      </div>
    );
  }

  const rating = ratingFromScore(window.peakScore);
  const { hex, bg, text } = ratingClasses(rating);
  const peak = new Date(window.peakTime).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Next best window
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${bg} ${text}`}
        >
          peaks {window.peakScore}
        </span>
      </div>
      <div className="mt-1 text-lg font-bold text-slate-900">
        {fmtRange(window.start, window.end)}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: hex }}
        />
        Peak conditions around {peak}
      </div>
    </div>
  );
}

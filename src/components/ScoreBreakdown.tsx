import type { ScoreComponent } from "@/lib/types";

function barColor(factor: number): string {
  if (factor >= 0.75) return "bg-emerald-500";
  if (factor >= 0.5) return "bg-lime-500";
  if (factor >= 0.3) return "bg-amber-500";
  return "bg-slate-300";
}

export function ScoreBreakdown({
  components,
}: {
  components: ScoreComponent[];
}) {
  const sorted = [...components].sort((a, b) => b.points - a.points);
  return (
    <div className="space-y-3">
      {sorted.map((c) => (
        <div key={c.key}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-slate-800">
              {c.label}
              {!c.available && (
                <span className="ml-1 align-middle text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  est.
                </span>
              )}
            </span>
            <span className="text-xs font-semibold tabular-nums text-slate-500">
              {c.points}/{c.weight}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${barColor(c.factor)}`}
              style={{ width: `${Math.round(c.factor * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs leading-snug text-slate-500">{c.reason}</p>
        </div>
      ))}
    </div>
  );
}

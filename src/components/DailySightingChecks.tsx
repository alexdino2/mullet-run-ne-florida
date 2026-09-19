import type { Beach, SightingCheck } from "@/lib/types";
import { timeAgo } from "@/lib/ui";

export function DailySightingChecks({
  beaches,
  checks,
}: {
  beaches: Beach[];
  checks: SightingCheck[];
}) {
  const byBeach = new Map(checks.map((check) => [check.beach_id, check]));

  return (
    <div className="space-y-2">
      {beaches.map((beach) => {
        const check = byBeach.get(beach.id);
        const recent = check?.reports[0];

        return (
          <div
            key={beach.id}
            className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {beach.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {!check
                    ? "Awaiting first daily check"
                    : check.status === "unavailable"
                      ? "Source temporarily unavailable"
                      : check.reports.length === 0
                        ? "No recent online mullet reports found"
                        : `${check.reports.length} recent online report${check.reports.length === 1 ? "" : "s"}`}
                </p>
              </div>
              {check && (
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    check.status === "checked"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {timeAgo(check.checked_at)}
                </span>
              )}
            </div>

            {recent && (
              <a
                href={recent.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                data-analytics-event="external_report_clicked"
                data-analytics-property-beach-id={beach.id}
                data-analytics-property-source={recent.source}
                className="mt-2 block text-xs font-medium text-ocean-700 hover:underline"
              >
                {recent.title} · {recent.source}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

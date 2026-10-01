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
  // Only beaches where the scan turned something up get a card. A row per
  // beach saying "nothing found" is filler, so the rest share one line.
  const withReports = beaches.filter(
    (beach) => (byBeach.get(beach.id)?.reports.length ?? 0) > 0,
  );
  const checked = beaches.filter((beach) => byBeach.has(beach.id));
  const unavailable = checked.filter(
    (beach) => byBeach.get(beach.id)?.status === "unavailable",
  ).length;
  const lastChecked = checked
    .map((beach) => byBeach.get(beach.id)!.checked_at)
    .sort()
    .pop();
  const quiet = checked.length - withReports.length - unavailable;

  let summary = "The first daily check hasn't run yet.";
  if (checked.length > 0 && withReports.length === 0) {
    summary = `No recent online mullet reports turned up at the ${quiet} beaches checked`;
    if (unavailable > 0) summary += ` (${unavailable} couldn't be checked)`;
    summary += ".";
  } else if (checked.length > 0) {
    summary = `${withReports.length} of ${checked.length} beaches had recent online mullet reports`;
    if (quiet > 0) summary += `; nothing new turned up at the other ${quiet}`;
    if (unavailable > 0) summary += ` (${unavailable} couldn't be checked)`;
    summary += ".";
  }

  return (
    <div className="space-y-2">
      <p className="rounded-xl bg-white p-3 text-xs text-slate-600 shadow-sm ring-1 ring-slate-100">
        {summary}
        {lastChecked && (
          <span className="text-slate-400"> Last scan {timeAgo(lastChecked)}.</span>
        )}
      </p>
      {withReports.map((beach) => {
        const check = byBeach.get(beach.id)!;
        const recent = check.reports[0];

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
                  {`${check.reports.length} recent online report${check.reports.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                {timeAgo(check.checked_at)}
              </span>
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

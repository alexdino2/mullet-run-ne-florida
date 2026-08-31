import type { AlertRule, Beach } from "@/lib/types";

const CHANNEL_META: Record<string, { label: string; emoji: string }> = {
  email: { label: "Email", emoji: "✉️" },
  sms: { label: "SMS", emoji: "💬" },
  push: { label: "Push", emoji: "🔔" },
  none: { label: "None", emoji: "—" },
};

export function AlertRulesTable({
  rules,
  beaches,
}: {
  rules: AlertRule[];
  beaches: Beach[];
}) {
  const beachName = (id: string | null) =>
    id ? (beaches.find((b) => b.id === id)?.name ?? id) : "Any beach";

  if (rules.length === 0) {
    return (
      <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
        No alert rules defined.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-3 py-2 font-semibold">Rule</th>
            <th className="px-3 py-2 font-semibold">Beach</th>
            <th className="px-3 py-2 text-right font-semibold">Min score</th>
            <th className="px-3 py-2 font-semibold">Wind</th>
            <th className="px-3 py-2 font-semibold">Via</th>
            <th className="px-3 py-2 font-semibold">On</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => {
            const ch = CHANNEL_META[r.channel] ?? CHANNEL_META.none;
            const windRange =
              r.wind_dir_min != null && r.wind_dir_max != null
                ? `${r.wind_dir_min}–${r.wind_dir_max}°`
                : "any";
            return (
              <tr
                key={r.id}
                className="border-b border-slate-50 last:border-0 align-top"
              >
                <td className="px-3 py-2 font-medium text-slate-800">
                  {r.name}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {beachName(r.beach_id)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                  {r.min_score}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {windRange}
                  {r.max_wind_kt != null && (
                    <span className="text-slate-400"> ≤{r.max_wind_kt}kt</span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  <span aria-hidden>{ch.emoji}</span> {ch.label}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                      r.enabled ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                    title={r.enabled ? "Enabled" : "Disabled"}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

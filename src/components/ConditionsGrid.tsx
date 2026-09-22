import type { Conditions } from "@/lib/types";
import { formatClock } from "@/lib/ui";

function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-bold text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

const STAGE_LABEL: Record<string, string> = {
  rising: "Rising ↑",
  falling: "Falling ↓",
  high: "High (slack)",
  low: "Low (slack)",
  unknown: "—",
};

export function ConditionsGrid({ conditions }: { conditions: Conditions }) {
  const { wind, tide } = conditions;

  const nextTide = tide?.nextEvent
    ? `${tide.nextEvent.type === "H" ? "High" : "Low"} ${formatClock(
        tide.nextEvent.time,
      )}`
    : undefined;

  return (
    <div className="grid grid-cols-2 gap-2">
      <Tile
        label="Wind"
        value={
          wind ? `${wind.directionLabel} ${wind.speedKt} kt` : "No data"
        }
        sub={wind?.gustKt ? `gusts ${wind.gustKt} kt` : undefined}
      />
      <Tile
        label="Tide"
        value={STAGE_LABEL[tide?.stage ?? "unknown"]}
        sub={nextTide}
      />
      <Tile
        label="Water temp"
        value={
          conditions.waterTempF != null ? `${conditions.waterTempF}°F` : "—"
        }
      />
      <Tile
        label="Air temp"
        value={conditions.airTempF != null ? `${Math.round(conditions.airTempF)}°F` : "—"}
      />
      <Tile
        label="Surf"
        value={
          conditions.waveHeightFt != null
            ? `${conditions.waveHeightFt} ft`
            : "—"
        }
      />
      <Tile
        label="Recent NE–E"
        value={
          conditions.recentEasterlyFraction != null
            ? `${Math.round(conditions.recentEasterlyFraction * 100)}%`
            : "—"
        }
        sub="of recent hours"
      />
    </div>
  );
}

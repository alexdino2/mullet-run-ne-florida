import type { Coast, Conditions } from "@/lib/types";
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

function signed(n: number, unit: string): string {
  return `${n > 0 ? "+" : n < 0 ? "−" : "±"}${Math.abs(n)}${unit}`;
}

export function ConditionsGrid({
  conditions,
  coast = "atlantic",
}: {
  conditions: Conditions;
  coast?: Coast;
}) {
  const { wind, tide } = conditions;

  const nextTide = tide?.nextEvent
    ? `${tide.nextEvent.type === "H" ? "High" : "Low"} ${formatClock(
        tide.nextEvent.time,
      )}`
    : undefined;

  if (coast === "gulf") {
    const range =
      tide?.rangeRatio == null
        ? undefined
        : tide.rangeRatio >= 0.8
          ? "spring-tide range"
          : tide.rangeRatio <= 0.45
            ? "neap-tide range"
            : "mid-cycle range";
    const river = conditions.river;
    return (
      <div className="grid grid-cols-2 gap-2">
        <Tile
          label="Wind"
          value={wind ? `${wind.directionLabel} ${wind.speedKt} kt` : "No data"}
          sub={
            conditions.recentNortherlyFraction != null
              ? `${Math.round(conditions.recentNortherlyFraction * 100)}% NW–NE last 12h`
              : wind?.gustKt
                ? `gusts ${wind.gustKt} kt`
                : undefined
          }
        />
        <Tile
          label="Tide"
          value={STAGE_LABEL[tide?.stage ?? "unknown"]}
          sub={[nextTide, range].filter(Boolean).join(" · ") || undefined}
        />
        <Tile
          label="Water temp"
          value={conditions.waterTempF != null ? `${conditions.waterTempF}°F` : "—"}
          sub={
            conditions.waterTempChange48hF != null
              ? `${signed(conditions.waterTempChange48hF, "°F")} in 48h`
              : undefined
          }
        />
        <Tile
          label="Pressure"
          value={
            conditions.pressureHpa != null
              ? `${Math.round(conditions.pressureHpa)} hPa`
              : "—"
          }
          sub={
            conditions.pressureDrop24hHpa != null
              ? conditions.pressureDrop24hHpa >= 1
                ? `fell ${conditions.pressureDrop24hHpa} hPa in 24h`
                : "steady (no front)"
              : undefined
          }
        />
        <Tile
          label="Moon"
          value={conditions.moon?.name ?? "—"}
          sub={
            conditions.moon
              ? `${conditions.moon.daysFromSyzygy} days from new/full`
              : undefined
          }
        />
        {river ? (
          <Tile
            label={river.label}
            value={
              river.dischargeRatio != null
                ? `${Math.round(river.dischargeRatio * 100)}% of normal`
                : river.dischargeCfs != null
                  ? `${river.dischargeCfs.toLocaleString()} cfs`
                  : river.conductance != null
                    ? `${river.conductance.toLocaleString()} µS/cm`
                    : "—"
            }
            sub={
              river.dischargeRatio != null && river.dischargeCfs != null
                ? `${river.dischargeCfs.toLocaleString()} cfs (24h mean)`
                : "USGS gauge"
            }
          />
        ) : (
          <Tile
            label="Air temp"
            value={conditions.airTempF != null ? `${Math.round(conditions.airTempF)}°F` : "—"}
          />
        )}
      </div>
    );
  }

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

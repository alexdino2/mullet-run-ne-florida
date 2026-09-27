import { getStation } from "@/lib/beaches";

const TYPE_LABEL = { beach: "Surf beach", pass: "Pass / inlet", river: "River mouth" } as const;

/**
 * Header art for stations without a licensed photo: a water-toned panel with
 * the station type and coordinates. Pure CSS, so it costs nothing to load.
 */
export function StationVisual({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const station = getStation(id);
  if (!station) return null;
  const gulf = station.coast === "gulf";
  return (
    <div
      aria-hidden
      className={`relative h-full w-full overflow-hidden ${
        gulf
          ? "bg-gradient-to-br from-teal-600 via-cyan-700 to-ocean-900"
          : "bg-gradient-to-br from-sky-500 via-ocean-600 to-ocean-900"
      }`}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 20% 120%, transparent 0 14px, rgba(255,255,255,.55) 15px 16px)",
        }}
      />
      {!compact && (
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="text-[11px] font-bold uppercase tracking-widest opacity-80">
            {TYPE_LABEL[station.station_type]} · {gulf ? "Gulf coast" : "Atlantic coast"}
          </div>
          <div className="mt-0.5 text-lg font-bold leading-tight">{station.name}</div>
          <div className="text-[11px] opacity-75">
            {station.lat.toFixed(3)}°N, {Math.abs(station.lon).toFixed(3)}°W
          </div>
        </div>
      )}
    </div>
  );
}

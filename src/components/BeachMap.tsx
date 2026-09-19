"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { BeachSummary, Sighting } from "@/lib/types";
import { ratingClasses } from "@/lib/ui";

const SIGHTING_STYLE: Record<
  Sighting["school_size"],
  { radius: number; color: string; label: string }
> = {
  small: { radius: 5, color: "#f59e0b", label: "Small" },
  medium: { radius: 7, color: "#f97316", label: "Medium" },
  large: { radius: 9, color: "#ef4444", label: "Large" },
  huge: { radius: 12, color: "#be123c", label: "Huge" },
};

/**
 * Vercel-friendly live tracker using free OpenStreetMap tiles. Score stations
 * are rings; crowd reports are warm solid dots sized by school size.
 */
export default function BeachMap({
  summaries,
  sightings,
}: {
  summaries: BeachSummary[];
  sightings: Sighting[];
}) {
  const center: [number, number] = [27.8, -81.45];
  const beaches = new Map(
    summaries.map((summary) => [summary.beach.id, summary.beach]),
  );

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sightings.map((sighting) => {
        const beach = beaches.get(sighting.beach_id);
        const lat = sighting.lat ?? beach?.lat;
        const lon = sighting.lon ?? beach?.lon;
        if (
          lat == null ||
          lon == null ||
          !Number.isFinite(lat) ||
          !Number.isFinite(lon)
        )
          return null;
        const style = SIGHTING_STYLE[sighting.school_size];
        // Guard against any unexpected school_size so a single bad row can't
        // throw and blank the whole client-rendered map.
        if (!style) return null;

        return (
          <CircleMarker
            key={sighting.id}
            center={[lat, lon]}
            radius={style.radius}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: style.color,
              fillOpacity: 0.95,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <div className="max-w-48">
                <div className="font-semibold">
                  {style.label} school · {beach?.name ?? "Florida coast"}
                </div>
                <div>{new Date(sighting.observed_at).toLocaleString()}</div>
                {sighting.notes && <div className="mt-1">{sighting.notes}</div>}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
      {summaries.map((s) => {
        if (!Number.isFinite(s.beach.lat) || !Number.isFinite(s.beach.lon)) {
          return null;
        }
        const { hex } = ratingClasses(s.rating);
        return (
          <CircleMarker
            key={s.beach.id}
            center={[s.beach.lat, s.beach.lon]}
            radius={s.beach.id === "micklers" ? 14 : 11}
            pathOptions={{
              color: hex,
              weight: 4,
              fillColor: hex,
              fillOpacity: 0.16,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <div className="text-center">
                <div className="font-semibold">{s.beach.name}</div>
                <div>
                  Score <span className="font-bold">{s.score}</span>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

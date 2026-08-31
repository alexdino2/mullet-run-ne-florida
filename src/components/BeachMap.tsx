"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { BeachSummary } from "@/lib/types";
import { ratingClasses } from "@/lib/ui";

/**
 * Leaflet map with a colored dot per beach. Uses free OpenStreetMap tiles
 * (no API key), and CircleMarkers so there are no marker-image assets to bundle.
 */
export default function BeachMap({
  summaries,
}: {
  summaries: BeachSummary[];
}) {
  const center: [number, number] = [30.05, -81.38];

  return (
    <MapContainer
      center={center}
      zoom={9}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {summaries.map((s) => {
        const { hex } = ratingClasses(s.rating);
        return (
          <CircleMarker
            key={s.beach.id}
            center={[s.beach.lat, s.beach.lon]}
            radius={s.beach.id === "micklers" ? 13 : 10}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: hex,
              fillOpacity: 0.9,
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

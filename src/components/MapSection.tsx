"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { BeachSummary, Sighting } from "@/lib/types";
import { ratingClasses } from "@/lib/ui";

const BeachMap = dynamic(() => import("./BeachMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      Loading map…
    </div>
  ),
});

export function MapSection() {
  const [summaries, setSummaries] = useState<BeachSummary[] | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/summaries").then((response) => {
        if (!response.ok) throw new Error("Summary request failed");
        return response.json();
      }),
      fetch("/api/sightings")
        .then((response) => (response.ok ? response.json() : { sightings: [] }))
        .catch(() => ({ sightings: [] })),
    ])
      .then(([summaryData, sightingData]) => {
        if (!active) return;
        setSummaries(summaryData.summaries ?? []);
        setSightings(sightingData.sightings ?? []);
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  const ranked = useMemo(
    () => (summaries ? [...summaries].sort((a, b) => b.score - a.score) : []),
    [summaries],
  );
  const recentSightings = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return sightings.filter(
      (sighting) => new Date(sighting.observed_at).getTime() >= cutoff,
    );
  }, [sightings]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-orange-200" />
              Sightings
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-ocean-600 bg-ocean-100" />
              Conditions
            </span>
          </div>
          <span className="font-semibold text-slate-600">
            {recentSightings.length} report
            {recentSightings.length === 1 ? "" : "s"} · 7 days
          </span>
        </div>
        <div className="h-80 w-full">
          {summaries && !error ? (
            <BeachMap
              summaries={summaries}
              sightings={recentSightings}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {error ? "Map data unavailable" : "Loading conditions…"}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ranked.map((s) => {
          const { hex, bg, text } = ratingClasses(s.rating);
          return (
            <Link
              key={s.beach.id}
              href={`/beaches/${s.beach.id}`}
              data-analytics-event="beach_selected"
              data-analytics-property-beach-id={s.beach.id}
              data-analytics-property-source="map_ranking"
              className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 hover:ring-ocean-300"
            >
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  {s.beach.name}
                </div>
                <div className="text-xs text-slate-500">
                  {s.wind
                    ? `${s.wind.directionLabel} ${s.wind.speedKt}kt`
                    : "no wind data"}
                  {" · "}
                  <span className="text-ocean-600">guide</span>
                </div>
              </div>
              <span
                className={`rounded-lg px-2 py-1 text-sm font-bold ${bg} ${text}`}
                style={{ boxShadow: `inset 0 0 0 1px ${hex}33` }}
              >
                {s.score}
              </span>
            </Link>
          );
        })}
        {!summaries && !error && (
          <p className="col-span-2 text-center text-xs text-slate-400">
            Fetching live scores for all beaches…
          </p>
        )}
      </div>
    </div>
  );
}

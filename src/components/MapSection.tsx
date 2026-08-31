"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { BeachSummary } from "@/lib/types";
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
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/summaries")
      .then((r) => r.json())
      .then((d) => {
        if (active) setSummaries(d.summaries ?? []);
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

  return (
    <div className="space-y-3">
      <div className="h-56 w-full overflow-hidden rounded-xl ring-1 ring-slate-200">
        {summaries && !error ? (
          <BeachMap summaries={summaries} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            {error ? "Map data unavailable" : "Loading conditions…"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ranked.map((s) => {
          const { hex, bg, text } = ratingClasses(s.rating);
          return (
            <Link
              key={s.beach.id}
              href={`/?beach=${s.beach.id}`}
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

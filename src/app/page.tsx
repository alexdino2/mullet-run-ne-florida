import Link from "next/link";
import { getBeaches } from "@/lib/beaches";
import { computeBeachConditions } from "@/lib/conditions";
import { getRecentSightings } from "@/lib/sightings";
import { getAlertRules } from "@/lib/alerts";
import { BeachSwitcher } from "@/components/BeachSwitcher";
import { ScoreGauge } from "@/components/ScoreGauge";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { ConditionsGrid } from "@/components/ConditionsGrid";
import { NextWindowCard } from "@/components/NextWindowCard";
import { MapSection } from "@/components/MapSection";
import { SightingList } from "@/components/SightingList";
import { AlertRulesTable } from "@/components/AlertRulesTable";

export const dynamic = "force-dynamic";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 text-xs font-bold uppercase tracking-widest text-slate-400">
      {children}
    </h2>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { beach?: string };
}) {
  const beaches = await getBeaches();
  const selected =
    beaches.find((b) => b.id === searchParams.beach) ?? beaches[0];

  const sightings = await getRecentSightings(100);
  const [data, rules] = await Promise.all([
    computeBeachConditions(selected, sightings),
    getAlertRules(),
  ]);

  const generated = new Date(data.generatedAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div>
      <BeachSwitcher beaches={beaches} currentId={selected.id} />

      <div className="mt-4 flex flex-col items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900">
            {selected.name}
          </h1>
          {selected.id === "micklers" && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              ★ Priority
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Updated {generated} · sources: {data.conditions.sources.join(", ") || "none available"}
        </p>

        <div className="mt-3">
          <ScoreGauge score={data.score.score} rating={data.score.rating} />
        </div>
        <p className="mt-2 max-w-xs text-center text-sm font-medium text-slate-600">
          {data.score.summary}
        </p>
      </div>

      <div className="mt-5">
        <NextWindowCard window={data.nextWindow} />
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Live migration map
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Recent crowd reports and live conditions along Florida’s Atlantic
            coast.
          </p>
        </div>
        <Link
          href="/sightings"
          className="shrink-0 rounded-lg bg-ocean-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-ocean-700"
        >
          + Report bait
        </Link>
      </div>
      <div className="mt-3">
        <MapSection />
      </div>

      <SectionTitle>Current conditions</SectionTitle>
      <ConditionsGrid conditions={data.conditions} />

      <SectionTitle>Why this score</SectionTitle>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <ScoreBreakdown components={data.score.components} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Recent sightings · {selected.name}
        </h2>
        <Link
          href="/sightings"
          className="text-xs font-semibold text-ocean-600 hover:text-ocean-700"
        >
          Add / view all →
        </Link>
      </div>
      <div className="mt-2">
        <SightingList
          sightings={data.recentSightings}
          beaches={beaches}
          emptyHint="No sightings logged here yet — be the first to report a school."
        />
      </div>

      <SectionTitle>Alert rules (for future notifications)</SectionTitle>
      <AlertRulesTable rules={rules} beaches={beaches} />
      <p className="mt-2 text-xs text-slate-400">
        These rules define when notifications will fire once a delivery channel
        is connected. The hourly refresh already evaluates them.
      </p>
    </div>
  );
}

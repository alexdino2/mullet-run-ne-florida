import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/content/guides";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Mullet Run Guide — Biology, Locations, Regulations & Tactics",
  description:
    "The complete Florida mullet run guide: what triggers the migration, the best inlets, FWC regulations, and the tactics and gear that land tarpon and snook from the beach.",
  alternates: { canonical: "/guide" },
};

export default function GuideHubPage() {
  return (
    <div>
      <div className="rounded-2xl bg-ocean-900 p-5 text-white">
        <h1 className="text-xl font-bold">Florida Mullet Run Guide</h1>
        <p className="mt-1 text-sm text-ocean-100">
          Everything you need to fish the fall run — the science behind the
          migration, where to stand, what’s legal, and how to hook up.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}`}
            className="group rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:ring-ocean-300"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden>
                {g.emoji}
              </span>
              <span className="rounded-full bg-ocean-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ocean-700">
                {g.category}
              </span>
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-900 group-hover:text-ocean-700">
              {g.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{g.summary}</p>
            <p className="mt-2 text-xs font-semibold text-ocean-600">
              {g.readMinutes} min read →
            </p>
          </Link>
        ))}
      </div>

      <AdSlot label="In-content ad" />

      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-bold text-slate-900">
          Ready to get on the fish?
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Check live conditions, gear up, or book a captain who’s already on the
          bait.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-lg bg-ocean-600 px-3 py-2 text-xs font-bold text-white hover:bg-ocean-700"
          >
            Live conditions
          </Link>
          <Link
            href="/gear"
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            Gear guide
          </Link>
          <Link
            href="/charters"
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            Find a charter
          </Link>
        </div>
      </div>
    </div>
  );
}

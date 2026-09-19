import type { Metadata } from "next";
import Link from "next/link";
import { GEAR } from "@/lib/content/gear";
import { amazonSearch } from "@/lib/monetization";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Best Mullet Run Gear — Rods, Reels, Line & Lures",
  description:
    "A no-fluff Florida mullet run gear guide: the surf rods, spinning reels, braid, leaders, and mullet-matching lures that land tarpon, snook, and sharks from the beach.",
  alternates: { canonical: "/gear" },
};

const TIER_LABEL: Record<string, string> = {
  $: "Budget",
  $$: "Mid",
  $$$: "Premium",
};

export default function GearPage() {
  return (
    <div>
      <div className="rounded-2xl bg-ocean-900 p-5 text-white">
        <h1 className="text-xl font-bold">Mullet Run Gear Guide</h1>
        <p className="mt-1 text-sm text-ocean-100">
          The surf kit that won’t get spooled by a beach tarpon — organized by
          job, with picks at a few price points.
        </p>
      </div>

      <div className="mt-4">
        <AffiliateDisclosure />
      </div>

      <nav className="mt-4 flex flex-wrap gap-2">
        {GEAR.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ocean-700 shadow-sm ring-1 ring-slate-100 hover:ring-ocean-300"
          >
            {cat.title}
          </a>
        ))}
      </nav>

      {GEAR.map((cat, ci) => (
        <section key={cat.id} id={cat.id} className="mt-8 scroll-mt-28">
          <h2 className="text-lg font-bold text-slate-900">{cat.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{cat.intent}</p>

          <div className="mt-3 space-y-3">
            {cat.items.map((item) => (
              <div
                key={item.name}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] font-bold text-slate-900">
                    {item.name}
                  </h3>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {TIER_LABEL[item.tier]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.blurb}</p>
                <a
                  href={amazonSearch(item.query)}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  data-analytics-event="affiliate_link_clicked"
                  data-analytics-property-category={cat.id}
                  data-analytics-property-product={item.name}
                  data-analytics-property-tier={item.tier}
                  className="mt-3 inline-flex rounded-lg bg-ocean-600 px-3 py-2 text-xs font-bold text-white hover:bg-ocean-700"
                >
                  Shop {item.name.split("(")[0].trim()} →
                </a>
              </div>
            ))}
          </div>

          {ci === 1 && <AdSlot label="In-content ad" />}
        </section>
      ))}

      <div className="mt-8 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-bold text-slate-900">
          Not sure how to fish it?
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Our tactics guide covers reading the blitz, matching the bait, and
          working the edges of a pod.
        </p>
        <Link
          href="/guide/tactics"
          className="mt-3 inline-flex rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
        >
          Read the tactics guide →
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  CHARTER_COASTS,
  CHARTER_FORM_ID as FORM_ID,
  CHARTER_REGIONS,
} from "@/lib/content/charters";
import { monetization } from "@/lib/monetization";
import { CharterListingForm } from "@/components/CharterListingForm";

export const metadata: Metadata = {
  title: "Florida Mullet Run Charters — Atlantic & Gulf Coast Guides",
  description:
    "Find a verified mullet run charter captain on Florida's Atlantic and Gulf coasts, from Jacksonville to Miami and Pensacola to Naples. Captains: get your charter listed at the season's top inlets and passes.",
  alternates: { canonical: "/charters" },
};

export default function ChartersPage() {
  return (
    <div>
      <div className="rounded-2xl bg-ocean-900 p-5 text-white">
        <h1 className="text-xl font-bold">Mullet Run Charters</h1>
        <p className="mt-1 text-sm text-ocean-100">
          Where the run fishes best, region by region — and the captains who
          fish it.
        </p>
        <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs text-ocean-50">
          We’re verifying the first captains for this season. Listings appear
          here once a USCG license is confirmed; until then, use the region notes
          below to plan your own trip.
        </p>
      </div>

      <nav
        aria-label="Coasts"
        className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"
      >
        {CHARTER_COASTS.map((coast) => (
          <a
            key={coast.id}
            href={`#${coast.id}`}
            className="rounded-full bg-white px-3 py-1.5 text-ocean-700 shadow-sm ring-1 ring-slate-100 hover:bg-ocean-50"
          >
            {coast.name}
          </a>
        ))}
        <a
          href={`#${FORM_ID}`}
          data-analytics-event="charter_lead_started"
          data-analytics-property-placement="captain_cta"
          className="rounded-full bg-amber-500 px-3 py-1.5 text-white shadow-sm hover:bg-amber-600"
        >
          List your charter
        </a>
      </nav>

      {CHARTER_COASTS.map((coast) => (
        <section key={coast.id} id={coast.id} className="mt-6 scroll-mt-28">
          <h2 className="text-lg font-bold text-slate-900">{coast.name}</h2>
          <p className="mt-0.5 text-sm text-slate-600">{coast.blurb}</p>
          <div className="mt-3 space-y-4">
            {CHARTER_REGIONS.filter((r) => r.coast === coast.id).map(
              (region) => (
                <section
                  key={region.id}
                  className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <h3 className="text-base font-bold text-slate-900">
                    {region.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {region.fishery}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {region.targets.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-ocean-50 px-2 py-0.5 text-[11px] font-semibold text-ocean-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end border-t border-dashed border-slate-200 pt-3">
                    <Link
                      href={{ query: { region: region.id }, hash: FORM_ID }}
                      data-analytics-event="charter_lead_started"
                      data-analytics-property-region={region.id}
                      data-analytics-property-placement="region"
                      className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
                    >
                      {coast.id === "gulf"
                        ? "Claim this area"
                        : "Claim this inlet"}
                    </Link>
                  </div>
                </section>
              ),
            )}
          </div>
        </section>
      ))}

      {/* Captain lead-gen CTA */}
      <div
        id={FORM_ID}
        className="mt-6 scroll-mt-28 rounded-2xl bg-gradient-to-br from-ocean-700 to-ocean-900 p-5 text-white"
      >
        <h2 className="text-lg font-bold">
          Captains: get booked out this fall
        </h2>
        <p className="mt-1 text-sm text-ocean-100">
          The mullet run is your busiest window. Get your charter in front of
          anglers checking live conditions at your inlet or pass every day of
          the season.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-ocean-50">
          <li className="flex gap-2">
            <span aria-hidden>✔</span> Verified listing at your home inlet or
            pass
          </li>
          <li className="flex gap-2">
            <span aria-hidden>✔</span> Direct booking link — no middleman on
            your trips
          </li>
          <li className="flex gap-2">
            <span aria-hidden>✔</span> Featured placement during peak-season
            traffic
          </li>
        </ul>
        <div className="mt-4">
          <CharterListingForm contactEmail={monetization.charterContactEmail} />
        </div>
        <p className="mt-2 text-[11px] text-ocean-200">
          We verify a valid USCG captain’s license before any listing goes live.
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Not fishing with a guide?{" "}
        <Link href="/gear" className="font-semibold text-ocean-600">
          Gear up
        </Link>{" "}
        and{" "}
        <Link href="/guide/tactics" className="font-semibold text-ocean-600">
          learn the tactics
        </Link>
        .
      </p>
    </div>
  );
}

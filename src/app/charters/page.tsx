import type { Metadata } from "next";
import Link from "next/link";
import { CHARTER_REGIONS } from "@/lib/content/charters";
import { monetization } from "@/lib/monetization";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Florida Mullet Run Charters — Book a Guide by Inlet",
  description:
    "Find a verified mullet run charter captain along Florida's Atlantic coast, from Northeast Florida to Miami. Captains: get your charter listed at the season's top inlets.",
  alternates: { canonical: "/charters" },
};

const listingSubject = encodeURIComponent("Charter listing request");
const listingBody = encodeURIComponent(
  "Captain name:\nBusiness name:\nHome inlet/region:\nTarget species:\nWebsite/booking link:\nPhone:\nUSCG license #:\n",
);
const claimMailto = `mailto:${monetization.charterContactEmail}?subject=${listingSubject}&body=${listingBody}`;

export default function ChartersPage() {
  return (
    <div>
      <div className="rounded-2xl bg-ocean-900 p-5 text-white">
        <h1 className="text-xl font-bold">Mullet Run Charters</h1>
        <p className="mt-1 text-sm text-ocean-100">
          Book a captain who’s already on the bait. Verified guides organized by
          the inlets where the run fires.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {CHARTER_REGIONS.map((region, i) => (
          <section
            key={region.id}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <h2 className="text-base font-bold text-slate-900">
              {region.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{region.fishery}</p>
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
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3">
              <p className="text-xs text-slate-400">
                Verified listings opening for this season.
              </p>
              <a
                href={claimMailto}
                className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
              >
                Claim this inlet
              </a>
            </div>
            {i === 1 && <AdSlot label="In-content ad" />}
          </section>
        ))}
      </div>

      {/* Captain lead-gen CTA */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-ocean-700 to-ocean-900 p-5 text-white">
        <h2 className="text-lg font-bold">Captains: get booked out this fall</h2>
        <p className="mt-1 text-sm text-ocean-100">
          The mullet run is your busiest window. Get your charter in front of
          anglers checking live conditions at your inlet every day of the season.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-ocean-50">
          <li className="flex gap-2">
            <span aria-hidden>✔</span> Verified listing at your home inlet
          </li>
          <li className="flex gap-2">
            <span aria-hidden>✔</span> Direct booking link — no middleman on your
            trips
          </li>
          <li className="flex gap-2">
            <span aria-hidden>✔</span> Featured placement during peak-season
            traffic
          </li>
        </ul>
        <a
          href={claimMailto}
          className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-bold text-ocean-800 hover:bg-ocean-50"
        >
          List your charter →
        </a>
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

import type { Metadata } from "next";
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
import { AdSlot } from "@/components/AdSlot";
import { FaqSection } from "@/components/FaqSection";
import { TrackerHero } from "@/components/TrackerHero";
import { TRACKER_FAQ } from "@/lib/content/faq";
import { GUIDES } from "@/lib/content/guides";
import { ratingClasses, ratingLabel } from "@/lib/ui";

export const dynamic = "force-dynamic";

const PAGE_PATH = "/florida-mullet-tracker";
const SITE_URL = "https://floridamulletrun.com";

export const metadata: Metadata = {
  title: {
    absolute:
      "Florida Mullet Tracker — Live Run Scores & Sightings Map",
  },
  description:
    "Florida mullet tracker with live opportunity scores, Atlantic coastal conditions, and a crowdsourced sightings map from Northeast Florida to Miami. See where the bait is stacking up today.",
  keywords: [
    "florida mullet tracker",
    "mullet tracker florida",
    "florida mullet run tracker",
    "live mullet tracker",
    "mullet run map florida",
    "where are the mullet",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "website",
    url: PAGE_PATH,
    title: "Florida Mullet Tracker — Live Run Scores & Sightings Map",
    description:
      "Live opportunity scores and crowdsourced mullet sightings from Northeast Florida to Miami.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Florida Mullet Tracker — Live Run Scores & Sightings Map",
    description:
      "Live opportunity scores and crowdsourced mullet sightings from Northeast Florida to Miami.",
  },
};

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight text-ocean-950">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export default async function FloridaMulletTrackerPage({
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
  const { hex } = ratingClasses(data.score.rating);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Florida Mullet Tracker",
    url: `${SITE_URL}${PAGE_PATH}`,
    applicationCategory: "SportsApplication",
    operatingSystem: "Any",
    description:
      "Live Florida mullet tracker with opportunity scores, coastal conditions, and a crowdsourced Atlantic sightings map.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    areaServed: { "@type": "State", name: "Florida" },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <div className="tracker-page">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <TrackerHero />

      <section id="live-tracker" className="tracker-section scroll-mt-28">
        <SectionHeading
          title="Live beach scores"
          description="Pick a station. Scores refresh from NWS, NOAA tides, and buoy data."
        />

        <BeachSwitcher
          beaches={beaches}
          currentId={selected.id}
          basePath={PAGE_PATH}
        />

        <div className="tracker-score mt-5">
          <div className="tracker-score__meta">
            <h3 className="font-display text-2xl font-bold tracking-tight text-ocean-950">
              <Link
                href={`/beaches/${selected.id}`}
                className="hover:text-ocean-700"
              >
                {selected.name}
              </Link>
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Updated {generated}
              {data.conditions.sources.length > 0
                ? ` · ${data.conditions.sources.join(", ")}`
                : " · sources unavailable"}
              {" · "}
              <Link
                href={`/beaches/${selected.id}`}
                className="font-medium text-ocean-600 hover:text-ocean-700"
              >
                beach guide
              </Link>
            </p>
          </div>

          <div className="tracker-score__gauge">
            <ScoreGauge score={data.score.score} rating={data.score.rating} />
          </div>

          <p className="tracker-score__summary">
            <span className="font-semibold" style={{ color: hex }}>
              {ratingLabel(data.score.rating)}
            </span>
            {" — "}
            {data.score.summary}
          </p>
        </div>

        <div className="mt-5">
          <NextWindowCard window={data.nextWindow} />
        </div>
      </section>

      <section className="tracker-section">
        <SectionHeading
          title="Live migration map"
          description="Crowd reports and conditions along Florida’s Atlantic coast."
          action={
            <Link
              href="/sightings"
              className="shrink-0 rounded-lg bg-ocean-700 px-3 py-2 text-xs font-bold text-white hover:bg-ocean-800"
            >
              Report bait
            </Link>
          }
        />
        <MapSection />
      </section>

      <AdSlot label="Advertisement" />

      <section className="tracker-section">
        <SectionHeading
          title="Current conditions"
          description={`What’s driving the score at ${selected.name}.`}
        />
        <ConditionsGrid conditions={data.conditions} />
      </section>

      <section className="tracker-section">
        <SectionHeading title="Why this score" />
        <div className="rounded-xl bg-white/80 p-4 ring-1 ring-ocean-100 backdrop-blur-sm">
          <ScoreBreakdown components={data.score.components} />
        </div>
      </section>

      <section className="tracker-section">
        <SectionHeading
          title={`Recent sightings · ${selected.name}`}
          action={
            <Link
              href="/sightings"
              className="text-xs font-semibold text-ocean-700 hover:text-ocean-800"
            >
              View all →
            </Link>
          }
        />
        <SightingList
          sightings={data.recentSightings}
          beaches={beaches}
          emptyHint="No sightings logged here yet — be the first to report a school."
        />
      </section>

      <section className="tracker-section">
        <SectionHeading
          title="Learn the run"
          description="Biology, inlets, regulations, and tactics for the fall migration."
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href="/beaches"
            className="group border-b border-ocean-100 py-3 transition hover:border-ocean-300 sm:col-span-2 sm:border sm:rounded-xl sm:border-ocean-100 sm:bg-white/70 sm:px-4 sm:py-3 sm:hover:border-ocean-300"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-ocean-600">
              Locations
            </span>
            <p className="mt-0.5 font-display text-base font-bold leading-snug text-ocean-950 group-hover:text-ocean-700">
              Beach-by-beach mullet run guides
            </p>
          </Link>
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guide/${g.slug}`}
              className="group border-b border-ocean-100 py-3 transition hover:border-ocean-300 sm:border sm:rounded-xl sm:border-ocean-100 sm:bg-white/70 sm:px-4 sm:py-3 sm:hover:border-ocean-300"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-ocean-600">
                {g.category}
              </span>
              <p className="mt-0.5 font-display text-base font-bold leading-snug text-ocean-950 group-hover:text-ocean-700">
                {g.title}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <Link href="/gear" className="text-ocean-700 hover:text-ocean-900">
            Gear
          </Link>
          <Link
            href="/charters"
            className="text-ocean-700 hover:text-ocean-900"
          >
            Charters
          </Link>
          <Link href="/insider" className="text-ocean-700 hover:text-ocean-900">
            Insider
          </Link>
          <Link href="/" className="text-ocean-700 hover:text-ocean-900">
            Home dashboard
          </Link>
        </div>
      </section>

      <FaqSection
        items={TRACKER_FAQ}
        heading="Florida mullet tracker FAQ"
      />

      <section className="tracker-section tracker-section--muted">
        <SectionHeading title="Alert rules (for future notifications)" />
        <AlertRulesTable rules={rules} beaches={beaches} />
        <p className="mt-2 text-xs text-slate-400">
          These rules define when notifications will fire once a delivery
          channel is connected. The hourly refresh already evaluates them.
        </p>
      </section>
    </div>
  );
}

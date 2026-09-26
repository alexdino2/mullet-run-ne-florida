import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BEACH_CONTENT,
  beachesByRegion,
  beachPath,
} from "@/lib/content/beaches";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Florida Mullet Run Beaches — Inlet & Surf Guides",
  description:
    "Beach-by-beach Florida mullet run guides from Mickler's Landing to Miami Beach: photos, access tips, tactics, and links to live opportunity scores along the Atlantic corridor.",
  alternates: { canonical: "/beaches" },
  openGraph: {
    type: "website",
    title: "Florida Mullet Run Beaches — Inlet & Surf Guides",
    description:
      "Explore every tracked Atlantic beach on the Florida mullet run map, with photos and fishing guides.",
    url: "/beaches",
  },
};

export default function BeachesHubPage() {
  const regions = beachesByRegion();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Florida Mullet Run Beaches",
    description:
      "Guides for every Atlantic beach station tracked on the Florida Mullet Run live map.",
    url: "https://floridamulletrun.com/beaches",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: BEACH_CONTENT.length,
      itemListElement: BEACH_CONTENT.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://floridamulletrun.com${beachPath(b.slug)}`,
        name: b.headline,
      })),
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="rounded-2xl bg-ocean-900 p-5 text-white">
        <h1 className="text-xl font-bold">Mullet Run Beaches</h1>
        <p className="mt-1 text-sm text-ocean-100">
          Every station on the live map — north-to-south along Florida&apos;s
          Atlantic migration corridor, with photos, access notes, and fishing
          tips.
        </p>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Content for each beach lives in one editable file so guides stay easy to
        update. Check{" "}
        <Link href="/" className="font-semibold text-ocean-600 hover:text-ocean-700">
          live conditions
        </Link>{" "}
        before you drive.
      </p>

      {regions.map((group) => (
        <section key={group.region} className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {group.region}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {group.beaches.map((beach) => (
              <Link
                key={beach.id}
                href={beachPath(beach.slug)}
                className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:ring-ocean-300"
              >
                <div className="relative aspect-[16/10] bg-slate-100">
                  <Image
                    src={beach.image.src}
                    alt={beach.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    quality={70}
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-ocean-700">
                    {beach.headline.replace(/ Mullet Run$/, "")}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {beach.summary}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-ocean-600">
                    Beach guide →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <AdSlot label="In-content ad" />

      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-bold text-slate-900">
          See where bait is right now
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Scores and crowd sightings update throughout the day on the live
          tracker.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-lg bg-ocean-600 px-3 py-2 text-xs font-bold text-white hover:bg-ocean-700"
          >
            Live map & scores
          </Link>
          <Link
            href="/guide/locations"
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            Locations overview
          </Link>
        </div>
      </div>
    </div>
  );
}

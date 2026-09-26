import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FALLBACK_BEACHES } from "@/lib/beaches";
import {
  BEACH_CONTENT,
  beachPath,
  getBeachContent,
  getBeachContentById,
} from "@/lib/content/beaches";
import { AdSlot } from "@/components/AdSlot";

export function generateStaticParams() {
  return BEACH_CONTENT.map((b) => ({ slug: b.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const beach = getBeachContent(params.slug);
  if (!beach) return { title: "Beach not found" };

  const url = beachPath(beach.slug);
  const ogTitle = beach.ogTitle ?? beach.title;

  return {
    title: beach.title,
    description: beach.description,
    keywords: beach.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: ogTitle,
      description: beach.description,
      url,
      images: [
        {
          url: beach.image.src,
          width: beach.image.width,
          height: beach.image.height,
          alt: beach.image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: beach.description,
      images: [beach.image.src],
    },
  };
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2 text-[15px] leading-relaxed text-slate-700"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function BeachPage({ params }: { params: { slug: string } }) {
  const content = getBeachContent(params.slug);
  if (!content) notFound();

  const station = FALLBACK_BEACHES.find((b) => b.id === content.id);
  const nearby = content.nearby
    .map((id) => getBeachContentById(id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const pageUrl = `https://floridamulletrun.com${beachPath(content.slug)}`;
  const imageUrl = `https://floridamulletrun.com${content.image.src}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      "@id": `${pageUrl}#place`,
      name: station?.name ?? content.headline,
      description: content.description,
      url: pageUrl,
      image: imageUrl,
      touristType: "Fishing",
      isAccessibleForFree: true,
      geo: station
        ? {
            "@type": "GeoCoordinates",
            latitude: station.lat,
            longitude: station.lon,
          }
        : undefined,
      address: {
        "@type": "PostalAddress",
        addressRegion: "FL",
        addressCountry: "US",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: content.headline,
      description: content.description,
      dateModified: content.updated,
      image: imageUrl,
      author: { "@type": "Organization", name: "Florida Mullet Run" },
      publisher: { "@type": "Organization", name: "Florida Mullet Run" },
      mainEntityOfPage: pageUrl,
      about: { "@id": `${pageUrl}#place` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://floridamulletrun.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Beaches",
          item: "https://floridamulletrun.com/beaches",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: station?.name ?? content.headline,
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <article>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-slate-400">
        <Link href="/beaches" className="hover:text-ocean-600">
          Beaches
        </Link>{" "}
        / <span className="text-slate-500">{content.region}</span>
      </nav>

      <header className="mt-2">
        <span className="rounded-full bg-ocean-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ocean-700">
          {content.region}
        </span>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900">
          {content.headline}
        </h1>
        <p className="mt-2 text-base text-slate-600">{content.summary}</p>
        <p className="mt-2 text-xs text-slate-400">
          Updated{" "}
          {new Date(content.updated).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <figure className="mt-5 overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={content.image.src}
            alt={content.image.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            quality={75}
          />
        </div>
        <figcaption className="px-3 py-2 text-[11px] leading-relaxed text-slate-500">
          {content.image.alt}. Photo: {content.image.credit} ({content.image.license}
          ).{" "}
          <a
            href={content.image.sourceUrl}
            className="underline hover:text-ocean-600"
            rel="noopener noreferrer"
            target="_blank"
          >
            Source
          </a>
        </figcaption>
      </figure>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/?beach=${content.id}`}
          className="rounded-lg bg-ocean-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-ocean-700"
        >
          Live score for {station?.name ?? "this beach"}
        </Link>
        <Link
          href="/sightings"
          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
        >
          Report a sighting
        </Link>
      </div>

      <div className="mt-6 space-y-6">
        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-900">
            About {station?.name ?? content.headline}
          </h2>
          {content.about.map((p) => (
            <p
              key={p.slice(0, 48)}
              className="mt-2 text-[15px] leading-relaxed text-slate-700"
            >
              {p}
            </p>
          ))}
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-900">
            Why fish here during the run
          </h2>
          <BulletList items={content.whyFish} />
        </section>

        <AdSlot label="In-content ad" />

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-900">
            Angler tips
          </h2>
          <BulletList items={content.tips} />
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-900">
            Access & conditions notes
          </h2>
          <BulletList items={content.access} />
          {station && (
            <p className="mt-3 text-sm text-slate-500">
              Map pin: {station.lat.toFixed(4)}°N,{" "}
              {Math.abs(station.lon).toFixed(4)}°W
              {station.nws_note ? ` · ${station.nws_note}` : ""}
            </p>
          )}
        </section>
      </div>

      {nearby.length > 0 && (
        <div className="mt-8 border-t border-slate-200 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Nearby beaches
          </h2>
          <ul className="mt-3 space-y-3">
            {nearby.map((b) => (
              <li key={b.id}>
                <Link
                  href={beachPath(b.slug)}
                  className="flex gap-3 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100 transition hover:ring-ocean-300"
                >
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={b.image.src}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                      quality={60}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ocean-700">
                      {b.headline.replace(/ Mullet Run$/, "")} →
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                      {b.summary}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-bold text-slate-900">Keep learning</h2>
        <ul className="mt-2 space-y-1.5">
          <li>
            <Link
              href="/guide/locations"
              className="text-sm font-semibold text-ocean-600 hover:text-ocean-700"
            >
              Full inlet & beaches overview →
            </Link>
          </li>
          <li>
            <Link
              href="/guide/tactics"
              className="text-sm font-semibold text-ocean-600 hover:text-ocean-700"
            >
              Mullet run tactics & gear →
            </Link>
          </li>
          <li>
            <Link
              href="/beaches"
              className="text-sm font-semibold text-ocean-600 hover:text-ocean-700"
            >
              All beach guides →
            </Link>
          </li>
        </ul>
      </div>
    </article>
  );
}

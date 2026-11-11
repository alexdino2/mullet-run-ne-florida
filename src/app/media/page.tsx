import type { Metadata } from "next";
import Link from "next/link";
import { MEDIA_VIDEOS } from "@/lib/content/media";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mullet Run Videos",
  description:
    "Short videos of the Florida mullet run, including the run seen from inside the school as a tarpon strikes in the Northeast Florida surf.",
  alternates: { canonical: "/media" },
};

const videoJsonLd = MEDIA_VIDEOS.map((v) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: v.title,
  description: v.credit ? `${v.description} ${v.credit}` : v.description,
  thumbnailUrl: `${SITE_URL}${v.poster}`,
  contentUrl: `${SITE_URL}${v.src}`,
  uploadDate: v.published,
  duration: v.duration,
  width: v.width,
  height: v.height,
}));

export default function MediaPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />

      <div className="rounded-2xl bg-ocean-900 p-5 text-white">
        <h1 className="text-xl font-bold">Mullet Run Videos</h1>
        <p className="mt-1 text-sm text-ocean-100">
          Clips from the fall run along Florida’s beaches.
        </p>
      </div>

      <div className="mt-5 space-y-6">
        {MEDIA_VIDEOS.map((v) => (
          <figure
            key={v.id}
            id={v.id}
            className="scroll-mt-28 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100"
          >
            <div className="flex justify-center bg-slate-900">
              <video
                src={v.src}
                poster={v.poster}
                width={v.width}
                height={v.height}
                controls
                playsInline
                loop
                preload="metadata"
                className="h-auto max-h-[80vh] w-auto max-w-full"
                aria-label={v.title}
              />
            </div>
            <figcaption className="px-4 py-3">
              <h2 className="text-base font-bold text-slate-900">{v.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {v.description}
              </p>
              {v.credit && (
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {v.credit}
                </p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-600">
        Want to see the real thing? Check the{" "}
        <Link href="/sightings" className="font-semibold text-ocean-600">
          live sightings map
        </Link>{" "}
        or the{" "}
        <Link href="/" className="font-semibold text-ocean-600">
          current beach scores
        </Link>
        .
      </p>
    </div>
  );
}

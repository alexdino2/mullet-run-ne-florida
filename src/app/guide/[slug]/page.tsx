import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide, relatedLink } from "@/lib/content/guides";
import { AdSlot } from "@/components/AdSlot";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return { title: "Guide not found" };
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/guide/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.summary,
      url: `/guide/${guide.slug}`,
    },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const related = guide.related
    .map(relatedLink)
    .filter((r): r is { href: string; label: string } => r !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.summary,
    dateModified: guide.updated,
    articleSection: guide.category,
    author: { "@type": "Organization", name: "Florida Mullet Run" },
    publisher: { "@type": "Organization", name: "Florida Mullet Run" },
    mainEntityOfPage: `https://floridamulletrun.com/guide/${guide.slug}`,
  };

  return (
    <article>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-slate-400">
        <Link href="/guide" className="hover:text-ocean-600">
          Guide
        </Link>{" "}
        / <span className="text-slate-500">{guide.category}</span>
      </nav>

      <header className="mt-2">
        <span className="rounded-full bg-ocean-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ocean-700">
          {guide.emoji} {guide.category}
        </span>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900">
          {guide.title}
        </h1>
        <p className="mt-2 text-base text-slate-600">{guide.summary}</p>
        <p className="mt-2 text-xs text-slate-400">
          {guide.readMinutes} min read · Updated{" "}
          {new Date(guide.updated).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <div className="mt-6 space-y-6">
        {guide.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="mb-2 text-lg font-bold text-slate-900">
                {section.heading}
              </h2>
            )}
            {section.paragraphs?.map((p, j) => (
              <p key={j} className="mt-2 text-[15px] leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-3 space-y-1.5">
                {section.bullets.map((b, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-[15px] leading-relaxed text-slate-700"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {i === 1 && <AdSlot label="In-content ad" />}
          </section>
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-8 border-t border-slate-200 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Keep reading
          </h2>
          <ul className="mt-2 space-y-1.5">
            {related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="text-sm font-semibold text-ocean-600 hover:text-ocean-700"
                >
                  {r.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

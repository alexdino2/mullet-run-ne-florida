import { FAQ, type FaqItem } from "@/lib/content/faq";

/**
 * Renders an accessible FAQ block plus matching FAQPage structured data.
 *
 * Pass a subset of questions with `items` (e.g. a page-specific slice); it
 * defaults to the full shared list. The JSON-LD mirrors exactly what's on the
 * page so the markup stays eligible for rich results.
 */
export function FaqSection({
  items = FAQ,
  heading = "Mullet run FAQ",
}: {
  items?: FaqItem[];
  heading?: string;
}) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section aria-labelledby="faq-heading" className="mt-6">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2
        id="faq-heading"
        className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400"
      >
        {heading}
      </h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        {items.map((item) => (
          <details key={item.question} className="group px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-800">
              <span>{item.question}</span>
              <span
                aria-hidden
                className="text-ocean-500 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

/**
 * Shared layout for the site's plain-text pages (About, Contact, Privacy):
 * a header card followed by white section cards, matching the guide pages.
 */

export function InfoPage({
  title,
  lede,
  updated,
  children,
}: {
  title: string;
  lede: string;
  /** Human-readable "last updated" date, shown under the lede. */
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <article>
      <header className="rounded-2xl bg-ocean-900 p-5 text-white">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-ocean-100">{lede}</p>
        {updated && (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-ocean-300">
            Last updated {updated}
          </p>
        )}
      </header>
      <div className="mt-5 space-y-4">{children}</div>
    </article>
  );
}

export function InfoSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
    >
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700 [&_a]:font-semibold [&_a]:text-ocean-600 [&_a]:underline [&_a]:decoration-ocean-200 [&_a]:underline-offset-2 hover:[&_a]:text-ocean-700 [&_li]:ml-4 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}

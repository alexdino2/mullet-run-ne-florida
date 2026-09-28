import Link from "next/link";
import type { Coast } from "@/lib/types";

const OPTIONS: { coast: Coast; label: string; sub: string }[] = [
  { coast: "atlantic", label: "Atlantic", sub: "Jacksonville → Miami" },
  { coast: "gulf", label: "Gulf", sub: "Pensacola → Marco Island" },
];

/** Server-rendered coast switch (plain links, no client JS). */
export function CoastToggle({
  current,
  basePath = "/",
}: {
  current: Coast;
  basePath?: string;
}) {
  return (
    <nav
      aria-label="Choose a coast"
      className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
    >
      {OPTIONS.map((o) => {
        const active = o.coast === current;
        return (
          <Link
            key={o.coast}
            href={`${basePath}?coast=${o.coast}`}
            scroll={false}
            aria-current={active ? "page" : undefined}
            data-analytics-event="coast_selected"
            data-analytics-property-coast={o.coast}
            className={`rounded-lg px-3 py-2 text-center transition ${
              active
                ? "bg-white text-ocean-700 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="block text-sm font-bold">{o.label} coast</span>
            <span className="block text-[11px] font-medium opacity-80">{o.sub}</span>
          </Link>
        );
      })}
    </nav>
  );
}

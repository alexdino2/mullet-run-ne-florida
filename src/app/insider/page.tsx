import type { Metadata } from "next";
import Link from "next/link";
import { monetization } from "@/lib/monetization";

export const metadata: Metadata = {
  title: "Florida Mullet Run Insider — Real-Time Bait Alerts",
  description:
    "Join the Florida Mullet Run Insider waitlist for real-time bait-pod alerts, exclusive inlet reports, and member-only charter and tackle discounts.",
  alternates: { canonical: "/insider" },
};

const waitlistSubject = encodeURIComponent("Insider waitlist");
const waitlistMailto = `mailto:${monetization.insiderContactEmail}?subject=${waitlistSubject}`;
const waitlistHref = monetization.insiderWaitlistUrl ?? waitlistMailto;
const waitlistExternal = Boolean(monetization.insiderWaitlistUrl);

const PERKS = [
  {
    emoji: "📍",
    title: "Real-time pod alerts",
    body: "Push/SMS the moment a big school hits your home inlet — before it's picked over.",
  },
  {
    emoji: "🗺️",
    title: "Members-only reports",
    body: "Unfiltered daily inlet reports and the historical timing data behind the score.",
  },
  {
    emoji: "🎣",
    title: "Pro tactics",
    body: "Short breakdowns from local guides on how they're fishing the run this week.",
  },
  {
    emoji: "🏷️",
    title: "Member discounts",
    body: "Negotiated deals on partnered charter trips and tackle during the season.",
  },
];

export default function InsiderPage() {
  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white">
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
          Coming soon
        </span>
        <h1 className="mt-2 text-2xl font-bold">Mullet Run Insider</h1>
        <p className="mt-1 text-sm text-amber-50">
          The run moves fast. Insider gets you on the bait first — real-time
          alerts, member reports, and deals, straight from the coast.
        </p>
        <a
          href={waitlistHref}
          data-analytics-event="insider_waitlist_clicked"
          data-analytics-property-placement="hero"
          data-analytics-property-destination={
            waitlistExternal ? "hosted_form" : "email"
          }
          {...(waitlistExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50"
        >
          Join the waitlist →
        </a>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {PERKS.map((p) => (
          <div
            key={p.title}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <div className="text-lg" aria-hidden>
              {p.emoji}
            </div>
            <h2 className="mt-1 text-sm font-bold text-slate-900">{p.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-bold text-slate-900">Simple seasonal price</h2>
        <p className="mt-1 text-3xl font-bold text-slate-900">
          $29<span className="text-base font-medium text-slate-400">/year</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Planned launch pricing. Waitlist members get first access and a founding
          rate. No charge today.
        </p>
        <a
          href={waitlistHref}
          data-analytics-event="insider_waitlist_clicked"
          data-analytics-property-placement="pricing"
          data-analytics-property-destination={
            waitlistExternal ? "hosted_form" : "email"
          }
          {...(waitlistExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="mt-3 inline-flex rounded-lg bg-ocean-600 px-4 py-2 text-sm font-bold text-white hover:bg-ocean-700"
        >
          Get on the list
        </a>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Meanwhile, everything on{" "}
        <Link href="/" className="font-semibold text-ocean-600">
          Florida Mullet Run
        </Link>{" "}
        stays free. Insider just gets you there faster.
      </p>
    </div>
  );
}

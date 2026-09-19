import { AFFILIATE_DISCLOSURE } from "@/lib/monetization";

/** Compact FTC-style disclosure shown at the top of any page with paid links. */
export function AffiliateDisclosure({ className }: { className?: string }) {
  return (
    <p
      className={
        "rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800 ring-1 ring-amber-100 " +
        (className ?? "")
      }
    >
      <span className="font-semibold">Disclosure:</span> {AFFILIATE_DISCLOSURE}
    </p>
  );
}

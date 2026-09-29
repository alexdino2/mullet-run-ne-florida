"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { monetization, adsEnabled } from "@/lib/monetization";

interface AdSlotProps {
  /** AdSense ad-unit id (data-ad-slot). Defaults to `monetization.adsSlot`. */
  slot?: string;
  /** Short label describing where the unit lives. */
  label?: string;
  className?: string;
}

const isDev = process.env.NODE_ENV !== "production";

/**
 * A single in-page display-ad unit.
 *
 * Renders a responsive AdSense unit using the `slot` prop, or the site's
 * default in-content unit. If ads are ever unconfigured it renders nothing in
 * production and a labeled placeholder in development. Swapping in
 * Raptive/Mediavine later only touches this component.
 */
export function AdSlot({ slot, label = "Advertisement", className }: AdSlotProps) {
  const adSlot = slot ?? monetization.adsSlot;
  const live = adsEnabled && Boolean(adSlot);
  // Client-side navigations between pages of the same route (e.g. one beach
  // to another) reuse this component; re-key the unit so each page requests
  // a fresh ad instead of keeping the previous page's.
  const pathname = usePathname();

  useEffect(() => {
    if (!live) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* Unit already filled (e.g. Strict Mode double-effect) or blocked. */
    }
  }, [live, pathname]);

  // Units stay visible even when AdSense leaves them unfilled (as it does
  // while the site is under review), so the space is always there to see.
  const wrapper =
    "my-6 flex flex-col items-center " + (className ? className : "");

  if (!live) {
    if (!isDev) return null;
    return (
      <div className={wrapper} aria-hidden>
        <div className="flex min-h-[90px] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {label} placeholder
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <span className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-slate-300">
        {label}
      </span>
      <ins
        key={pathname}
        className="adsbygoogle block w-full"
        // Reserve the space before AdSense sizes the unit.
        style={{ display: "block", minHeight: 100 }}
        data-ad-client={monetization.adsClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

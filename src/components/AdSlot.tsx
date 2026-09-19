"use client";

import { useEffect } from "react";
import { monetization, adsEnabled } from "@/lib/monetization";

interface AdSlotProps {
  /** AdSense slot id (data-ad-slot). Optional while using auto/placeholder. */
  slot?: string;
  /** Short label describing where the unit lives, for the placeholder. */
  label?: string;
  className?: string;
}

/**
 * A single display-ad unit.
 *
 * When a publisher client id is configured (`NEXT_PUBLIC_ADS_CLIENT`) this
 * renders a real AdSense unit; otherwise it shows an unobtrusive, clearly
 * labeled placeholder so the layout is designed for ads from day one without
 * shipping a fake ad. Swapping in Raptive/Mediavine later only touches this
 * component.
 */
export function AdSlot({ slot, label = "Advertisement", className }: AdSlotProps) {
  useEffect(() => {
    if (!adsEnabled) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense not ready yet; it retries on the next render. */
    }
  }, []);

  const wrapper =
    "my-6 flex flex-col items-center " + (className ? className : "");

  if (!adsEnabled) {
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
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client={monetization.adsClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { adsEnabled, adsScriptSrc, isAdFreePath } from "@/lib/monetization";
import { afterFirstInteraction, loadScript } from "@/lib/defer";

/**
 * Loads the AdSense loader (which also powers Auto ads) after the first
 * interaction or a few idle seconds, instead of from <head>. The ~230 KiB of
 * ad JS it pulls in no longer blocks the first render on mobile. `<AdSlot>`
 * units push onto `window.adsbygoogle` beforehand; AdSense drains that queue
 * when it arrives.
 *
 * Pages in `AD_FREE_PATHS` skip it, so landing on one shows no Auto ads; the
 * script loads once the visitor navigates to a page that carries ads.
 */
export function AdSenseLoader() {
  const pathname = usePathname();
  const adFree = isAdFreePath(pathname);

  useEffect(() => {
    if (!adsEnabled || adFree) return;
    afterFirstInteraction().then(() =>
      loadScript("adsbygoogle-js", adsScriptSrc, { crossorigin: "anonymous" }),
    );
  }, [adFree]);

  return null;
}

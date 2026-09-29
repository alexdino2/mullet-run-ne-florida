"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { adsEnabled, adsScriptSrc, isAdFreePath } from "@/lib/monetization";
import { loadScript } from "@/lib/defer";

/**
 * Where the visitor entered the site. The server HTML carries the loader tag
 * unless that was an ad-free page. Read from `location`, which is set before
 * any script runs; always false on the server.
 */
const landedAdFree =
  typeof window !== "undefined" && isAdFreePath(window.location.pathname);

/**
 * The Google AdSense loader (which also powers Auto ads), rendered into
 * <head> of the server HTML exactly as AdSense issues it: a plain async tag,
 * not next/script, whose `data-nscript` attribute AdSense rejects. AdSense's
 * site review and crawler look for this tag in the page source, so it must
 * not be injected later by client JS.
 *
 * Pages in `AD_FREE_PATHS` leave it out. React doesn't execute scripts it
 * inserts itself, so a visitor who lands on one of those and then navigates
 * to a page with ads gets the loader injected by hand instead.
 */
export function AdSenseLoader() {
  const pathname = usePathname();
  const adFree = isAdFreePath(pathname);

  useEffect(() => {
    if (!adsEnabled || adFree || !landedAdFree) return;
    loadScript("adsbygoogle-js", adsScriptSrc, { crossorigin: "anonymous" });
  }, [adFree]);

  if (!adsEnabled || adFree || landedAdFree) return null;
  return <script async src={adsScriptSrc} crossOrigin="anonymous" />;
}

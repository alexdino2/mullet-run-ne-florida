"use client";

import { useEffect } from "react";
import { adsEnabled, adsScriptSrc } from "@/lib/monetization";
import { afterFirstInteraction, loadScript } from "@/lib/defer";

/**
 * Loads the AdSense loader (which also powers Auto ads) after the first
 * interaction or a few idle seconds, instead of from <head>. The ~230 KiB of
 * ad JS it pulls in no longer blocks the first render on mobile. `<AdSlot>`
 * units push onto `window.adsbygoogle` beforehand; AdSense drains that queue
 * when it arrives. It loads on every page, so every page requests ads.
 */
export function AdSenseLoader() {
  useEffect(() => {
    if (!adsEnabled) return;
    afterFirstInteraction().then(() =>
      loadScript("adsbygoogle-js", adsScriptSrc, { crossorigin: "anonymous" }),
    );
  }, []);

  return null;
}

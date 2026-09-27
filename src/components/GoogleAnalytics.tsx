"use client";

import { useEffect } from "react";
import { afterFirstInteraction, loadScript } from "@/lib/defer";

const measurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-R0TS34GF7K";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 via gtag.js, kept off the critical path:
 * - The dataLayer stub is set up right after hydration, so `config` (and the
 *   initial page_view) is queued immediately without any network request.
 * - gtag.js itself is fetched after the first interaction or a few idle
 *   seconds (see `afterFirstInteraction`); it flushes the queue on arrival.
 * Client-side route changes are picked up by GA4's enhanced measurement
 * (browser history events), so no manual page_view calls are needed.
 */
export function GoogleAnalytics() {
  useEffect(() => {
    if (!measurementId || window.gtag) return;

    const dataLayer = (window.dataLayer = window.dataLayer || []);
    const gtag = function gtag(..._args: unknown[]) {
      // gtag.js expects the `arguments` object itself, not an array.
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments);
    };
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", measurementId);

    afterFirstInteraction().then(() =>
      loadScript(
        "ga4-gtag",
        `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
      ),
    );
  }, []);

  return null;
}

import Script from "next/script";

const measurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-R0TS34GF7K";

/**
 * GA4 via gtag.js, loaded so it never competes with page rendering:
 * - The dataLayer stub is a few bytes of inline JS that runs after hydration,
 *   so `gtag()` calls queue up immediately without any network request.
 * - gtag.js itself (~100 KB) is fetched with `lazyOnload`, i.e. once the
 *   browser is idle after the load event, keeping it off the critical path
 *   for LCP/TBT/INP. Queued commands are flushed when it arrives.
 * Client-side route changes are picked up by GA4's enhanced measurement
 * (browser history events), so no manual page_view calls are needed.
 */
export function GoogleAnalytics() {
  if (!measurementId) return null;

  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`}
      </Script>
      <Script
        id="ga4-gtag"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
    </>
  );
}

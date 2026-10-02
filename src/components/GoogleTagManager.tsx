import { GTM_CONTAINER_ID } from "@/lib/site";

/**
 * Google Tag Manager loader, rendered into <head> of every page's server HTML
 * as Google issues it, so Tag Assistant and GA4 see it in the page source.
 * The GA4 tag (property 556083705) is configured inside the container; its
 * enhanced measurement records client-side navigations as page views.
 */
export function GoogleTagManager() {
  if (!GTM_CONTAINER_ID) return null;
  const id = JSON.stringify(GTM_CONTAINER_ID);
  // A plain inline tag, as Google issues it, rather than next/script, so the
  // container starts from the server HTML before hydration.
  return (
    // eslint-disable-next-line @next/next/next-script-for-ga
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${id});`,
      }}
    />
  );
}

/** GTM's no-JavaScript fallback, placed first in <body>. */
export function GoogleTagManagerNoScript() {
  if (!GTM_CONTAINER_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(GTM_CONTAINER_ID)}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

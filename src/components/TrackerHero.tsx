import Link from "next/link";

/**
 * Brand-first first viewport for the Florida mullet tracker landing page:
 * product name, one question, one supporting line, CTAs, and the animated
 * mullet school as a full-bleed visual plane.
 */
export function TrackerHero() {
  return (
    <section
      aria-labelledby="tracker-hero-brand"
      className="tracker-hero relative -mx-4 -mt-4 overflow-hidden text-white"
    >
      <div className="tracker-hero__visual" aria-hidden>
        {/* iframe keeps the SVG’s CSS animations alive (img would freeze them). */}
        <iframe
          src="/images/mullet-school.svg"
          title=""
          className="tracker-hero__svg"
          loading="eager"
          tabIndex={-1}
        />
      </div>

      <div className="tracker-hero__shade" aria-hidden />

      <div className="tracker-hero__content">
        <p id="tracker-hero-brand" className="tracker-hero__brand">
          Florida Mullet Tracker
        </p>
        <h1 className="tracker-hero__headline">
          Live bait scores from Northeast Florida to Miami
        </h1>
        <p className="tracker-hero__support">
          Opportunity ratings, coastal conditions, and crowdsourced sightings
          for the fall Atlantic mullet run.
        </p>
        <div className="tracker-hero__ctas">
          <a
            href="#live-tracker"
            className="tracker-hero__cta tracker-hero__cta--primary"
          >
            Open live tracker
          </a>
          <Link
            href="/sightings"
            className="tracker-hero__cta tracker-hero__cta--ghost"
          >
            Report a school
          </Link>
        </div>
      </div>
    </section>
  );
}

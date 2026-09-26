import Link from "next/link";

/**
 * First-viewport composition for the home page: brand, one question,
 * one supporting line, CTAs, and the animated mullet blitz as the
 * full-bleed visual plane.
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-brand"
      className="home-hero relative -mx-4 -mt-4 overflow-hidden text-white"
    >
      <div className="home-hero__visual" aria-hidden>
        {/* iframe keeps the SVG’s CSS animations alive (img would freeze them). */}
        <iframe
          src="/images/mullet-school.svg"
          title=""
          className="home-hero__svg"
          loading="eager"
          tabIndex={-1}
        />
      </div>

      <div className="home-hero__shade" aria-hidden />

      <div className="home-hero__content">
        <p id="home-hero-brand" className="home-hero__brand">
          Florida Mullet Run
        </p>
        <h1 className="home-hero__headline">Where are the mullet right now?</h1>
        <p className="home-hero__support">
          Live opportunity scores and crowdsourced sightings along the Atlantic
          migration from Northeast Florida to Miami.
        </p>
        <div className="home-hero__ctas">
          <a href="#tracker" className="home-hero__cta home-hero__cta--primary">
            Check conditions
          </a>
          <Link href="/sightings" className="home-hero__cta home-hero__cta--ghost">
            Report bait
          </Link>
        </div>
      </div>
    </section>
  );
}

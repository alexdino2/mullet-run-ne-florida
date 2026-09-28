import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { monetization } from "@/lib/monetization";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Florida Mullet Run collects and uses information: Google AdSense advertising cookies, analytics, affiliate links, crowdsourced mullet sightings, and charter listing requests.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "September 28, 2026";

const privacyMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Privacy request")}`;

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      lede="What Florida Mullet Run collects, why, who we share it with, and the choices you have — including how Google and other advertising partners use cookies on this site."
      updated={UPDATED}
    >
      <InfoSection title="Who we are">
        <p>
          Florida Mullet Run (floridamulletrun.com) is an independent Florida
          fishing resource that tracks the annual mullet migration using public
          weather and marine data and angler-submitted sightings. In this policy,
          “we”, “us” and “our” mean Florida Mullet Run.
        </p>
        <p>
          Questions or requests about your information:{" "}
          <a href={privacyMailto}>{CONTACT_EMAIL}</a>. See also our{" "}
          <Link href="/contact">Contact</Link> page.
        </p>
      </InfoSection>

      <InfoSection title="The short version">
        <ul>
          <li>
            You can use the whole site without an account. We don’t ask for your
            name or email to read conditions, scores or guides.
          </li>
          <li>
            The site shows Google AdSense ads. Google and its partners use
            cookies, web beacons and your IP address to serve and measure ads,
            which may be personalized. You can opt out (see{" "}
            <a href="#advertising">Advertising</a>).
          </li>
          <li>
            We use analytics to understand how the site is used and to fix bugs.
          </li>
          <li>
            Mullet sightings you submit are published on the public map,
            including their location if you choose to share it.
          </li>
          <li>
            Some gear links are affiliate links that can earn us a commission.
          </li>
          <li>We don’t sell your name, email address or phone number.</li>
        </ul>
      </InfoSection>

      <InfoSection id="advertising" title="Advertising: Google AdSense">
        <p>
          We use Google AdSense to show ads. Third-party vendors, including
          Google, use cookies to serve ads based on your prior visits to this
          website and other websites. Google’s use of advertising cookies enables
          it and its partners to serve ads to you based on your visits to this
          site and/or other sites on the Internet.
        </p>
        <p>
          To do this, Google and its partners may place and read cookies on your
          browser, use web beacons (small pixels) and similar technologies, and
          collect information such as your IP address, browser and device type,
          the page you’re viewing, and approximate location. This lets them
          choose which ads to show, limit how often you see the same ad, detect
          fraud and measure ad performance. We don’t control the cookies Google
          and its partners set, and we don’t receive information that identifies
          you personally from them.
        </p>
        <p>Your choices:</p>
        <ul>
          <li>
            Opt out of personalized advertising from Google at{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>
            . You’ll still see ads, but they won’t be based on your interests.
          </li>
          <li>
            Opt out of personalized ads from other participating third-party
            vendors at{" "}
            <a
              href="https://optout.aboutads.info/"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info
            </a>{" "}
            (or{" "}
            <a
              href="https://www.youronlinechoices.eu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              youronlinechoices.eu
            </a>{" "}
            in Europe).
          </li>
          <li>
            Learn more in{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
            >
              How Google uses information from sites or apps that use its
              services
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              How Google uses cookies in advertising
            </a>
            .
          </li>
        </ul>
        <p>
          Where the law requires it (for example in the European Economic Area,
          the UK and Switzerland), Google asks for your consent before
          personalized ads are shown.
        </p>
      </InfoSection>

      <InfoSection title="Analytics">
        <p>
          We use PostHog to understand how people use the site: which pages are
          viewed, which buttons and links are clicked, how long pages take to
          load, and errors that occur. PostHog sets a cookie and local storage
          entry with a random identifier so repeat visits can be counted, and
          receives your IP address, browser and device type, referring page and
          approximate location.
        </p>
        <p>
          We may record anonymized sessions (a replay of page interactions) to
          find bugs and confusing layouts. Anything typed into form fields is
          masked and never recorded in these replays.
        </p>
        <p>
          We use this data only to run and improve Florida Mullet Run. You can
          block these cookies in your browser settings or with a content blocker;
          the site keeps working.
        </p>
      </InfoSection>

      <InfoSection title="Affiliate links">
        <p>
          Some gear links point to retailers such as Amazon. If you buy through
          them we may earn a small commission at no extra cost to you. When you
          click one, the retailer may set its own cookies to attribute the
          purchase; its privacy policy governs what happens on its site. We don’t
          receive your name, address or payment details from retailers.
        </p>
        {monetization.amazonTag && (
          <p>
            Florida Mullet Run is a participant in the Amazon Services LLC
            Associates Program. As an Amazon Associate we earn from qualifying
            purchases.
          </p>
        )}
      </InfoSection>

      <InfoSection title="Mullet sightings you submit">
        <p>
          When you log a sighting on the{" "}
          <Link href="/sightings">Sightings</Link> page we collect the beach, the
          time you saw the school, its size, any notes you add and, only if you
          provide them, a link to an Instagram post and your Instagram handle.
        </p>
        <p>
          If you tap “use my location”, your browser asks for permission and then
          shares your GPS coordinates (rounded to five decimal places) and their
          accuracy. We never read your location unless you tap that button.
        </p>
        <p>
          <strong>Sightings are public.</strong> Everything in a sighting,
          including its location and Instagram link, is shown on the live map and
          in recent-sighting lists and may be kept as part of the site’s
          historical migration record. Please don’t put your name, phone number
          or other personal details in the notes. We don’t ask for your name or
          email to submit a sighting.
        </p>
        <p>
          We also link public Instagram posts about the run to beach pages, with
          the original post and account credited. If you’d like a post or
          sighting removed, email us and we’ll take it down.
        </p>
      </InfoSection>

      <InfoSection title="Charter listing requests">
        <p>
          Captains who ask to be listed on the{" "}
          <Link href="/charters">Charters</Link> page give us their name,
          business name, email, phone number, website, USCG license number,
          region and notes. We use this to verify the license, contact the
          captain and set up the listing.
        </p>
        <p>
          Requests are stored in our database, emailed to our listings inbox, and
          may be added to our customer relationship management (CRM) system so we
          can follow up. Nothing is published until the captain approves a
          listing. Captains can ask us to update or delete their details at any
          time.
        </p>
      </InfoSection>

      <InfoSection title="Emails and the Insider waitlist">
        <p>
          If you email us or join the Insider waitlist, we receive your email
          address and whatever you include in the message. We use it to reply
          and, for the waitlist, to tell you when Insider launches. We won’t add
          you to any other mailing list.
        </p>
      </InfoSection>

      <InfoSection title="Other services that load on this site">
        <ul>
          <li>
            <strong>Hosting.</strong> The site runs on Vercel, whose servers log
            standard request data (IP address, browser, pages requested) to
            deliver the site and protect it from abuse.
          </li>
          <li>
            <strong>Database.</strong> Sightings and charter requests are stored
            with Supabase.
          </li>
          <li>
            <strong>Email.</strong> We send notification emails through Resend.
          </li>
          <li>
            <strong>Maps.</strong> Map tiles load from OpenStreetMap, which
            receives your IP address when it serves them.
          </li>
          <li>
            <strong>Videos.</strong> Guide videos are embedded from YouTube in
            privacy-enhanced mode (youtube-nocookie.com); YouTube may set cookies
            once you play a video.
          </li>
          <li>
            <strong>Public data.</strong> Conditions come from the National
            Weather Service, NOAA Tides & Currents, NOAA’s National Data Buoy
            Center, USGS and Open-Meteo. We request that data from our servers;
            none of your information is sent to them.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Cookies and your choices">
        <p>
          Cookies are small files a website stores in your browser. This site
          uses them for advertising (Google and its partners) and analytics
          (PostHog), as described above. We don’t use cookies to log you in —
          there are no accounts.
        </p>
        <p>
          You can delete or block cookies in your browser settings, and use the
          opt-out links in the <a href="#advertising">Advertising</a> section.
          Blocking cookies won’t stop the site from working, though you may see
          less relevant ads. Our site doesn’t currently respond to browser “Do
          Not Track” signals.
        </p>
      </InfoSection>

      <InfoSection title="How long we keep information">
        <ul>
          <li>
            Sightings are kept as part of the public migration record unless you
            ask us to remove one.
          </li>
          <li>
            Charter requests are kept while a listing is active or being set up,
            and deleted on request.
          </li>
          <li>
            Analytics data is kept for as long as it’s useful for improving the
            site, and no longer than our analytics provider’s retention period.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Your rights">
        <p>
          You can ask us to access, correct or delete information you’ve given
          us — a sighting, an Instagram credit, or a charter request — by
          emailing <a href={privacyMailto}>{CONTACT_EMAIL}</a>. Depending on
          where you live (for example California, or the EEA and UK), you may
          have additional rights, including to opt out of personalized
          advertising; the opt-out links above apply to everyone. We’ll respond
          within 30 days.
        </p>
      </InfoSection>

      <InfoSection title="Children">
        <p>
          Florida Mullet Run is written for anglers and isn’t directed to
          children under 13. We don’t knowingly collect personal information from
          children. If you believe a child has sent us information, email us and
          we’ll delete it.
        </p>
      </InfoSection>

      <InfoSection title="Security">
        <p>
          The site is served only over HTTPS, and our database restricts who can
          read and change stored records. No method of transmission or storage is
          completely secure, so please don’t submit anything you wouldn’t want
          made public in a sighting.
        </p>
      </InfoSection>

      <InfoSection title="Changes to this policy">
        <p>
          We’ll update this page when our practices change and revise the “last
          updated” date above.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

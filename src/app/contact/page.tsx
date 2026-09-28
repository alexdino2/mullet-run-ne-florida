import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { CHARTER_FORM_ID } from "@/lib/content/charters";
import { monetization } from "@/lib/monetization";
import { CONTACT_EMAIL, INSTAGRAM_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Florida Mullet Run",
  description:
    "Contact Florida Mullet Run with corrections, local beach tips, sighting or photo removal requests, privacy questions, charter listings and partnership inquiries.",
  alternates: { canonical: "/contact" },
};

function mailto(address: string, subject: string): string {
  return `mailto:${address}?subject=${encodeURIComponent(subject)}`;
}

const TOPICS = [
  {
    title: "Corrections & local tips",
    body: "Found something wrong on a beach or guide page, or know a spot’s parking, structure or best wind? Tell us and we’ll update the page.",
    subject: "Correction or local tip",
  },
  {
    title: "Remove a sighting or post",
    body: "Want a sighting you logged, or an Instagram post we credited, taken down? Send the beach and date and we’ll remove it.",
    subject: "Removal request",
  },
  {
    title: "Privacy questions",
    body: "Ask what we hold about you, or request a correction or deletion. See the Privacy Policy for details.",
    subject: "Privacy request",
  },
  {
    title: "Advertising & partnerships",
    body: "Tackle shops, marinas and brands interested in sponsoring the run coverage.",
    subject: "Partnership inquiry",
  },
];

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact"
      lede="Corrections, local knowledge, removal requests and partnerships — here’s how to reach the people behind Florida Mullet Run."
    >
      <InfoSection title="Email">
        <p>
          The fastest way to reach us is{" "}
          <a href={mailto(CONTACT_EMAIL, "Hello from the site")}>
            {CONTACT_EMAIL}
          </a>
          . A real person reads every message.
        </p>
      </InfoSection>

      <div className="grid gap-3 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <a
            key={t.title}
            href={mailto(CONTACT_EMAIL, t.subject)}
            data-analytics-event="contact_topic_clicked"
            data-analytics-property-topic={t.subject}
            className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:ring-ocean-200"
          >
            <h2 className="text-sm font-bold text-slate-900">{t.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{t.body}</p>
            <span className="mt-2 inline-block text-xs font-semibold text-ocean-600">
              Email us →
            </span>
          </a>
        ))}
      </div>

      <InfoSection title="Charter captains">
        <p>
          To list your charter, use the{" "}
          <Link href={`/charters#${CHARTER_FORM_ID}`}>listing request form</Link>{" "}
          or email{" "}
          <a href={mailto(monetization.charterContactEmail, "Charter listing")}>
            {monetization.charterContactEmail}
          </a>
          . We verify a valid USCG license before any listing goes live.
        </p>
      </InfoSection>

      <InfoSection title="Report a mullet sighting">
        <p>
          Seeing bait right now? Log it on the{" "}
          <Link href="/sightings">Sightings</Link> page so it shows up on the
          live map for everyone, or tag{" "}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            @floridamulletrun
          </a>{" "}
          on Instagram.
        </p>
      </InfoSection>

      <InfoSection title="About the site">
        <p>
          Florida Mullet Run is an independent Florida fishing resource. Read how
          we build the Opportunity Score on our{" "}
          <Link href="/about">About</Link> page, and how we handle data in our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

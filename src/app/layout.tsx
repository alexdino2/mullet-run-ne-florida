import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Figtree, Syne } from "next/font/google";
import { PostHogAnalytics } from "@/components/PostHogAnalytics";
import { AdSenseLoader } from "@/components/AdSenseLoader";
import { monetization } from "@/lib/monetization";
import { EARLY_ERROR_BUFFER_SCRIPT } from "@/lib/early-errors";
import "./globals.css";
import { INSTAGRAM_URL, SITE_URL } from "@/lib/site";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Florida Mullet Run Tracker — Where Are the Mullet Right Now?",
    template: "%s | Florida Mullet Run",
  },
  description:
    "Track the Florida mullet run live: see where the mullet are right now with a crowdsourced sightings map, daily opportunity scores, coastal conditions, inlet guides, gear picks, and charter captains from Northeast Florida to Miami.",
  applicationName: "Florida Mullet Run",
  keywords: [
    "florida mullet run",
    "florida mullet tracker",
    "mullet run 2026",
    "where are the mullet",
    "where is the mullet run right now",
    "mullet run florida map",
    "mullet migration florida",
    "surf fishing florida",
    "tarpon snook mullet run",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Florida Mullet Run",
    locale: "en_US",
    title: "Florida Mullet Run Tracker — Where Are the Mullet Right Now?",
    description:
      "Live coastal conditions and a crowdsourced mullet sightings map for Florida's Atlantic and Gulf coasts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Florida Mullet Run Tracker — Where Are the Mullet Right Now?",
    description:
      "Live coastal conditions and a crowdsourced mullet sightings map for Florida's Atlantic and Gulf coasts.",
  },
  other: {
    "google-adsense-account": monetization.adsClient,
  },
  category: "sports",
};

export const viewport: Viewport = {
  themeColor: "#0f5479",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const NAV = [
  { href: "/", label: "Now" },
  { href: "/sightings", label: "Sightings" },
  { href: "/beaches", label: "Beaches" },
  { href: "/guide", label: "Guide" },
  { href: "/gear", label: "Gear" },
  { href: "/insider", label: "Insider" },
];

const FOOTER_LINKS = [
  { href: "/florida-mullet-tracker", label: "Florida mullet tracker" },
  { href: "/beaches", label: "Beach guides" },
  { href: "/guide/biology", label: "Migration biology" },
  { href: "/guide/locations", label: "Inlet guides" },
  { href: "/guide/regulations", label: "FWC regulations" },
  { href: "/guide/tactics", label: "Tactics & gear" },
  { href: "/gear", label: "Gear shop" },
  { href: "/charters", label: "Charter captains" },
];

/** Site-wide policy links, kept in their own row at the bottom of every page. */
const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Florida Mullet Run",
  url: SITE_URL,
  description:
    "Live Florida mullet run tracker with a crowdsourced sightings map, daily opportunity scores, and inlet and pass guides for Florida's Atlantic and Gulf coasts.",
  areaServed: { "@type": "State", name: "Florida" },
  sameAs: [INSTAGRAM_URL],
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Florida Mullet Run",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?beach={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${syne.variable}`}>
      <head>
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: EARLY_ERROR_BUFFER_SCRIPT }}
        />
        <AdSenseLoader />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans">
        <PostHogAnalytics>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          />
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
          />
          <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col bg-transparent shadow-sm ring-1 ring-ocean-900/5">
            <header className="sticky top-0 z-[500] border-b border-ocean-800 bg-ocean-900 text-white">
              <div className="flex items-center justify-between px-4 py-3">
                <Link href="/" className="flex shrink-0 items-center gap-2">
                  <span className="font-display text-base font-bold tracking-tight">
                    Florida <span className="text-ocean-300">Mullet Run</span>
                  </span>
                </Link>
              </div>
              <nav className="flex items-center gap-1 overflow-x-auto px-3 pb-2 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap rounded-md px-2.5 py-1 font-medium hover:bg-ocean-800"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>
            <main className="flex-1 px-4 pb-16 pt-4">{children}</main>
            <footer className="border-t border-slate-200 bg-white px-4 py-6 text-xs text-slate-500">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 sm:grid-cols-3">
                {FOOTER_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-medium text-slate-600 hover:text-ocean-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
                Scores are heuristics, not a guarantee. Regulations change — always
                confirm current limits with the FWC. Fish responsibly.
              </p>
              <p className="mt-3 text-center">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-fuchsia-700 hover:text-fuchsia-800"
                >
                  Follow @floridamulletrun on Instagram ↗
                </a>
              </p>
              <nav
                aria-label="Legal"
                className="mt-4 flex items-center justify-center gap-x-2 border-t border-slate-100 pt-4 text-[12px]"
              >
                {LEGAL_LINKS.map((item, i) => (
                  <span key={item.href} className="flex items-center gap-x-2">
                    {i > 0 && (
                      <span aria-hidden className="text-slate-300">
                        |
                      </span>
                    )}
                    <Link
                      href={item.href}
                      className="font-semibold text-slate-600 hover:text-ocean-700"
                    >
                      {item.label}
                    </Link>
                  </span>
                ))}
              </nav>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                © {new Date().getFullYear()} Florida Mullet Run
              </p>
            </footer>
          </div>
        </PostHogAnalytics>
      </body>
    </html>
  );
}

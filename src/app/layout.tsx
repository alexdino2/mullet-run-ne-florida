import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { PostHogAnalytics } from "@/components/PostHogAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://floridamulletrun.com"),
  title: {
    default: "Florida Mullet Run Tracker — Where Are the Mullet Right Now?",
    template: "%s | Florida Mullet Run",
  },
  description:
    "Track the Florida mullet run live: see where the mullet are right now with a crowdsourced sightings map, daily opportunity scores, coastal conditions, inlet guides, gear picks, and charter captains from Northeast Florida to Miami.",
  applicationName: "Florida Mullet Run",
  keywords: [
    "florida mullet run",
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
      "Live coastal conditions and a crowdsourced mullet sightings map from Northeast Florida to Miami.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Florida Mullet Run Tracker — Where Are the Mullet Right Now?",
    description:
      "Live coastal conditions and a crowdsourced mullet sightings map from Northeast Florida to Miami.",
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
  { href: "/charters", label: "Charters" },
  { href: "/insider", label: "Insider" },
];

const FOOTER_LINKS = [
  { href: "/beaches", label: "Beach guides" },
  { href: "/guide/biology", label: "Migration biology" },
  { href: "/guide/locations", label: "Inlet guides" },
  { href: "/guide/regulations", label: "FWC regulations" },
  { href: "/guide/tactics", label: "Tactics & gear" },
  { href: "/gear", label: "Gear shop" },
  { href: "/charters", label: "Book a charter" },
];

const SITE_URL = "https://floridamulletrun.com";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Florida Mullet Run",
  url: SITE_URL,
  description:
    "Live Florida mullet run tracker with a crowdsourced sightings map, daily opportunity scores, and inlet guides from Northeast Florida to Miami.",
  areaServed: { "@type": "State", name: "Florida" },
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
    <html lang="en">
      <Script
        id="adsbygoogle-init"
        async
        strategy="beforeInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4183912956441070"
        crossOrigin="anonymous"
      />
      <body className="min-h-screen">
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
          <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col bg-slate-50 shadow-sm">
            <header className="sticky top-0 z-[500] border-b border-ocean-800 bg-ocean-900 text-white">
              <div className="flex items-center justify-between px-4 py-3">
                <Link href="/" className="flex shrink-0 items-center gap-2">
                  <span className="text-xl" aria-hidden>
                    🐟
                  </span>
                  <span className="text-base font-bold tracking-tight">
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
                Public data: NWS · NOAA CO-OPS · NDBC. Scores are heuristics, not a
                guarantee. Regulations change — always confirm current limits with
                the FWC. Fish responsibly.
              </p>
            </footer>
          </div>
        </PostHogAnalytics>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mullet Watch NEFL",
  description:
    "Mullet run opportunity scores for Northeast Florida beaches — wind, tides, buoys, and sightings.",
  applicationName: "Mullet Watch NEFL",
};

export const viewport: Viewport = {
  themeColor: "#0f5479",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-slate-50 shadow-sm sm:max-w-lg">
          <header className="sticky top-0 z-[500] border-b border-ocean-800 bg-ocean-900 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  🐟
                </span>
                <span className="text-base font-bold tracking-tight">
                  Mullet Watch <span className="text-ocean-300">NEFL</span>
                </span>
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link
                  href="/"
                  className="rounded-md px-2 py-1 font-medium hover:bg-ocean-800"
                >
                  Now
                </Link>
                <Link
                  href="/sightings"
                  className="rounded-md px-2 py-1 font-medium hover:bg-ocean-800"
                >
                  Sightings
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 px-4 pb-16 pt-4">{children}</main>
          <footer className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-400">
            Public data: NWS · NOAA CO-OPS · NDBC. Scores are heuristics, not a
            guarantee. Fish responsibly.
          </footer>
        </div>
      </body>
    </html>
  );
}

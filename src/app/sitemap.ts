import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/content/guides";
import { BEACH_CONTENT, isBeachIndexed } from "@/lib/content/beaches";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Home, the tracker landing, and the live sightings map change constantly
  // during the run and are the primary ranking targets.
  const highFrequency = new Set(["", "/florida-mullet-tracker", "/sightings"]);

  const staticRoutes = [
    "",
    "/florida-mullet-tracker",
    "/sightings",
    "/beaches",
    "/guide",
    // /gear, /charters and /insider are noindexed placeholders; add them back
    // here when they carry original content.
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: highFrequency.has(path)
      ? ("daily" as const)
      : ("weekly" as const),
    priority:
      path === ""
        ? 1
        : path === "/florida-mullet-tracker"
          ? 0.95
          : path === "/sightings"
            ? 0.9
            : path === "/beaches"
              ? 0.85
              : 0.7,
  }));

  // Site information pages: crawlable for trust signals, rarely updated.
  const infoRoutes = ["/about", "/contact", "/privacy"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.3,
  }));

  const beachRoutes = BEACH_CONTENT.filter((b) => isBeachIndexed(b.id)).map((b) => ({
    url: `${SITE_URL}/beaches/${b.slug}`,
    lastModified: new Date(b.updated),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const guideRoutes = GUIDES.map((g) => ({
    url: `${SITE_URL}/guide/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...beachRoutes, ...guideRoutes, ...infoRoutes];
}

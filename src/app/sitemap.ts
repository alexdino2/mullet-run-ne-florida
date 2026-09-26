import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/content/guides";
import { BEACH_CONTENT } from "@/lib/content/beaches";

const BASE = "https://floridamulletrun.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Home and the live sightings map change constantly during the run and are
  // the primary ranking targets, so crawl them more aggressively.
  const highFrequency = new Set(["", "/sightings"]);

  const staticRoutes = [
    "",
    "/sightings",
    "/beaches",
    "/guide",
    "/gear",
    "/charters",
    "/insider",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: highFrequency.has(path)
      ? ("daily" as const)
      : ("weekly" as const),
    priority:
      path === "" ? 1 : path === "/sightings" ? 0.9 : path === "/beaches" ? 0.85 : 0.7,
  }));

  const beachRoutes = BEACH_CONTENT.map((b) => ({
    url: `${BASE}/beaches/${b.slug}`,
    lastModified: new Date(b.updated),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const guideRoutes = GUIDES.map((g) => ({
    url: `${BASE}/guide/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...beachRoutes, ...guideRoutes];
}

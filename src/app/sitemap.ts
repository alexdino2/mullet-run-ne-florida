import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/content/guides";

const BASE = "https://floridamulletrun.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Home and the live sightings map change constantly during the run and are
  // the primary ranking targets, so crawl them more aggressively.
  const highFrequency = new Set(["", "/sightings"]);

  const staticRoutes = [
    "",
    "/sightings",
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
    priority: path === "" ? 1 : path === "/sightings" ? 0.9 : 0.7,
  }));

  const guideRoutes = GUIDES.map((g) => ({
    url: `${BASE}/guide/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...guideRoutes];
}

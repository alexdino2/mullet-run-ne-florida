import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/content/guides";

const BASE = "https://floridamulletrun.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const guideRoutes = GUIDES.map((g) => ({
    url: `${BASE}/guide/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...guideRoutes];
}

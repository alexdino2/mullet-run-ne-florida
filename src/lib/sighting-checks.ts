import type {
  Beach,
  OnlineSightingReport,
  SightingCheck,
} from "@/lib/types";
import { safeFetchText } from "@/lib/data/http";
import { getServerSupabase, hasServiceRole } from "@/lib/supabase/server";

const NEWS_ENDPOINT = "https://news.google.com/rss/search";
const REPORT_MAX_AGE_MS = 48 * 60 * 60 * 1000;

function decodeXml(value: string): string {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function readTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

export function parseNewsReports(
  xml: string,
  now = new Date(),
): OnlineSightingReport[] {
  const oldest = now.getTime() - REPORT_MAX_AGE_MS;
  const items = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];

  return items
    .map((item): OnlineSightingReport | null => {
      const title = readTag(item, "title");
      const url = readTag(item, "link");
      const source = readTag(item, "source") || "Google News";
      const publishedAt = readTag(item, "pubDate");
      const timestamp = new Date(publishedAt).getTime();

      if (
        !title ||
        !url.startsWith("https://") ||
        !/\bmullet\b/i.test(title) ||
        !Number.isFinite(timestamp) ||
        timestamp < oldest
      ) {
        return null;
      }

      return {
        title,
        url,
        source,
        publishedAt: new Date(timestamp).toISOString(),
      };
    })
    .filter((report): report is OnlineSightingReport => report !== null)
    .slice(0, 5);
}

export async function checkBeachForSightings(
  beach: Beach,
  now = new Date(),
): Promise<SightingCheck> {
  const query = `"mullet" "${beach.name}" Florida when:1d`;
  const url = `${NEWS_ENDPOINT}?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const xml = await safeFetchText(url, {
    timeoutMs: 8000,
    revalidate: 0,
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent":
        process.env.NWS_USER_AGENT ??
        "FloridaMulletRun/1.0 (https://floridamulletrun.com)",
    },
  });
  const checkedAt = now.toISOString();

  return {
    beach_id: beach.id,
    checked_at: checkedAt,
    check_date: checkedAt.slice(0, 10),
    status: xml === null ? "unavailable" : "checked",
    reports: xml === null ? [] : parseNewsReports(xml, now),
  };
}

export async function saveSightingChecks(
  checks: SightingCheck[],
): Promise<boolean> {
  const supabase = getServerSupabase();
  if (!supabase || !hasServiceRole() || checks.length === 0) return false;

  const { error } = await supabase.from("mw_sighting_checks").upsert(checks, {
    onConflict: "beach_id,check_date",
  });
  return !error;
}

export async function getLatestSightingChecks(): Promise<SightingCheck[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("mw_sighting_checks")
    .select("*")
    .order("checked_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];

  const latest = new Map<string, SightingCheck>();
  for (const row of data as SightingCheck[]) {
    if (!latest.has(row.beach_id)) latest.set(row.beach_id, row);
  }
  return [...latest.values()];
}

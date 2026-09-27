import { getBeaches } from "@/lib/beaches";
import { checkBeachForSightings, saveSightingChecks } from "@/lib/sighting-checks";
import { jobLog, mapLimit } from "./log";

const JOB = "sighting-checks";

/**
 * Daily scan of public news for attributable mullet reports at every station.
 * Upserts one row per station per day, so re-running the same day is safe.
 */
export async function runSightingChecks(): Promise<{
  checked: number;
  unavailable: number;
  reports: number;
  persisted: boolean;
}> {
  const beaches = await getBeaches();
  const checkedAt = new Date();
  jobLog(JOB, "start", { stations: beaches.length });
  // Gentle on the news feed: two at a time.
  const checks = await mapLimit(beaches, 2, (b) => checkBeachForSightings(b, checkedAt));
  const persisted = await saveSightingChecks(checks);
  const result = {
    checked: checks.filter((c) => c.status === "checked").length,
    unavailable: checks.filter((c) => c.status === "unavailable").length,
    reports: checks.reduce((n, c) => n + c.reports.length, 0),
    persisted,
  };
  jobLog(JOB, "done", result);
  return result;
}

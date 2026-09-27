import type { AlertRule, BeachConditions } from "@/lib/types";

export interface AlertMatch {
  rule: AlertRule;
  result: BeachConditions;
}

/** Which enabled rules match which station results right now. */
export function evaluateAlerts(
  rules: AlertRule[],
  results: BeachConditions[],
): AlertMatch[] {
  const matches: AlertMatch[] = [];
  for (const rule of rules) {
    if (!rule.enabled) continue;
    for (const r of results) {
      if (rule.beach_id && rule.beach_id !== r.beach.id) continue;
      if (r.score.score < rule.min_score) continue;
      const wind = r.conditions.wind;
      if (rule.wind_dir_min != null && rule.wind_dir_max != null) {
        if (!wind) continue;
        const d = wind.directionDeg;
        const inRange =
          rule.wind_dir_min <= rule.wind_dir_max
            ? d >= rule.wind_dir_min && d <= rule.wind_dir_max
            : d >= rule.wind_dir_min || d <= rule.wind_dir_max; // wraps north
        if (!inRange) continue;
      }
      if (rule.max_wind_kt != null && wind && wind.speedKt > rule.max_wind_kt) {
        continue;
      }
      matches.push({ rule, result: r });
    }
  }
  return matches;
}

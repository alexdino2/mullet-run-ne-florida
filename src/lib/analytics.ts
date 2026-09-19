import posthog from "posthog-js";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export function captureEvent(
  event: string,
  properties?: AnalyticsProperties,
): void {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  posthog.capture(event, properties);
}

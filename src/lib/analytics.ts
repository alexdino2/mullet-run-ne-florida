import type { PostHog } from "posthog-js";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

const posthogKey =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  "phc_z62VAYZou8K5H3nziNjcaxQjagDYFHZnmGdSBzHDGt2m";
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

/** Upper bound on events held while posthog-js is still loading. */
const MAX_QUEUED_EVENTS = 100;

let client: PostHog | null = null;
let loading = false;
const queue: {
  event: string;
  properties?: AnalyticsProperties;
  timestamp: Date;
}[] = [];

/**
 * Capture a PostHog event. Before posthog-js has loaded (it is deferred, see
 * `loadAnalytics`), events are queued with their original timestamp and sent
 * once it arrives.
 */
export function captureEvent(
  event: string,
  properties?: AnalyticsProperties,
): void {
  if (typeof window === "undefined" || !posthogKey) return;
  if (client) {
    client.capture(event, properties);
  } else if (queue.length < MAX_QUEUED_EVENTS) {
    queue.push({ event, properties, timestamp: new Date() });
  }
}

/**
 * Download and initialise posthog-js (~100 KiB, plus the session recorder it
 * fetches), then flush queued events. Called once the page is interactive so
 * none of it is on the critical path.
 */
export async function loadAnalytics(): Promise<void> {
  if (typeof window === "undefined" || !posthogKey || client || loading) return;
  loading = true;

  const { default: posthog } = await import("posthog-js");
  if (!posthog.__loaded) {
    posthog.init(posthogKey, {
      // Sent through the Next.js rewrites in next.config.mjs so ad blockers
      // that block *.posthog.com don't drop events.
      api_host: "/ingest",
      ui_host: posthogHost.replace(".i.posthog.com", ".posthog.com"),
      defaults: "2026-05-30",
      autocapture: true,
      capture_pageview: false,
      capture_pageleave: true,
      capture_dead_clicks: true,
      capture_exceptions: true,
      capture_performance: true,
      rageclick: true,
      person_profiles: "always",
      session_recording: {
        maskAllInputs: true,
      },
    });
  }

  client = posthog;
  for (const { event, properties, timestamp } of queue.splice(0)) {
    posthog.capture(event, properties, { timestamp });
  }
}

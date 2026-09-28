import type { PostHog } from "posthog-js";

/** Upper bound on errors held while posthog-js is still loading. */
const MAX_EARLY_ERRORS = 20;

declare global {
  interface Window {
    __earlyErrors?: unknown[];
    __stopEarlyErrors?: () => void;
  }
}

/**
 * Inline script for <head>. posthog-js loads after the first interaction (see
 * `loadAnalytics`), so its exception autocapture is not active during
 * hydration. This script runs before any React code and holds uncaught
 * errors and rejections, such as React hydration errors, until
 * `flushEarlyErrors` sends them.
 */
export const EARLY_ERROR_BUFFER_SCRIPT = `(function(w){var q=w.__earlyErrors=[];function add(e){if(q.length<${MAX_EARLY_ERRORS})q.push(e)}function onError(e){add(e.error||e.message)}function onRejection(e){add(e.reason)}w.addEventListener("error",onError);w.addEventListener("unhandledrejection",onRejection);w.__stopEarlyErrors=function(){w.removeEventListener("error",onError);w.removeEventListener("unhandledrejection",onRejection)}})(window)`;

/**
 * Stop the inline buffer and send the errors it held. posthog-js exception
 * autocapture takes over from this point.
 */
export function flushEarlyErrors(posthog: PostHog): void {
  window.__stopEarlyErrors?.();
  for (const error of window.__earlyErrors?.splice(0) ?? []) {
    posthog.captureException(error, { captured_before_analytics_load: true });
  }
}

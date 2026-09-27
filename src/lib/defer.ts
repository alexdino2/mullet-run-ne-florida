/**
 * Helpers for keeping third-party scripts (ads, analytics) off the critical
 * path. They wait until the visitor first interacts with the page, or until
 * the page has been loaded and idle for a few seconds, so their JS never
 * competes with rendering, hydration or the LCP image on slow phones.
 */

const INTERACTION_EVENTS = [
  "pointerdown",
  "touchstart",
  "keydown",
  "scroll",
  "wheel",
  "mousemove",
] as const;

/** Default time after `load` to wait before loading without interaction. */
const DEFAULT_FALLBACK_DELAY_MS = 5000;

const readinessByDelay = new Map<number, Promise<void>>();

/**
 * Resolves once, on the first user interaction or `fallbackDelayMs` after
 * the window `load` event, whichever comes first. Callers using the same
 * fallback share one promise and start together.
 */
export function afterFirstInteraction(
  fallbackDelayMs = DEFAULT_FALLBACK_DELAY_MS,
): Promise<void> {
  if (typeof window === "undefined") return new Promise(() => {});
  const existing = readinessByDelay.get(fallbackDelayMs);
  if (existing) return existing;

  const ready = new Promise<void>((resolve) => {
    let timer: number | undefined;

    const trigger = () => {
      for (const event of INTERACTION_EVENTS) {
        window.removeEventListener(event, trigger);
      }
      window.removeEventListener("load", startTimer);
      window.clearTimeout(timer);
      resolve();
    };

    function startTimer() {
      timer = window.setTimeout(trigger, fallbackDelayMs);
    }

    for (const event of INTERACTION_EVENTS) {
      window.addEventListener(event, trigger, { passive: true });
    }

    if (document.readyState === "complete") startTimer();
    else window.addEventListener("load", startTimer);
  });

  readinessByDelay.set(fallbackDelayMs, ready);
  return ready;
}

/** Append an async `<script>` once; later calls with the same id are no-ops. */
export function loadScript(
  id: string,
  src: string,
  attributes: Record<string, string> = {},
): void {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  for (const [name, value] of Object.entries(attributes)) {
    script.setAttribute(name, value);
  }
  document.head.appendChild(script);
}

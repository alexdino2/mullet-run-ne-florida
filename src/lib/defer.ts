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

/** How long after `load` to wait before loading anyway without interaction. */
const FALLBACK_DELAY_MS = 5000;

let ready: Promise<void> | null = null;

/**
 * Resolves once, on the first user interaction or `FALLBACK_DELAY_MS` after
 * the window `load` event, whichever comes first. Shared by every caller so
 * all deferred scripts start together.
 */
export function afterFirstInteraction(): Promise<void> {
  if (typeof window === "undefined") return new Promise(() => {});
  if (ready) return ready;

  ready = new Promise<void>((resolve) => {
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
      timer = window.setTimeout(trigger, FALLBACK_DELAY_MS);
    }

    for (const event of INTERACTION_EVENTS) {
      window.addEventListener(event, trigger, { passive: true });
    }

    if (document.readyState === "complete") startTimer();
    else window.addEventListener("load", startTimer);
  });

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

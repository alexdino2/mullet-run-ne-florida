"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureEvent, loadAnalytics } from "@/lib/analytics";
import { afterFirstInteraction } from "@/lib/defer";

const POSTHOG_FALLBACK_DELAY_MS = 3000;

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureEvent("$pageview", {
      $current_url: window.location.href,
      $pathname: pathname,
    });
  }, [pathname, searchParams]);

  return null;
}

function InteractionTracker() {
  useEffect(() => {
    const captureClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const tracked = target.closest<HTMLElement>("[data-analytics-event]");
      if (tracked?.dataset.analyticsEvent) {
        const properties = Object.fromEntries(
          Object.entries(tracked.dataset)
            .filter(([key]) => key.startsWith("analyticsProperty"))
            .map(([key, value]) => [
              key
                .slice("analyticsProperty".length)
                .replace(/^./, (character) => character.toLowerCase()),
              value,
            ]),
        );
        captureEvent(tracked.dataset.analyticsEvent, properties);
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.protocol === "http:" ||
        destination.protocol === "https:"
      ) {
        if (destination.origin !== window.location.origin) {
          captureEvent("outbound_link_clicked", {
            destination_host: destination.host,
            destination_path: destination.pathname,
            link_text: anchor.textContent?.trim().slice(0, 100),
          });
        }
      } else if (destination.protocol === "mailto:") {
        captureEvent("email_link_clicked", {
          link_text: anchor.textContent?.trim().slice(0, 100),
        });
      }
    };

    const captureDetailsToggle = (event: Event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open) return;

      captureEvent("faq_opened", {
        question: details.querySelector("summary")?.textContent?.trim(),
      });
    };

    document.addEventListener("click", captureClick);
    document.addEventListener("toggle", captureDetailsToggle, true);

    return () => {
      document.removeEventListener("click", captureClick);
      document.removeEventListener("toggle", captureDetailsToggle, true);
    };
  }, []);

  return null;
}

/**
 * PostHog page views and interaction events. posthog-js itself is loaded
 * after the first interaction or three idle seconds (see `loadAnalytics`);
 * events captured before then are queued, not lost.
 */
export function PostHogAnalytics({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    afterFirstInteraction(POSTHOG_FALLBACK_DELAY_MS).then(loadAnalytics);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <InteractionTracker />
      {children}
    </>
  );
}

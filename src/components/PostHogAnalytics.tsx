"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

const posthogKey =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  "phc_z62VAYZou8K5H3nziNjcaxQjagDYFHZnmGdSBzHDGt2m";
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (typeof window !== "undefined" && posthogKey && !posthog.__loaded) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    ui_host: posthogHost,
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

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthogKey || !posthog.__loaded) return;

    posthog.capture("$pageview", {
      $current_url: window.location.href,
      $pathname: pathname,
    });
  }, [pathname, searchParams]);

  return null;
}

function InteractionTracker() {
  useEffect(() => {
    if (!posthogKey || !posthog.__loaded) return;

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
        posthog.capture(tracked.dataset.analyticsEvent, properties);
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.protocol === "http:" ||
        destination.protocol === "https:"
      ) {
        if (destination.origin !== window.location.origin) {
          posthog.capture("outbound_link_clicked", {
            destination_host: destination.host,
            destination_path: destination.pathname,
            link_text: anchor.textContent?.trim().slice(0, 100),
          });
        }
      } else if (destination.protocol === "mailto:") {
        posthog.capture("email_link_clicked", {
          link_text: anchor.textContent?.trim().slice(0, 100),
        });
      }
    };

    const captureDetailsToggle = (event: Event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open) return;

      posthog.capture("faq_opened", {
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

export function PostHogAnalytics({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <InteractionTracker />
      {children}
    </PostHogProvider>
  );
}

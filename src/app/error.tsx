"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary. If a client component throws during render, this
 * replaces the raw "Application error: a client-side exception has occurred"
 * screen with a recoverable prompt instead of a dead page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error in the console for debugging.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        🎣
      </span>
      <h1 className="mt-4 text-lg font-bold text-slate-900">
        Something snagged
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        This page hit an unexpected error. Reloading usually clears it.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-lg bg-ocean-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-ocean-700"
      >
        Try again
      </button>
    </div>
  );
}

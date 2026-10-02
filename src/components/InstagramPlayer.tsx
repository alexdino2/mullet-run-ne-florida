"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { captureEvent } from "@/lib/analytics";
import { instagramEmbedUrl } from "@/lib/instagram";

const INSTAGRAM_ORIGIN = "https://www.instagram.com";
/** Used until the embed reports its real height (fits a Reel at ~400px). */
const DEFAULT_EMBED_HEIGHT = 720;

export interface InstagramPost {
  url: string;
  handle: string | null;
  beachId: string;
  title: string;
}

/**
 * Modal that plays an Instagram post or Reel on our page. The iframe is only
 * mounted while the dialog is open, so Instagram loads nothing (and sets no
 * cookies) until a visitor asks to watch.
 */
export function InstagramPlayerDialog({
  post,
  onClose,
}: {
  post: InstagramPost | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(DEFAULT_EMBED_HEIGHT);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (post && !dialog.open) {
      setHeight(DEFAULT_EMBED_HEIGHT);
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!post && dialog.open) {
      dialog.close();
    }
  }, [post]);

  // Never leave the page scroll-locked if we unmount while open.
  useEffect(
    () => () => {
      document.documentElement.style.overflow = "";
    },
    [],
  );

  // The embed posts {"type":"MEASURE","details":{"height":…}} as it lays out;
  // use it to size the iframe so there is no inner scrollbar.
  useEffect(() => {
    if (!post) return;
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== INSTAGRAM_ORIGIN ||
        event.source !== iframeRef.current?.contentWindow
      ) {
        return;
      }
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        const measured = Number(data?.details?.height);
        if (data?.type === "MEASURE" && measured > 0) setHeight(measured);
      } catch {
        // Not a message we understand; keep the current height.
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [post]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={post?.title ?? "Instagram video"}
      onClose={() => {
        document.documentElement.style.overflow = "";
        onClose();
      }}
      // A click on the backdrop lands on the <dialog> itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="m-auto max-h-[92dvh] w-[min(440px,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/70"
    >
      {post && (
        <div className="p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
              {post.title}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg leading-none text-slate-600 hover:bg-slate-200"
              aria-label="Close video"
              autoFocus
            >
              ×
            </button>
          </div>
          <iframe
            ref={iframeRef}
            key={post.url}
            src={instagramEmbedUrl(post.url)}
            title={post.title}
            style={{ height }}
            className="w-full rounded-lg border-0 bg-slate-50"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="instagram_sighting_external_opened"
            data-analytics-property-beach-id={post.beachId}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-700 hover:text-fuchsia-800"
          >
            {post.handle
              ? `Open @${post.handle} on Instagram`
              : "Open on Instagram"}
            <span aria-hidden>↗</span>
          </a>
        </div>
      )}
    </dialog>
  );
}

/**
 * A whole sighting card that opens its Instagram post in the on-site player,
 * so a tap anywhere on the card (thumbnail included) plays the video.
 */
export function InstagramSightingCard({
  post,
  surface,
  className,
  children,
}: {
  post: InstagramPost;
  /** Where the card sits, for analytics: "list", "latest", … */
  surface: string;
  className: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          captureEvent("instagram_sighting_opened", {
            beach_id: post.beachId,
            surface,
          });
          setOpen(true);
        }}
        className={`group text-left transition hover:shadow-md hover:ring-fuchsia-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${className}`}
      >
        {children}
      </button>
      <InstagramPlayerDialog
        post={open ? post : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** "▶ Watch the Reel · @handle" pill for an Instagram sighting card. */
export function InstagramWatchLabel({ post }: { post: InstagramPost }) {
  return (
    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-fuchsia-50 px-2.5 py-1 text-xs font-bold text-fuchsia-700">
      <span aria-hidden>▶</span>
      {post.url.includes("/reel/") ? "Watch the Reel" : "View the post"}
      {post.handle && (
        <span className="font-medium text-fuchsia-600">· @{post.handle}</span>
      )}
    </span>
  );
}

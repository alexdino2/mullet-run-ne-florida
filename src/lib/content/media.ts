/**
 * Videos shown on /media. Files live in `public/media/`; add a new entry here
 * (newest first) to publish another clip.
 */
export interface MediaVideo {
  id: string;
  title: string;
  description: string;
  /** Public path to the MP4 (H.264/AAC, encoded with +faststart). */
  src: string;
  /** Public path to the poster frame (JPEG). */
  poster: string;
  width: number;
  height: number;
  /** ISO 8601 duration, for VideoObject structured data. */
  duration: string;
  /** ISO date the clip went up. */
  published: string;
  /** Shown under the video when the clip is AI-generated. */
  credit?: string;
}

export const MEDIA_VIDEOS: MediaVideo[] = [
  {
    id: "mullet-run-bullet-time",
    title: "The Mullet Run, From the Mullet’s Point of View",
    description:
      "Ten seconds inside a school of mullet running the Northeast Florida surf. A tarpon strikes, one mullet clears the water, time freezes with a pelican diving overhead, and then the run keeps moving south.",
    src: "/media/mullet-run-bullet-time.mp4",
    poster: "/media/mullet-run-bullet-time.jpg",
    width: 720,
    height: 1280,
    duration: "PT10S",
    published: "2026-11-11",
    credit: "AI-generated with Google Veo. Not real footage.",
  },
];

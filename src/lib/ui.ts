import type { ScoreResult, SchoolSize } from "@/lib/types";

export type Rating = ScoreResult["rating"];

export function ratingLabel(rating: Rating): string {
  return { poor: "Slow", fair: "Fair", good: "Good", prime: "Prime" }[rating];
}

/** Tailwind classes for a rating pill / accent. */
export function ratingClasses(rating: Rating): {
  text: string;
  bg: string;
  ring: string;
  hex: string;
} {
  switch (rating) {
    case "prime":
      return {
        text: "text-emerald-700",
        bg: "bg-emerald-100",
        ring: "ring-emerald-500",
        hex: "#10b981",
      };
    case "good":
      return {
        text: "text-lime-700",
        bg: "bg-lime-100",
        ring: "ring-lime-500",
        hex: "#65a30d",
      };
    case "fair":
      return {
        text: "text-amber-700",
        bg: "bg-amber-100",
        ring: "ring-amber-500",
        hex: "#f59e0b",
      };
    default:
      return {
        text: "text-slate-600",
        bg: "bg-slate-100",
        ring: "ring-slate-400",
        hex: "#94a3b8",
      };
  }
}

export function ratingFromScore(score: number): Rating {
  if (score >= 80) return "prime";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

export const SIZE_META: Record<SchoolSize, { label: string; emoji: string }> = {
  small: { label: "Small", emoji: "🐟" },
  medium: { label: "Medium", emoji: "🐟🐟" },
  large: { label: "Large", emoji: "🐟🐟🐟" },
  huge: { label: "Huge", emoji: "🐟🐟🐟🐟" },
};

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

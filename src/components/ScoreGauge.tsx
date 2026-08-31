import type { Rating } from "@/lib/ui";
import { ratingClasses, ratingLabel } from "@/lib/ui";

export function ScoreGauge({
  score,
  rating,
}: {
  score: number;
  rating: Rating;
}) {
  const size = 168;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const { hex } = ratingClasses(rating);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={hex}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-black tabular-nums text-slate-900">
          {score}
        </span>
        <span
          className="text-sm font-bold uppercase tracking-wide"
          style={{ color: hex }}
        >
          {ratingLabel(rating)}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
          out of 100
        </span>
      </div>
    </div>
  );
}

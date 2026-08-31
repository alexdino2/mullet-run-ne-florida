"use client";

import { useRouter } from "next/navigation";
import type { Beach } from "@/lib/types";

export function BeachSwitcher({
  beaches,
  currentId,
}: {
  beaches: Beach[];
  currentId: string;
}) {
  const router = useRouter();
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex w-max gap-2 pb-1">
        {beaches.map((b) => {
          const active = b.id === currentId;
          return (
            <button
              key={b.id}
              onClick={() => router.push(`/?beach=${b.id}`)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                active
                  ? "border-ocean-600 bg-ocean-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-ocean-300"
              }`}
            >
              {b.id === "micklers" && !active && (
                <span className="mr-1 text-amber-500" aria-hidden>
                  ★
                </span>
              )}
              {b.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

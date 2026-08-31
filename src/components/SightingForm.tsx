"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Beach, SchoolSize } from "@/lib/types";
import { SIZE_META } from "@/lib/ui";

const SIZES: SchoolSize[] = ["small", "medium", "large", "huge"];

function localNow(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function SightingForm({
  beaches,
  defaultBeachId,
}: {
  beaches: Beach[];
  defaultBeachId?: string;
}) {
  const router = useRouter();
  const [beachId, setBeachId] = useState(
    defaultBeachId ?? beaches[0]?.id ?? "",
  );
  const [size, setSize] = useState<SchoolSize>("medium");
  const [observedAt, setObservedAt] = useState(localNow());
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/sightings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beach_id: beachId,
          school_size: size,
          observed_at: new Date(observedAt).toISOString(),
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not save sighting.");
        return;
      }
      setStatus("ok");
      setMessage("Sighting logged. Tight lines! 🎣");
      setNotes("");
      setObservedAt(localNow());
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error — try again.");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
    >
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Beach
        </label>
        <select
          value={beachId}
          onChange={(e) => setBeachId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500"
        >
          {beaches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          School size
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold capitalize transition ${
                size === s
                  ? "border-ocean-600 bg-ocean-600 text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <span className="block text-sm" aria-hidden>
                {SIZE_META[s].emoji.slice(0, 2)}
              </span>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          When
        </label>
        <input
          type="datetime-local"
          value={observedAt}
          max={localNow()}
          onChange={(e) => setObservedAt(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Notes <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Bait pushed tight to the beach, birds working, jacks crashing…"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500"
        />
      </div>

      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-lg bg-ocean-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-ocean-700 disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Log sighting"}
      </button>

      {message && (
        <p
          className={`text-center text-sm ${
            status === "error" ? "text-red-600" : "text-emerald-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

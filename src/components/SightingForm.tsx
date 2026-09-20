"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { captureEvent } from "@/lib/analytics";
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
  // Seeded after mount so the server-rendered HTML (UTC on Vercel) and the
  // client-rendered HTML (the visitor's local time) match during hydration.
  // Computing local time during render caused a hydration mismatch that could
  // surface as a client-side exception for anyone outside UTC.
  const [observedAt, setObservedAt] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<{
    lat: number;
    lon: number;
    accuracy: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "error"
  >("idle");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const now = localNow();
    setObservedAt(now);
    setMaxTime(now);
  }, []);

  function useCurrentLocation() {
    captureEvent("sighting_location_requested");
    if (!navigator.geolocation) {
      setLocationStatus("error");
      captureEvent("sighting_location_failed", { reason: "unsupported" });
      return;
    }

    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({
          lat: Number(coords.latitude.toFixed(5)),
          lon: Number(coords.longitude.toFixed(5)),
          accuracy: Math.round(coords.accuracy),
        });
        setLocationStatus("idle");
        captureEvent("sighting_location_added", {
          accuracy_m: Math.round(coords.accuracy),
        });
      },
      (error) => {
        setLocationStatus("error");
        captureEvent("sighting_location_failed", { error_code: error.code });
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!observedAt) return;
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
          lat: location?.lat,
          lon: location?.lon,
          location_accuracy_m: location?.accuracy,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not save sighting.");
        captureEvent("sighting_submission_failed", {
          beach_id: beachId,
          status_code: res.status,
        });
        return;
      }
      setStatus("ok");
      setMessage("Sighting logged. Tight lines! 🎣");
      setNotes("");
      setLocation(null);
      setObservedAt(localNow());
      captureEvent("sighting_submitted", {
        beach_id: beachId,
        school_size: size,
        has_location: Boolean(location),
        has_notes: Boolean(notes.trim()),
      });
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error — try again.");
      captureEvent("sighting_submission_failed", {
        beach_id: beachId,
        reason: "network_error",
      });
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
        <div className="mb-1 flex items-center justify-between gap-3">
          <label className="block text-sm font-semibold text-slate-700">
            Map location{" "}
            <span className="font-normal text-slate-400">(recommended)</span>
          </label>
          {location && (
            <button
              type="button"
              onClick={() => {
                setLocation(null);
                captureEvent("sighting_location_cleared");
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locationStatus === "locating"}
          className="w-full rounded-lg border border-ocean-200 bg-ocean-50 px-3 py-2.5 text-sm font-semibold text-ocean-800 transition hover:bg-ocean-100 disabled:opacity-60"
        >
          {locationStatus === "locating"
            ? "Getting your location…"
            : location
              ? `Location added · accurate to ~${location.accuracy}m`
              : "◎ Use my current location"}
        </button>
        <p className="mt-1.5 text-xs text-slate-400">
          Your coordinates place this report on the public tracker. Without
          them, the selected beach location is used.
        </p>
        {locationStatus === "error" && (
          <p className="mt-1 text-xs text-red-600">
            Location unavailable. Check browser permission and try again.
          </p>
        )}
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
          max={maxTime || undefined}
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

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { captureEvent } from "@/lib/analytics";
import {
  CHARTER_COASTS,
  CHARTER_FORM_ID,
  CHARTER_REGIONS,
} from "@/lib/content/charters";

const INPUT =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500";
const LABEL = "mb-1 block text-sm font-semibold text-slate-700";

const EMPTY = {
  captain_name: "",
  business_name: "",
  email: "",
  phone: "",
  website: "",
  uscg_license: "",
  notes: "",
  nickname: "",
};

function isRegion(id: string | null | undefined): id is string {
  return !!id && CHARTER_REGIONS.some((r) => r.id === id);
}

/**
 * Picks up `?region=` from the "Claim this inlet/area" link on each region card and
 * brings the form into view (a soft navigation only scrolls it partway).
 * Kept in its own Suspense boundary so the rest of the form still prerenders.
 */
function RegionFromQuery({ onRegion }: { onRegion: (id: string) => void }) {
  const region = useSearchParams().get("region");
  useEffect(() => {
    if (!isRegion(region)) return;
    onRegion(region);
    if (window.location.hash === `#${CHARTER_FORM_ID}`) {
      document.getElementById(CHARTER_FORM_ID)?.scrollIntoView();
    }
  }, [region, onRegion]);
  return null;
}

export function CharterListingForm({ contactEmail }: { contactEmail: string }) {
  const [region, setRegion] = useState(CHARTER_REGIONS[0].id);
  const [fields, setFields] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  function field(name: keyof typeof EMPTY) {
    return {
      name,
      value: fields[name],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setFields((f) => ({ ...f, [name]: e.target.value })),
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/charter-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region_id: region, ...fields }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "We couldn’t save your request.");
        captureEvent("charter_lead_failed", {
          region,
          status_code: res.status,
        });
        return;
      }
      setStatus("ok");
      setFields(EMPTY);
      captureEvent("charter_lead_submitted", {
        region,
        has_license: Boolean(fields.uscg_license.trim()),
        has_website: Boolean(fields.website.trim()),
      });
    } catch {
      setStatus("error");
      setMessage("Network error — try again.");
      captureEvent("charter_lead_failed", { region, reason: "network_error" });
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-xl bg-white p-5 text-center text-slate-700 shadow-sm">
        <p className="text-base font-bold text-slate-900">
          Request received. Thanks, Captain!
        </p>
        <p className="mt-1 text-sm">
          We’ll reach out to verify your USCG license and set up your listing.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-3 text-sm font-semibold text-ocean-600 hover:text-ocean-700"
        >
          Submit another charter
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl bg-white p-4 text-left shadow-sm"
    >
      <Suspense fallback={null}>
        <RegionFromQuery onRegion={setRegion} />
      </Suspense>
      <div>
        <label htmlFor="charter-region" className={LABEL}>
          Region you fish
        </label>
        <select
          id="charter-region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className={INPUT}
        >
          {CHARTER_COASTS.map((coast) => (
            <optgroup key={coast.id} label={coast.name}>
              {CHARTER_REGIONS.filter((r) => r.coast === coast.id).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="charter-captain" className={LABEL}>
            Captain name
          </label>
          <input
            id="charter-captain"
            required
            maxLength={120}
            autoComplete="name"
            className={INPUT}
            {...field("captain_name")}
          />
        </div>
        <div>
          <label htmlFor="charter-business" className={LABEL}>
            Business name{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="charter-business"
            maxLength={160}
            autoComplete="organization"
            className={INPUT}
            {...field("business_name")}
          />
        </div>
        <div>
          <label htmlFor="charter-email" className={LABEL}>
            Email
          </label>
          <input
            id="charter-email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className={INPUT}
            {...field("email")}
          />
        </div>
        <div>
          <label htmlFor="charter-phone" className={LABEL}>
            Phone <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="charter-phone"
            type="tel"
            maxLength={40}
            autoComplete="tel"
            className={INPUT}
            {...field("phone")}
          />
        </div>
        <div>
          <label htmlFor="charter-website" className={LABEL}>
            Website or booking link{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="charter-website"
            type="text"
            inputMode="url"
            maxLength={300}
            autoComplete="url"
            className={INPUT}
            {...field("website")}
          />
        </div>
        <div>
          <label htmlFor="charter-license" className={LABEL}>
            USCG license #{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="charter-license"
            maxLength={60}
            className={INPUT}
            {...field("uscg_license")}
          />
        </div>
      </div>

      <div>
        <label htmlFor="charter-notes" className={LABEL}>
          Target species & notes{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="charter-notes"
          rows={2}
          maxLength={1000}
          placeholder="Home inlet or pass, species, boat, trip lengths…"
          className={`${INPUT} resize-none`}
          {...field("notes")}
        />
      </div>

      {/* Honeypot for bots; hidden from people and screen readers. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="charter-nickname">Leave this empty</label>
        <input
          id="charter-nickname"
          tabIndex={-1}
          autoComplete="off"
          {...field("nickname")}
        />
      </div>

      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-60"
      >
        {status === "saving" ? "Sending…" : "Request my listing"}
      </button>

      {status === "error" && (
        <p className="text-center text-sm text-red-600">
          {message} You can also email{" "}
          <a
            href={`mailto:${contactEmail}?subject=${encodeURIComponent("Charter listing request")}`}
            className="font-semibold underline"
          >
            {contactEmail}
          </a>
          .
        </p>
      )}
    </form>
  );
}

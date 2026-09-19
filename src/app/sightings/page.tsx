import Link from "next/link";
import { getBeaches } from "@/lib/beaches";
import { getRecentSightings } from "@/lib/sightings";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { SightingForm } from "@/components/SightingForm";
import { SightingList } from "@/components/SightingList";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export default async function SightingsPage() {
  const [beaches, sightings] = await Promise.all([
    getBeaches(),
    getRecentSightings(50),
  ]);
  const configured = isSupabaseConfigured();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Sightings</h1>
        <Link
          href="/"
          className="text-xs font-semibold text-ocean-600 hover:text-ocean-700"
        >
          ← Back to scores
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Log a school you spotted. Sightings are tracked and shown here, but
        don’t affect the opportunity score yet — the score uses public data
        only while we gather more reports.
      </p>

      {!configured && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
          Supabase isn’t configured, so sightings can’t be saved yet. Add your
          keys to <code>.env.local</code> (see the README).
        </p>
      )}

      <div className="mt-4">
        <SightingForm beaches={beaches} defaultBeachId={beaches[0]?.id} />
      </div>

      <AdSlot label="Advertisement" />

      <h2 className="mb-2 mt-6 text-xs font-bold uppercase tracking-widest text-slate-400">
        Latest reports
      </h2>
      <SightingList sightings={sightings} beaches={beaches} />
    </div>
  );
}

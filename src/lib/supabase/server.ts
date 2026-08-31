import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase access.
 *
 * Uses the service-role key when it is configured (writes bypass RLS), and
 * falls back to the public anon key otherwise so the app still runs with only
 * the two public environment variables set. Returns null when Supabase is not
 * configured at all, so callers can degrade gracefully instead of crashing.
 */
export function getServerSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceKey && serviceKey.length > 0 ? serviceKey : anonKey;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Always read fresh: Next.js caches fetch GETs by URL, which would
      // otherwise serve stale sightings/rules between requests.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export function hasServiceRole(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client using the public anon key. Reads are protected by
 * Row Level Security. Safe to use in client components (e.g. realtime).
 */
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

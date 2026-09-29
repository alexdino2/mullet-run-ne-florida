import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cookie-based Supabase Auth client for server components, server actions and
 * route handlers. Used only to know who is signed in to /admin; data access
 * still goes through getServerSupabase() (service role) after the admin check.
 */
export function getAuthSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components can't set cookies; middleware refreshes the session.
        }
      },
    },
  });
}

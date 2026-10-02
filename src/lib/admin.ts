import { redirect } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { getAuthSupabase } from "@/lib/supabase/auth";

/** Addresses allowed into /admin (comma-separated ADMIN_EMAILS). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && adminEmails().includes(email.trim().toLowerCase());
}

/** The signed-in admin's email, or null when signed out or not allowed. */
export async function getAdminEmail(): Promise<string | null> {
  const supabase = getAuthSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? null;
  return isAdminEmail(email) ? email : null;
}

/** Guard for admin pages and server actions (actions are public endpoints). */
export async function requireAdmin(): Promise<string> {
  const email = await getAdminEmail();
  if (!email) redirect("/admin/login");
  return email;
}

/**
 * Origin for links emailed to the admin. Taken from the deployment rather than
 * request headers, so a forged Host header can't redirect a sign-in link.
 */
export function adminBaseUrl(): string {
  if (process.env.VERCEL_ENV === "production") return SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

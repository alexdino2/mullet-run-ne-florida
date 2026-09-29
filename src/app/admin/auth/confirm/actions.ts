"use server";

import { redirect } from "next/navigation";
import { getAuthSupabase } from "@/lib/supabase/auth";

/** Trade the emailed one-time token for a session cookie. */
export async function confirmSignIn(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const supabase = getAuthSupabase();
  if (!tokenHash || !supabase) redirect("/admin/login?error=link");

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
  redirect(error ? "/admin/login?error=link" : "/admin/instagram");
}

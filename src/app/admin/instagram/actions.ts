"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { approveCandidate, setCandidateStatus } from "@/lib/instagram-candidates";
import { getAuthSupabase } from "@/lib/supabase/auth";

function back(params: Record<string, string>): never {
  redirect(`/admin/instagram?${new URLSearchParams(params).toString()}`);
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function approvePost(formData: FormData) {
  const reviewer = await requireAdmin();
  const result = await approveCandidate(
    {
      id: String(formData.get("id") ?? ""),
      beach_id: String(formData.get("beach_id") ?? ""),
      school_size: String(formData.get("school_size") ?? ""),
      observed_at: String(formData.get("observed_at") ?? ""),
      lat: numberOrNull(formData.get("lat")),
      lon: numberOrNull(formData.get("lon")),
      source_handle: String(formData.get("source_handle") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    },
    reviewer,
  );
  if (!result.ok) back({ error: result.error });
  revalidatePath("/sightings");
  back({ notice: "Posted to the sightings map." });
}

export async function rejectPost(formData: FormData) {
  const reviewer = await requireAdmin();
  const result = await setCandidateStatus(String(formData.get("id") ?? ""), "rejected", reviewer);
  back(result.ok ? { notice: "Rejected." } : { error: result.error ?? "Could not reject" });
}

export async function restorePost(formData: FormData) {
  const reviewer = await requireAdmin();
  const result = await setCandidateStatus(String(formData.get("id") ?? ""), "pending", reviewer);
  back(result.ok ? { status: "pending", notice: "Moved back to pending." } : { error: result.error ?? "Could not restore" });
}

export async function signOut() {
  await getAuthSupabase()?.auth.signOut();
  redirect("/admin/login");
}

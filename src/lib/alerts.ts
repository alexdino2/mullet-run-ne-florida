import type { AlertRule } from "@/lib/types";
import { getServerSupabase } from "@/lib/supabase/server";

export async function getAlertRules(): Promise<AlertRule[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("mw_alert_rules")
    .select("*")
    .order("min_score", { ascending: false });
  if (error || !data) return [];
  return data as AlertRule[];
}

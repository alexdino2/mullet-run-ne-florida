import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import type { AlertRule } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ rules: [] as AlertRule[] });

  const { data, error } = await supabase
    .from("mw_alert_rules")
    .select("*")
    .order("min_score", { ascending: false });

  if (error) return NextResponse.json({ rules: [] as AlertRule[] });
  return NextResponse.json({ rules: data as AlertRule[] });
}

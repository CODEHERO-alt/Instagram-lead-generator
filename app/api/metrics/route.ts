import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(_req: NextRequest) {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const now = new Date();
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [{ data: totalData }, { data: byStatus }, { data: discovered7 }, { data: contacted7 }, { data: interested7 }, { data: closed30 }] =
    await Promise.all([
      supabase
        .from("instagram_accounts")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("instagram_accounts")
        .select("status, count:id")
        .group("status"),
      supabase
        .from("instagram_accounts")
        .select("id", { count: "exact", head: true })
        .gte("created_at", last7.toISOString()),
      supabase
        .from("instagram_accounts")
        .select("id", { count: "exact", head: true })
        .eq("status", "contacted")
        .gte("last_status_change_at", last7.toISOString()),
      supabase
        .from("instagram_accounts")
        .select("id", { count: "exact", head: true })
        .eq("status", "interested")
        .gte("last_status_change_at", last7.toISOString()),
      supabase
        .from("instagram_accounts")
        .select("id", { count: "exact", head: true })
        .eq("status", "closed")
        .gte("last_status_change_at", last30.toISOString())
    ]);

  return NextResponse.json({
    total_leads: totalData?.length ?? null, // Supabase count with head: true is in response.count usually
    leads_by_status: byStatus ?? [],
    leads_discovered_last_7_days: discovered7?.length ?? null,
    leads_contacted_last_7_days: contacted7?.length ?? null,
    leads_interested_last_7_days: interested7?.length ?? null,
    leads_closed_last_30_days: closed30?.length ?? null
  });
}

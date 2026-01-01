import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "./supabase-server";

export type AuthUser = {
  id: string;
  email?: string;
};

export async function getAuthUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user ? ({ id: user.id, email: user.email ?? undefined } as AuthUser) : null;
}

export async function requireAdminUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthenticated");
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) {
    throw new Error("Forbidden");
  }

  return user;
}

export function assertCronAuth(req: NextRequest) {
  const secret = process.env.CRON_SECRET_TOKEN;
  const header = req.headers.get("x-cron-secret");
  if (!secret || header !== secret) {
    throw new Error("Unauthorized cron");
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

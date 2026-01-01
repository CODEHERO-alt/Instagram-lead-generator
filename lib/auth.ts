// lib/auth.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // If this ever happens in prod, something is wrong with env vars
    throw new Error("Supabase URL or anon key not configured on server");
  }

  const cookieStore = cookies();

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}

export async function getAuthUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}

/**
 * Used in /dashboard to ensure only mapped admin users can access.
 * Never throws 500 — it either returns the user or redirects to /login.
 */
export async function requireAdminUser() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Not logged in → send to login
  if (authError || !user) {
    redirect("/login?redirect=/dashboard");
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  // If table/query fails, or user isn't in admin_users, just send to login.
  if (adminError) {
    console.error("Error querying admin_users:", adminError);
    redirect("/login?redirect=/dashboard");
  }

  if (!admin) {
    redirect("/login?redirect=/dashboard");
  }

  return user;
}

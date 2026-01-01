"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push(redirectTo);
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md border border-slate-800 rounded-xl p-6 bg-slate-900/60">
        <h1 className="text-2xl font-semibold mb-2">
          Instagram Lead Engine – Admin
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Internal login for Pehchaan Media team.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 whitespace-pre-wrap">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-sm font-medium"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

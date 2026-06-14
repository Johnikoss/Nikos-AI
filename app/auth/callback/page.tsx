"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/logo";

/**
 * OAuth landing route. Supabase parses the session from the URL on load; we
 * then forward the user into the app (or back to sign-in if it didn't take).
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const finish = async () => {
      const { data } = await supabase.auth.getSession();
      router.replace(data.session ? "/app" : "/signin");
    };
    finish();
  }, [router]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-4 text-white">
      <Logo className="h-10 w-10 animate-pulse" />
      <p className="text-sm text-white/60">Signing you in…</p>
    </main>
  );
}

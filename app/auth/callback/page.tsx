"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // THIS is the correct way (wait for session to hydrate)
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/signin");
        return;
      }

      router.replace("/app");
    };

    handleAuth();
  }, [router]);

  return <p>Signing you in...</p>;
}
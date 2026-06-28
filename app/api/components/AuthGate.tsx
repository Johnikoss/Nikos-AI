"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();

      const session = data.session;

      if (!session) {
        router.replace("/signin");
        return;
      }

      setLoading(false);
    };

    check();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center text-foreground/60">
        Loading session...
      </div>
    );
  }

  return <>{children}</>;
}
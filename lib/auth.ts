import { supabase } from "@/lib/supabase";

/** Email + password sign-up. Returns an error message string, or null on success. */
export async function signUp(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signUp({ email, password });
  return error ? error.message : null;
}

/** Email + password sign-in. Returns an error message string, or null on success. */
export async function signIn(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
}

/**
 * Start the Google OAuth flow. Supabase redirects to Google, then back to
 * /auth/callback (see app/auth/callback/page.tsx) which lands the user in /app.
 */
export async function signInWithGoogle(): Promise<string | null> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined,
    },
  });
  return error ? error.message : null;
}

/** Current signed-in user (or null). */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

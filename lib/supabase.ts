import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// These are PUBLIC values — the project URL and the anon (publishable) key are
// shipped to the browser in every Supabase app, so it is safe to keep them in
// source. We hardcode them here on purpose: it guarantees the app always talks
// to the correct Supabase project (where Google sign-in is enabled), regardless
// of how the Vercel environment variables happen to be set. The anon key only
// allows what Row Level Security policies permit — it is NOT a secret.
const url = "https://hgljrkofcezntyshunqq.supabase.co";
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbGpya29mY2V6bnR5c2h1bnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4ODA4MTgsImV4cCI6MjA5NjQ1NjgxOH0.zY5C5VczIjGqptk1eaaf_MOKoa6oZEAAQ5KgdTB2YNk";

// Construct the client lazily. Pages like /auth/callback and /signin are
// prerendered at build time and import this module, but only actually call
// supabase in the browser. A Proxy defers creation until the first real
// property access (at runtime) so `next build` never evaluates createClient and
// every existing `supabase.auth.*` call site keeps working unchanged.
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const c = getClient();
    const value = Reflect.get(c, prop, receiver);
    return typeof value === "function" ? value.bind(c) : value;
  },
});

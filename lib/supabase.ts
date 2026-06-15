import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Construct the client lazily. Pages like /auth/callback and /signin are
// prerendered at build time and import this module, but only actually call
// supabase in the browser. Building the client at module scope would run
// createClient() during `next build` with possibly-missing env vars, throwing
// "supabaseUrl is required" and failing the build. A Proxy defers creation
// until the first real property access (at runtime), so the build never throws
// and every existing `supabase.auth.*` call site keeps working unchanged.
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
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

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Untyped client by design: admin paths cross schemas/tables we don't generate
// types for in this MVP. When `supabase gen types` is wired in, replace with
// `SupabaseClient<Database>`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: SupabaseClient<any, "public", any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSupabaseAdminClient(): SupabaseClient<any, "public", any> {
  if (cached) return cached;
  cached = createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return cached;
}

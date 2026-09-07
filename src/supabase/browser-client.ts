import { createBrowserClient } from '@supabase/ssr';

// Deliberately reads process.env directly instead of importing `env` from the
// project root: `env.ts` validates server-only secrets (service role key,
// JWT secret, etc.) that are never defined in the browser bundle, so
// importing it here would throw at module load time for every client
// component that touches Supabase.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function getSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

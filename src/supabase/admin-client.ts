import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { env } from '@/env';

// Service-role client for server-only storage operations (signed upload/view URLs).
// Never import this from client components.
export function getSupabaseAdminClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
  });
}

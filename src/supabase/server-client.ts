import { cookies } from 'next/headers';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { env } from '@/env';

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  // Called during a Server Component render, cookies cannot be mutated —
  // session refresh happens on the next Server Action or Route Handler call.
  const setAll: NonNullable<CookieMethodsServer['setAll']> = (cookiesToSet) => {
    try {
      for (const { name, value, options } of cookiesToSet) {
        cookieStore.set(name, value, options);
      }
    } catch {
      // no-op — see comment above
    }
  };

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll,
    },
  });
}

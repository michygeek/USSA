'use client';

import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/supabase/browser-client';

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
    router.refresh();
  }

  return (
    <button type="button" onClick={handleSignOut} className="text-sm font-semibold text-slate-600 hover:text-navy-900">
      Sign out
    </button>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthenticatedUserFromSession } from '@/features/auth/get-authenticated-user';
import { SignOutButton } from '@/features/auth/sign-out-button';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authenticatedUser = await getAuthenticatedUserFromSession();
  if (!authenticatedUser) redirect('/sign-in');
  if (authenticatedUser.role !== 'admin') redirect('/sign-in');

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/ussalogo.png" alt="USSA seal" width={40} height={40} className="h-10 w-10" />
            <div>
              <p className="text-sm font-extrabold leading-tight text-white">UNITED STATES SECURITY ACADEMY</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-400">Admin Console</p>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xs font-semibold uppercase tracking-wide text-slate-300 hover:text-white">
              Overview
            </Link>
            <Link href="/admin/users" className="text-xs font-semibold uppercase tracking-wide text-slate-300 hover:text-white">
              Users
            </Link>
            <Link href="/instructor/courses" className="text-xs font-semibold uppercase tracking-wide text-slate-300 hover:text-white">
              Course Tools
            </Link>
            <SignOutButton className="text-slate-300 hover:text-white" />
          </div>
        </div>
      </header>
      <div className="min-h-[calc(100vh-73px)] bg-slate-100">{children}</div>
    </div>
  );
}

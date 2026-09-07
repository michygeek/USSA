import Image from 'next/image';
import Link from 'next/link';
import { SignOutButton } from '@/features/auth/sign-out-button';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/instructor/courses" className="flex items-center gap-3">
            <Image src="/ussalogo.png" alt="USSA seal" width={40} height={40} className="h-10 w-10" />
            <div>
              <p className="text-sm font-extrabold leading-tight text-navy-900">UNITED STATES SECURITY ACADEMY</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gold-600">Instructor Portal</p>
            </div>
          </Link>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}

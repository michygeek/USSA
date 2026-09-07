'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Courses & Programs', href: '/courses' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Training Modes', href: '/training-modes' },
  { label: 'Resources', href: '/resources' },
  { label: 'Contact Us', href: '/contact' },
];

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto hidden max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs sm:flex">
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="hover:text-gold-400">
            Login
          </Link>
          <Link href="/contact" className="hover:text-gold-400">
            Contact Us
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Icon name="phone" className="h-3.5 w-3.5" />
            (832) 272-0151
          </span>
          <span className="flex items-center gap-1">
            <Icon name="mail" className="h-3.5 w-3.5" />
            info@ussa-academy.com
          </span>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image src="/ussalogo.png" alt="USSA seal" width={80} height={80} className="h-16 w-16 sm:h-20 sm:w-20" />
            <span>
              <span className="block text-base font-extrabold leading-tight tracking-wide sm:text-xl">
                UNITED STATES
                <br />
                SECURITY ACADEMY
              </span>
              <span className="block text-[10px] font-semibold tracking-[0.2em] text-gold-400 sm:text-xs">
                TRAIN &middot; CERTIFY &middot; SERVE &middot; LEAD
              </span>
            </span>
          </Link>

          <nav className="hidden flex-1 justify-end lg:flex">
            <ul className="flex items-center gap-6 text-xs font-semibold tracking-wide">
              {NAV_LINKS.map((navLink) => (
                <li key={navLink.href}>
                  <Link href={navLink.href} className="hover:text-gold-400">
                    {navLink.label.toUpperCase()}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/courses" className="text-gold-400 hover:text-gold-500">
                  ENROLL NOW
                </Link>
              </li>
            </ul>
          </nav>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((currentIsOpen) => !currentIsOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 lg:hidden"
          >
            <Icon name={isMobileMenuOpen ? 'close' : 'menu'} className="h-5 w-5" />
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav className="border-t border-white/10 lg:hidden">
            <ul className="mx-auto flex max-w-7xl flex-col px-4 py-3 text-sm font-semibold tracking-wide">
              {NAV_LINKS.map((navLink) => (
                <li key={navLink.href}>
                  <Link
                    href={navLink.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 hover:text-gold-400"
                  >
                    {navLink.label.toUpperCase()}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-gold-400 hover:text-gold-500"
                >
                  ENROLL NOW
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

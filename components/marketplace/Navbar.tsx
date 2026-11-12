'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import XnettLogo from '@/components/auth/XnettLogo';
import { useAuthStore } from '@/lib/store/authStore';
import { useUiStore } from '@/lib/store/uiStore';

type NavKey = 'personal' | 'business' | 'banks' | 'contact';

const LINKS: { key: NavKey; label: string; href: string }[] = [
  { key: 'personal', label: 'Personal', href: '/' },
  { key: 'business', label: 'Business', href: '/#business' },
  { key: 'banks', label: 'Banks', href: '/banks' },
  { key: 'contact', label: 'Contact us', href: '/contact' },
];

function activeKey(pathname: string): NavKey | null {
  if (pathname.startsWith('/banks')) return 'banks';
  if (pathname.startsWith('/contact')) return 'contact';
  if (pathname === '/' || pathname.startsWith('/services') || pathname.startsWith('/categories')) return 'personal';
  return null;
}

/** Landing navbar from the web redesign: logo, centred links, outlined + filled pill actions. */
export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUiStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const active = activeKey(pathname);
  const signedIn = isAuthenticated && !!user;

  // Close the profile menu on outside click or Escape
  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setProfileOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  const signOut = () => {
    logout();
    setProfileOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <header
      className="lp-rise relative z-50 mx-auto flex w-full max-w-[1280px] items-center gap-x-10 gap-y-3 px-4 py-5 sm:px-6 sm:py-6"
      style={{ '--d': '0s' } as React.CSSProperties}
    >
      <XnettLogo href="/" className="shrink-0 [&_svg]:h-10 [&_svg]:w-auto" />

      <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-[34px] text-base lg:flex">
        {LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            aria-current={active === link.key ? 'page' : undefined}
            className={`py-2.5 transition-colors ${
              active === link.key ? 'font-bold text-white' : 'text-[#9AA8B0] hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto hidden items-center gap-3 lg:ml-0 lg:flex">
        {signedIn ? (
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 rounded-full border-[1.5px] border-white/80 py-2 pl-2 pr-4 font-semibold text-white transition hover:border-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EE6E2D] text-sm font-extrabold text-[#14252E]">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[140px] truncate">{user.name}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-[#2A3740] bg-[#10181D] p-1.5 shadow-2xl"
              >
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="truncate text-xs text-[#9AA8B0]">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#DCE3E7] hover:bg-white/5"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={signOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-[#F49A66] hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="rounded-full border-[1.5px] border-white px-7 py-3.5 font-semibold text-white transition hover:bg-white hover:text-[#0A1014]"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-[#1E2A31] px-7 py-[15px] font-semibold text-white transition hover:bg-[#2A3740]"
            >
              Create a new account
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileMenuOpen}
        className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#2A3740] bg-[#10181D] text-white lg:hidden"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isMobileMenuOpen && (
        <div className="absolute inset-x-4 top-full z-50 rounded-3xl border border-[#2A3740] bg-[#10181D] p-4 shadow-2xl sm:inset-x-6 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={active === link.key ? 'page' : undefined}
                className={`rounded-xl px-3 py-3 text-base ${
                  active === link.key ? 'font-bold text-white' : 'text-[#9AA8B0]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2.5 border-t border-[#1E2A31] pt-4">
            {signedIn ? (
              <>
                <p className="px-3 text-sm text-[#9AA8B0]">
                  Signed in as <span className="font-semibold text-white">{user.name}</span>
                </p>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-[#EE6E2D] px-6 py-3.5 text-center font-bold text-[#14252E]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-full border-[1.5px] border-white px-6 py-3.5 font-semibold text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full border-[1.5px] border-white px-6 py-3.5 text-center font-semibold text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-[#EE6E2D] px-6 py-3.5 text-center font-bold text-[#14252E]"
                >
                  Create a new account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, Menu, X, ChevronDown, User as UserIcon, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useUiStore } from '@/lib/store/uiStore';
import HatisoLogo from '@/components/brand/HatisoLogo';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, setLanguage, isMobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUiStore();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const languages = ['English', 'Français', 'Español'];

  return (
    <header className="relative z-50 w-full bg-transparent px-4 py-5 sm:px-8 lg:px-14">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand Logo & Left Nav */}
        <div className="flex items-center gap-10">
          <HatisoLogo variant="cloud" height={30} priority />

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/#solutions"
              className="text-sm font-medium text-white transition-colors hover:text-brand-305"
            >
              Personal
            </Link>
            <Link
              href="/#solutions"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-brand-305"
            >
              Business
            </Link>
            <Link
              href="/banks"
              className={`text-sm font-medium transition-colors ${pathname === '/banks'
                ? 'text-brand-361 font-semibold'
                : 'text-slate-300 hover:text-brand-305'
                }`}
            >
              Banks
            </Link>
          </nav>
        </div>

        {/* Right Navigation & Action Buttons */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors ${pathname === '/contact'
              ? 'text-brand-361 font-semibold'
              : 'text-slate-300 hover:text-white'
              }`}
          >
            Contact us
          </Link>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              aria-label="Change language"
            >
              <span>{language}</span>
              <Globe className="h-4 w-4 text-slate-400" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-lg border border-slate-700/80 bg-ink-709 py-1 shadow-xl backdrop-blur-md">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-1.5 text-left text-xs transition-colors ${language === lang
                      ? 'bg-brand-361/20 font-semibold text-brand-361'
                      : 'text-slate-200 hover:bg-slate-700/40'
                      }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Action Buttons */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-slate-700 bg-ink-684 py-1.5 pl-2 pr-3 text-sm text-white transition hover:border-brand-361/60"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-361 text-xs font-bold text-on-brand">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate font-medium">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-700/80 bg-ink-713 p-2 shadow-2xl backdrop-blur-lg">
                  <div className="border-b border-slate-700/60 px-3 py-2">
                    <p className="text-xs font-semibold text-white">{user.name}</p>
                    <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                    {user.balance !== undefined && (
                      <p className="mt-1 text-xs font-medium text-emerald-400">
                        Balance: ₦{user.balance.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700/40 hover:text-white"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileDropdownOpen(false);
                      router.push('/');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="rounded-lg bg-brand-359 px-5 py-2 text-sm font-semibold text-on-brand shadow-md shadow-brand-361/20 transition-all duration-200 hover:bg-brand-370 hover:shadow-lg hover:shadow-brand-361/30 active:scale-95"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg border border-slate-600/80 bg-ink-665/60 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-sm transition-all duration-200 hover:border-slate-400 hover:bg-ink-665 hover:text-white active:scale-95"
              >
                Create a new account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-3 md:hidden">
          {!isAuthenticated && (
            <Link
              href="/auth/login"
              className="rounded-lg bg-brand-361 px-3.5 py-1.5 text-xs font-semibold text-on-brand shadow"
            >
              Sign in
            </Link>
          )}
          <button
            onClick={toggleMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-ink-709 text-slate-200"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="mt-4 rounded-2xl border border-slate-700/80 bg-ink-721/95 p-5 shadow-2xl backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-slate-700/40"
            >
              Personal
            </Link>
            <Link
              href="/#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700/40 hover:text-white"
            >
              Business
            </Link>
            <Link
              href="/banks"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/banks'
                ? 'bg-brand-361/15 text-brand-361 font-semibold'
                : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
                }`}
            >
              Banks
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/contact'
                ? 'bg-brand-361/15 text-brand-361 font-semibold'
                : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
                }`}
            >
              Contact us
            </Link>

            <div className="my-2 border-t border-slate-700/60 pt-3">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2">
                  <div className="px-3 py-1 text-xs text-slate-400">
                    Signed in as <span className="font-semibold text-white">{user.name}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-brand-361/20 px-3 py-2 text-sm font-semibold text-brand-361"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-lg bg-brand-361 py-2.5 text-center text-sm font-semibold text-on-brand shadow-md shadow-brand-361/20"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-lg border border-slate-600 bg-ink-665 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Create a new account
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

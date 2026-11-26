'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Globe,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useUiStore } from '@/lib/store/uiStore';
import HatisoLogo from '@/components/brand/HatisoLogo';
import LogoutDialog from '@/components/auth/LogoutDialog';

/** Header board links. "Services" is active on any service or category page. */
const NAV_LINKS = [
  { label: 'Services', href: '/#popular-categories', match: ['/services', '/categories'] },
  { label: 'Banks', href: '/banks', match: ['/banks'] },
  { label: 'For business', href: '/#business', match: [] as string[] },
  { label: 'Contact', href: '/contact', match: ['/contact'] },
];

/** Menus board: account menu (Rewards stays hidden while the feature is off). */
const ACCOUNT_LINKS = [
  { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
  { label: 'Transactions', href: '/dashboard/transactions', Icon: List },
  /* { label: 'Rewards', href: '/dashboard/rewards', Icon: Gift }, */
  { label: 'Profile and security', href: '/dashboard/profile', Icon: UserRound },
];

const LANGUAGES = ['English', 'Français', 'Español'];

const MENU_PANEL =
  'hz-pop absolute right-0 top-full mt-2 rounded-xl border border-silver bg-white p-1.5 text-carbon shadow-[0_24px_48px_-20px_rgba(18,21,26,0.45)]';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'H';
}

/** Closes a popover on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, setLanguage, isMobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUiStore();
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const cancelSignOut = useCallback(() => setConfirmOut(false), []);
  const langRef = useDismiss(langOpen, () => setLangOpen(false));
  const accountRef = useDismiss(accountOpen, () => setAccountOpen(false));

  const signedIn = isAuthenticated && !!user;
  const isActive = (match: string[]) => match.some((m) => pathname.startsWith(m));

  const askSignOut = () => {
    setAccountOpen(false);
    setMobileMenuOpen(false);
    setConfirmOut(true);
  };

  const signOut = () => {
    setConfirmOut(false);
    logout();
    router.push('/');
  };

  return (
    <header className="relative z-50 w-full border-b border-graphite bg-carbon text-cloud">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-14">
        <div className="flex items-center gap-6 lg:gap-10">
          <HatisoLogo variant="cloud" height={26} priority />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.match);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-graphite text-cloud' : 'text-silver hover:bg-graphite hover:text-cloud'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Language and account */}
        <div className="hidden items-center gap-3 md:flex">
          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-label={`Language: ${language}`}
              aria-haspopup="menu"
              aria-expanded={langOpen}
              className="hz-press flex min-h-10 items-center gap-2 rounded-lg border border-grey-800 px-3 text-sm font-medium text-silver transition-colors hover:text-cloud"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span>{language}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {langOpen && (
              <div role="menu" className={`${MENU_PANEL} w-48`}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    role="menuitemradio"
                    aria-checked={language === lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangOpen(false);
                    }}
                    className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm transition-colors hover:bg-cloud ${
                      language === lang ? 'font-semibold' : 'text-grey-700'
                    }`}
                  >
                    {lang}
                    {language === lang && <Check className="h-4 w-4" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {signedIn ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                className="hz-press flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-cloud text-sm font-semibold text-carbon ring-offset-2 ring-offset-carbon hover:ring-2 hover:ring-grey-700"
              >
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(user.name)
                )}
              </button>
              {accountOpen && (
                <div role="menu" className={`${MENU_PANEL} w-[260px]`}>
                  <div className="border-b border-cloud px-3 pt-2 pb-3">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-[13px] text-grey-600">{user.email || user.phone}</p>
                  </div>
                  <div className="flex flex-col py-1">
                    {ACCOUNT_LINKS.map(({ label, href, Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium hover:bg-cloud"
                      >
                        <Icon className="h-4 w-4 text-grey-600" aria-hidden="true" />
                        {label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-cloud pt-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={askSignOut}
                      className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium hover:bg-cloud"
                    >
                      <LogOut className="h-4 w-4 text-grey-600" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hz-press inline-flex min-h-11 items-center whitespace-nowrap rounded-[10px] px-3.5 text-sm font-medium text-cloud hover:bg-graphite"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="hz-press inline-flex min-h-11 items-center whitespace-nowrap rounded-[10px] bg-cloud px-[18px] text-sm font-medium text-carbon hover:bg-white"
              >
                Create account
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggleMobileMenu}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-grey-800 bg-graphite text-cloud md:hidden"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* MobileMenus board: full-height Carbon sheet */}
      {isMobileMenuOpen && (
        <div className="hz-pop fixed inset-x-0 top-[73px] bottom-0 z-50 flex flex-col overflow-y-auto bg-carbon md:hidden">
          <nav aria-label="Main" className="hz-stagger flex flex-col px-5 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive(link.match) ? 'page' : undefined}
                className="flex min-h-14 items-center justify-between border-b border-graphite text-xl font-medium text-cloud"
              >
                {link.label}
                <ArrowRight className="h-5 w-5 text-grey-500" aria-hidden="true" />
              </Link>
            ))}
            {signedIn &&
              ACCOUNT_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-14 items-center justify-between border-b border-graphite text-xl font-medium text-cloud"
                >
                  {label}
                  <ArrowRight className="h-5 w-5 text-grey-500" aria-hidden="true" />
                </Link>
              ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2.5 p-5">
            {signedIn ? (
              <>
                <p className="text-sm text-grey-400">
                  Signed in as <span className="font-semibold text-cloud">{user.name}</span>
                </p>
                <button
                  type="button"
                  onClick={askSignOut}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-[10px] border border-grey-800 text-[15px] font-medium text-cloud"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[52px] items-center justify-center rounded-[10px] bg-cloud text-[15px] font-medium text-carbon"
                >
                  Create a free account
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[52px] items-center justify-center rounded-[10px] border border-grey-800 text-[15px] font-medium text-cloud"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      {confirmOut && <LogoutDialog onCancel={cancelSignOut} onConfirm={signOut} />}
    </header>
  );
}

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  LayoutGrid,
  Landmark,
  List,
  BarChart3,
  Gift,
  Bell,
  UserRound,
  HelpCircle,
  Search,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import LogoutDialog from '@/components/auth/LogoutDialog';
import HatisoLogo from '@/components/brand/HatisoLogo';

/* ── nav structure (DashSidebar board) ─────────────────────────── */
interface NavItem {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}
interface NavSection {
  section: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
      { label: 'Pay bills', href: '/dashboard/services', Icon: LayoutGrid },
      { label: 'Banking', href: '/dashboard/banking', Icon: Landmark },
    ],
  },
  {
    section: 'Activity',
    items: [
      { label: 'Transactions', href: '/dashboard/transactions', Icon: List },
      { label: 'Analytics', href: '/dashboard/analytics', Icon: BarChart3 },
      /* { label: 'Rewards', href: '/dashboard/rewards', Icon: Gift }, */
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Notifications', href: '/dashboard/notifications', Icon: Bell },
      { label: 'Profile and security', href: '/dashboard/profile', Icon: UserRound },
      { label: 'Help and support', href: '/dashboard/support', Icon: HelpCircle },
    ],
  },
];

// Kept for when Rewards comes back to the nav.
void Gift;

/* ── helpers ───────────────────────────────────────────────────── */
function useSearchShortcut(ref: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ref]);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'H';
}

/* ── sub-components ────────────────────────────────────────────── */
function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const { Icon } = item;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`hz-press flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${active ? 'bg-cloud text-carbon' : 'text-silver hover:bg-graphite hover:text-cloud'
        }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
      <span className="flex-1">{item.label}</span>
    </Link>
  );
}

/* ── main component ────────────────────────────────────────────── */
interface DashboardSidebarProps {
  /** Controlled by mobile sheet: undefined = always visible (desktop) */
  open?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [query, setQuery] = useState('');
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const displayName = user?.name || 'Hatiso user';

  useSearchShortcut(searchRef);

  const isActive = useCallback(
    (href: string) =>
      href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href),
    [pathname]
  );

  const closeLogout = useCallback(() => setIsLogoutConfirmOpen(false), []);

  const handleLogout = () => {
    logout();
    setIsLogoutConfirmOpen(false);
    onClose?.();
    router.replace('/auth/login');
  };

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      {open !== undefined && open && (
        <div
          className="fixed inset-0 z-30 bg-carbon/60 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* ── Sidebar shell ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col gap-6 overflow-y-auto bg-carbon px-4 py-6 text-silver no-scrollbar transition-transform duration-300 ease-out-soft
          lg:static lg:z-auto lg:translate-x-0
          ${open === undefined || open ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Dashboard"
      >
        {/* ── Logo ── */}
        <div className="flex items-center px-2 py-1">
          <HatisoLogo variant="cloud" height={26} href="/dashboard" />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-grey-400 hover:bg-graphite hover:text-cloud lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {/* ── Search ── */}
        <label className="flex min-h-11 items-center gap-2.5 rounded-lg border border-grey-900 bg-graphite px-3.5 transition-colors focus-within:border-grey-500">
          <Search className="h-4 w-4 shrink-0 text-grey-400" aria-hidden="true" />
          <span className="sr-only">Search</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full min-w-0 bg-transparent text-sm text-cloud placeholder-grey-500 focus:outline-none"
          />
          <kbd className="hidden rounded-md border border-grey-800 px-1.5 text-[11px] text-grey-500 sm:block">⌘K</kbd>
        </label>

        {/* ── Nav ── */}
        <nav className="flex flex-1 flex-col gap-[22px]">
          {NAV.map((group) => (
            <div key={group.section} className="flex flex-col gap-1">
              <p className="mb-1.5 px-3 text-[11px] font-medium tracking-[0.14em] text-grey-600 uppercase">
                {group.section}
              </p>
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={onClose} />
              ))}
            </div>
          ))}
        </nav>

        {/* ── Account card ── */}
        <div className="flex items-center gap-3 rounded-lg border border-grey-900 bg-graphite p-3">
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cloud text-sm font-semibold text-carbon">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(displayName)
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-cloud">{displayName}</span>
              <span className="truncate text-xs text-grey-400">{user?.email || user?.phone || 'Personal account'}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            aria-label="Sign out"
            className="hz-press flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-grey-400 hover:bg-carbon hover:text-cloud"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>
        </div>
      </aside>

      {isLogoutConfirmOpen && <LogoutDialog onCancel={closeLogout} onConfirm={handleLogout} />}
    </>
  );
}

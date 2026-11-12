'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  LayoutGrid,
  Building2,
  ClipboardList,
  BarChart3,
  Gift,
  Bell,
  UserCog,
  HelpCircle,
  Search,
  Headphones,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import XnettLogoDashboard from '../auth/XnettLogoDashboard';

/* ── nav structure ─────────────────────────────────────────────── */
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}
interface NavSection {
  section: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    section: 'OVERVIEW',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={2.2} />,
      },
    ],
  },
  {
    section: 'PAY & BANK',
    items: [
      {
        label: 'Digital Services',
        href: '/dashboard/services',
        icon: <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={2.2} />,
      },
      {
        label: 'Banking',
        href: '/dashboard/banking',
        icon: <Building2 className="h-[18px] w-[18px]" strokeWidth={2.2} />,
      },
    ],
  },
  {
    section: 'ACTIVITY',
    items: [
      {
        label: 'Transactions',
        href: '/dashboard/transactions',
        icon: <ClipboardList className="h-[18px] w-[18px]" strokeWidth={2.2} />,
      },
    ],
  },
  {
    section: 'GROW',
    items: [
      {
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2.2} />,
      },
      /*   {
          label: 'Rewards',
          href: '/dashboard/rewards',
          icon: <Gift className="h-[18px] w-[18px]" strokeWidth={2.2} />,
        }, */
    ],
  },

  {
    section: 'ACCOUNT',
    items: [
      {
        label: 'Notification & Alert',
        href: '/dashboard/notifications',
        icon: <Bell className="h-[18px] w-[18px]" strokeWidth={2.2} />,
      },
      {
        label: 'Profile & Security',
        href: '/dashboard/profile',
        icon: <UserCog className="h-[18px] w-[18px]" strokeWidth={2.2} />,
      },
      {
        label: 'Help & Support',
        href: '/dashboard/support',
        icon: <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2.2} />,
      },
    ],
  },
];

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

/* ── sub-components ────────────────────────────────────────────── */
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm transition-all duration-150 ${active
        ? 'bg-[#1A2329] font-semibold text-white'
        : 'font-medium text-[#9AA8B0] hover:bg-[#10181D] hover:text-white'
        }`}
    >
      <span className={active ? 'text-[#EE6E2D]' : 'text-[#5D6F78] group-hover:text-[#DCE3E7]'}>
        {item.icon}
      </span>
      {item.label}
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
  const [helpDismissed, setHelpDismissed] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [query, setQuery] = useState('');
  const logout = useAuthStore((state) => state.logout);

  useSearchShortcut(searchRef);

  const isActive = useCallback(
    (href: string) =>
      href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href),
    [pathname]
  );

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
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* ── Sidebar shell ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden border-r border-[#1E2A31] bg-[#0A1014] transition-transform duration-300 ease-out
          lg:static lg:z-auto lg:translate-x-0
          ${open === undefined || open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Logo ── */}
        <div className="flex items-start justify-start px-5 pt-7 pb-5">
          <XnettLogoDashboard />
          {/* Close button (mobile only) */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto rounded-full p-1.5 text-[#9AA8B0] hover:bg-[#1A2329] hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Search ── */}
        <div className="px-4 pb-5">
          <div className="flex items-center gap-2 rounded-full border border-[#2A3740] bg-[#10181D] px-4 py-2.5 transition focus-within:border-[#EE6E2D]/60">
            <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#5D6F78]" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[13px] text-[#DCE3E7] placeholder-[#5D6F78] focus:outline-none"
              aria-label="Search dashboard"
            />
            <kbd className="hidden rounded-md bg-[#1A2329] px-1.5 py-0.5 text-[10px] font-semibold text-[#5D6F78] sm:block">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-4 no-scrollbar space-y-5">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="mb-2 px-3.5 text-[10px] font-bold uppercase tracking-widest text-[#5D6F78]">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <NavLink item={item} active={isActive(item.href)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Help card ── */}
        {!helpDismissed && (
          <div className="relative m-4 mt-3 overflow-hidden rounded-[22px] border border-[#2A3740] bg-[#10202A] p-4">
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#EE6E2D] opacity-20 blur-2xl" />
            {/* Headset icon */}
            <div className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#EE6E2D] text-[#14252E]">
              <Headphones className="h-5 w-5" strokeWidth={2.2} />
            </div>

            <p className="text-[13px] font-bold text-white">Need a little help?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#9AA8B0]">
              Our support team is always here for you
            </p>

            <div className="mt-3.5 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setHelpDismissed(true)}
                className="text-[12px] font-medium text-[#9AA8B0] transition-colors hover:text-white"
              >
                Dismiss
              </button>
              <Link
                href="/dashboard/support"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#F49A66] transition-colors hover:text-white"
              >
                Reach out to us
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        )}

        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium text-[#9AA8B0] transition hover:bg-rose-500/10 hover:text-rose-300 active:scale-[0.98]"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={2.2} />
            Log out
          </button>
        </div>

        <div className="h-4" />
      </aside>

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1014]/70 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="w-full max-w-sm rounded-[28px] bg-white p-6 text-[#10202A] shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3E8] text-[#EE6E2D]">
              <LogOut className="h-5 w-5" />
            </div>
            <h2 id="logout-title" className="mt-4 text-xl font-semibold tracking-[-0.03em]">Log out?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Are you sure you want to log out of your account?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsLogoutConfirmOpen(false)} className="rounded-full border border-[#DDE3E6] px-5 py-2.5 text-sm font-semibold text-[#233C49] transition hover:bg-[#F3F4F5]">Cancel</button>
              <button type="button" onClick={handleLogout} className="rounded-full bg-[#EE6E2D] px-5 py-2.5 text-sm font-bold text-[#14252E] transition hover:bg-[#F48245] active:scale-[0.98]">Yes, log out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


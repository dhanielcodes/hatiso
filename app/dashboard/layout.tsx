'use client';

import { Suspense, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, LayoutPanelTop, Menu } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/store/authStore';
import Link from 'next/link';

// 1. Move all layout logic and hooks into this inner component
function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const displayName = user?.name || 'Mayowa Babs';

  // Determine dynamic breadcrumb based on current path
  let section = 'Overview';
  let pageName = 'Dashboard';

  if (pathname.startsWith('/dashboard/banking')) {
    section = 'Pay & Bank';
    pageName = 'Banking';
  } else if (pathname.startsWith('/dashboard/services')) {
    section = 'Pay & Bank';
    pageName = 'Digital Services';
  } else if (pathname.startsWith('/dashboard/transactions')) {
    section = 'Activity';
    pageName = 'Transactions';
  } else if (pathname.startsWith('/dashboard/analytics')) {
    section = 'Grow';
    pageName = 'Analytics';
  } else if (pathname.startsWith('/dashboard/rewards')) {
    section = 'Grow';
    pageName = 'Rewards';
  } else if (pathname.startsWith('/dashboard/notifications')) {
    section = 'Account';
    pageName = 'Notification & Alert';
  } else if (pathname.startsWith('/dashboard/security') || pathname.startsWith('/dashboard/profile')) {
    section = 'Account';
    pageName = 'Profile & Security';
  } else if (pathname.startsWith('/dashboard/help')) {
    section = 'Account';
    pageName = 'Help & Support';
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F4F5]">
      <Suspense fallback={<div className="w-64" />}>
        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[#E3E8EB] bg-white px-5 sm:px-7">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DDE3E6] text-[#233C49] hover:bg-[#F3F4F5] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
            <LayoutPanelTop className="hidden h-4 w-4 text-[#8A989F] sm:block" />
            <span className="hidden text-[#5D6F78] sm:block">{section}</span>
            <ChevronDown className="hidden h-3.5 w-3.5 -rotate-90 text-[#B9C6CD] sm:block" />
            <span className="truncate font-semibold text-[#10202A]">{pageName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-full border border-[#DDE3E6] px-4 py-2 text-sm font-semibold text-[#233C49] transition hover:border-[#B9C6CD] md:inline-flex"
            >
              Visit Hatiso
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EE6E2D" strokeWidth="2.4">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </Link>
            <Link
              href="/dashboard/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#DDE3E6] text-[#10202A] transition hover:bg-[#F3F4F5]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#EE6E2D]" />
            </Link>
            <Link
              href="/dashboard/profile"
              className="hidden items-center gap-3 rounded-full border border-[#DDE3E6] py-1 pl-1 pr-3 transition hover:border-[#B9C6CD] sm:flex"
            >
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#EE6E2D] text-sm font-extrabold text-[#14252E]">
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar URLs come from any host
                  <img src={user.avatar} alt="Profile photo" className="h-full w-full object-cover" />
                ) : (
                  displayName.slice(0, 1)
                )}
              </span>
              <span>
                <span className="block text-sm font-semibold leading-4 text-[#10202A]">{displayName}</span>
                <span className="mt-0.5 block text-xs text-[#5D6F78]">Personal account</span>
              </span>
              <ChevronDown className="h-4 w-4 text-[#5D6F78]" />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// Shown while the dashboard shell loads: sidebar, header and a few content cards
function DashboardShellSkeleton() {
  return (
    <SkeletonGroup label="Loading dashboard" className="flex h-screen bg-[#F3F4F5]">
      <div className="hidden w-64 shrink-0 space-y-4 bg-[#0A1014] p-5 lg:block">
        <Skeleton strong className="h-8 w-32" />
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-full" />
        ))}
      </div>
      <div className="flex-1 space-y-6 p-5 sm:p-8">
        <Skeleton strong className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </SkeletonGroup>
  );
}

// 2. Wrap the layout in Suspense at the top export level
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
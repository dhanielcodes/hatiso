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
    <div className="flex h-screen overflow-hidden bg-[#FFFAF7]">
      <Suspense fallback={<div className="w-64" />}>
        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#F0E9E5] bg-white px-5 sm:px-7">
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-[#777274] hover:bg-[#F5F3F1] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <LayoutPanelTop className="hidden h-4 w-4 text-[#B8B7B5] sm:block" />
            <span className="hidden border-r border-[#E5E2DF] pr-3 text-[#898585] sm:block">
              {section}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 -rotate-90 text-[#C7C4C2] sm:block" />
            <span className="font-medium text-[#2B2930]">{pageName}</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/dashboard/notifications">
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[#EEE9E6] text-[#201E1E]"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#F65A08]" />
              </button>
            </Link>
            <Link href="/dashboard/profile">
              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#E95312] text-sm font-semibold text-white">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile photo" className="h-full w-full object-cover" />
                  ) : (
                    displayName.slice(0, 1)
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium leading-4 text-black">{displayName}</p>
                  <p className="mt-1 text-xs text-[#7E7B7B]">Personal account</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </div>
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
    <SkeletonGroup label="Loading dashboard" className="flex h-screen bg-[#FFFAF7]">
      <div className="hidden w-[260px] shrink-0 space-y-4 border-r border-[#F0E9E5] bg-white p-5 lg:block">
        <Skeleton strong className="h-8 w-32" />
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-lg" />
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
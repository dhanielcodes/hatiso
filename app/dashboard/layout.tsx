'use client';

import { Suspense, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import HatisoLogo from '@/components/brand/HatisoLogo';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { useDashboardTheme } from '@/lib/theme/theme';
import { FieldVariantProvider } from '@/components/forms';

// 1. Move all layout logic and hooks into this inner component
function DashboardContent({ children }: { children: React.ReactNode }) {
  useDashboardTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  } else if (pathname.startsWith('/dashboard/support')) {
    section = 'Account';
    pageName = 'Help & Support';
  }

  return (
    <div className="flex h-screen overflow-hidden bg-tone-44">
      <Suspense fallback={<div className="w-[264px]" />}>
        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Phones only: the sidebar folds away behind this bar (DashSidebar board) */}
        <header className="flex shrink-0 items-center justify-between bg-carbon px-5 py-4 lg:hidden">
          <HatisoLogo variant="cloud" height={24} href="/dashboard" />
          <span className="sr-only">{section}: {pageName}</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="hz-press flex h-11 w-11 items-center justify-center rounded-lg border border-grey-800 bg-graphite text-cloud"
            aria-label="Open navigation"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          {/* Fields here use the dashboard look, which follows the theme and light/dark mode. */}
          <FieldVariantProvider variant="dashboard">{children}</FieldVariantProvider>
        </main>
      </div>
    </div>
  );
}

// Shown while the dashboard shell loads: sidebar, header and a few content cards
function DashboardShellSkeleton() {
  return (
    <SkeletonGroup label="Loading dashboard" className="flex h-screen bg-tone-44">
      <div className="hidden w-[264px] shrink-0 space-y-4 bg-carbon p-5 lg:block">
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
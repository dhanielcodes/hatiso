'use client';

import { useState } from 'react';
import { Bell, ChevronDown, LayoutPanelTop, Menu } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useAuthStore } from '@/lib/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const displayName = user?.name || 'Mayowa Babs';

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFAF7]">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#F0E9E5] bg-white px-5 sm:px-7">
          <div className="flex items-center gap-3 text-sm">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 text-[#777274] hover:bg-[#F5F3F1] lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
            <LayoutPanelTop className="hidden h-4 w-4 text-[#B8B7B5] sm:block" />
            <span className="hidden border-r border-[#E5E2DF] pr-3 text-[#898585] sm:block">Overview</span>
            <ChevronDown className="hidden h-3.5 w-3.5 -rotate-90 text-[#C7C4C2] sm:block" />
            <span className="font-medium text-[#2B2930]">Dashboard</span>
          </div>
          <div className="flex items-center gap-5">
            <button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[#EEE9E6] text-[#201E1E]" aria-label="Notifications"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#F65A08]" /></button>
            <div className="hidden items-center gap-3 sm:flex"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#F7F7F7] text-sm font-semibold">{user?.avatar ? <img src={user.avatar} alt="Profile photo" className="h-full w-full object-cover" /> : displayName.slice(0, 1)}</div>
              <div>
                <p className="text-sm font-medium leading-4 text-black">{displayName}</p><p className="mt-1 text-xs text-[#7E7B7B]">Personal account</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

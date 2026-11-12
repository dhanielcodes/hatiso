import React from 'react';
import Link from 'next/link';
import AuthBrandPanel from './AuthBrandPanel';
import XnettLogo from './XnettLogo';

/**
 * Shared layout for login, register and forgot-password, in the landing-page look:
 * the ink brand panel on the left (desktop) and the form in a white card on light grey.
 * Modals can be passed as children; they are fixed-position so they sit above everything.
 */
export default function AuthShell({ children, width = 'max-w-[460px]' }: { children: React.ReactNode; width?: string }) {
  return (
    <div className="grid min-h-screen bg-[#F3F4F5] font-jakarta text-[#10202A] lg:grid-cols-2">
      <AuthBrandPanel />

      <main className="flex min-h-screen flex-col px-4 py-5 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between gap-4">
          {/* The logo's wordmark is white; darken it for the light side (only shown below lg) */}
          <div className="lg:invisible [&_path[fill='#F9FAFB']]:fill-[#10202A] [&_path[fill='white']]:fill-[#10202A]">
            <XnettLogo href="/" className="[&_svg]:h-9 [&_svg]:w-auto" />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE3E6] bg-white px-4 py-2.5 text-sm font-semibold text-[#233C49] transition hover:border-[#B9C6CD]"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <div
            className={`lp-rise w-full rounded-[28px] border border-[#E3E8EB] bg-white p-6 shadow-[0_24px_60px_-40px_rgba(16,32,42,0.35)] sm:p-9 ${width}`}
            style={{ '--d': '0.1s' } as React.CSSProperties}
          >
            {children}
          </div>
        </div>

        <p className="text-center text-xs text-[#8A989F]">© 2026 Xnett. All rights reserved.</p>
      </main>
    </div>
  );
}

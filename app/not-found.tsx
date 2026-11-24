import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Landmark, Smartphone, Wifi, Zap, type LucideIcon } from 'lucide-react';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';

export const metadata: Metadata = {
  title: 'Page not found | Hatiso',
};

/** Places people most likely meant to reach. */
const SUGGESTIONS: { Icon: LucideIcon; label: string; href: string }[] = [
  { Icon: Smartphone, label: 'Airtime', href: '/categories/airtime' },
  { Icon: Wifi, label: 'Data', href: '/categories/data' },
  { Icon: Zap, label: 'Electricity', href: '/categories/electricity' },
  { Icon: Landmark, label: 'Banks', href: '/banks' },
];

/** 404 for any URL that doesn't match a route, or where a page calls notFound(). Uses the marketplace look. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-ink-662 text-white selection:bg-brand-361 selection:text-white">
      <Navbar />

      <main className="relative flex-1 overflow-hidden px-4 pb-24 pt-10 sm:px-8 sm:pt-16 lg:px-14">
        {/* Same soft cyan and orange glows as the home hero */}
        <div className="pointer-events-none absolute right-1/4 top-1/4 -z-0 h-96 w-96 rounded-full bg-info-203/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-10 -z-0 h-80 w-80 rounded-full bg-brand-361/8 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col space-y-6 lg:col-span-7">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-brand-305">Error 404</span>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block text-brand-305 drop-shadow-sm">Page not found,</span>
              <span className="block font-extrabold text-white">let&apos;s get you back</span>
            </h1>
            <p className="max-w-xl text-base text-slate-300 sm:text-lg sm:leading-relaxed">
              The link may be broken, or the page may have moved. Head back to the marketplace, or jump straight to
              one of the services below.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 sm:gap-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-359 px-7 py-3.5 text-sm font-bold text-on-brand shadow-lg shadow-brand-361/20 transition-all duration-150 hover:bg-brand-370 active:scale-[0.98]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-surface px-7 py-3.5 text-sm font-bold text-ink-729 shadow-md transition-all duration-150 hover:bg-slate-100 active:scale-[0.98]"
              >
                Contact us
              </Link>
            </div>
          </div>

          {/* Big 404 on a card in the CTA banner style */}
          <div aria-hidden="true" className="flex justify-center lg:col-span-5 lg:justify-end">
            <div className="relative w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/5 bg-ink-592 px-8 py-12 text-center shadow-2xl">
              <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full border-[28px] border-white/[0.05]" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full border-[32px] border-white/[0.05]" />
              <div className="relative select-none text-[110px] font-black leading-none tracking-tight sm:text-[140px]">
                4<span className="text-brand-305">0</span>4
              </div>
              <p className="relative mt-3 text-sm font-medium text-slate-200/90">We couldn&apos;t find that page</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-7xl">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-white sm:text-2xl">Popular destinations</h2>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {SUGGESTIONS.map(({ Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex min-h-[170px] flex-col overflow-hidden rounded-xl bg-surface transition-all duration-200 hover:-translate-y-1 hover:ring-2 hover:ring-brand-305/40 active:scale-95"
              >
                <div className="flex flex-1 items-center justify-center bg-tone-46 px-3 py-8 transition-colors group-hover:bg-tone-74">
                  <Icon className="h-9 w-9 text-brand-305 transition-transform duration-200 group-hover:scale-105" strokeWidth={2} />
                </div>
                <div className="flex items-center justify-center bg-surface px-2 py-3 text-center">
                  <span className="text-xs font-semibold text-ink-729 transition-colors group-hover:text-brand-305 sm:text-sm">
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

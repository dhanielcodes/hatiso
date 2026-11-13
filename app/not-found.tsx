import type { Metadata } from 'next';
import type React from 'react';
import Link from 'next/link';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';
import { DarkHero, HeroHeadline, HeroLead, LandingPage, LpIcon, type LpIconName } from '@/components/landing/LandingKit';

export const metadata: Metadata = {
  title: 'Page not found | Hatiso',
};

/** Places people most likely meant to reach. */
const SUGGESTIONS: { icon: LpIconName; title: string; body: string; href: string }[] = [
  { icon: 'phone', title: 'Buy airtime', body: 'Top up any Nigerian network', href: '/services/airtime' },
  { icon: 'data', title: 'Buy data', body: 'Bundles for every network', href: '/services/data' },
  { icon: 'bolt', title: 'Pay electricity', body: 'Prepaid tokens and postpaid bills', href: '/services/electricity' },
  { icon: 'card', title: 'Find your bank', body: 'Go straight to its website', href: '/banks' },
];

/** 404 for any URL that doesn't match a route, or where a page calls notFound(). */
export default function NotFound() {
  return (
    <LandingPage>
      <main className="flex-1">
        <DarkHero>
          <Navbar />
          {/* Orange glow behind the big number */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-[#EE6E2D] opacity-[0.13] blur-[120px]"
          />
          <section className="relative mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-12 px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:pb-28">
            <div className="min-w-0 flex-[1_1_520px]">
              <p
                className="lp-rise m-0 mb-5 text-sm font-bold uppercase tracking-[0.14em] text-[#F49A66]"
                style={{ '--d': '0.05s' } as React.CSSProperties}
              >
                Error 404
              </p>
              <HeroHeadline lines={[{ text: 'This page took' }, { text: 'a wrong turn.', accent: true }]} />
              <HeroLead>
                The link may be broken, or the page may have moved. Head back home, or jump straight to one of the
                services below.
              </HeroLead>
              <div className="lp-rise mt-9 flex flex-wrap gap-3" style={{ '--d': '0.56s' } as React.CSSProperties}>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-[#EE6E2D] px-7 py-4 text-[15px] font-bold text-[#14252E] transition hover:bg-[#F48245] active:scale-[0.99]"
                >
                  Back to home
                  <LpIcon name="arrow" size={15} strokeWidth={2.4} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-[#2A3740] px-7 py-4 text-[15px] font-bold text-white transition hover:border-[#5D6F78] hover:bg-[#10181D]"
                >
                  Contact us
                </Link>
              </div>
            </div>

            <div aria-hidden="true" className="relative flex min-w-0 flex-[1_1_380px] justify-center lg:justify-end">
              <div
                className="lp-card select-none rounded-[32px] border border-[#2A3740] bg-[#10202A] px-10 py-8 sm:px-14 sm:py-10"
                style={{ '--r': '-3deg', '--d': '0.3s', '--f': '7s' } as React.CSSProperties}
              >
                <div className="bg-gradient-to-b from-white to-[#5D6F78] bg-clip-text text-[120px] font-extrabold leading-none tracking-[-6px] text-transparent sm:text-[168px]">
                  4<span className="text-[#EE6E2D]">0</span>4
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#9AA8B0]">
                  <span className="h-2 w-2 rounded-full bg-[#EE6E2D]" />
                  Page not found
                </div>
              </div>
            </div>
          </section>
        </DarkHero>

        <section className="bg-[#F3F4F5] text-[#10202A]">
          <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="m-0 text-[26px] font-semibold tracking-[-0.8px] sm:text-[32px]">
              Where would you like <span className="text-[#E2591A]">to go?</span>
            </h2>
            <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
              {SUGGESTIONS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex flex-col gap-8 rounded-[26px] border border-[#E3E8EB] bg-white p-[22px] transition hover:-translate-y-0.5 hover:border-[#C9D0D4] hover:shadow-[0_12px_30px_-18px_rgba(16,32,42,0.35)]"
                >
                  <span className="flex items-start justify-between">
                    <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#EE6E2D] text-[#14252E]">
                      <LpIcon name={s.icon} strokeWidth={1.7} />
                    </span>
                    <LpIcon
                      name="arrow"
                      size={16}
                      strokeWidth={2.2}
                      className="text-[#5D6F78] transition group-hover:text-[#C2531C]"
                    />
                  </span>
                  <span>
                    <span className="block text-lg font-bold tracking-[-0.3px]">{s.title}</span>
                    <span className="mt-1 block text-sm text-[#4A5B64]">{s.body}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </LandingPage>
  );
}

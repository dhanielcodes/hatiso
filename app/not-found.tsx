import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';

export const metadata: Metadata = {
  title: 'Page not found | Hatiso',
};

const rise = (d: number) => ({ '--d': d }) as React.CSSProperties;

/** NotFound board: shown for any URL that doesn't match a route, or where a page calls notFound(). */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-carbon text-cloud selection:bg-silver selection:text-carbon">
      <Navbar />

      <main className="flex min-h-[620px] flex-1 items-center">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-[clamp(40px,6vw,80px)] px-[clamp(16px,4vw,56px)] py-[clamp(56px,8vw,112px)]">
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-6">
            <p className="hz-rise text-xs font-medium tracking-[0.14em] text-grey-400 uppercase">Error 404</p>
            <h1
              className="hz-rise text-[clamp(40px,5.5vw,68px)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance"
              style={rise(1)}
            >
              This page took a <span className="text-silver">wrong turn.</span>
            </h1>
            <p className="hz-rise max-w-[480px] text-[17px] leading-[1.6] text-silver" style={rise(2)}>
              The link may be old, or the page may have moved. Your payments and account are fine.
            </p>
            <div className="hz-rise flex flex-wrap gap-3" style={rise(3)}>
              <Link
                href="/"
                className="hz-press inline-flex min-h-[52px] items-center rounded-[10px] bg-cloud px-6 text-[15px] font-medium text-carbon hover:bg-white"
              >
                Go to the home page
              </Link>
              <Link
                href="/#popular-categories"
                className="hz-press inline-flex min-h-[52px] items-center rounded-[10px] border border-grey-700 px-6 text-[15px] font-medium text-cloud hover:bg-graphite"
              >
                Pay a bill
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="hz-rise relative flex h-[340px] max-w-[520px] min-w-0 flex-[1_1_380px] items-center justify-center overflow-hidden rounded-2xl bg-graphite bg-[radial-gradient(var(--color-grey-800)_1px,transparent_1px)] bg-[length:22px_22px]"
            style={rise(2)}
          >
            <span className="hz-float text-[clamp(120px,14vw,180px)] leading-none font-bold tracking-[-0.06em] text-cloud select-none">
              4<span className="text-transparent [-webkit-text-stroke:2px_var(--color-silver)]">0</span>4
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

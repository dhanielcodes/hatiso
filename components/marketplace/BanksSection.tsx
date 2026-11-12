import React from 'react';
import Link from 'next/link';
import { LpIcon, SectionPill } from '@/components/landing/LandingKit';
import { BANKS_DATA, STATUS_DOT, bankMono } from '@/lib/marketing/banks';

/** Home "Banks" block: intro on the left, a compact grid of banks with live status on the right. */
export default function BanksSection() {
  return (
    <section className="bg-white text-[#10202A]">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-wrap items-start gap-12">
          <div className="min-w-0 max-w-[420px] flex-[1_1_340px]">
            <SectionPill dot className="bg-[#F3F4F5]">
              Banks
            </SectionPill>
            <h2 className="m-0 mt-4 text-[30px] font-semibold leading-[1.15] tracking-[-1.2px] sm:text-[38px]">
              Bank the way you already do, <span className="text-[#E2591A]">just in one place</span>
            </h2>
            <p className="mt-[18px] text-[17px] leading-[1.6] text-[#4A5B64]">
              Select your bank to go straight to your app or internet banking.
            </p>
            <Link
              href="/banks"
              className="mt-[30px] inline-block rounded-full px-[30px] py-4 text-base font-semibold text-white transition hover:brightness-125"
              style={{ background: 'radial-gradient(70% 90% at 50% 135%, rgba(238,110,45,0.75), rgba(238,110,45,0) 72%), #10202A' }}
            >
              See all Banks
            </Link>
          </div>

          <div className="grid min-w-0 flex-[999_1_560px] grid-cols-[repeat(auto-fill,minmax(220px,1fr))] content-start gap-3">
            {BANKS_DATA.map((bank) => (
              <Link
                key={bank.id}
                href="/banks"
                className="lp-reveal flex items-center gap-3.5 rounded-[22px] border border-[#E8ECEE] bg-[#F7F8F9] px-4 py-3.5 text-[#10202A] transition hover:border-[#C9D0D4] hover:bg-white"
              >
                <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[#10202A] text-[13px] font-extrabold text-white">
                  {bankMono(bank)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold">{bank.name}</span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A5B64]">
                    <span className="h-[7px] w-[7px] rounded-full" style={{ background: STATUS_DOT[bank.status] }} />
                    {bank.status}
                  </span>
                </span>
                <LpIcon name="arrow" size={18} strokeWidth={2} className="text-[#C2531C]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

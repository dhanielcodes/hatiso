'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const SPEND = [
  { label: 'Electricity', amount: '₦68,320.00', pct: '100%', bar: '#EE6E2D' },
  { label: 'TV', amount: '₦40,310.00', pct: '59%', bar: '#36637F' },
  { label: 'Data', amount: '₦30,320.00', pct: '44%', bar: '#36637F' },
  { label: 'Airtime', amount: '₦26,330.00', pct: '39%', bar: '#36637F' },
];

const ctaClass =
  'mt-[30px] inline-block rounded-full bg-[#EE6E2D] px-7 py-4 text-base font-bold text-[#14252E] transition hover:bg-[#F48245]';

function SampleTag() {
  return <span className="rounded-full border border-[#DDE3E6] px-2.5 py-1 text-xs text-[#5D6F78]">Sample</span>;
}

/** "Built for you, and your business": Personal/Business toggle over two sample dashboards. */
export default function SolutionsSection() {
  const [tab, setTab] = useState<'personal' | 'business'>('personal');
  const personal = tab === 'personal';

  return (
    <section id="business" className="scroll-mt-6 bg-[#F3F4F5] text-[#10202A]">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 sm:py-24">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
          <h2 className="m-0 text-[30px] font-semibold leading-[1.15] tracking-[-1.2px] sm:text-[38px]">
            Built for you, <span className="text-[#E2591A]">and your business</span>
          </h2>
          <div role="tablist" aria-label="Audience" className="inline-flex gap-1 rounded-full border border-[#E3E8EB] bg-white p-[5px]">
            {(['personal', 'business'] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`rounded-full px-[26px] py-3 text-[15px] font-bold capitalize transition-colors ${tab === key ? 'bg-[#233C49] text-white' : 'text-[#233C49] hover:bg-[#F3F4F5]'}`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div
          key={tab}
          className="lp-rise relative flex flex-wrap items-center gap-12 overflow-hidden rounded-[28px] bg-[#10202A] p-7 text-white sm:rounded-[36px] sm:p-14"
          style={{ '--d': '0s' } as React.CSSProperties}
        >
          <div
            aria-hidden="true"
            className={`absolute h-[520px] w-[520px] rounded-full blur-[90px] ${personal ? '-right-[120px] -top-40 bg-[#EE6E2D] opacity-[0.14]' : '-bottom-[200px] -left-[140px] bg-[#2F6A93] opacity-20'}`}
          />
          <div className="relative min-w-0 flex-[1_1_360px]">
            <div className="text-sm font-bold text-[#FFB27A]">{personal ? 'For individuals' : 'For businesses'}</div>
            <h3 className="m-0 mt-3 text-[28px] font-semibold leading-[1.15] tracking-[-1px] sm:text-[34px]">
              {personal ? 'Pay for what you need, instantly' : 'Put your services in front of every Hatiso user'}
            </h3>
            <p className="mt-4 max-w-[420px] text-[17px] leading-[1.6] text-[#B9C6CD]">
              {personal
                ? 'Bills, airtime, transfers, and merchant payments settled in seconds, no extra apps required.'
                : 'Onboard your business onto Hatiso and reach people already looking for services like yours.'}
            </p>
            {personal ? (
              <Link href="/auth/register" className={ctaClass}>
                Create your account now
              </Link>
            ) : (
              <Link href="/contact" className={ctaClass}>
                Contact Us
              </Link>
            )}
          </div>

          {personal ? (
            <div className="relative min-w-0 flex-[1_1_420px] rounded-[28px] bg-white p-6 text-[#10202A] sm:p-[30px]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-lg font-bold">Track spending across every service</div>
                <SampleTag />
              </div>
              <div className="mt-5 text-[13px] text-[#5D6F78]">Total this month</div>
              <div className="mt-0.5 text-[32px] font-extrabold tracking-[-1.4px] sm:text-[40px]">₦165,280.00</div>
              <div className="mt-[22px] flex flex-col gap-4">
                {SPEND.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{s.label}</span>
                      <span className="font-bold">{s.amount}</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-[#EEF1F3]">
                      <div className="h-2.5 rounded-full" style={{ width: s.pct, background: s.bar }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative min-w-0 flex-[1_1_480px] overflow-hidden rounded-[28px] bg-white text-[#10202A]">
              <div className="flex items-center justify-between gap-2.5 border-b border-[#E3E8EB] px-6 py-5">
                <div>
                  <div className="text-[17px] font-bold">Welcome back</div>
                  <div className="mt-0.5 text-[13px] text-[#5D6F78]">Merchant dashboard</div>
                </div>
                <SampleTag />
              </div>
              <div className="grid grid-cols-3 gap-2.5 px-6 pt-[18px]">
                {[
                  { k: 'Customers', v: '61,289', bg: 'bg-[#F3F4F5]' },
                  { k: 'Transactions', v: '117,382', bg: 'bg-[#F3F4F5]' },
                  { k: 'Value', v: '₦28.7m', bg: 'bg-[#FFF3E8]' },
                ].map((m) => (
                  <div key={m.k} className={`rounded-[18px] px-4 py-3.5 ${m.bg}`}>
                    <div className="text-xs text-[#5D6F78]">{m.k}</div>
                    <div className="mt-1 text-lg font-extrabold sm:text-[22px]">{m.v}</div>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-[22px] pt-[18px]">
                <div className="flex justify-between text-[13px]">
                  <span className="font-bold">Transaction Growth Trends</span>
                  <span className="text-[#5D6F78]">Jan to Dec</span>
                </div>
                <svg role="img" aria-label="Sample line chart of monthly transaction value rising through the year" viewBox="0 0 480 140" preserveAspectRatio="none" className="mt-3 h-[140px] w-full">
                  <path d="M0 118 L44 104 L88 110 L132 86 L176 92 L220 70 L264 76 L308 52 L352 60 L396 38 L440 30 L480 18 V140 H0z" fill="#EE6E2D" fillOpacity="0.12" />
                  <path d="M0 118 L44 104 L88 110 L132 86 L176 92 L220 70 L264 76 L308 52 L352 60 L396 38 L440 30 L480 18" fill="none" stroke="#EE6E2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <path d="M0 126 L44 122 L88 118 L132 114 L176 108 L220 104 L264 98 L308 92 L352 88 L396 80 L440 76 L480 70" fill="none" stroke="#10202A" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

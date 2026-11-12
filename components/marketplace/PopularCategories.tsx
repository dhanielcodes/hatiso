'use client';

import React from 'react';
import Link from 'next/link';
import { LpIcon, type LpIconName, SectionPill } from '@/components/landing/LandingKit';
import type { PayBillService } from './HeroSection';

type Category = { label: string; icon: LpIconName; pay?: PayBillService; slug: string };

const CATEGORIES: Category[] = [
  { label: 'Airtime', icon: 'phone', pay: 'airtime', slug: 'airtime' },
  { label: 'Data', icon: 'data', pay: 'data', slug: 'data' },
  { label: 'Electricity', icon: 'bolt', pay: 'electricity', slug: 'electricity' },
  { label: 'TV', icon: 'tv', pay: 'tv', slug: 'tv' },
  { label: 'Betting', icon: 'dice', slug: 'betting' },
  { label: 'Education', icon: 'edu', slug: 'education' },
  { label: 'Government Services', icon: 'gov', slug: 'government-services' },
  { label: 'Shopping', icon: 'bag', slug: 'shopping' },
  { label: 'Embassies', icon: 'embassy', slug: 'embassies' },
  { label: 'Transport & Travel', icon: 'bus', slug: 'transport-travel' },
];

const cardClass =
  'lp-reveal flex min-h-[150px] flex-col justify-between gap-[34px] rounded-[26px] border border-[#E3E8EB] bg-white p-[22px] text-left text-[#10202A] transition hover:-translate-y-0.5 hover:border-[#C9D0D4] hover:shadow-[0_12px_30px_-18px_rgba(16,32,42,0.35)]';

function CardBody({ c }: { c: Category }) {
  return (
    <>
      <span className="flex items-start justify-between">
        <span
          className={`flex h-[50px] w-[50px] items-center justify-center rounded-full ${c.pay ? 'bg-[#EE6E2D] text-[#14252E]' : 'bg-[#F3F4F5] text-[#10202A]'}`}
        >
          <LpIcon name={c.icon} strokeWidth={1.7} />
        </span>
        <span className={`text-xs font-bold ${c.pay ? 'text-[#C2531C]' : 'text-[#5D6F78]'}`}>{c.pay ? 'Pay here' : 'Explore'}</span>
      </span>
      <span className="text-lg font-bold tracking-[-0.3px]">{c.label}</span>
    </>
  );
}

/** "Popular categories": the first four open the hero's payment card, the rest link to their category. */
export default function PopularCategories({ onPay }: { onPay: (service: PayBillService) => void }) {
  return (
    <>
      <section aria-labelledby="cats" className="bg-[#F3F4F5] text-[#10202A]">
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 sm:py-24">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionPill>Digital services</SectionPill>
              <h2 id="cats" className="m-0 mt-4 text-[34px] font-semibold leading-[1.1] tracking-[-1.4px] sm:text-[44px]">
                Popular <span className="text-[#E2591A]">categories</span>
              </h2>
            </div>
            <p className="m-0 max-w-[360px] text-base leading-[1.6] text-[#4A5B64]">
              Tap Airtime, Data, Electricity or TV and the payment card above opens it, ready to pay.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
            {CATEGORIES.map((c) =>
              c.pay ? (
                <button key={c.label} type="button" onClick={() => onPay(c.pay!)} className={cardClass}>
                  <CardBody c={c} />
                </button>
              ) : (
                <Link key={c.label} href={`/categories/${c.slug}`} className={cardClass}>
                  <CardBody c={c} />
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="overflow-hidden bg-[#10202A] py-[22px] text-white">
        <div className="lp-marquee flex w-max whitespace-nowrap text-[22px] font-semibold tracking-[-0.3px]">
          {[0, 1].map((copy) => (
            <span key={copy} className="pr-10">
              {CATEGORIES.map((c) => (
                <React.Fragment key={c.label}>
                  {c.label}
                  <span className="px-[1.1em] text-[#EE6E2D]">•</span>
                </React.Fragment>
              ))}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useDigitalServiceCategories } from '@/lib/queries/useDigitalServiceCategories';
import type { DigitalServiceCategory } from '@/lib/api/digitalServices';

// Custom precision SVG icons matching the exact iconography in the screenshot
const CategoryIconMap: Record<string, React.ReactNode> = {
  airtime: (
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 text-[#FF6500]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Phone container */}
      <rect x="15" y="10" width="14" height="24" rx="4" />
      <line x1="20.5" y1="13.5" x2="23.5" y2="13.5" strokeWidth="2.2" />
      {/* Encircling rotation arrow matching the uploaded zoom-in */}
      <path d="M 15 20 C 11.5 19.5 11 24.5 14.5 25 L 24 25" />
      <path d="M 21.5 22.5 L 24.5 25 L 21.5 27.5" />
      <path d="M 29 25 C 33 24.5 33.5 19.5 29 20" />
    </svg>
  ),
  data: (
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 text-[#FF6500]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Phone container */}
      <rect x="15" y="10" width="14" height="24" rx="4" />
      <line x1="20.5" y1="13.5" x2="23.5" y2="13.5" strokeWidth="2.2" />
      {/* Expanding broadcast signal arcs */}
      <path d="M 11 17 C 8 20 8 24 11 27" />
      <path d="M 7.5 14 C 4 18.5 4 25.5 7.5 30" />
      <path d="M 33 17 C 36 20 36 24 33 27" />
      <path d="M 36.5 14 C 40 18.5 40 25.5 36.5 30" />
    </svg>
  ),
  electricity: (
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 text-[#FF6500]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Lightbulb outline */}
      <path d="M 16 19 C 16 15.686 18.686 13 22 13 C 25.314 13 28 15.686 28 19 C 28 21.5 26.5 23.5 24.5 24.5 L 24.5 27.5 H 19.5 L 19.5 24.5 C 17.5 23.5 16 21.5 16 19 Z" />
      <line x1="20" y1="30.5" x2="24" y2="30.5" strokeWidth="2.4" />
      {/* Glowing rays */}
      <line x1="22" y1="8" x2="22" y2="10" strokeWidth="2.4" />
      <line x1="13" y1="11" x2="14.5" y2="12.5" strokeWidth="2.4" />
      <line x1="31" y1="11" x2="29.5" y2="12.5" strokeWidth="2.4" />
    </svg>
  ),
  tv: (
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 text-[#FF6500]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* TV Screen */}
      <rect x="10" y="15" width="24" height="19" rx="3.5" />
      <circle cx="28.5" cy="20.5" r="1.5" fill="currentColor" />
      <circle cx="28.5" cy="25.5" r="1.5" fill="currentColor" />
      <line x1="25.5" y1="16" x2="25.5" y2="33" strokeWidth="1.8" />
      {/* V-shaped dual antennas */}
      <line x1="16" y1="9" x2="21" y2="15" strokeWidth="2.4" />
      <line x1="28" y1="9" x2="23" y2="15" strokeWidth="2.4" />
    </svg>
  ),
  betting: (
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 text-[#FF6500]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Playing Cards */}
      <rect x="11" y="13" width="14" height="20" rx="3" transform="rotate(-10 11 13)" />
      <rect x="19" y="13" width="14" height="20" rx="3" />
      <circle cx="26" cy="19" r="1.5" fill="currentColor" />
      <circle cx="26" cy="27" r="1.5" fill="currentColor" />
      <circle cx="23" cy="23" r="1.5" fill="currentColor" />
    </svg>
  ),
  education: (
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 text-[#FF6500]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Mortarboard Graduation Cap */}
      <path d="M 22 12 L 8 18 L 22 24 L 36 18 L 22 12 Z" />
      <path d="M 13 20.5 V 26.5 C 13 26.5 16 30 22 30 C 28 30 31 26.5 31 26.5 V 20.5" />
      <path d="M 33 19.5 V 29.5" strokeWidth="2" />
      <circle cx="33" cy="30.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  'government-services': (
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 text-[#FF6500]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Municipal / Civic Office Building */}
      <rect x="11" y="17" width="10" height="16" rx="1.5" />
      <rect x="23" y="12" width="11" height="21" rx="1.5" />
      <rect x="14" y="20" width="2" height="3" fill="currentColor" />
      <rect x="14" y="26" width="2" height="3" fill="currentColor" />
      <rect x="27" y="16" width="3" height="3" fill="currentColor" />
      <rect x="27" y="22" width="3" height="3" fill="currentColor" />
      <line x1="8" y1="33" x2="36" y2="33" strokeWidth="2.4" />
    </svg>
  ),
  shopping: (
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 text-[#FF6500]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Shopping Bag */}
      <path d="M 12 16 H 32 L 30 33 H 14 L 12 16 Z" />
      <path d="M 17 16 V 12 C 17 9.5 19 7.5 22 7.5 C 25 7.5 27 9.5 27 12 V 16" />
      <circle cx="22" cy="23" r="2" fill="currentColor" />
    </svg>
  ),
  embassies: (
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 text-[#FF6500]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Classical Embassy Building with Pillars */}
      <path d="M 8 16 L 22 10 L 36 16 H 8 Z" />
      <line x1="12" y1="18" x2="12" y2="28" strokeWidth="2.4" />
      <line x1="18.5" y1="18" x2="18.5" y2="28" strokeWidth="2.4" />
      <line x1="25.5" y1="18" x2="25.5" y2="28" strokeWidth="2.4" />
      <line x1="32" y1="18" x2="32" y2="28" strokeWidth="2.4" />
      <line x1="8" y1="29" x2="36" y2="29" strokeWidth="2.4" />
      <line x1="6" y1="32" x2="38" y2="32" strokeWidth="2.4" />
    </svg>
  ),
  'transport-travel': (
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 text-[#FF6500]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Circular Looping Pathway */}
      <path d="M 22 12 C 27.5 12 32 16.5 32 22 C 32 27.5 27.5 32 22 32 C 17 32 13 28.5 12 24" />
      <path d="M 16 11.5 L 22 12 L 19 17" strokeWidth="2.4" />
      <circle cx="22" cy="22" r="3" fill="currentColor" />
    </svg>
  ),
};

const categoryCardConfig: Partial<Record<
  DigitalServiceCategory,
  { label: string; slug: string; href: string }
>> = {
  TELCO: { label: 'Airtime & Data', slug: 'airtime', href: '/categories/airtime' },
  INTERNET_SERVICES: { label: 'Internet Services', slug: 'data', href: '/categories/data' },
  DISCO: { label: 'Electricity', slug: 'electricity', href: '/categories/electricity' },
  CABLE: { label: 'Cable TV', slug: 'tv', href: '/categories/tv' },
  EDUCATION: { label: 'Education', slug: 'education', href: '/categories/education' },
  INSURANCE: { label: 'Insurance', slug: 'government-services', href: '/services' },
  OTHER_SERVICES: { label: 'Other Services', slug: 'shopping', href: '/services' },
};

export default function PopularCategories() {
  const {
    data: serviceCategories,
    isError: hasCategoryRequestError,
    isLoading,
  } = useDigitalServiceCategories();

  return (
    <section id="popular-categories" className="relative px-4 py-36 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Popular Categories
          </h2>
        </div>

        {/* Categories Grid & Featured Promo Banner */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: 2 Rows x 5 Columns Grid of Two-Tone Category Cards (10 Cards total) */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5 lg:col-span-8 lg:gap-3.5 xl:col-span-9" aria-live="polite">
            {isLoading &&
              Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="min-h-47.5 animate-pulse rounded-xl bg-white/10" />
              ))}
            {hasCategoryRequestError && (
              <p className="col-span-full self-center text-sm text-slate-300">
                Available services are temporarily unavailable.
              </p>
            )}
            {serviceCategories?.map((serviceCategory) => {
              const category = categoryCardConfig[serviceCategory];
              if (!category) return null;

              const icon = CategoryIconMap[category.slug] || CategoryIconMap.airtime;

              return (
                <Link
                  key={serviceCategory}
                  href={category.href}
                  className="group flex flex-col overflow-hidden rounded-xl bg-white transition-all duration-200 hover:-translate-y-1 hover:ring-2 hover:ring-[#FF6500]/40 active:scale-95"
                  style={{ minHeight: '190px' }}
                >
                  {/* Top Portion: Soft Pale Ice-Blue Tint with Centered Orange Icon */}
                  <div className="flex flex-1 items-center justify-center bg-[#EBF5FA] py-8 px-3 transition-colors group-hover:bg-[#E2EFF6]">
                    <div className="transition-transform duration-200 group-hover:scale-105">
                      {icon}
                    </div>
                  </div>

                  {/* Bottom Portion: Pure Crisp White with Dark Slate Navy Title */}
                  <div className="flex items-center justify-center bg-white py-3 px-2 text-center">
                    <span className="text-xs sm:text-sm font-semibold text-[#102A36] transition-colors group-hover:text-[#FF6500]">
                      {category.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right: "Pay Instantly" Card matching exact design */}
          <div className="flex lg:col-span-4 xl:col-span-3">
            <Link
              href="/categories/airtime"
              className="group flex w-full flex-col justify-between rounded-xl bg-[#26434D] p-5 transition-all duration-300 hover:bg-[#2B4B57]"
            >
              {/* Inner Rounded Photo with rounded corners on all 4 sides */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900 sm:aspect-[4/3] lg:aspect-square">
                <img
                  src="/images/pay_instantly_verve.jpg"
                  alt="Pay instantly - woman holding banking app on phone"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Text Area below image */}
              <div className="pt-5 pb-2">
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  Pay instantly
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-200/90 font-normal">
                  Bills, airtime, transfers, and merchant payments settled in seconds, no extra
                  apps required.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

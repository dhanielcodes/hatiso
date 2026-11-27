'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useDigitalServiceCategories } from '@/lib/queries/useDigitalServices';
import { Skeleton } from '@/components/ui/Skeleton';
import { servicesForCategory } from '@/lib/digitalServices/categoryServices';
import { pickFeatured, useMarketplacePageConfiguration } from '@/lib/queries/useMarketplace';

// Custom precision SVG icons matching the exact iconography in the screenshot
const CategoryIconMap: Record<string, React.ReactNode> = {
  airtime: (
    <svg
      viewBox="0 0 44 44"
      className="h-7 w-7"
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
      className="h-7 w-7"
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
      className="h-7 w-7"
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
      className="h-7 w-7"
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
      className="h-7 w-7"
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
      className="h-7 w-7"
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
      className="h-7 w-7"
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
      className="h-7 w-7"
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
      className="h-7 w-7"
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
      className="h-7 w-7"
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

/** One line under each service name (Main board). */
const SERVICE_LINES: Record<string, string> = {
  airtime: 'MTN, Airtel, Glo and 9mobile',
  data: 'Daily, weekly and monthly bundles',
  'internet-services': 'Home and office broadband',
  electricity: 'Prepaid tokens and postpaid bills',
  tv: 'Renew your subscription in seconds',
  education: 'Exam pins and school fees',
  insurance: 'Cover for you, your car and home',
  betting: 'Fund your wallet instantly',
  'other-services': 'Pay verified providers',
};

export default function PopularCategories() {
  const {
    data: serviceCategories,
    isError: hasCategoryRequestError,
    isLoading: categoriesLoading,
  } = useDigitalServiceCategories();
  const { data: config, isPending: configLoading } = useMarketplacePageConfiguration();
  // The admin's featured services (page configuration), matched by featureId (e.g. AIRTIME, CABLE_TV), slug or category.
  const featured = config?.featuredServices ?? [];
  const isLoading = categoriesLoading || configLoading;
  const services = isLoading
    ? []
    : pickFeatured(serviceCategories?.flatMap(servicesForCategory) ?? [], featured, (s) => [s.featureId, s.slug, s.category]);

  // Featured services were picked but none of them can be shown: leave the section out.
  if (!isLoading && !hasCategoryRequestError && featured.length && !services.length) return null;

  return (
    <section id="popular-categories" className="bg-cloud text-carbon">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-[clamp(16px,4vw,56px)] py-[clamp(72px,9vw,128px)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="hz-reveal flex max-w-[640px] flex-col gap-4">
            <p className="hz-eyebrow text-grey-600">Services</p>
            <h2 className="text-[clamp(32px,4vw,52px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
              Everything you pay for, every month.
            </h2>
          </div>
          <Link
            href={services[0] ? `/categories/${services[0].slug}` : '/categories/airtime'}
            className="inline-flex min-h-11 items-center gap-2 border-b border-carbon text-[15px] font-medium"
          >
            See all services
          </Link>
        </div>

        {/* Services from GET /digital-services/categories */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4" aria-live="polite">
          {isLoading &&
            Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} tone="light" className="min-h-47 rounded-xl" />
            ))}
          {hasCategoryRequestError && (
            <p className="col-span-full rounded-xl border border-dashed border-grey-150 p-8 text-center text-sm text-grey-600">
              Available services are temporarily unavailable.
            </p>
          )}
          {services.map((service) => {
            const icon = CategoryIconMap[service.visualSlug] || CategoryIconMap.airtime;
            return (
              <Link
                key={service.slug}
                href={`/categories/${service.slug}`}
                className="hz-reveal hz-lift flex min-h-47 flex-col gap-7 rounded-xl border border-grey-100 bg-white p-6"
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-carbon text-cloud">{icon}</span>
                  <ArrowUpRight className="hz-arrow h-4.5 w-4.5 text-grey-400" aria-hidden="true" />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="text-[19px] font-semibold tracking-[-0.01em]">{service.label}</span>
                  {SERVICE_LINES[service.slug] && (
                    <span className="text-sm leading-normal text-grey-600">{SERVICE_LINES[service.slug]}</span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

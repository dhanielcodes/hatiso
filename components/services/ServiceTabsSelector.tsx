'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDigitalServiceCategories } from '@/lib/queries/useDigitalServices';
import { Skeleton } from '@/components/ui/Skeleton';
import { servicesForCategory } from '@/lib/digitalServices/categoryServices';

export interface ServiceItem {
  slug: string;
  name: string;
  icon: React.ReactNode;
}

// All 10 Marketplace Categories with exact precision SVG icons
export const ALL_DIGITAL_SERVICES: ServiceItem[] = [
  {
    slug: 'airtime',
    name: 'Airtime',
    icon: (
      <svg
        viewBox="0 0 44 44"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="15" y="10" width="14" height="24" rx="4" />
        <line x1="20.5" y1="13.5" x2="23.5" y2="13.5" strokeWidth="2.2" />
        <path d="M 15 20 C 11.5 19.5 11 24.5 14.5 25 L 24 25" />
        <path d="M 21.5 22.5 L 24.5 25 L 21.5 27.5" />
        <path d="M 29 25 C 33 24.5 33.5 19.5 29 20" />
      </svg>
    ),
  },
  {
    slug: 'data',
    name: 'Data',
    icon: (
      <svg
        viewBox="0 0 44 44"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="15" y="10" width="14" height="24" rx="4" />
        <line x1="20.5" y1="13.5" x2="23.5" y2="13.5" strokeWidth="2.2" />
        <path d="M 11 17 C 8 20 8 24 11 27" />
        <path d="M 7.5 14 C 4 18.5 4 25.5 7.5 30" />
        <path d="M 33 17 C 36 20 36 24 33 27" />
        <path d="M 36.5 14 C 40 18.5 40 25.5 36.5 30" />
      </svg>
    ),
  },
  {
    slug: 'electricity',
    name: 'Electricity',
    icon: (
      <svg
        viewBox="0 0 44 44"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 16 19 C 16 15.686 18.686 13 22 13 C 25.314 13 28 15.686 28 19 C 28 21.5 26.5 23.5 24.5 24.5 L 24.5 27.5 H 19.5 L 19.5 24.5 C 17.5 23.5 16 21.5 16 19 Z" />
        <line x1="20" y1="30.5" x2="24" y2="30.5" strokeWidth="2.4" />
        <line x1="22" y1="8" x2="22" y2="10" strokeWidth="2.4" />
        <line x1="13" y1="11" x2="14.5" y2="12.5" strokeWidth="2.4" />
        <line x1="31" y1="11" x2="29.5" y2="12.5" strokeWidth="2.4" />
      </svg>
    ),
  },
  {
    slug: 'tv',
    name: 'TV',
    icon: (
      <svg
        viewBox="0 0 44 44"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="10" y="15" width="24" height="19" rx="3.5" />
        <circle cx="28.5" cy="20.5" r="1.5" fill="currentColor" />
        <circle cx="28.5" cy="25.5" r="1.5" fill="currentColor" />
        <line x1="25.5" y1="16" x2="25.5" y2="33" strokeWidth="1.8" />
        <line x1="16" y1="9" x2="21" y2="15" strokeWidth="2.4" />
        <line x1="28" y1="9" x2="23" y2="15" strokeWidth="2.4" />
      </svg>
    ),
  },
  {
    slug: 'betting',
    name: 'Betting',
    icon: (
      <svg
        viewBox="0 0 44 44"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="11" y="13" width="14" height="20" rx="3" transform="rotate(-10 11 13)" />
        <rect x="19" y="13" width="14" height="20" rx="3" />
        <circle cx="26" cy="19" r="1.5" fill="currentColor" />
        <circle cx="26" cy="27" r="1.5" fill="currentColor" />
        <circle cx="23" cy="23" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    slug: 'education',
    name: 'Education',
    icon: (
      <svg
        viewBox="0 0 44 44"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 22 12 L 8 18 L 22 24 L 36 18 L 22 12 Z" />
        <path d="M 13 20.5 V 26.5 C 13 26.5 16 30 22 30 C 28 30 31 26.5 31 26.5 V 20.5" />
        <path d="M 33 19.5 V 29.5" strokeWidth="2" />
        <circle cx="33" cy="30.5" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    slug: 'government-services',
    name: 'Government',
    icon: (
      <svg
        viewBox="0 0 44 44"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="11" y="17" width="10" height="16" rx="1.5" />
        <rect x="23" y="12" width="11" height="21" rx="1.5" />
        <rect x="14" y="20" width="2" height="3" fill="currentColor" />
        <rect x="14" y="26" width="2" height="3" fill="currentColor" />
        <rect x="27" y="16" width="3" height="3" fill="currentColor" />
        <rect x="27" y="22" width="3" height="3" fill="currentColor" />
        <line x1="8" y1="33" x2="36" y2="33" strokeWidth="2.4" />
      </svg>
    ),
  },
  {
    slug: 'shopping',
    name: 'Shopping',
    icon: (
      <svg
        viewBox="0 0 44 44"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 12 16 H 32 L 30 33 H 14 L 12 16 Z" />
        <path d="M 17 16 V 12 C 17 9.5 19 7.5 22 7.5 C 25 7.5 27 9.5 27 12 V 16" />
        <circle cx="22" cy="23" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    slug: 'embassies',
    name: 'Embassies',
    icon: (
      <svg
        viewBox="0 0 44 44"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 8 16 L 22 10 L 36 16 H 8 Z" />
        <line x1="12" y1="18" x2="12" y2="28" strokeWidth="2.4" />
        <line x1="18.5" y1="18" x2="18.5" y2="28" strokeWidth="2.4" />
        <line x1="25.5" y1="18" x2="25.5" y2="28" strokeWidth="2.4" />
        <line x1="32" y1="18" x2="32" y2="28" strokeWidth="2.4" />
        <line x1="8" y1="29" x2="36" y2="29" strokeWidth="2.4" />
        <line x1="6" y1="32" x2="38" y2="32" strokeWidth="2.4" />
      </svg>
    ),
  },
  {
    slug: 'transport-travel',
    name: 'Transport',
    icon: (
      <svg
        viewBox="0 0 44 44"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="10" y="14" width="24" height="18" rx="4" />
        <circle cx="16" cy="26" r="2" fill="currentColor" />
        <circle cx="28" cy="26" r="2" fill="currentColor" />
        <line x1="10" y1="21" x2="34" y2="21" strokeWidth="2" />
        <line x1="14" y1="10" x2="16" y2="14" strokeWidth="2" />
        <line x1="30" y1="10" x2="28" y2="14" strokeWidth="2" />
      </svg>
    ),
  },
];

const visualServiceBySlug = Object.fromEntries(
  ALL_DIGITAL_SERVICES.map((service) => [service.slug, service])
) as Record<string, ServiceItem>;

interface ServiceTabsSelectorProps {
  activeSlug: string;
  onSelectService?: (slug: string, title: string) => void;
}

export default function ServiceTabsSelector({
  activeSlug,
  onSelectService,
}: ServiceTabsSelectorProps) {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const { data: categories, isLoading } = useDigitalServiceCategories();
  // TELCO gives two tabs (Airtime, Data); see lib/digitalServices/categoryServices.ts
  const services = (categories ?? []).flatMap(servicesForCategory).flatMap((service) => {
    const visualService = visualServiceBySlug[service.visualSlug];
    return visualService ? [{ ...visualService, slug: service.slug, name: service.label }] : [];
  });

  const handleSelect = (slug: string, title: string) => {
    if (onSelectService) onSelectService(slug, title);
    else router.push(`/categories/${slug}`);
  };

  // Keep the active tab in view when it changes
  useEffect(() => {
    const el = carouselRef.current?.querySelector(`[data-slug="${activeSlug}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeSlug]);

  /** Service board switcher: a row of pills under the hero; the current service is Cloud. */
  return (
    <div
      ref={carouselRef}
      role="tablist"
      aria-label="Services"
      className="hz-stagger no-scrollbar flex gap-2 overflow-x-auto pt-8 pb-6 [scrollbar-width:none]"
    >
      {isLoading &&
        Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} tone="dark" className="h-11 w-24 shrink-0 rounded-[10px]" />
        ))}
      {services.map((srv) => {
        const isActive = activeSlug === srv.slug;
        return (
          <button
            key={srv.slug}
            data-slug={srv.slug}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(srv.slug, srv.name)}
            className={`hz-press inline-flex min-h-11 shrink-0 items-center rounded-[10px] border px-[18px] text-sm font-medium whitespace-nowrap transition-colors ${
              isActive ? 'border-cloud bg-cloud text-carbon' : 'border-grey-800 text-silver hover:border-grey-500 hover:text-cloud'
            }`}
          >
            {srv.name}
          </button>
        );
      })}
    </div>
  );
}

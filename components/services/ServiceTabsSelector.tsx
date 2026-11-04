'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDigitalServiceCategories } from '@/lib/queries/useDigitalServiceCategories';
import type { DigitalServiceCategory } from '@/lib/api/digitalServices';

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
        className="h-9 w-9 text-[#E95312]"
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
        className="h-9 w-9 text-[#E95312]"
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
        className="h-9 w-9 text-[#E95312]"
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
        className="h-9 w-9 text-[#E95312]"
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
        className="h-9 w-9 text-[#E95312]"
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
        className="h-9 w-9 text-[#E95312]"
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
        className="h-9 w-9 text-[#E95312]"
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
        className="h-9 w-9 text-[#E95312]"
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
        className="h-9 w-9 text-[#E95312]"
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
        className="h-9 w-9 text-[#E95312]"
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

const categoryTabConfig: Partial<
  Record<DigitalServiceCategory, { slug: string; name: string; visualSlug: string }>
> = {
  TELCO: { slug: 'airtime', name: 'Airtime & Data', visualSlug: 'airtime' },
  INTERNET_SERVICES: { slug: 'data', name: 'Internet Services', visualSlug: 'data' },
  DISCO: { slug: 'electricity', name: 'Electricity', visualSlug: 'electricity' },
  CABLE: { slug: 'tv', name: 'Cable TV', visualSlug: 'tv' },
  EDUCATION: { slug: 'education', name: 'Education', visualSlug: 'education' },
  INSURANCE: { slug: 'insurance', name: 'Insurance', visualSlug: 'government-services' },
  OTHER_SERVICES: { slug: 'other-services', name: 'Other Services', visualSlug: 'shopping' },
};

interface ServiceTabsSelectorProps {
  activeSlug: string;
  onSelectService?: (slug: string) => void;
}

export default function ServiceTabsSelector({
  activeSlug,
  onSelectService,
}: ServiceTabsSelectorProps) {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const { data: categories, isLoading } = useDigitalServiceCategories();
  const services = (categories ?? []).flatMap((category) => {
    const config = categoryTabConfig[category];
    const visualService = config ? visualServiceBySlug[config.visualSlug] : undefined;
    return config && visualService
      ? [{ ...visualService, slug: config.slug, name: config.name }]
      : [];
  });

  // Mouse drag-to-scroll state
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const handleSelect = (slug: string) => {
    // If the user was dragging, don't trigger the click
    if (hasMoved.current) return;

    if (onSelectService) {
      onSelectService(slug);
    } else {
      router.push(`/categories/${slug}`);
    }
  };

  // Scroll smoothly with arrow buttons
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Auto-scroll the active tab into view whenever activeSlug changes
  useEffect(() => {
    if (carouselRef.current) {
      const activeEl = carouselRef.current.querySelector(
        `[data-slug="${activeSlug}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [activeSlug]);

  // Mouse drag-to-scroll handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDown.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
  };

  const onMouseLeave = () => {
    isDown.current = false;
  };

  const onMouseUp = () => {
    isDown.current = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasMoved.current = true;
    }
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <section className="my-12 w-full sm:my-16">
      {/* Title & Subtitle */}
      <div className="mb-8 text-center sm:mb-10">
        <p className="text-xs font-semibold tracking-wide text-[#E95312] sm:text-sm">
          Choose your digital service
        </p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
          Select a service below to continue.
        </h2>
      </div>

      {/* Spanning full width to align directly with Hero section */}
      <div className="flex w-full items-center justify-between gap-3 sm:gap-4">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-500/80 text-white transition-all duration-200 hover:border-white hover:bg-white/10 active:scale-95 sm:h-10 sm:w-10"
          aria-label="Previous categories"
        >
          <ChevronLeft className="h-5 w-5 stroke-[2.2]" />
        </button>

        {/* Carousel Container - Scrollable, Grabbable, and displaying Two-Tone Cards with Hidden Scrollbar */}
        <div
          ref={carouselRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className="no-scrollbar flex flex-1 cursor-grab items-center gap-3.5 overflow-x-auto py-3 select-none active:cursor-grabbing sm:gap-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]"
          style={{
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {isLoading && Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-[125px] w-[105px] shrink-0 animate-pulse rounded-2xl bg-white/10 sm:h-[142px] sm:w-[124px]" />
          ))}
          {services.map((srv) => {
            const isActive = activeSlug === srv.slug;

            return (
              <button
                key={srv.slug}
                data-slug={srv.slug}
                type="button"
                onClick={() => handleSelect(srv.slug)}
                className={`group flex h-[125px] w-[105px] flex-shrink-0 flex-col overflow-hidden rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none sm:h-[142px] sm:w-[124px] ${isActive
                  ? 'border-2 border-[#E95312] shadow-xl ring-4 ring-[#E95312]/20'
                  : 'border border-transparent shadow-sm hover:shadow-md'
                  }`}
              >
                {/* TOP PORTION: Two-Tone upper portion with Centered Orange Icon */}
                <div
                  className={`flex flex-1 items-center justify-center px-2 py-4 transition-colors ${isActive ? 'bg-[#FDF2EC]' : 'bg-[#EAF5FA] group-hover:bg-[#E2EFF6]'
                    }`}
                >
                  <div className="transition-transform duration-200 group-hover:scale-105">
                    {srv.icon}
                  </div>
                </div>

                {/* BOTTOM PORTION: Pure Crisp White with Category Name */}
                <div className="flex items-center justify-center bg-white py-2.5 px-1.5 text-center">
                  <span
                    className={`text-xs font-bold transition-colors sm:text-sm ${isActive ? 'text-[#E95312]' : 'text-[#102A36]'
                      }`}
                  >
                    {srv.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-500/80 text-white transition-all duration-200 hover:border-white hover:bg-white/10 active:scale-95 sm:h-10 sm:w-10"
          aria-label="Next categories"
        >
          <ChevronRight className="h-5 w-5 stroke-[2.2]" />
        </button>
      </div>
    </section>
  );
}

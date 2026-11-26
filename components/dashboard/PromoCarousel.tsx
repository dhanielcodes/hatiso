'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Banknote, Signal, UserPlus, type LucideIcon } from 'lucide-react';

/** Dashboard promo slides (design "Component 6"). Class strings are written out in full so Tailwind sees them. */
const SLIDES = [
  {
    id: 'data-points',
    tag: 'This week',
    title: 'Get 5× points on every data bundle',
    body: ['More data, more rewards.', 'Ends Sunday.'],
    cta: { label: 'Buy Data', href: '/dashboard/services' },
    badge: { value: '5x', caption: 'POINTS' },
    tone: {
      card: 'bg-brand-61',
      tag: 'bg-brand-109 text-brand-333',
      cta: 'text-brand-333',
      badge: 'bg-brand-303 border-brand-241',
      dot: 'bg-brand-333',
    },
  },
  {
    id: 'cash-back',
    tag: 'New',
    title: 'Pay your bills, get cash back',
    body: ['Electricity, TV and airtime all count.', 'Cash back lands instantly.'],
    cta: { label: 'Pay a bill', href: '/dashboard/services' },
    badge: { value: '₦500', caption: 'BACK' },
    tone: {
      card: 'bg-brand-61',
      tag: 'bg-brand-109 text-brand-333',
      cta: 'text-brand-333',
      badge: 'bg-brand-303 border-brand-241',
      dot: 'bg-brand-333',
    },
  },
  {
    id: 'refer',
    tag: 'Refer and earn',
    title: 'Invite a friend, you both earn',
    body: ['Get 500 points when they make their first purchase.'],
    // The design labels this "Buy Data"; there's no referral page yet, so it opens services.
    cta: { label: 'Buy Data', href: '/dashboard/services' },
    badge: { value: '+500', caption: 'POINTS' },
    tone: {
      card: 'bg-brand-61',
      tag: 'bg-brand-109 text-brand-333',
      cta: 'text-brand-333',
      badge: 'bg-brand-303 border-brand-241',
      dot: 'bg-brand-333',
    },
  },
] as const;

const SLIDE_MS = 6000;

const SLIDE_ICONS: Record<(typeof SLIDES)[number]['id'], LucideIcon> = {
  'data-points': Signal,
  'cash-back': Banknote,
  refer: UserPlus,
};

/**
 * Rotating offers card: cross-fades every 6s, pauses on hover or keyboard focus, and doesn't
 * auto-rotate when the user prefers reduced motion. The dots pick a slide.
 */
export default function PromoCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setActive((index) => (index + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [active, paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative grid overflow-hidden rounded-[14px] bg-graphite text-cloud"
    >
      {SLIDES.map((slide, index) => {
        const current = index === active;
        const Icon = SLIDE_ICONS[slide.id];
        return (
          <article
            key={slide.id}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${SLIDES.length}`}
            aria-hidden={!current}
            inert={!current}
            className={`col-start-1 row-start-1 flex flex-wrap items-center gap-[18px] px-6 py-[22px] pr-6 transition-opacity duration-500 sm:pr-24 ${current ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-grey-800 bg-carbon text-silver">
              <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
              <span className="text-xs font-medium tracking-[0.14em] text-grey-400 uppercase">{slide.tag}</span>
              <span className="text-[17px] font-semibold">{slide.title}</span>
              <span className="text-sm text-silver">{slide.body.join(' ')}</span>
            </span>
            <Link
              href={slide.cta.href}
              className="hz-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-cloud px-[18px] text-sm font-medium text-carbon hover:bg-white"
            >
              {slide.cta.label}
              <ArrowRight className="hz-arrow h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
        );
      })}

      <div className="absolute right-6 bottom-4 z-10 flex items-center gap-1.5 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show offer ${index + 1}: ${slide.title}`}
            aria-current={index === active}
            className={`h-1.5 rounded-full transition-all duration-300 ease-out-soft ${index === active ? 'w-5 bg-cloud' : 'w-1.5 bg-grey-700 hover:bg-grey-500'}`}
          />
        ))}
      </div>
    </section>
  );
}

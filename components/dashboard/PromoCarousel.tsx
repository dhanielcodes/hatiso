'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/** Dashboard promo slides (design "Component 6"). Class strings are written out in full so Tailwind sees them. */
const SLIDES = [
  {
    id: 'data-points',
    tag: 'THIS WEEK',
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
    tag: 'NEW',
    title: 'Pay your bills, get cash back',
    body: ['Electricity, TV and airtime all count.', 'Cash back lands instantly.'],
    cta: { label: 'Pay a bill', href: '/dashboard/services' },
    badge: { value: '₦500', caption: 'BACK' },
    tone: {
      card: 'bg-success-57',
      tag: 'bg-success-96 text-success-471',
      cta: 'text-success-471',
      badge: 'bg-success-326 border-success-402',
      dot: 'bg-success-471',
    },
  },
  {
    id: 'refer',
    tag: 'REFER & EARN',
    title: 'Invite a friend, you both earn',
    body: ['Get 500 points when they make their first purchase.'],
    // The design labels this "Buy Data"; there's no referral page yet, so it opens services.
    cta: { label: 'Buy Data', href: '/dashboard/services' },
    badge: { value: '+500', caption: 'POINTS' },
    tone: {
      card: 'bg-info-62',
      tag: 'bg-info-103 text-info-496',
      cta: 'text-info-496',
      badge: 'bg-info-347 border-info-414',
      dot: 'bg-info-496',
    },
  },
] as const;

const SLIDE_MS = 6000;

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
      className="relative grid min-h-[247px] overflow-hidden rounded-xl"
    >
      {SLIDES.map((slide, index) => {
        const current = index === active;
        return (
          <article
            key={slide.id}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${SLIDES.length}`}
            aria-hidden={!current}
            inert={!current}
            className={`relative col-start-1 row-start-1 p-6 pb-10 transition-opacity duration-500 sm:p-7 sm:pb-10 ${slide.tone.card} ${current ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <span className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold ${slide.tone.tag}`}>{slide.tag}</span>
            <h2 className="mt-4 max-w-[195px] text-[21px] font-semibold leading-[1.35] tracking-[-0.01em] text-tone-744">{slide.title}</h2>
            <p className="mt-3 max-w-[215px] text-[13px] leading-4 text-tone-388">
              {slide.body.map((line, i) => (
                <span key={line}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
            <Link href={slide.cta.href} className={`mt-6 inline-flex items-center gap-2 text-sm font-medium ${slide.tone.cta}`}>
              {slide.cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            {/* Tilted oval badge from the design. */}
            <div
              aria-hidden="true"
              className={`absolute right-4 top-1/2 flex h-[124px] w-[104px] -translate-y-1/2 rotate-[14deg] items-center justify-center rounded-[50%] border-[7px] text-center text-white ${slide.tone.badge}`}
            >
              <span className="text-[30px] font-semibold leading-none">
                {slide.badge.value}
                <small className="mt-2 block text-[11px] font-medium tracking-[0.08em]">{slide.badge.caption}</small>
              </span>
            </div>
          </article>
        );
      })}

      <div className="absolute bottom-3.5 left-6 z-10 flex items-center gap-1 sm:left-7">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show offer ${index + 1}: ${slide.title}`}
            aria-current={index === active}
            className={`h-1.5 rounded-full transition-all duration-300 ${index === active ? `w-4 ${SLIDES[active].tone.dot}` : 'w-1.5 bg-tone-114 hover:bg-tone-190'}`}
          />
        ))}
      </div>
    </section>
  );
}

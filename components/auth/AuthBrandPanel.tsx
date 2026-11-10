'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Dices, HandCoins, MonitorPlay, Vibrate } from 'lucide-react';
import XnettLogo from './XnettLogo';

/**
 * Left-hand brand panel shared by login, register and forgot-password (desktop only).
 * Photo slides cross-fade inside a squircle frame with floating service icons around it.
 */
const SLIDES = [
  {
    src: '/images/pink_blazer_phone.jpg',
    alt: 'Woman managing her finances on her phone',
    // Crop towards her face and phone so the frame reads like the design's close-up
    position: '58% 38%',
    zoom: 1.18,
  },
  {
    src: '/images/smiling_professional.webp',
    alt: 'Smiling woman in a bright office',
    // Landscape photo: shift right so she sits in the middle of the frame
    position: '72% 30%',
    // No zoom: the photo has little headroom above her hair
    zoom: 1,
  },
];

const SLIDE_MS = 6000;
const SWIPE_PX = 40;

/** Superellipse (|x|^n + |y|^n = 1) as a CSS polygon: straighter sides and softer corners than border-radius. */
const SQUIRCLE = (() => {
  const n = 4.2;
  const points: string[] = [];
  for (let i = 0; i < 72; i += 1) {
    const t = (i / 72) * Math.PI * 2;
    const cos = Math.cos(t);
    const sin = Math.sin(t);
    const x = 50 + 50 * Math.sign(cos) * Math.abs(cos) ** (2 / n);
    const y = 50 + 50 * Math.sign(sin) * Math.abs(sin) ** (2 / n);
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${points.join(', ')})`;
})();

function FloatingIcon({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#D9DDE0]/90 text-[#C8561B] shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm xl:h-[52px] xl:w-[52px] ${className}`}
    >
      {children}
    </div>
  );
}

export default function AuthBrandPanel() {
  const [active, setActive] = useState(0);
  const [hidden, setHidden] = useState(false);
  const swipeStart = useRef<number | null>(null);

  const go = (delta: number) => setActive((i) => (i + delta + SLIDES.length) % SLIDES.length);

  // Pause only while the tab is in the background
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // One timer per slide: picking a slide (dot or swipe) restarts the countdown
  useEffect(() => {
    if (hidden) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [active, hidden]);

  return (
    <aside className="relative hidden flex-col overflow-hidden bg-[#1B3C4A] px-10 pb-6 pt-8 text-white lg:sticky lg:top-0 lg:flex lg:h-screen xl:px-14">
      <XnettLogo />

      <div className="mt-[clamp(1.5rem,5vh,3.5rem)] max-w-[540px]">
        <h2 className="text-[clamp(2rem,3.1vw,2.9rem)] font-semibold leading-[1.15] tracking-tight text-[#E8ECEF]">
          Start managing your financial life <span className="text-[#E8692B]">in one place.</span>
        </h2>
        <p className="mt-4 max-w-[470px] text-[15px] leading-relaxed text-white/75">
          Join Hatiso to explore trusted services and businesses, connect with your bank and enjoy an experience built
          around you. Unified in a single app.
        </p>
      </div>

      {/* Photo frame grows with the space left, so the whole panel fits the viewport */}
      <div className="flex min-h-0 flex-1 items-center justify-center py-[clamp(1.25rem,4vh,3rem)]">
        <div className="relative aspect-[19/20] h-full max-h-[440px] max-w-full">
          <div
            className="relative h-full w-full touch-pan-y select-none overflow-hidden bg-[#2A4B59]"
            style={{ clipPath: SQUIRCLE }}
            onPointerDown={(e) => {
              swipeStart.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (swipeStart.current === null) return;
              const dx = e.clientX - swipeStart.current;
              swipeStart.current = null;
              if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
            }}
            onPointerCancel={() => {
              swipeStart.current = null;
            }}
          >
            {SLIDES.map((slide, i) => (
              <Image
                key={slide.src}
                src={slide.src}
                alt={i === active ? slide.alt : ''}
                aria-hidden={i !== active}
                fill
                priority={i === 0}
                draggable={false}
                sizes="(min-width: 1280px) 440px, 360px"
                style={{ objectPosition: slide.position, transform: `scale(${slide.zoom})` }}
                className={`object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                  i === active ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>

          <FloatingIcon className="auth-float right-[-2%] top-[-3%]">
            <MonitorPlay className="h-5 w-5" strokeWidth={2.2} />
          </FloatingIcon>
          <FloatingIcon className="auth-float auth-float-delay left-[-7%] top-[26%]">
            <HandCoins className="h-5 w-5" strokeWidth={2.2} />
          </FloatingIcon>
          <FloatingIcon className="auth-float auth-float-delay-2 bottom-[16%] right-[-6%]">
            <Dices className="h-5 w-5" strokeWidth={2.2} />
          </FloatingIcon>
          <FloatingIcon className="auth-float auth-float-delay-3 bottom-[-4%] left-[4%]">
            <Vibrate className="h-5 w-5" strokeWidth={2.2} />
          </FloatingIcon>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5" role="group" aria-label="Choose slide">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className="flex h-6 items-center px-0.5"
          >
            <span
              className={`block h-1 rounded-full transition-all duration-300 ${
                i === active ? 'w-6 bg-white' : 'w-3 bg-[#5E7F8D] hover:bg-[#7E9DAA]'
              }`}
            />
          </button>
        ))}
      </div>
    </aside>
  );
}

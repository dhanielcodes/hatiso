'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MonitorPlay, Wallet, Lock, Wifi } from 'lucide-react';
import XnettLogo from './XnettLogo';

const SLIDES = [
  {
    src: '/images/pink_blazer_phone.jpg',
    alt: 'Woman managing her finances on her phone',
  },
  {
    src: '/images/phone_app.jpg',
    alt: 'Checking balances and payments on a phone',
  },
];

function FloatingIcon({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={`absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] ${className}`}
    >
      <span className="text-[#FF6500]">{children}</span>
    </div>
  );
}

export default function AuthBrandPanel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#1B3C4A] px-10 py-8 text-white lg:flex xl:px-14">
      <XnettLogo />

      <div className="max-w-xl pt-6">
        <h2 className="text-[2.35rem] font-semibold leading-[1.15] tracking-tight xl:text-[2.75rem]">
          Start managing your financial life{' '}
          <span className="text-[#FF6500]">in one place.</span>
        </h2>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/75">
          Join Hatiso to explore trusted services and businesses, connect with your bank
          and enjoy an experience built around you. Unified in a single app.
        </p>
      </div>

      <div
        className="relative mx-auto mt-8 mb-4 w-full max-w-[420px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem]">
          {SLIDES.map((slide, i) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="420px"
              className={`object-cover object-[center_20%] transition-opacity duration-700 ease-out ${i === active ? 'opacity-100' : 'opacity-0'
                }`}
            />
          ))}
        </div>

        <FloatingIcon className="auth-float -right-3 top-[12%]">
          <MonitorPlay className="h-5 w-5" strokeWidth={2.2} />
        </FloatingIcon>
        <FloatingIcon className="auth-float-delay -left-4 top-[42%]">
          <Wallet className="h-5 w-5" strokeWidth={2.2} />
        </FloatingIcon>
        <FloatingIcon className="auth-float-delay-2 -right-2 bottom-[28%]">
          <Lock className="h-5 w-5" strokeWidth={2.2} />
        </FloatingIcon>
        <FloatingIcon className="auth-float-delay-3 -left-2 bottom-[8%]">
          <Wifi className="h-5 w-5" strokeWidth={2.2} />
        </FloatingIcon>
      </div>

      <div className="flex items-center justify-center gap-2 pb-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-white' : 'w-3 bg-white/35 hover:bg-white/55'
              }`}
          />
        ))}
      </div>
    </aside>
  );
}

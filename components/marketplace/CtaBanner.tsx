'use client';

import React from 'react';
import Link from 'next/link';

interface CtaBannerProps {
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
}

export default function CtaBanner({
  secondaryButtonText = 'Contact Us',
  secondaryButtonHref = '/auth/register?role=business',
}: CtaBannerProps) {
  return (
    <section className="relative bg-[#1B3C4A] px-4 py-20 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[32px] bg-[#344E5A] px-6 py-16 sm:px-12 sm:py-20 lg:py-24 text-center shadow-2xl border border-white/5">
          {/* Decorative Topographic / Wave Contours */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {/* Left wavy contours */}
            <svg
              className="absolute -left-10 top-0 h-full w-72 text-white/[0.06]"
              viewBox="0 0 200 400"
              fill="none"
              stroke="currentColor"
              strokeWidth="24"
              preserveAspectRatio="none"
            >
              <path d="M 40 -20 C 120 80, -20 180, 60 280 C 120 350, 40 420, 20 450" />
            </svg>
            <svg
              className="absolute -left-2 top-0 h-full w-80 text-white/[0.04]"
              viewBox="0 0 200 400"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              preserveAspectRatio="none"
            >
              <path d="M 80 -40 C 160 70, 20 190, 90 300 C 140 370, 70 430, 40 460" />
            </svg>

            {/* Right wavy contour */}
            <svg
              className="absolute -right-12 top-0 h-full w-80 text-white/[0.06]"
              viewBox="0 0 250 400"
              fill="none"
              stroke="currentColor"
              strokeWidth="22"
              preserveAspectRatio="none"
            >
              <path d="M 180 -20 C 80 100, 20 220, 160 300 C 240 360, 200 440, 230 460" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to get started?
            </h2>
            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-xl mx-auto">
              Create an account instantly to get started or contact us
              <br className="hidden sm:inline" /> to design a custom package for your business
            </p>

            <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-xl bg-[#FF8A4C] px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#E95312]/20 transition-all duration-150 hover:bg-[#E84D15] active:scale-[0.98]"
              >
                Create a free account
              </Link>
              <Link
                href={secondaryButtonHref}
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-xs sm:text-sm font-bold text-[#102A36] shadow-md transition-all duration-150 hover:bg-slate-100 active:scale-[0.98]"
              >
                {secondaryButtonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


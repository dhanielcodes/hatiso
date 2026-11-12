'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';

const CARDS = [
  { label: 'Data', right: '23%', bottom: '-70px', width: 210, r: '-6deg', d: '0.2s', f: '7s', bg: 'linear-gradient(150deg, #2F6A93 0%, #233C49 55%, #10202A 100%)', fg: '#FFFFFF', border: '1px solid #36505E' },
  { label: 'Bills', right: '9%', bottom: '-30px', width: 210, r: '2deg', d: '0.35s', f: '8s', bg: 'linear-gradient(150deg, #FFB27A 0%, #EE6E2D 50%, #B84A16 100%)', fg: '#14252E', border: 'none' },
  { label: 'Banks', right: '-2%', bottom: '-100px', width: 190, r: '8deg', d: '0.5s', f: '6.5s', bg: 'linear-gradient(150deg, #FFF3E8 0%, #F6C9A6 60%, #EE9A62 100%)', fg: '#14252E', border: 'none' },
];

/** "Ready to get started?" card shown above the footer on every landing page. */
export default function CtaBanner() {
  const signedIn = useAuthStore((s) => s.isAuthenticated && !!s.user);

  return (
    <section className="bg-white px-4 pb-24 pt-6 font-jakarta sm:px-6">
      <div className="lp-reveal relative mx-auto min-h-[380px] max-w-[1280px] overflow-hidden rounded-[32px] bg-[#0A1014] px-7 py-14 text-white sm:rounded-[40px] sm:px-14 sm:py-[72px]">
        <div
          aria-hidden="true"
          className="absolute right-[8%] top-10 h-[360px] w-[420px] rounded-full bg-[#EE6E2D] opacity-[0.16] blur-[90px]"
        />
        <div className="relative max-w-[620px]">
          <h2 className="m-0 text-[34px] font-semibold leading-[1.1] tracking-[-1.4px] sm:text-[48px]">
            Ready to get <span className="text-[#EE6E2D]">started?</span>
          </h2>
          <p className="mt-5 max-w-[460px] text-[17px] leading-[1.6] text-[#B9C6CD]">
            Create an account instantly to get started or contact us to design a custom package for your business
          </p>
          <div className="mt-[34px] flex flex-wrap gap-3">
            {signedIn ? (
              <Link href="/dashboard" className="rounded-full bg-[#EE6E2D] px-[30px] py-[17px] text-base font-bold text-[#14252E] transition hover:bg-[#F48245]">
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="rounded-full bg-[#EE6E2D] px-[30px] py-[17px] text-base font-bold text-[#14252E] transition hover:bg-[#F48245]">
                  Create a free account
                </Link>
                <Link href="/auth/login" className="rounded-full border-[1.5px] border-white px-[30px] py-4 text-base font-semibold text-white transition hover:bg-white hover:text-[#0A1014]">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
        {CARDS.map((card) => (
          <div
            key={card.label}
            aria-hidden="true"
            className="lp-card absolute hidden aspect-[0.66] rounded-[26px] p-[22px] min-[961px]:block"
            style={
              {
                right: card.right,
                bottom: card.bottom,
                width: card.width,
                background: card.bg,
                color: card.fg,
                border: card.border,
                '--r': card.r,
                '--d': card.d,
                '--f': card.f,
              } as React.CSSProperties
            }
          >
            <span className="text-lg font-bold">{card.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

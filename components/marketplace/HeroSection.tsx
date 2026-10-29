'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Shield,
  Send,
  ChevronDown,
} from 'lucide-react';

interface CarouselSlide {
  id: string;
  title: string;
  subtext: string;
  type: 'avatars' | 'photo' | 'transfer' | 'architecture';
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'avatars',
    title: 'One app, every\nservice you rely on',
    subtext:
      'From bills to banking to your favorite merchants access it all without switching apps.',
    type: 'avatars',
  },
  {
    id: 'photo',
    title: 'Everything you need,\nright in your hand',
    subtext:
      'Buy airtime, pay bills, and access your bank. All from one app, wherever you are.',
    type: 'photo',
  },
  {
    id: 'transfer',
    title: 'Your bank, without\nthe bank queue',
    subtext:
      'Check balances, move money, and manage your account securely, right from Atiso.',
    type: 'transfer',
  },
  {
    id: 'architecture',
    title: 'Your bank, without\nthe bank queue',
    subtext:
      'Check balances, move money, and manage your account securely, right from Atiso.',
    type: 'architecture',
  },
];

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0); // Start with Card 1 (or 0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying]);

  return (
    <section className="relative overflow-hidden px-4 pt-4 pb-12 sm:px-8 lg:px-14">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-[#22D3EE]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 -z-10 h-80 w-80 rounded-full bg-[#FF6500]/8 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline & Value Proposition */}
          <div className="flex flex-col space-y-6 lg:col-span-6 xl:col-span-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                <span className="block text-[#FF6500] drop-shadow-sm">
                  One platform.
                </span>
                <span className="block font-extrabold text-white">
                  Every service you need.
                </span>
              </h1>
            </div>

            <p className="max-w-xl text-base text-slate-300 sm:text-lg sm:leading-relaxed">
              Discover digital services from trusted providers, manage your banking, and get
              things done. All from one place. No account required to start.
            </p>
          </div>

          {/* Right Column: Straight Cards Carousel with Blurred Out Sides (NO SHADOWS) */}
          <div
            className="relative flex flex-col items-center justify-center lg:col-span-6 xl:col-span-6"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Carousel Viewport with Side Fade/Blur Masks */}
            <div className="relative flex h-[500px] w-full max-w-[560px] items-center justify-center overflow-hidden sm:h-[540px]">
              {/* Left Side Blur & Fade Overlay Mask */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-30 w-16 bg-gradient-to-r from-[#1B3C4A] via-[#1B3C4A]/70 to-transparent sm:w-24" />

              {/* Right Side Blur & Fade Overlay Mask */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-30 w-16 bg-gradient-to-l from-[#1B3C4A] via-[#1B3C4A]/70 to-transparent sm:w-24" />

              {/* Carousel Slides Container */}
              {CAROUSEL_SLIDES.map((slide, index) => {
                const total = CAROUSEL_SLIDES.length;
                let offset = (index - activeIndex + total) % total;
                if (offset > total / 2) offset -= total;

                const isCenter = offset === 0;
                const isLeft = offset === -1 || (total === 4 && offset === -1);
                const isRight = offset === 1;

                // Straight cards (0deg rotation) with blurred sides matching screenshot, NO SHADOW
                let transformClass = '';
                let zIndex = 10;
                let styleFilters = '';
                let opacityClass = 'opacity-0 pointer-events-none scale-75';

                if (isCenter) {
                  // Active Center Card: Straight, Crisp, In Focus, Full Opacity, No Shadow
                  transformClass = 'translate-x-0 scale-100 rotate-0';
                  zIndex = 20;
                  opacityClass = 'opacity-100 z-20 cursor-default';
                  styleFilters = 'none';
                } else if (isLeft) {
                  // Left Card: Straight, Translated left, Blurred out, No Shadow
                  transformClass =
                    '-translate-x-[64%] sm:-translate-x-[68%] scale-[0.88] rotate-0 hover:opacity-70';
                  zIndex = 10;
                  opacityClass = 'opacity-40 z-10 cursor-pointer';
                  styleFilters = 'blur(3.5px)';
                } else if (isRight) {
                  // Right Card: Straight, Translated right, Blurred out, No Shadow
                  transformClass =
                    'translate-x-[64%] sm:translate-x-[68%] scale-[0.88] rotate-0 hover:opacity-70';
                  zIndex = 10;
                  opacityClass = 'opacity-40 z-10 cursor-pointer';
                  styleFilters = 'blur(3.5px)';
                }

                return (
                  <div
                    key={slide.id}
                    onClick={() => {
                      if (!isCenter) setActiveIndex(index);
                    }}
                    className={`absolute top-4 flex h-[460px] w-[260px] flex-col justify-between overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#183946] via-[#1B3C4A] to-[#0E222A] p-6 transition-all duration-700 ease-out sm:h-[490px] sm:w-[280px] ${transformClass} ${opacityClass}`}
                    style={{
                      filter: styleFilters,
                      boxShadow: 'none', // Strictly NO shadow on cards as requested
                    }}
                  >
                    {/* Visual Area (Top 60%) */}
                    <div className="relative flex flex-1 flex-col items-center justify-center">
                      {/* CARD 1: Avatars Community */}
                      {slide.type === 'avatars' && (
                        <div className="relative flex h-full w-full flex-col justify-between">
                          {/* Top-left User Silhouette Badge */}
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-[10px] text-slate-300">
                            <User className="h-3 w-3" />
                          </div>

                          {/* 5 Avatar Bubbles in Constellation */}
                          <div className="relative my-auto flex h-48 w-full items-center justify-center">
                            {/* Subtle contour lines */}
                            <svg
                              className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
                              viewBox="0 0 200 200"
                              fill="none"
                            >
                              <circle cx="100" cy="100" r="70" stroke="#22D3EE" strokeWidth="1" />
                              <circle cx="100" cy="100" r="45" stroke="#22D3EE" strokeWidth="1" strokeDasharray="3 3" />
                            </svg>

                            {/* Top Left: Professional black woman in blazer */}
                            <div className="absolute top-2 left-6 h-11 w-11 overflow-hidden rounded-full border border-white/40">
                              <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                                alt="User"
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* Top Right: Young man looking at camera */}
                            <div className="absolute top-4 right-8 h-11 w-11 overflow-hidden rounded-full border border-white/40">
                              <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                                alt="User"
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* Center: Smiling young man in white shirt */}
                            <div className="relative z-10 h-12 w-12 overflow-hidden rounded-full border-2 border-white ring-2 ring-cyan-500/30">
                              <img
                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                                alt="User"
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* Orange Network Badge on the right edge */}
                            <div className="absolute right-3 top-24 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6500] text-white">
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            </div>

                            {/* Bottom Left: Woman with curly hair */}
                            <div className="absolute bottom-3 left-6 h-11 w-11 overflow-hidden rounded-full border border-white/40">
                              <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                                alt="User"
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* Bottom Right: Young man */}
                            <div className="absolute bottom-2 right-9 h-11 w-11 overflow-hidden rounded-full border border-white/40">
                              <img
                                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
                                alt="User"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CARD 2: Everything you need (Woman in pink blazer & cap with phone) */}
                      {slide.type === 'photo' && (
                        <div className="relative -mx-6 -mt-6 h-[250px] w-[calc(100%+3rem)] overflow-hidden">
                          <img
                            src="/images/pink_blazer_phone.jpg"
                            alt="Everything you need"
                            className="h-full w-full object-cover object-top"
                          />
                          {/* Bottom Gradient Fade into card body */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1B3C4A] via-[#1B3C4A]/40 to-transparent" />
                        </div>
                      )}

                      {/* CARD 3: Transfer money card */}
                      {slide.type === 'transfer' && (
                        <div className="relative flex h-full w-full flex-col justify-between py-1">
                          {/* Top-left icon */}
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-[10px] text-slate-300">
                            <Send className="h-3 w-3" />
                          </div>

                          {/* Floating light Transfer Money widget */}
                          <div className="relative mx-auto my-auto w-full rounded-xl bg-[#DCE7EB] p-3 text-slate-800">
                            <h4 className="text-center text-xs font-bold text-slate-900">
                              Transfer money
                            </h4>
                            <p className="mt-0.5 text-center text-[9px] text-slate-500">
                              Choose the currency and amount you want to send?
                            </p>

                            {/* Amount Input 1 */}
                            <div className="mt-2.5 flex items-center justify-between rounded-md bg-white px-2 py-1.5 border border-slate-200">
                              <span className="text-xs font-bold text-slate-900">2,000</span>
                              <div className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">
                                <span>🇳🇬 NGN</span>
                                <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                              </div>
                            </div>

                            {/* Separator lines */}
                            <div className="my-1.5 flex flex-col gap-0.5 px-1 opacity-40">
                              <div className="h-0.5 w-7 rounded-full bg-slate-400" />
                              <div className="h-0.5 w-7 rounded-full bg-slate-400" />
                              <div className="h-0.5 w-7 rounded-full bg-slate-400" />
                            </div>

                            <p className="text-[9px] text-slate-500">Your recipient will receive</p>

                            {/* Amount Input 2 */}
                            <div className="mt-1 flex items-center justify-between rounded-md bg-white px-2 py-1.5 border border-slate-200">
                              <span className="text-xs font-bold text-slate-900">1,500</span>
                              <div className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">
                                <span>🇳🇬 NGN</span>
                                <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                              </div>
                            </div>

                            {/* Orange badge on right edge */}
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6500] text-white">
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CARD 4: Atiso Banking Integration Architecture */}
                      {slide.type === 'architecture' && (
                        <div className="relative flex h-full w-full flex-col items-center justify-center py-2">
                          {/* Top XNETT Logo */}
                          <div className="mb-2 flex items-center gap-1">
                            <div className="relative flex h-4 w-4 items-center justify-center">
                              <svg viewBox="0 0 36 36" fill="none" className="h-4 w-4">
                                <path d="M9 11L18 20L15 23L6 14L9 11Z" fill="#FF6500" />
                                <path d="M27 11L18 20L21 23L30 14L27 11Z" fill="#FF6500" />
                                <path d="M9 25L18 16L15 13L6 22L9 25Z" fill="#FF8554" />
                                <path d="M27 25L18 16L21 13L30 22L27 25Z" fill="#FF8554" />
                              </svg>
                            </div>
                            <span className="text-[11px] font-black tracking-widest text-slate-200">
                              X<span className="text-[#FF6500]">NETT</span>
                            </span>
                          </div>

                          <span className="mb-2 text-[10px] font-bold text-slate-300">Atiso</span>

                          {/* Architecture diagram with central shield and two phones */}
                          <div className="relative flex w-full items-center justify-between px-1">
                            {/* Left Phone Wireframe */}
                            <div className="flex h-20 w-11 flex-col rounded-lg border border-white/30 bg-white/10 p-1 backdrop-blur-sm">
                              <div className="h-1.5 w-4 rounded-full bg-white/40 mb-1" />
                              <div className="h-3 w-full rounded bg-white/20 mb-1" />
                              <div className="space-y-0.5">
                                <div className="h-1 w-full rounded bg-white/20" />
                                <div className="h-1 w-3/4 rounded bg-white/20" />
                              </div>
                            </div>

                            {/* Left connecting line */}
                            <div className="h-0.5 flex-1 bg-white/30" />

                            {/* Center Atiso Secure Vault */}
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/40 bg-[#0E2530] p-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                                <Shield className="h-5 w-5" />
                              </div>
                            </div>

                            {/* Right connecting line */}
                            <div className="h-0.5 flex-1 bg-white/30" />

                            {/* Right Phone Wireframe */}
                            <div className="flex h-20 w-11 flex-col rounded-lg border border-white/30 bg-slate-900/60 p-1">
                              <div className="h-1.5 w-4 rounded-full bg-white/30 mb-1" />
                              <div className="h-3 w-full rounded bg-white/10 mb-1" />
                              <div className="space-y-0.5">
                                <div className="h-1 w-full rounded bg-white/15" />
                                <div className="h-1 w-2/3 rounded bg-white/15" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Card Texts (Matching exact typography) */}
                    <div className="pt-3 text-center space-y-1.5">
                      <h3 className="whitespace-pre-line text-base font-bold leading-snug text-white sm:text-lg">
                        {slide.title}
                      </h3>
                      <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-300 px-1">
                        {slide.subtext}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

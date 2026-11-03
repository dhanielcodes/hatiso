'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SlideData {
  badge: string;
  title: string[];
  description: string;
  buttonText: string;
  buttonHref: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition: 'left' | 'right';
  hasTransactionsGauge?: boolean;
}

const INDIVIDUAL_SLIDES: SlideData[] = [
  {
    badge: 'For individuals',
    title: ['Pay for what you', 'need, instantly'],
    description:
      'Bills, airtime, transfers, and merchant payments settled in seconds, no extra apps required.',
    buttonText: 'Create your account now',
    buttonHref: '/auth/register',
    imageSrc: '/images/market-place/pay-for-what-you-need.png',
    imageAlt: 'Track spending across every service',
    imagePosition: 'right',
    hasTransactionsGauge: true,
  },
  {
    badge: 'For individuals',
    title: ['Built around your', 'everyday life'],
    description:
      'From paying bills to managing your money, Hatiso brings the services you use most into one secure account.',
    buttonText: 'Create your account now',
    buttonHref: '/auth/register',
    imageSrc: '/images/market-place/built-aroung-your-everyday-life.png',
    imageAlt: 'Built around your everyday life payment flows',
    imagePosition: 'left',
  },
];

const BUSINESS_SLIDES: SlideData[] = [
  {
    badge: 'For businesses',
    title: ['Put your services in front', 'of every Hatiso user'],
    description:
      'Onboard your business onto Hatiso and reach people already looking for services like yours.',
    buttonText: 'Contact Us',
    buttonHref: '/auth/register?role=business',
    imageSrc: '/images/market-place/put-your-services-in-front.png',
    imageAlt: 'Put your services in front of every Hatiso user',
    imagePosition: 'right',
  },
  {
    badge: 'For businesses',
    title: ['Manage your transactions', 'in one dashboard'],
    description:
      'See every payment, transfer, and order across services in a single, up-to-date view.',
    buttonText: 'Contact Us',
    buttonHref: '/auth/register?role=business',
    imageSrc: '/images/market-place/manage-your-transactions.png',
    imageAlt: 'Manage your transactions in one dashboard',
    imagePosition: 'left',
  },
];

export default function SolutionsSection() {
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
  const [individualSlide, setIndividualSlide] = useState(0);
  const [businessSlide, setBusinessSlide] = useState(0);
  const [isHoveredIndividual, setIsHoveredIndividual] = useState(false);
  const [isHoveredBusiness, setIsHoveredBusiness] = useState(false);

  // Auto-animate Individual section slides every 4.2 seconds when Personal tab is active
  useEffect(() => {
    if (activeTab !== 'personal' || isHoveredIndividual) return;
    const timer = setInterval(() => {
      setIndividualSlide((prev) => (prev + 1) % INDIVIDUAL_SLIDES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [activeTab, isHoveredIndividual]);

  // Auto-animate Business section slides every 4.2 seconds when Business tab is active
  useEffect(() => {
    if (activeTab !== 'business' || isHoveredBusiness) return;
    const timer = setInterval(() => {
      setBusinessSlide((prev) => (prev + 1) % BUSINESS_SLIDES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [activeTab, isHoveredBusiness]);

  const handleTabChange = (tab: 'personal' | 'business') => {
    setActiveTab(tab);
    if (tab === 'personal') {
      setIndividualSlide(0);
    } else {
      setBusinessSlide(0);
    }
  };

  return (
    <section id='solutions' className="relative bg-white px-4 py-20 sm:px-8 lg:px-20 xl:px-28 text-slate-900 overflow-hidden lg:overflow-visible">
      <div className="mx-auto max-w-7xl">
        {/* Segmented Control Pill: [ Personal | Business ] */}
        <div className="mb-12 flex items-center justify-start">
          <div className="inline-flex items-center rounded-xl bg-[#F0F2F5] p-1 shadow-inner">
            <button
              onClick={() => handleTabChange('personal')}
              className={`rounded-lg px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${activeTab === 'personal'
                ? 'bg-white text-[#102A36] shadow-sm'
                : 'text-slate-500 hover:text-[#102A36]'
                }`}
            >
              Personal
            </button>
            <button
              onClick={() => handleTabChange('business')}
              className={`rounded-lg px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${activeTab === 'business'
                ? 'bg-white text-[#102A36] shadow-sm'
                : 'text-slate-500 hover:text-[#102A36]'
                }`}
            >
              Business
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CONDITIONAL CARD DISPLAY BASED ON ACTIVE TAB */}
        {/* ============================================================== */}

        {/* 1. PERSONAL TAB CARD */}
        {activeTab === 'personal' && (
          <div
            id="personal-card"
            onMouseEnter={() => setIsHoveredIndividual(true)}
            onMouseLeave={() => setIsHoveredIndividual(false)}
            className="relative my-8 lg:my-14 rounded-3xl bg-[#F0F2F5] p-8 sm:p-12 lg:px-14 lg:py-16 min-h-[480px] sm:min-h-[500px] lg:min-h-[520px] flex items-center overflow-visible transition-all duration-500"
          >
            {INDIVIDUAL_SLIDES.map((slide, index) => {
              const isActive = individualSlide === index;
              const isLeftImage = slide.imagePosition === 'left';

              return (
                <div
                  key={index}
                  className={`w-full grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8 transition-all duration-700 ease-in-out ${isActive
                    ? 'opacity-100 translate-x-0 relative z-10 pointer-events-auto'
                    : 'opacity-0 absolute inset-0 p-8 sm:p-12 lg:px-14 lg:py-16 z-0 pointer-events-none'
                    }`}
                >
                  {/* SLIDE 1 (Built around your everyday life): Visual on Left, Text on Right (NO POP OUT, standard layout) */}
                  {isLeftImage ? (
                    <>
                      {/* Visual on Left - sits comfortably inside the card */}
                      <div className="relative flex justify-center lg:col-span-6 lg:justify-start">
                        <div className="relative w-full max-w-[430px] sm:max-w-[470px] drop-shadow-xl transition-transform duration-700 hover:scale-[1.02]">
                          <Image
                            src={slide.imageSrc}
                            alt={slide.imageAlt}
                            width={471}
                            height={339}
                            className="h-auto w-full object-contain"
                            priority
                          />
                        </div>
                      </div>

                      {/* Text on Right */}
                      <div className="space-y-5 lg:col-span-6 lg:pl-6">
                        <span className="inline-block text-sm sm:text-base font-bold text-[#FF6500]">
                          {slide.badge}
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-[#102A36] sm:text-4xl lg:text-5xl leading-[1.12]">
                          {slide.title.map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i < slide.title.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </h2>
                        <p className="max-w-md text-sm sm:text-base text-slate-600 leading-relaxed">
                          {slide.description}
                        </p>
                        <div className="pt-2">
                          <Link
                            href={slide.buttonHref}
                            className="inline-flex items-center justify-center rounded-xl bg-[#102A36] px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition-all duration-150 hover:bg-[#183946] active:scale-[0.98]"
                          >
                            {slide.buttonText}
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* SLIDE 0 (Pay for what you need): Text on Left, DRAMATIC VERTICAL POP OUT on Right */}
                      {/* Text on Left */}
                      <div className="space-y-5 lg:col-span-7">
                        <span className="inline-block text-sm sm:text-base font-bold text-[#FF6500]">
                          {slide.badge}
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-[#102A36] sm:text-4xl lg:text-5xl leading-[1.12]">
                          {slide.title.map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i < slide.title.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </h2>
                        <p className="max-w-md text-sm sm:text-base text-slate-600 leading-relaxed">
                          {slide.description}
                        </p>
                        <div className="pt-2">
                          <Link
                            href={slide.buttonHref}
                            className="inline-flex items-center justify-center rounded-xl bg-[#102A36] px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition-all duration-150 hover:bg-[#183946] active:scale-[0.98]"
                          >
                            {slide.buttonText}
                          </Link>
                        </div>
                      </div>

                      {/* Visual on Right: Dramatic vertical pop out extending above & below */}
                      <div className="relative flex justify-center lg:col-span-5 lg:justify-end">
                        {/* Floating Mini Transactions Card */}
                        {slide.hasTransactionsGauge && (
                          <div className="absolute top-6 -left-8 sm:top-10 sm:-left-14 lg:top-14 lg:-left-20 z-0 hidden sm:block w-36 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-100/90">
                            <div className="mb-1.5 flex items-center justify-between text-[7px] font-bold text-slate-400 uppercase tracking-wider">
                              <span>Transactions</span>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <div className="relative mx-auto my-1.5 h-12 w-12">
                              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="14"
                                  fill="none"
                                  stroke="#EF4444"
                                  strokeWidth="3.5"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="14"
                                  fill="none"
                                  stroke="#22C55E"
                                  strokeWidth="3.5"
                                  strokeDasharray="80 100"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-800">
                                92%
                              </div>
                            </div>
                            <div className="space-y-1 text-[7px] font-semibold text-slate-600">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Success
                                </span>
                                <span className="font-bold text-slate-800">92%</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                  Failed
                                </span>
                                <span className="font-bold text-slate-800">8%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TALL DARK CARD: Extends ~90px above and ~70px below */}
                        <div className="relative z-10 w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[410px] lg:-mt-24 lg:-mb-20 drop-shadow-[0_30px_45px_rgba(0,0,0,0.3)] transition-transform duration-700 hover:scale-[1.02]">
                          <Image
                            src={slide.imageSrc}
                            alt={slide.imageAlt}
                            width={400}
                            height={505}
                            className="h-auto w-full object-contain"
                            priority
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Slide Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {INDIVIDUAL_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndividualSlide(i)}
                  aria-label={`Go to individual slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${individualSlide === i
                    ? 'w-6 bg-[#FF6500]'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* 2. BUSINESS TAB CARD */}
        {activeTab === 'business' && (
          <div
            id="business-card"
            onMouseEnter={() => setIsHoveredBusiness(true)}
            onMouseLeave={() => setIsHoveredBusiness(false)}
            className="relative my-8 lg:my-14 rounded-3xl bg-[#F0F2F5] p-8 sm:p-12 lg:px-14 lg:py-16 min-h-[480px] sm:min-h-[500px] lg:min-h-[520px] flex items-center overflow-visible transition-all duration-500"
          >
            {BUSINESS_SLIDES.map((slide, index) => {
              const isActive = businessSlide === index;
              const isLeftImage = slide.imagePosition === 'left';

              return (
                <div
                  key={index}
                  className={`w-full grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8 transition-all duration-700 ease-in-out ${isActive
                    ? 'opacity-100 translate-x-0 relative z-10 pointer-events-auto'
                    : 'opacity-0 absolute inset-0 p-8 sm:p-12 lg:px-14 lg:py-16 z-0 pointer-events-none'
                    }`}
                >
                  {/* SLIDE 1 (Manage your transactions): DRAMATIC POP OUT ON LEFT (extending top, bottom, and BEYOND LEFT EDGE) */}
                  {isLeftImage ? (
                    <>
                      {/* Visual on Left: Bleeds out above, below, and hangs off the LEFT edge of the grey container */}
                      <div className="relative flex justify-center lg:col-span-7 lg:justify-start">
                        <div className="relative z-10 w-full max-w-[480px] sm:max-w-[560px] lg:max-w-[640px] xl:max-w-[700px] lg:-mt-24 lg:-mb-20 lg:-ml-20 xl:-ml-28 drop-shadow-[0_30px_50px_rgba(0,0,0,0.25)] transition-transform duration-700 hover:scale-[1.02]">
                          <Image
                            src={slide.imageSrc}
                            alt={slide.imageAlt}
                            width={567}
                            height={500}
                            className="h-auto w-full object-contain"
                            priority
                          />
                        </div>
                      </div>

                      {/* Text on Right */}
                      <div className="space-y-5 lg:col-span-5 lg:pl-6">
                        <span className="inline-block text-sm sm:text-base font-bold text-[#FF6500]">
                          {slide.badge}
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-[#102A36] sm:text-4xl lg:text-5xl leading-[1.12]">
                          {slide.title.map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i < slide.title.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </h2>
                        <p className="max-w-md text-sm sm:text-base text-slate-600 leading-relaxed">
                          {slide.description}
                        </p>
                        <div className="pt-2">
                          <Link
                            href={slide.buttonHref}
                            className="inline-flex items-center justify-center rounded-xl bg-[#102A36] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition-all duration-150 hover:bg-[#183946] active:scale-[0.98]"
                          >
                            {slide.buttonText}
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* SLIDE 0 (Put your services in front): DRAMATIC POP OUT ON RIGHT (extending top, bottom, and BEYOND RIGHT EDGE) */}
                      {/* Text on Left */}
                      <div className="space-y-5 lg:col-span-5">
                        <span className="inline-block text-sm sm:text-base font-bold text-[#FF6500]">
                          {slide.badge}
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-[#102A36] sm:text-4xl lg:text-5xl leading-[1.12]">
                          {slide.title.map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i < slide.title.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </h2>
                        <p className="max-w-md text-sm sm:text-base text-slate-600 leading-relaxed">
                          {slide.description}
                        </p>
                        <div className="pt-2">
                          <Link
                            href={slide.buttonHref}
                            className="inline-flex items-center justify-center rounded-xl bg-[#102A36] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition-all duration-150 hover:bg-[#183946] active:scale-[0.98]"
                          >
                            {slide.buttonText}
                          </Link>
                        </div>
                      </div>

                      {/* Visual on Right: Bleeds out above, below, and hangs off the RIGHT edge of the grey container */}
                      <div className="relative flex justify-center lg:col-span-7 lg:justify-end">
                        <div className="relative z-10 w-full max-w-[460px] sm:max-w-[530px] lg:max-w-[600px] xl:max-w-[650px] lg:-mt-24 lg:-mb-20 lg:-mr-20 xl:-mr-28 drop-shadow-[0_30px_50px_rgba(0,0,0,0.25)] transition-transform duration-700 hover:scale-[1.02]">
                          <Image
                            src={slide.imageSrc}
                            alt={slide.imageAlt}
                            width={461}
                            height={481}
                            className="h-auto w-full object-contain"
                            priority
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Slide Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {BUSINESS_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBusinessSlide(i)}
                  aria-label={`Go to business slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${businessSlide === i
                    ? 'w-6 bg-[#FF6500]'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

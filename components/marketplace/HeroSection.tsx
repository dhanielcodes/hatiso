'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  Globe,
  Lock,
  Dices,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tv,
  Wifi,
  Zap,
} from 'lucide-react';

/** How long each hero message stays before the next one comes in. */
const SLIDE_MS = 4500;

/** The three hero messages. Each one lights up its tile below the headline. */
const SLIDES = [
  {
    id: 'services',
    title: 'One app, every service',
    tail: 'you rely on.',
    body: 'From bills to banking to your favourite merchants, access it all without switching apps.',
  },
  {
    id: 'hand',
    title: 'Everything you need,',
    tail: 'right in your hand.',
    body: 'Buy airtime, pay bills and reach your bank, all from one app, wherever you are. You can pay without an account.',
  },
  {
    id: 'bank',
    title: 'Your bank, without',
    tail: 'the bank queue.',
    body: 'Check balances, move money and manage your account securely, right from Hatiso.',
  },
] as const;

/** The services Hatiso offers (see lib/digitalServices/categoryServices.ts). */
const SERVICES = [
  { name: 'Airtime', Icon: Smartphone },
  { name: 'Data', Icon: Wifi },
  { name: 'Internet', Icon: Globe },
  { name: 'Electricity', Icon: Zap },
  { name: 'Cable TV', Icon: Tv },
  { name: 'Education', Icon: BookOpen },
  { name: 'Insurance', Icon: ShieldCheck },
  { name: 'Betting', Icon: Dices },
];

const BANK_STEPS = ['Confirm your phone number', "Sign in on your bank's own app", 'Check balances and move money'];

export default function HeroSection() {
  const [active, setActive] = useState(0);
  // Bumped on every change so the progress bar restarts even when the same tile is picked again.
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((current) => (current + 1) % SLIDES.length);
      setCycle((c) => c + 1);
    }, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [cycle]);

  const pick = (index: number) => {
    setActive(index);
    setCycle((c) => c + 1);
  };

  const slide = SLIDES[active];

  const tileClass = (index: number) =>
    `hz-lift group relative min-w-0 overflow-hidden rounded-2xl border text-left transition-[opacity,border-color] duration-400 ${
      index === active ? 'border-silver opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
    }`;

  const progress = (index: number, light = false) => (
    <span
      aria-hidden="true"
      className={`absolute top-3.5 right-4.5 left-4.5 z-10 h-[3px] overflow-hidden rounded-full ${
        light ? 'bg-grey-150' : 'bg-cloud/20'
      }`}
    >
      {index === active && (
        <span
          key={cycle}
          className={`hz-fill absolute inset-0 rounded-full ${light ? 'bg-carbon' : 'bg-cloud'}`}
          style={{ '--fill-ms': `${SLIDE_MS}ms` } as React.CSSProperties}
        />
      )}
    </span>
  );

  return (
    <section id="top" className="overflow-hidden bg-carbon text-cloud">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 pt-10 pb-16 sm:px-8 sm:pt-16 sm:pb-24 lg:gap-16 lg:px-14">
        {/* Headline: changes with the active tile */}
        <div className="flex w-full flex-col items-center gap-7 text-center">
          <div key={slide.id} className="hz-swap flex flex-col items-center gap-5" aria-live="polite">
            <h1 className="max-w-[1000px] text-[clamp(42px,7vw,92px)] leading-none font-semibold tracking-[-0.04em] text-balance">
              {slide.title} <span className="text-highlight">{slide.tail}</span>
            </h1>
            <p className="max-w-[580px] text-base leading-relaxed text-pretty text-silver sm:text-lg">{slide.body}</p>
          </div>
          <div className="hz-rise flex flex-wrap justify-center gap-3" style={{ '--d': 2 } as React.CSSProperties}>
            <Link
              href="#popular-categories"
              className="hz-press inline-flex min-h-13 items-center gap-2.5 rounded-xl bg-cloud px-6.5 text-[15px] font-medium text-carbon hover:bg-white"
            >
              Pay a bill
              <ArrowRight className="hz-arrow h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/auth/register"
              className="hz-press inline-flex min-h-13 items-center rounded-xl border border-grey-700 px-6.5 text-[15px] font-medium text-cloud hover:border-grey-400"
            >
              Create a free account
            </Link>
          </div>
        </div>

        {/* Three tiles, one per message */}
        <div className="hz-rise flex w-full flex-wrap items-stretch gap-4" style={{ '--d': 3 } as React.CSSProperties}>
          <button
            type="button"
            aria-label="Every service"
            aria-pressed={active === 0}
            onClick={() => pick(0)}
            className={`${tileClass(0)} flex min-h-[420px] flex-[3_1_280px] flex-col justify-between gap-5 bg-graphite px-5.5 pt-9 pb-5.5`}
          >
            {progress(0)}
            <span className="flex w-full items-center justify-between text-[13px]">
              <span className="font-medium text-grey-400">Services</span>
              <span className="text-grey-500">{SERVICES.length} and counting</span>
            </span>
            <span className="grid w-full grid-cols-2 gap-2">
              {SERVICES.map(({ name, Icon }) => (
                <span
                  key={name}
                  className="flex min-h-13 items-center gap-2.5 rounded-xl border border-grey-900 bg-carbon px-3 text-sm font-medium text-cloud"
                >
                  <Icon className="h-4 w-4 shrink-0 text-silver" strokeWidth={1.8} aria-hidden="true" />
                  {name}
                </span>
              ))}
            </span>
            <span className="text-[15px] leading-snug font-medium">Bills to banking, without switching apps.</span>
          </button>

          <button
            type="button"
            aria-label="Right in your hand"
            aria-pressed={active === 1}
            onClick={() => pick(1)}
            className={`${tileClass(1)} min-h-[420px] flex-[5_1_380px] bg-graphite`}
          >
            {progress(1)}
            <Image
              src="/images/pink_blazer_phone.jpg"
              alt="A woman paying for airtime on her phone"
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="hz-zoom object-cover object-[58%_30%]"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-carbon/0 from-45% to-carbon/75" />
            <span className="hz-card absolute right-4.5 bottom-4.5 left-4.5 flex max-w-[300px] flex-col gap-3 rounded-xl bg-cloud p-4.5 text-carbon shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
              <span className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-grey-600">Airtime · MTN</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-carbon px-2.5 py-1 text-xs font-medium text-cloud">
                  <span className="hz-ping h-1.5 w-1.5 rounded-full bg-silver text-silver" />
                  Paid
                </span>
              </span>
              <span className="text-3xl font-semibold tracking-[-0.02em]">
                ₦2,000<span className="text-[17px] text-grey-500">.00</span>
              </span>
              <span className="h-px bg-grey-100" />
              <span className="flex justify-between text-[13px] text-grey-600">
                <span>0803 ••• 4512</span>
                <span>Today, 09:41</span>
              </span>
            </span>
          </button>

          <button
            type="button"
            aria-label="Your bank"
            aria-pressed={active === 2}
            onClick={() => pick(2)}
            className={`${tileClass(2)} flex min-h-[420px] flex-[4_1_300px] flex-col justify-between gap-5 bg-cloud px-5.5 pt-9 pb-5.5 text-carbon`}
          >
            {progress(2, true)}
            <span className="flex w-full items-center justify-between text-[13px] text-grey-600">
              <span className="font-medium">Banking</span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Secure hand-off
              </span>
            </span>
            <span className="flex w-full flex-col gap-2.5">
              <span className="flex items-center gap-3 rounded-xl border border-grey-100 bg-white p-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-carbon text-cloud">
                  <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">Your bank</span>
                  <span className="text-[13px] text-grey-600">Opening the bank&apos;s own app</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-status-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                  Ready
                </span>
              </span>
              {BANK_STEPS.map((step) => (
                <span key={step} className="flex items-center gap-2.5 px-1 text-sm text-grey-800">
                  <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-carbon text-cloud">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {step}
                </span>
              ))}
            </span>
            <span className="text-[15px] leading-snug font-medium">Your bank, without the bank queue. We never see your login.</span>
          </button>
        </div>
      </div>
    </section>
  );
}

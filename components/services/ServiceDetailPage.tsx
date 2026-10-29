'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';
import ServiceTabsSelector from './ServiceTabsSelector';
import { ProviderItem } from './ProviderSelector';
import ServicePaymentForm, { PendingPayment } from './ServicePaymentForm';

interface ServiceDetailPageProps {
  initialSlug?: string;
}

const NETWORK_PROVIDERS: ProviderItem[] = [
  { id: 'mtn', name: 'MTN', imageSrc: '/images/network_mtn.png' },
  { id: 'airtel', name: 'Airtel', imageSrc: '/images/network_airtel.png' },
  { id: '9mobile', name: '9mobile', imageSrc: '/images/network_9mobile.png' },
  { id: 'glo', name: 'Glo', imageSrc: '/images/network_glo.png' },
];

const ELECTRICITY_PROVIDERS: ProviderItem[] = [
  { id: 'ikeja', name: 'Ikeja Electricity', imageSrc: '/images/elec_ikeja.png' },
  { id: 'ibedc', name: 'IBEDC', imageSrc: '/images/elec_ibedc.png' },
  { id: 'ekedc', name: 'EKEDC', imageSrc: '/images/elec_ekedc.png' },
  { id: 'jos', name: 'JED (Jos)', imageSrc: '/images/elec_jos.png' },
  { id: 'kaduna', name: 'Kaduna', imageSrc: '/images/elec_kaduna.png' },
];

const TV_PROVIDERS: ProviderItem[] = [
  { id: 'dstv', name: 'DSTV', imageSrc: '/images/tv_dstv.png' },
  { id: 'gotv', name: 'GOTV', imageSrc: '/images/tv_gotv.png' },
  { id: 'showmax', name: 'Showmax', imageSrc: '/images/tv_showmax.png' },
  { id: 'startimes', name: 'Startimes', imageSrc: '/images/tv_startimes.png' },
];

const BETTING_PROVIDERS: ProviderItem[] = [
  { id: 'sportybet', name: 'SportyBet', imageSrc: '/images/betting_sportybet.png' },
  { id: 'bet9ja', name: 'Bet9ja', imageSrc: '/images/betting_bet9ja.png' },
  { id: 'betway', name: 'Betway', imageSrc: '/images/betting_betway.png' },
  { id: 'kingbet', name: 'KingBet', imageSrc: '/images/betting_kingbet.png' },
  { id: 'merrybet', name: 'MerryBet', imageSrc: '/images/betting_merrybet.png' },
];

const EDUCATION_PROVIDERS: ProviderItem[] = [
  { id: 'waec', name: 'WAEC', imageSrc: '/images/network_mtn.png' },
  { id: 'jamb', name: 'JAMB', imageSrc: '/images/network_airtel.png' },
  { id: 'neco', name: 'NECO', imageSrc: '/images/network_glo.png' },
];

export default function ServiceDetailPage({ initialSlug = 'airtime' }: ServiceDetailPageProps) {
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [slugFromProp, setSlugFromProp] = useState(initialSlug);
  const [isFading, setIsFading] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [formResetKey, setFormResetKey] = useState(0);

  if (initialSlug !== slugFromProp) {
    setSlugFromProp(initialSlug);
    setActiveSlug(initialSlug);
  }

  useEffect(() => {
    const handlePopState = () => {
      const parts = window.location.pathname.split('/');
      const slugFromUrl = parts[parts.length - 1];
      if (slugFromUrl && slugFromUrl !== activeSlug) {
        setIsFading(true);
        setTimeout(() => {
          setActiveSlug(slugFromUrl);
          setIsFading(false);
        }, 150);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeSlug]);

  const handleServiceClick = (slug: string) => {
    if (slug === activeSlug) return;

    setIsFading(true);
    setTimeout(() => {
      setActiveSlug(slug);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/categories/${slug}`);
      }
      setTimeout(() => {
        setIsFading(false);
      }, 50);
    }, 150);
  };

  const currentProviders =
    activeSlug === 'airtime' || activeSlug === 'data'
      ? NETWORK_PROVIDERS
      : activeSlug === 'electricity'
        ? ELECTRICITY_PROVIDERS
        : activeSlug === 'tv'
          ? TV_PROVIDERS
          : activeSlug === 'betting'
            ? BETTING_PROVIDERS
            : EDUCATION_PROVIDERS;

  const handleValidated = (payment: PendingPayment) => {
    setPendingPayment(payment);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmModalOpen(false);
      setTransactionRef('TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase());
      setIsSuccessModalOpen(true);
    }, 1200);
  };

  const handleReset = () => {
    setIsSuccessModalOpen(false);
    setPendingPayment(null);
    setFormResetKey((k) => k + 1);
  };

  const heroContent = {
    airtime: {
      headlineOrange: 'Airtime, ',
      headlineWhite: 'instantly',
      body: "Recharge any Nigerian network in seconds, whether it's your own line or a loved one's. Enter the number, pick an amount from ₦100 upwards, and the credit lands straight away. You also earn cashback on every top-up, so staying in touch gives something back.",
      image: '/images/airtime_hero_2x.png',
      cardTitle: 'Top up in seconds',
      cardSubtitle: 'Enter a number, pick an amount and you’re done. No account needed.',
    },
    data: {
      headlineOrange: 'Stay connected ',
      headlineWhite: 'for less',
      body: 'Choose from daily, weekly and monthly data bundles for MTN, Airtel, Glo and 9mobile, all at clear, upfront prices. Pick the plan that fits how you browse, stream or work, and it activates within moments. No hidden charges, and no need to dial codes.',
      image: '/images/data_hero.png',
      cardTitle: 'One home for every service',
      cardSubtitle: 'Airtime, data, bills and more. Everything you pay for, all in one place.',
    },
    electricity: {
      headlineWhite: 'Keep the ',
      headlineOrange: 'lights on',
      body: 'Buy prepaid tokens or pay postpaid bills for your distribution company without queuing or travelling. Enter your meter number, confirm the name on the account, and get your token instantly on screen and by email. It works at any hour, even when power is out',
      image: '/images/bills_hero.png',
      cardTitle: 'Pay any bill, anytime',
      cardSubtitle: 'Electricity, TV, betting and more, settled instantly without queues or extra apps.',
    },
    tv: {
      headlineOrange: 'Never miss ',
      headlineWhite: 'your show',
      body: 'Renew or change your DStv, GOtv or StarTimes package in a few taps. Just enter your smartcard or IUC number, choose a plan, and your subscription is refreshed right away. That means no blank screens on match day or finale night.',
      image: '/images/bills_hero.png',
      cardTitle: 'Pay any bill, anytime',
      cardSubtitle: 'Electricity, TV, betting and more, settled instantly without queues or extra apps.',
    },
    betting: {
      headlineOrange: 'Fund ',
      headlineWhite: 'your wallet fast',
      body: 'Add money to your Bet9ja, SportyBet or 1xBet account in seconds, with no bank trips or delays. Your payment is encrypted and credited straight to your betting wallet. Please bet responsibly and only stake what you can afford to lose.',
      image: '/images/bills_hero.png',
      cardTitle: 'Pay any bill, anytime',
      cardSubtitle: 'Electricity, TV, betting and more, settled instantly without queues or extra apps.',
    },
  }[activeSlug] || {
    headlineOrange: `${activeSlug.replace('-', ' ').toUpperCase()}, `,
    headlineWhite: 'instantly',
    body: 'Fulfill digital transactions instantly and securely across top providers in Nigeria.',
    image: '/images/airtime_hero_2x.png',
    cardTitle: 'Pay instantly',
    cardSubtitle: 'Safe and encrypted digital payments on XNETT.',
  };

  return (
    <div className="relative min-h-screen bg-[#1B3C4A] text-white selection:bg-[#FF6500] selection:text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
        <svg
          className="absolute -top-40 -left-40 h-[1200px] w-[1400px]"
          viewBox="0 0 1000 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -100 200 C 150 150, 250 400, 500 320 C 750 240, 850 480, 1100 420"
            stroke="#1E4757"
            strokeWidth="1.6"
            strokeDasharray="6 8"
          />
          <path
            d="M -100 350 C 180 300, 320 550, 600 480 C 880 410, 920 620, 1150 580"
            stroke="#1E4757"
            strokeWidth="1.6"
          />
          <path
            d="M -50 500 C 220 460, 380 680, 700 620 C 1020 560, 980 750, 1200 700"
            stroke="#1E4757"
            strokeWidth="1.4"
          />
        </svg>
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 xl:px-0 pt-4 pb-24">
        <section
          className={`mt-4 mb-12 sm:mb-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14 w-full transition-all duration-300 ease-out ${
            isFading ? 'opacity-30 scale-[0.99] blur-[0.4px]' : 'opacity-100 scale-100 blur-0'
          }`}
        >
          <div className="flex flex-col lg:col-span-6 xl:col-span-7 min-h-[220px] sm:min-h-[250px] justify-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl transition-all duration-300">
              <span className="text-[#FF6500]">{heroContent.headlineOrange}</span>
              <span className="text-white">{heroContent.headlineWhite}</span>
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base min-h-[72px]">
              {heroContent.body}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-700/60 bg-[#1E3A46]/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6500]/20 text-[#FF6500]">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                </div>
                <span className="text-xs font-medium text-slate-200 sm:text-sm">
                  Instant delivery, usually under few seconds
                </span>
              </div>

              <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-700/60 bg-[#1E3A46]/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6500]/20 text-[#FF6500]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-slate-200 sm:text-sm">
                  Bank-grade encryption on every payment
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-6 xl:col-span-5">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/60 bg-[#25414C] p-3.5 shadow-2xl transition-all duration-300 hover:border-slate-600 sm:p-4">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-900 shadow-inner">
                <Image
                  src={heroContent.image}
                  alt={heroContent.cardTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  priority
                  className="object-cover object-center transition-opacity duration-300"
                />
              </div>

              <div className="mt-3.5 flex items-center justify-between px-1.5 py-1">
                <div>
                  <h3 className="text-sm font-bold text-white sm:text-base">
                    {heroContent.cardTitle}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-300">{heroContent.cardSubtitle}</p>
                </div>

                <div className="flex items-end gap-1 pl-3">
                  <span className="h-5 w-1.5 rounded-full bg-[#FF6500]" />
                  <span className="h-3.5 w-1.5 rounded-full bg-[#64748B]" />
                  <span className="h-2 w-1.5 rounded-full bg-[#475569]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServiceTabsSelector activeSlug={activeSlug} onSelectService={handleServiceClick} />

        <section className="my-10 flex justify-center">
          <ServicePaymentForm
            activeSlug={activeSlug}
            providers={currentProviders}
            isFading={isFading}
            onValidated={handleValidated}
            formResetKey={formResetKey}
          />
        </section>
      </main>

      {isConfirmModalOpen && pendingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 capitalize">
                Review {pendingPayment.slug} Payment
              </h3>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-5 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-[#EEF7FB] p-3.5">
                <span className="text-slate-500">Service</span>
                <span className="font-bold text-slate-900 capitalize">{pendingPayment.slug}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#EEF7FB] p-3.5">
                <span className="text-slate-500">Provider</span>
                <div className="flex items-center gap-2">
                  <img
                    src={pendingPayment.providerImage}
                    alt={pendingPayment.providerName}
                    className="h-6 w-6 rounded-full object-contain"
                  />
                  <span className="font-bold text-slate-900">{pendingPayment.providerName}</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#EEF7FB] p-3.5">
                <span className="text-slate-500">Recipient / Identifier</span>
                <span className="font-bold text-slate-900">{pendingPayment.recipientNumber}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#EEF7FB] p-3.5">
                <span className="text-slate-500">Total Amount</span>
                <span className="text-base font-extrabold text-[#FF6500]">
                  ₦
                  {pendingPayment.amount.toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {pendingPayment.email && (
                <div className="flex items-center justify-between rounded-xl bg-[#EEF7FB] p-3.5">
                  <span className="text-slate-500">Receipt Email</span>
                  <span className="font-medium text-slate-800">{pendingPayment.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6500] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#E04B14] active:scale-[0.99] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing Transaction...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>
                      Confirm & Pay ₦{pendingPayment.amount.toLocaleString()}
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-full rounded-xl py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && pendingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-center text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>

            <h3 className="mt-4 text-xl font-black text-slate-900">Payment Successful!</h3>
            <p className="mt-1 text-xs text-slate-500">
              Your {pendingPayment.slug} transaction has been processed instantly.
            </p>

            <div className="my-5 rounded-2xl bg-[#EEF7FB] p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-slate-900">
                  ₦
                  {pendingPayment.amount.toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Provider:</span>
                <span className="font-bold text-slate-900">{pendingPayment.providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Identifier:</span>
                <span className="font-bold text-slate-900">
                  {pendingPayment.recipientNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-800">{transactionRef}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-xl bg-[#FF6500] py-3 text-sm font-bold text-white shadow transition hover:bg-[#E04B14]"
              >
                Make Another Payment
              </button>
              <Link
                href="/"
                className="block w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Return to Marketplace
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

interface BankItem {
  id: string;
  name: string;
  slug: string;
  code: string;
  logo: string;
  url: string;
  description: string;
}

const BANKS_LIST: BankItem[] = [
  {
    id: 'ibile',
    name: 'IBILE MFB',
    slug: 'ibile-mfb',
    code: 'IBILE',
    logo: '/images/bank_ibile_hq.png',
    url: 'https://ibilemfb.com',
    description: 'Licensed by the Central Bank of Nigeria to deliver innovative microfinance and retail banking services.',
  },
  {
    id: 'ab',
    name: 'AB MFB',
    slug: 'ab-mfb',
    code: 'AB',
    logo: '/images/bank_ab_mfb_hq.png',
    url: 'https://ab-mfb.com',
    description: 'Providing accessible financial solutions, digital transfers, and business credit across Nigeria.',
  },
  {
    id: 'moneytrust',
    name: 'Moneytrust MFB',
    slug: 'moneytrust-mfb',
    code: 'MONEYTRUST',
    logo: '/images/bank_moneytrust.png',
    url: 'https://moneytrustmfb.com',
    description: 'Secure, modern digital banking tailored for individuals and emerging commercial enterprises.',
  },
  {
    id: 'fastcredit',
    name: 'Fast Credit',
    slug: 'fast-credit',
    code: 'FASTCREDIT',
    logo: '/images/bank_fastcredit.png',
    url: 'https://fastcredit-ng.com',
    description: 'Fast digital lending, account top-ups, and frictionless bill settlement solutions.',
  },
  {
    id: 'fastcredit_degraded',
    name: 'Fast Credit',
    slug: 'fast-credit-2',
    code: 'FASTCREDIT',
    logo: '/images/bank_fastcredit_degraded.png',
    url: 'https://fastcredit-ng.com',
    description: 'Secondary settlement gateway experiencing occasional network latency.',
  },
  {
    id: 'koins',
    name: 'Koins MFB',
    slug: 'koins-mfb',
    code: 'KOINS',
    logo: '/images/bank_koins.png',
    url: 'https://koinsmfb.com',
    description: 'Next-generation digital microfinance platform supporting smart savings, cards, and daily transactions.',
  },
  {
    id: 'hasal',
    name: 'Hasal MFB',
    slug: 'hasal-mfb',
    code: 'HASAL',
    logo: '/images/bank_hasal.png',
    url: 'https://hasalmfb.com',
    description: 'Serving businesses and households with tailored deposit accounts and instant merchant settlement.',
  },
  {
    id: 'alert',
    name: 'Alert Group',
    slug: 'alert-group',
    code: 'ALERT',
    logo: '/images/bank_alert_group.png',
    url: 'https://alertgroup.com.ng',
    description: 'Specialized retail micro-lending and automated virtual account management services.',
  },
  {
    id: 'ajo',
    name: 'Ajo Card',
    slug: 'ajo-card',
    code: 'AJO',
    logo: '/images/bank_ajo_card.png',
    url: 'https://ajocard.com',
    description: 'Smart cooperative contributions, digital debit cards, and wallet services.',
  },
  {
    id: 'bowen',
    name: 'Bowen MFB',
    slug: 'bowen-mfb',
    code: 'BOWEN',
    logo: '/images/bank_bowen.png',
    url: 'https://bowenmicrofinancebank.com',
    description: 'Pioneering community-first commercial microfinance and student educational financial services.',
  },
];

/* ─── Small inline lock SVG ─────────────────────────────────────────────── */
function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function BanksSection() {
  const [selectedBank, setSelectedBank] = useState<BankItem | null>(null);

  return (
    <section
      id="banks-section"
      className="relative bg-white px-4 py-24 sm:px-8 lg:px-14 text-slate-900"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E95312]">
            Banks
          </span>
          <h2 className="text-3xl font-black tracking-tight text-[#0F2833] sm:text-4xl lg:text-5xl">
            Bank the way you already do,
            <span className="block mt-1 font-extrabold text-[#0F2833]">
              just in one place
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
            Select your bank to go straight to your app or internet banking.
          </p>
        </div>

        {/* 10 Bank Cards Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:gap-4">
          {BANKS_LIST.map((bank) => (
            <button
              key={bank.id}
              onClick={() => setSelectedBank(bank)}
              type="button"
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs text-left transition-shadow duration-200 hover:shadow-md hover:border-slate-300 h-[200px] sm:h-[220px]"
            >
              {/* Logo taking full space of card */}
              <div className="relative flex-1 w-full bg-white p-5 flex items-center justify-center">
                <div className="relative h-full w-full">
                  <Image
                    src={bank.logo}
                    alt={bank.name}
                    fill
                    quality={95}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-2"
                  />
                </div>
              </div>

              {/* Bottom opaque bar with Bank Name and Arrow */}
              <div className="w-full bg-slate-50/95 border-t border-slate-100 px-3.5 py-2.5 flex items-center justify-between backdrop-blur-xs">
                <span className="text-xs sm:text-[13px] font-bold text-[#0F2833] truncate">
                  {bank.name}
                </span>
                <div className="flex-shrink-0 ml-1 text-[#E95312]">
                  <ArrowUpRight className="h-4 w-4 stroke-[2.2]" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* See all Banks */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/banks"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#102A36] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-[#183946] active:scale-95"
          >
            <span>See all Banks</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ── Bank Opening Modal ─────────────────────────────────────────────── */}
      {selectedBank && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelectedBank(null)}
        >
          {/* Card */}
          <div className="w-full max-w-sm rounded-3xl bg-white px-6 pt-8 pb-5 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            {/* Bank logo — left-aligned */}
            <div className="flex mb-5">
              <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-[#F4F7F9] p-2.5 border border-slate-100">
                <Image
                  src={selectedBank.logo}
                  alt={selectedBank.name}
                  fill
                  sizes="72px"
                  className="object-contain p-2"
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[#0F2833] mb-2">
              Continue to {selectedBank.name}
            </h3>

            {/* Privacy copy */}
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              You&apos;re about to open {selectedBank.name}&apos;s secure banking service.
              Hatiso will never see your username, password, PIN, or account details.
            </p>

            {/* Secure destination card */}
            <div className="rounded-xl border border-slate-200 px-4 py-3.5 mb-6 flex items-center gap-3">
              <div className="flex-shrink-0 text-emerald-500">
                <LockIcon />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                  Secure Destination
                </p>
                <p className="text-sm font-bold text-[#0F2833] truncate">
                  {selectedBank.name} Banking
                </p>
                <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                  Verified external service
                </p>
              </div>
            </div>

            {/* Stacked buttons */}
            <div className="flex flex-col gap-3">
              <a
                href={selectedBank.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedBank(null)}
                className="w-full rounded-xl bg-[#FF6500] py-3.5 text-center text-sm font-bold text-white hover:bg-[#E84D15] active:scale-[0.98] transition-all duration-150"
              >
                Continue to bank
              </a>
              <button
                type="button"
                onClick={() => setSelectedBank(null)}
                className="w-full rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-[#0F2833] hover:bg-slate-50 active:scale-[0.98] transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

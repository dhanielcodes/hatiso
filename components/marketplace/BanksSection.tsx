'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

interface BankItem {
  id: string;
  name: string;
  slug: string;
  code: string;
  logo: React.ReactNode;
  url?: string;
}

const BANKS_LIST: BankItem[] = [
  {
    id: 'ibile',
    name: 'IBILE MFB',
    slug: 'ibile-mfb',
    code: 'IBILE',
    logo: (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5EB533] text-white font-black text-sm">
          i
        </div>
        <span className="text-[7px] font-black tracking-tight text-[#2D5A1B] mt-0.5">IBILE</span>
      </div>
    ),
  },
  {
    id: 'ab',
    name: 'AB MFB',
    slug: 'ab-mfb',
    code: 'AB',
    logo: (
      <div className="flex items-center justify-center gap-0.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white font-bold text-[9px] shadow-xs">
          🌐
        </div>
        <span className="font-serif font-black text-xs tracking-tight text-[#0369A1]">AB</span>
      </div>
    ),
  },
  {
    id: 'moneytrust',
    name: 'Moneytrust MFB',
    slug: 'moneytrust-mfb',
    code: 'MONEYTRUST',
    logo: (
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
          <path d="M6 24L16 6L26 24H21L16 14L11 24H6Z" fill="#F97316" />
          <path d="M16 15L21 24H11L16 15Z" fill="#10B981" />
        </svg>
      </div>
    ),
  },
  {
    id: 'boa',
    name: 'BOA',
    slug: 'boa',
    code: 'BOA',
    logo: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center -space-x-1">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#15803D] text-[7px] font-bold text-white">B</div>
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#15803D] text-[7px] font-bold text-white ring-1 ring-white">O</div>
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#15803D] text-[7px] font-bold text-white">A</div>
        </div>
        <span className="text-[6px] font-semibold text-[#15803D] mt-0.5 scale-90">AGRICULTURE</span>
      </div>
    ),
  },
  {
    id: 'fastcredit',
    name: 'Fast Credit',
    slug: 'fast-credit',
    code: 'FASTCREDIT',
    logo: (
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-0.5">
          <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#DC2626] text-[8px] font-bold text-white">FC</div>
          <span className="text-[8px] font-black tracking-tighter text-[#1E3A8A]">FASTCREDIT</span>
        </div>
      </div>
    ),
  },
  {
    id: 'koins',
    name: 'Koins MFB',
    slug: 'koins-mfb',
    code: 'KOINS',
    logo: (
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-0.5 rounded-full bg-[#16A34A] px-2 py-0.5 text-white">
          <span className="text-[7px]">◖</span>
          <span className="text-[9px] font-black tracking-tight">Koins</span>
        </div>
      </div>
    ),
  },
  {
    id: 'hasal',
    name: 'Hasal MFB',
    slug: 'hasal-mfb',
    code: 'HASAL',
    logo: (
      <div className="flex flex-col items-center justify-center border border-[#DC2626] bg-[#DC2626]/5 px-1 py-0.5 rounded">
        <div className="flex items-center gap-0.5">
          <span className="bg-[#DC2626] px-1 text-[8px] font-black text-white rounded-[1px]">H</span>
          <span className="text-[8px] font-bold text-[#1E3A8A]">HASAL</span>
        </div>
      </div>
    ),
  },
  {
    id: 'alert',
    name: 'Alert Group',
    slug: 'alert-group',
    code: 'ALERT',
    logo: (
      <div className="flex items-center justify-center gap-1">
        <div className="h-0 w-0 border-x-4 border-x-transparent border-b-[9px] border-b-[#EA580C]" />
        <div className="flex flex-col text-left leading-none">
          <span className="text-[7px] font-black tracking-tight text-slate-900">ALERT</span>
          <span className="text-[5px] font-semibold text-slate-500">GROUP</span>
        </div>
      </div>
    ),
  },
  {
    id: 'ajo',
    name: 'Ajo Card',
    slug: 'ajo-card',
    code: 'AJO',
    logo: (
      <div className="flex items-center justify-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#D97706]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 4V20" />
            <path d="M6 12L12 18L18 12" />
            <path d="M4 8L12 16L20 8" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    id: 'bowen',
    name: 'Bowen MFB',
    slug: 'bowen-mfb',
    code: 'BOWEN',
    logo: (
      <div className="flex items-center justify-center gap-0.5">
        <div className="flex h-4 w-4 items-center justify-center rounded bg-[#1E3A8A] text-[9px] font-black text-[#F59E0B]">B</div>
        <span className="text-[8px] font-black tracking-tight text-[#1E3A8A]">BOWEN</span>
      </div>
    ),
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

/* ─── Section header label ──────────────────────────────────────────────── */
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
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6500]">
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
              className="group relative flex flex-col items-center justify-between rounded-2xl bg-[#EAEFF2] p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:bg-[#E2E8EC] hover:ring-2 hover:ring-[#FF6500]/30 active:scale-95"
              style={{ minHeight: '200px' }}
            >
              <div className="absolute top-3 right-3 text-[#FF6500] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div className="my-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white p-2 shadow-xs transition-transform duration-200 group-hover:scale-105">
                {bank.logo}
              </div>
              <span className="text-xs font-semibold text-[#0F2833] transition-colors group-hover:text-[#FF6500] sm:text-sm">
                {bank.name}
              </span>
            </button>
          ))}
        </div>

        {/* See all Banks */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setSelectedBank(BANKS_LIST[0])}
            className="group inline-flex items-center gap-2 rounded-xl bg-[#102A36] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-[#183946] active:scale-95"
          >
            <span>See all Banks</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* ── Bank Opening Modal ─────────────────────────────────────────────── */}
      {selectedBank && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(90,100,105,0.50)', backdropFilter: 'blur(3px)' }}
          onClick={(e) => e.target === e.currentTarget && setSelectedBank(null)}
        >
          {/* Card */}
          <div className="w-full max-w-sm rounded-3xl bg-white px-6 pt-8 pb-5 shadow-2xl text-slate-900">

            {/* Bank logo — left-aligned */}
            <div className="flex mb-5">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-[#F4F7F9]">
                <div className="scale-[1.7]">{selectedBank.logo}</div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[#0F2833] mb-2">
              Continue to {selectedBank.name}
            </h3>

            {/* Privacy copy */}
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              You&apos;re about to open {selectedBank.name}&apos;s secure banking service.
              Hasito will never see your username, password, PIN, or account details.
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
              <button
                onClick={() => {
                  alert(`Redirecting to ${selectedBank.name} online portal…`);
                  setSelectedBank(null);
                }}
                className="w-full rounded-xl bg-[#FF6500] py-3.5 text-sm font-bold text-white hover:bg-[#E84D15] active:scale-[0.98] transition-all duration-150"
              >
                Continue to bank
              </button>
              <button
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

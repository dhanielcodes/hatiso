'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Landmark,
  ChevronRight,
  ShieldCheck,
  X,
  Loader2,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import OtpInput from '@/components/auth/OtpInput';
import { useAuthStore } from '@/lib/store/authStore';

export interface BankCardItem {
  id: string;
  name: string;
  logo: string;
  badge?: 'Popular' | 'Recently used' | 'Maintenance';
  subtitle?: string;
  url: string;
  categories: Array<'All' | 'Popular' | 'Recently used' | 'Maintenance'>;
}

const BANKS: BankCardItem[] = [
  {
    id: 'ibile',
    name: 'IBILE MFB',
    logo: '/images/bank_ibile_hq.png',
    badge: 'Popular',
    subtitle: 'Internet & Mobile Banking',
    url: 'https://ibilemfb.com',
    categories: ['All', 'Popular'],
  },
  {
    id: 'ab_mfb',
    name: 'AB MFB',
    logo: '/images/bank_ab_mfb_hq.png',
    subtitle: 'Internet & Mobile Banking',
    url: 'https://ab-mfb.com',
    categories: ['All'],
  },
  {
    id: 'moneytrust',
    name: 'Moneytrust MFB',
    logo: '/images/bank_moneytrust.png',
    badge: 'Recently used',
    subtitle: 'Internet & Mobile Banking',
    url: 'https://moneytrustmfb.com',
    categories: ['All', 'Recently used'],
  },
  {
    id: 'boa',
    name: 'BOA',
    logo: '/images/bank_boa.png',
    subtitle: 'Internet & Mobile Banking',
    url: 'https://bankofagricultureng.com',
    categories: ['All'],
  },
  {
    id: 'hasal',
    name: 'Hasal MFB',
    logo: '/images/bank_hasal.png',
    subtitle: 'Internet & Mobile Banking',
    url: 'https://hasalmfb.com',
    categories: ['All'],
  },
  {
    id: 'koins',
    name: 'Koins MFB',
    logo: '/images/bank_koins.png',
    subtitle: 'Internet & Mobile Banking',
    url: 'https://koinsmfb.com',
    categories: ['All'],
  },
  {
    id: 'fastcredit',
    name: 'Fast Credit',
    logo: '/images/bank_fastcredit.png',
    badge: 'Maintenance',
    subtitle: 'Internet & Mobile Banking',
    url: 'https://fastcredit-ng.com',
    categories: ['All', 'Maintenance'],
  },
  {
    id: 'alert_group',
    name: 'Alert Group',
    logo: '/images/bank_alert_group.png',
    subtitle: 'Internet & Mobile Banking',
    url: 'https://alertgroup.com.ng',
    categories: ['All'],
  },
  {
    id: 'bowen',
    name: 'Bowen MFB',
    logo: '/images/bank_bowen.png',
    badge: 'Popular',
    subtitle: 'Internet & Mobile Banking',
    url: 'https://bowenmicrofinancebank.com',
    categories: ['All', 'Popular'],
  },
  {
    id: 'ajo_card',
    name: 'Ajo Card',
    logo: '/images/bank_ajo_card.png',
    badge: 'Maintenance',
    subtitle: 'Internet & Mobile Banking',
    url: 'https://ajocard.com',
    categories: ['All', 'Maintenance'],
  },
];

type FilterTab = 'All' | 'Popular' | 'Recently used' | 'Maintenance';

export default function BankingPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  // Redirection Modal State
  const [selectedBank, setSelectedBank] = useState<BankCardItem | null>(null);
  const [modalStep, setModalStep] = useState<'phone' | 'otp' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('+234 904 637 3748');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState(false);

  // Sync phone from user profile if available
  React.useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  // Filter banks
  const filteredBanks = useMemo(() => {
    return BANKS.filter((bank) => {
      // Tab filter
      if (activeTab !== 'All' && !bank.categories.includes(activeTab)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          bank.name.toLowerCase().includes(query) ||
          (bank.subtitle && bank.subtitle.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  // Open modal step 1
  const handleBankClick = (bank: BankCardItem) => {
    setSelectedBank(bank);
    setModalStep('phone');
    setOtp('');
    setOtpError(false);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedBank(null);
    setModalStep(null);
    setOtp('');
    setOtpError(false);
    setIsVerifying(false);
  };

  // Handle step 1 continue
  const handleContinueToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setModalStep('otp');
    toast.success(`OTP code sent to ${phoneNumber}`);
  };

  // Handle step 2 verify & redirect
  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      setOtpError(true);
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    setOtpError(false);

    setTimeout(() => {
      setIsVerifying(false);
      if (selectedBank) {
        toast.success(`Verified! Opening ${selectedBank.name}...`);
        window.open(selectedBank.url, '_blank', 'noopener,noreferrer');
      }
      handleCloseModal();
    }, 800);
  };

  // Badge styling helper
  const renderBadge = (badge: BankCardItem['badge']) => {
    if (!badge) return null;

    if (badge === 'Popular') {
      return (
        <span className="rounded-full bg-[#EEF2F6] px-2 py-0.5 text-[11px] font-medium text-[#4B5563]">
          Popular
        </span>
      );
    }
    if (badge === 'Recently used') {
      return (
        <span className="rounded-full bg-[#E6F8ED] px-2 py-0.5 text-[11px] font-medium text-[#1E7E44]">
          Recently used
        </span>
      );
    }
    if (badge === 'Maintenance') {
      return (
        <span className="rounded-full bg-[#FEF6E6] px-2 py-0.5 text-[11px] font-medium text-[#B7791F]">
          Maintenance
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-full bg-[#FFFAF7] space-y-6">
      {/* Top Header */}
      <section className="border-b border-[#F0E9E5] px-5 py-7 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#FF6500]">Banking</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#20232A] sm:text-3xl">Your bank is <span className="text-[#FF6500]">one tap away.</span></h2>
        <p className="mt-2 text-sm text-[#777486] sm:text-base">Visit your bank's secure digital banking service. Hatiso never sees or stores your login details.</p>
      </section>

      {/* Security Handoff Cyan Banner */}
      <section className='px-5 sm:px-8 space-y-6'>
        <div className="flex items-center gap-3 rounded-xl border border-[#CFE8EC] bg-[#EAF6F8] px-4 py-3 text-xs sm:text-sm text-[#1B3C4A]">
          <Landmark className="h-5 w-5 shrink-0 text-[#147D8F]" />
          <span>
            A secure handoff, every time. You&apos;ll always see where you&apos;re going before leaving Hatiso.
          </span>
        </div>
        {/* Search and Filter Tabs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09D9B]" />
            <input
              type="text"
              placeholder="Search services or provider"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#E8E3DF] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1B3C4A] placeholder:text-[#A09D9B] focus:border-[#FF6500] focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Popular', 'Recently used', 'Maintenance'] as FilterTab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${isActive
                    ? 'bg-[#1B3C4A] text-white'
                    : 'border border-[#E8E3DF] bg-white text-[#524E4E] hover:bg-[#F9F7F5]'
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </section>


      {/* Section Subheader */}
      <section className='px-5 py-7 space-y-6 sm:px-8'>
        <div>
          <p className="text-sm font-medium text-[#656160]">
            Where would you like to bank today?
          </p>
        </div>

        {/* Bank Cards Grid */}
        {filteredBanks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DDD7D2] bg-white p-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-[#C4C0BE]" />
            <h3 className="mt-3 text-base font-semibold text-[#1B3C4A]">No banks found</h3>
            <p className="mt-1 text-xs text-[#8A8583]">
              No partner banks matched your search query. Try searching with a different keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBanks.map((bank) => (
              <div
                key={bank.id}
                onClick={() => handleBankClick(bank)}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-[#EDE8E4] bg-white p-4 sm:p-5 transition-all hover:border-[#FF6500]/50 hover:shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  {/* Bank Logo */}
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1">
                    <Image
                      src={bank.logo}
                      alt={bank.name}
                      width={96}
                      height={96}
                      quality={100}
                      sizes="96px"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-[#1B3C4A] sm:text-base">
                        {bank.name}
                      </h3>
                      {renderBadge(bank.badge)}
                    </div>
                    <p className="mt-0.5 text-xs text-[#8A8583]">
                      {bank.subtitle || 'Internet & Mobile Banking'}
                    </p>
                  </div>
                </div>

                {/* Right Chevron */}
                <ChevronRight className="h-4 w-4 shrink-0 text-[#C4C0BE] transition-transform group-hover:translate-x-0.5 group-hover:text-[#FF6500]" />
              </div>
            ))}
          </div>
        )}

        {/* Bottom Protected Verified Banks Banner */}
        <div className="relative flex min-h-[120px] items-center overflow-hidden rounded-2xl bg-[#D6EEE2]">
          {/* Left: text content */}
          <div className="z-10 shrink-0 px-6 py-6 sm:px-8">
            {/* PROTECTED pill */}
            <span className="inline-block rounded-full bg-[#B7DEC9] px-3 py-1 text-[10px] font-semibold tracking-widest text-[#2D7A56] uppercase">
              PROTECTED
            </span>
            <h3 className="mt-3 text-xl font-extrabold text-[#0F2A1E] sm:text-2xl">
              Verified banks only
            </h3>
            <p className="mt-1 text-xs text-[#6B8C7A] sm:text-sm">
              Every bank you can reach from Hatiso is registered and approved
            </p>
          </div>

          {/* Centre: CBN logo + label — absolutely centred horizontally */}
          <div className="absolute left-[80%] hidden -translate-x-1/2 items-center gap-2.5 sm:flex">
            <Image
              src="/cbn.svg"
              alt="Central Bank of Nigeria"
              width={206}
              height={206}
              className="object-contain"
              quality={95}
            />

          </div>

          {/* Right: banking.png — anchored to right edge, partially overflowing top */}
          <div className="absolute bottom-0 right-0 top-0 w-44 sm:w-52">
            <Image
              src="/banking.svg"
              alt=""
              fill
              className="object-cover object-left"
              quality={95}
              aria-hidden="true"
            />
          </div>
        </div>

      </section>

      {/* ── 2-STEP REDIRECTION MODAL ─────────────────────────────────── */}
      {modalStep && selectedBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
            {/* Bank Logo */}
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#EDE8E4] bg-white p-1.5">
              <Image
                src={selectedBank.logo}
                alt={selectedBank.name}
                width={112}
                height={112}
                quality={100}
                sizes="56px"
                className="h-11 w-11 object-contain"
              />
            </div>

            {/* STEP 1: Phone Number */}
            {modalStep === 'phone' && (
              <form onSubmit={handleContinueToOtp} className="mt-4">
                <h2 className="text-xl font-bold text-[#1B3C4A]">
                  Continue to {selectedBank.name}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#736F6D] sm:text-sm">
                  You&apos;re about to open {selectedBank.name}&apos;s secure banking service. Hatiso will never see your username, password, PIN, or account details. Enter phone number to proceed to bank
                </p>

                <div className="mt-6">
                  <label className="block text-xs font-semibold text-[#3E3A39]">
                    Phone Number <span className="text-[#FF6500]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+234 904 637 3748"
                    className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm font-medium text-[#1B3C4A] placeholder:text-[#94A3B8] focus:border-[#FF6500] focus:outline-none"
                    required
                  />
                </div>

                <div className="mt-6 space-y-2.5">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#FF6500] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#E55B00] active:scale-[0.99]"
                  >
                    Continue to bank
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 text-sm font-medium text-[#495057] transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: OTP Verification */}
            {modalStep === 'otp' && (
              <div className="mt-4">
                <h2 className="text-xl font-bold text-[#1B3C4A]">
                  Continue to {selectedBank.name}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#736F6D] sm:text-sm">
                  An OTP (One-Time Password) has been sent to your phone number. Enter OTP below to verify your phone number.
                </p>

                <div className="mt-6">
                  <OtpInput
                    length={6}
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      if (otpError) setOtpError(false);
                    }}
                    hasError={otpError}
                    autoFocus
                  />
                </div>

                <div className="mt-6 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifying}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6500] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#E55B00] disabled:opacity-60 active:scale-[0.99]"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying identity...</span>
                      </>
                    ) : (
                      'Verify identity'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isVerifying}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 text-sm font-medium text-[#495057] transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


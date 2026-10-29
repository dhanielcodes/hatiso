'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  ArrowLeftRight,
  Menu,
  Check,
  ExternalLink,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';

export interface BankItem {
  id: string;
  name: string;
  logo: string;
  status: 'Online' | 'Degraded' | 'Down';
  services: string[];
  websiteUrl: string;
  description?: string;
}

const BANKS_DATA: BankItem[] = [
  {
    id: 'ibile',
    name: 'IBILE MFB',
    logo: '/images/bank_ibile_hq.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD', 'Virtual account'],
    websiteUrl: 'https://ibilemfb.com',
    description: 'Licensed by the Central Bank of Nigeria to deliver innovative microfinance and retail banking services.',
  },
  {
    id: 'ab_mfb',
    name: 'AB MFB',
    logo: '/images/bank_ab_mfb_hq.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD'],
    websiteUrl: 'https://ab-mfb.com',
    description: 'Providing accessible financial solutions, digital transfers, and business credit across Nigeria.',
  },
  {
    id: 'moneytrust',
    name: 'Moneytrust MFB',
    logo: '/images/bank_moneytrust.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'USSD', 'Virtual account'],
    websiteUrl: 'https://moneytrustmfb.com',
    description: 'Secure, modern digital banking tailored for individuals and emerging commercial enterprises.',
  },
  {
    id: 'fastcredit',
    name: 'Fast Credit',
    logo: '/images/bank_fastcredit.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Virtual account', 'Card', 'USSD'],
    websiteUrl: 'https://fastcredit-ng.com',
    description: 'Fast digital lending, account top-ups, and frictionless bill settlement solutions.',
  },
  {
    id: 'fastcredit_degraded',
    name: 'Fast Credit',
    logo: '/images/bank_fastcredit_degraded.png',
    status: 'Degraded',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD', 'Virtual account'],
    websiteUrl: 'https://fastcredit-ng.com',
    description: 'Secondary settlement gateway experiencing occasional network latency.',
  },
  {
    id: 'koins',
    name: 'Koins MFB',
    logo: '/images/bank_koins.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD', 'Virtual account'],
    websiteUrl: 'https://koinsmfb.com',
    description: 'Next-generation digital microfinance platform supporting smart savings, cards, and daily transactions.',
  },
  {
    id: 'hasal',
    name: 'Hasal MFB',
    logo: '/images/bank_hasal.png',
    status: 'Degraded',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD', 'Virtual account'],
    websiteUrl: 'https://hasalmfb.com',
    description: 'Serving businesses and households with tailored deposit accounts and instant merchant settlement.',
  },
  {
    id: 'alert_group',
    name: 'Alert Group',
    logo: '/images/bank_alert_group.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'USSD', 'Virtual account'],
    websiteUrl: 'https://alertgroup.com.ng',
    description: 'Specialized retail micro-lending and automated virtual account management services.',
  },
  {
    id: 'ajo_card',
    name: 'Ajo Card',
    logo: '/images/bank_ajo_card.png',
    status: 'Down',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'Virtual account'],
    websiteUrl: 'https://ajocard.com',
    description: 'Scheduled maintenance currently in progress on gateway endpoints.',
  },
  {
    id: 'bowen',
    name: 'Bowen MFB',
    logo: '/images/bank_bowen.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'USSD', 'Virtual account'],
    websiteUrl: 'https://bowenmicrofinancebank.com',
    description: 'Pioneering community-first commercial microfinance and student educational financial services.',
  },
];

const ALL_SERVICES = ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD', 'Virtual account'];
const ALL_STATUSES: Array<'Online' | 'Degraded' | 'Down'> = ['Online', 'Degraded', 'Down'];

export default function BanksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBankNames, setSelectedBankNames] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBankModal, setSelectedBankModal] = useState<BankItem | null>(null);

  // Toggle bank checkbox
  const toggleBank = (name: string) => {
    setSelectedBankNames((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
  };

  // Toggle service checkbox
  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  // Toggle status checkbox
  const toggleStatus = (st: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedBankNames([]);
    setSelectedServices([]);
    setSelectedStatuses([]);
  };

  // Filtered Banks
  const filteredBanks = useMemo(() => {
    return BANKS_DATA.filter((bank) => {
      // 1. Search Query
      if (
        searchQuery &&
        !bank.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // 2. Bank Name checkbox filter
      if (selectedBankNames.length > 0 && !selectedBankNames.includes(bank.name)) {
        return false;
      }

      // 3. Service Supported filter (bank must support all checked services)
      if (
        selectedServices.length > 0 &&
        !selectedServices.every((srv) => bank.services.includes(srv))
      ) {
        return false;
      }

      // 4. Status filter
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(bank.status)
      ) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedBankNames, selectedServices, selectedStatuses]);

  const hasActiveFilters =
    searchQuery ||
    selectedBankNames.length > 0 ||
    selectedServices.length > 0 ||
    selectedStatuses.length > 0;

  return (
    <div className="min-h-screen bg-[#1B3C4A] text-white selection:bg-[#FF6500] selection:text-white flex flex-col justify-between">
      {/* ========================================================= */}
      {/* 1. TOP HERO SECTION (Dark Brand Theme)                    */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden bg-[#1B3C4A] pb-16 sm:pb-20">
        <Navbar />

        <div className="relative z-10 mx-auto max-w-7xl px-4 xl:px-0 pt-6 ">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: Heading & Description */}
            <div className="flex flex-col lg:col-span-7">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-[#FF6500]">Every bank.</span>
                <span className="block text-white mt-1">One place to choose from.</span>
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base max-w-xl">
                Discover digital services from trusted providers, manage your banking.
                Browse banks and fintechs, then tap any one to visit its official website.
                Hatisto takes you straight to the bank&apos;s own domain.
              </p>
            </div>

            {/* Right Column: Visual 3x2 Icon Tiles Grid */}
            <div className="flex justify-center lg:col-span-5 lg:justify-end">
              <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                {/* Tile 1: Lock/Shield (Orange) */}
                <div className="aspect-square rounded-2xl bg-[#B95828] border border-orange-400/30 flex items-center justify-center p-3.5 shadow-md">
                  <ShieldCheck className="h-8 w-8 text-[#1B3C4A] stroke-[2.2]" />
                </div>

                {/* Tile 2: Bank Pillars (Orange) */}
                <div className="aspect-square rounded-2xl bg-[#B95828] border border-orange-400/30 flex items-center justify-center p-3.5 shadow-md">
                  <Building2 className="h-8 w-8 text-[#1B3C4A] stroke-[2.2]" />
                </div>

                {/* Tile 3: Statement/Menu (Dark Outline) */}
                <div className="aspect-square rounded-2xl bg-[#1A3744] border border-white/20 flex items-center justify-center p-3.5 shadow-sm">
                  <Menu className="h-8 w-8 text-white stroke-[2.2]" />
                </div>

                {/* Tile 4: Document (Dark Outline) */}
                <div className="aspect-square rounded-2xl bg-[#1A3744] border border-white/20 flex items-center justify-center p-3.5 shadow-sm">
                  <FileText className="h-8 w-8 text-white stroke-[2.2]" />
                </div>

                {/* Tile 5: Credit Card (Orange) */}
                <div className="aspect-square rounded-2xl bg-[#B95828] border border-orange-400/30 flex items-center justify-center p-3.5 shadow-md">
                  <CreditCard className="h-8 w-8 text-[#1B3C4A] stroke-[2.2]" />
                </div>

                {/* Tile 6: Exchange Arrows (Orange) */}
                <div className="aspect-square rounded-2xl bg-[#B95828] border border-orange-400/30 flex items-center justify-center p-3.5 shadow-md">
                  <ArrowLeftRight className="h-8 w-8 text-[#1B3C4A] stroke-[2.2]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CHOOSE A BANK SECTION (Pure Crisp White Section)        */}
      {/* ========================================================= */}
      <section className="relative z-10 w-full bg-white py-14 sm:py-20 text-slate-900 flex-1">
        <div className="mx-auto max-w-7xl px-4 xl:px-0">
          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Choose a bank
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Filter by service supported, status and reliability before you tap to visit its official website
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
            {/* ---------------------------------------------------- */}
            {/* LEFT COLUMN: Filter Sidebar                          */}
            {/* ---------------------------------------------------- */}
            <aside className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-6">
              {/* Header with Clear button */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Filters</span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-[#FF6500] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* 1. Banks Search & Checkbox List */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Banks
                </h3>

                {/* Search Input */}
                <div className="relative mb-3 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus-within:border-[#FF6500] focus-within:ring-1 focus-within:ring-[#FF6500]">
                  <Search className="mr-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search banks"
                    className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Scrollable Checkbox List */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 no-scrollbar text-xs">
                  {Array.from(new Set(BANKS_DATA.map((b) => b.name))).map((bName) => {
                    const isChecked = selectedBankNames.includes(bName);
                    return (
                      <label
                        key={bName}
                        className="flex items-center gap-2.5 cursor-pointer select-none py-0.5 hover:text-[#FF6500] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBank(bName)}
                          className="h-4 w-4 rounded border-slate-300 text-[#FF6500] focus:ring-[#FF6500]"
                        />
                        <span className="font-medium text-slate-700">{bName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Service Supported */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Service Supported
                </h3>
                <div className="space-y-2 text-xs">
                  {ALL_SERVICES.map((srv) => {
                    const isChecked = selectedServices.includes(srv);
                    return (
                      <label
                        key={srv}
                        className="flex items-center gap-2.5 cursor-pointer select-none py-0.5 hover:text-[#FF6500] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleService(srv)}
                          className="h-4 w-4 rounded border-slate-300 text-[#FF6500] focus:ring-[#FF6500]"
                        />
                        <span className="font-medium text-slate-700">{srv}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Bank Status */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Bank Status
                </h3>
                <div className="space-y-2 text-xs">
                  {ALL_STATUSES.map((status) => {
                    const isChecked = selectedStatuses.includes(status);
                    const dotColor =
                      status === 'Online'
                        ? 'bg-emerald-500'
                        : status === 'Degraded'
                          ? 'bg-amber-500'
                          : 'bg-red-500';

                    return (
                      <label
                        key={status}
                        className="flex items-center justify-between cursor-pointer select-none py-0.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleStatus(status)}
                            className="h-4 w-4 rounded border-slate-300 text-[#FF6500] focus:ring-[#FF6500]"
                          />
                          <span className="font-medium text-slate-700">{status}</span>
                        </div>
                        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                      </label>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* ---------------------------------------------------- */}
            {/* RIGHT COLUMN: Banks Grid                             */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-8 xl:col-span-9">
              {/* Header Count */}
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  {filteredBanks.length} Banks
                </h3>
              </div>

              {/* Grid of Bank Cards */}
              {filteredBanks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-slate-300" />
                  <h4 className="mt-4 text-base font-bold text-slate-900">
                    No matching banks found
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Try adjusting your filters or search terms.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-4 rounded-xl bg-[#FF6500] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#E04B14]"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredBanks.map((bank, index) => {
                    const dotColor =
                      bank.status === 'Online'
                        ? 'bg-emerald-500'
                        : bank.status === 'Degraded'
                          ? 'bg-amber-500'
                          : 'bg-red-500';

                    return (
                      <div
                        key={`${bank.id}-${index}`}
                        onClick={() => setSelectedBankModal(bank)}
                        className="relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs cursor-pointer"
                      >
                        {/* Top Area: Logo, Name, Status, and External Arrow */}
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                              {/* Bank Logo: directly placed on white card without grey container */}
                              <div className="relative h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0">
                                <Image
                                  src={bank.logo}
                                  alt={bank.name}
                                  fill
                                  sizes="48px"
                                  className="object-contain"
                                />
                              </div>

                              {/* Bank Name & Status Badge */}
                              <div>
                                <h4 className="text-base font-bold text-slate-900 tracking-tight">
                                  {bank.name}
                                </h4>
                                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#EAEDEF] px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                  <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                                  <span>{bank.status}</span>
                                </div>
                              </div>
                            </div>

                            {/* External Arrow Indicator */}
                            <div className="text-[#FF5A1F] pt-0.5">
                              <ArrowUpRight className="h-5 w-5 stroke-[2.2]" />
                            </div>
                          </div>
                        </div>

                        {/* Divider Line */}
                        <div className="my-4 border-t border-slate-100" />

                        {/* Bottom Area: Service Supported Pills */}
                        <div className="flex flex-wrap gap-2">
                          {bank.services.map((srv) => (
                            <span
                              key={srv}
                              className="rounded-lg bg-[#F8ECE5] px-2.5 py-1 text-xs font-medium text-slate-800"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. EXTERNAL BANK REDIRECTION MODAL                        */}
      {/* ========================================================= */}
      {selectedBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative h-7 w-7 flex-shrink-0">
                  <Image
                    src={selectedBankModal.logo}
                    alt={selectedBankModal.name}
                    fill
                    sizes="28px"
                    className="rounded-lg object-contain"
                  />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedBankModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBankModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-5 space-y-3.5 text-xs text-slate-600">
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedBankModal.description}
              </p>

              <div className="rounded-xl bg-[#EEF7FB] p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Gateway Status:</span>
                  <span
                    className={`font-bold ${selectedBankModal.status === 'Online'
                      ? 'text-emerald-700'
                      : selectedBankModal.status === 'Degraded'
                        ? 'text-amber-700'
                        : 'text-red-700'
                      }`}
                  >
                    {selectedBankModal.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Official Domain:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {selectedBankModal.websiteUrl.replace('https://', '')}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1.5">
                  Supported Services:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBankModal.services.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-[#FDF2EC] px-2 py-0.5 text-[11px] font-medium text-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={selectedBankModal.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6500] py-3 text-center text-xs sm:text-sm font-bold text-white shadow transition hover:bg-[#E04B14]"
              >
                <span>Visit Bank&apos;s Official Website</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setSelectedBankModal(null)}
                className="w-full rounded-xl py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}


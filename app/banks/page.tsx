"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  ArrowLeftRight,
  Menu,
  ExternalLink,
  X,
  Search,
  ArrowUpRight,
} from "lucide-react";
import Navbar from "@/components/marketplace/Navbar";
import Footer from "@/components/marketplace/Footer";
import BankLogo from "@/components/banks/BankLogo";
import { useBanks } from "@/lib/queries/useBanks";
import type { Bank } from "@/lib/api/banks";
import {
  bankDomain,
  bankStatus,
  bankWebsite,
  channelLabels,
  STATUS_DOT,
  STATUS_TEXT,
} from "@/lib/banks/bankDisplay";

export default function BanksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBankNames, setSelectedBankNames] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBankModal, setSelectedBankModal] = useState<Bank | null>(null);
  const { data: banks = [], isLoading, isError, refetch } = useBanks();

  // Filter options come from the banks the API returns.
  const allChannels = useMemo(
    () => Array.from(new Set(banks.flatMap(channelLabels))),
    [banks],
  );
  const allStatuses = useMemo(
    () => Array.from(new Set(banks.map((b) => bankStatus(b).label))),
    [banks],
  );

  // Toggle bank checkbox
  const toggleBank = (name: string) => {
    setSelectedBankNames((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name],
    );
  };

  // Toggle service checkbox
  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv],
    );
  };

  // Toggle status checkbox
  const toggleStatus = (st: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st],
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedBankNames([]);
    setSelectedServices([]);
    setSelectedStatuses([]);
  };

  // Filtered Banks
  const filteredBanks = useMemo(() => {
    return banks.filter((bank) => {
      // 1. Search Query
      if (
        searchQuery &&
        !bank.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // 2. Bank Name checkbox filter
      if (
        selectedBankNames.length > 0 &&
        !selectedBankNames.includes(bank.name)
      ) {
        return false;
      }

      // 3. Service Supported filter (bank must support all checked services)
      if (
        selectedServices.length > 0 &&
        !selectedServices.every((srv) => channelLabels(bank).includes(srv))
      ) {
        return false;
      }

      // 4. Status filter
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(bankStatus(bank).label)
      ) {
        return false;
      }

      return true;
    });
  }, [
    banks,
    searchQuery,
    selectedBankNames,
    selectedServices,
    selectedStatuses,
  ]);

  const hasActiveFilters =
    searchQuery ||
    selectedBankNames.length > 0 ||
    selectedServices.length > 0 ||
    selectedStatuses.length > 0;

  return (
    <div className="min-h-screen bg-ink-662 text-white selection:bg-brand-361 selection:text-white flex flex-col justify-between">
      {/* ========================================================= */}
      {/* 1. TOP HERO SECTION (Dark Brand Theme)                    */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden bg-ink-662 pb-16 sm:pb-20">
        <Navbar />

        <div className="relative z-10 mx-auto max-w-7xl px-4 xl:px-0 pt-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: Heading & Description */}
            <div className="flex flex-col lg:col-span-7">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-brand-361">Every bank.</span>
                <span className="block text-white mt-1">
                  One place to choose from.
                </span>
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base max-w-xl">
                Discover digital services from trusted providers, manage your
                banking. Browse banks and fintechs, then tap any one to visit
                its official website. Hatiso takes you straight to the
                bank&apos;s own domain.
              </p>
            </div>

            {/* Right Column: Visual 3x2 Icon Tiles Grid */}
            <div className="flex justify-center lg:col-span-5 lg:justify-end">
              <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                {/* Tile 1: Lock/Shield (Orange) */}
                <div className="aspect-square rounded-2xl bg-brand-428 border border-orange-400/30 flex items-center justify-center p-3.5 shadow-md">
                  <ShieldCheck className="h-8 w-8 text-ink-662 stroke-[2.2]" />
                </div>

                {/* Tile 2: Bank Pillars (Orange) */}
                <div className="aspect-square rounded-2xl bg-brand-428 border border-orange-400/30 flex items-center justify-center p-3.5 shadow-md">
                  <Building2 className="h-8 w-8 text-ink-662 stroke-[2.2]" />
                </div>

                {/* Tile 3: Statement/Menu (Dark Outline) */}
                <div className="aspect-square rounded-2xl bg-ink-680 border border-white/20 flex items-center justify-center p-3.5 shadow-sm">
                  <Menu className="h-8 w-8 text-white stroke-[2.2]" />
                </div>

                {/* Tile 4: Document (Dark Outline) */}
                <div className="aspect-square rounded-2xl bg-ink-680 border border-white/20 flex items-center justify-center p-3.5 shadow-sm">
                  <FileText className="h-8 w-8 text-white stroke-[2.2]" />
                </div>

                {/* Tile 5: Credit Card (Orange) */}
                <div className="aspect-square rounded-2xl bg-brand-428 border border-orange-400/30 flex items-center justify-center p-3.5 shadow-md">
                  <CreditCard className="h-8 w-8 text-ink-662 stroke-[2.2]" />
                </div>

                {/* Tile 6: Exchange Arrows (Orange) */}
                <div className="aspect-square rounded-2xl bg-brand-428 border border-orange-400/30 flex items-center justify-center p-3.5 shadow-md">
                  <ArrowLeftRight className="h-8 w-8 text-ink-662 stroke-[2.2]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CHOOSE A BANK SECTION (Pure Crisp White Section)        */}
      {/* ========================================================= */}
      <section className="relative z-10 w-full bg-surface py-14 sm:py-20 text-slate-900 flex-1">
        <div className="mx-auto max-w-7xl px-4 xl:px-0">
          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Choose a bank
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Filter by service supported, status and reliability before you tap
              to visit its official website
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
            {/* ---------------------------------------------------- */}
            {/* LEFT COLUMN: Filter Sidebar                          */}
            {/* ---------------------------------------------------- */}
            <aside className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-slate-200 bg-surface p-5 shadow-xs space-y-6">
              {/* Header with Clear button */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">
                  Filters
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-brand-361 hover:underline"
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
                <div className="relative mb-3 flex items-center rounded-xl border border-slate-200 bg-surface px-3 py-2 text-xs focus-within:border-brand-361 focus-within:ring-1 focus-within:ring-brand-361">
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
                      onClick={() => setSearchQuery("")}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Scrollable Checkbox List */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 no-scrollbar text-xs">
                  {Array.from(new Set(banks.map((b) => b.name))).map(
                    (bName) => {
                      const isChecked = selectedBankNames.includes(bName);
                      return (
                        <label
                          key={bName}
                          className="flex items-center gap-2.5 cursor-pointer select-none py-0.5 hover:text-brand-361 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleBank(bName)}
                            className="h-4 w-4 rounded border-slate-300 text-brand-361 focus:ring-brand-361"
                          />
                          <span className="font-medium text-slate-700">
                            {bName}
                          </span>
                        </label>
                      );
                    },
                  )}
                </div>
              </div>

              {/* 2. Service Supported */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Channels
                </h3>
                <div className="space-y-2 text-xs">
                  {allChannels.map((srv) => {
                    const isChecked = selectedServices.includes(srv);
                    return (
                      <label
                        key={srv}
                        className="flex items-center gap-2.5 cursor-pointer select-none py-0.5 hover:text-brand-361 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleService(srv)}
                          className="h-4 w-4 rounded border-slate-300 text-brand-361 focus:ring-brand-361"
                        />
                        <span className="font-medium text-slate-700">
                          {srv}
                        </span>
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
                  {allStatuses.map((status) => {
                    const isChecked = selectedStatuses.includes(status);
                    const tone = banks.find(
                      (b) => bankStatus(b).label === status,
                    );
                    const dotColor = tone
                      ? STATUS_DOT[bankStatus(tone).tone]
                      : STATUS_DOT.down;

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
                            className="h-4 w-4 rounded border-slate-300 text-brand-361 focus:ring-brand-361"
                          />
                          <span className="font-medium text-slate-700">
                            {status}
                          </span>
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
                  {isLoading
                    ? "Loading banks…"
                    : `${filteredBanks.length} ${filteredBanks.length === 1 ? "Bank" : "Banks"}`}
                </h3>
              </div>

              {/* Grid of Bank Cards */}
              {isLoading ? (
                <div
                  aria-busy="true"
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className="h-[260px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
                    />
                  ))}
                </div>
              ) : isError ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-slate-300" />
                  <h4 className="mt-4 text-base font-bold text-slate-900">
                    We couldn&apos;t load the banks
                  </h4>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-4 rounded-xl bg-brand-361 px-4 py-2 text-xs font-bold text-on-brand shadow-xs transition hover:bg-brand-385"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredBanks.length === 0 ? (
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
                    className="mt-4 rounded-xl bg-brand-361 px-4 py-2 text-xs font-bold text-on-brand shadow-xs transition hover:bg-brand-385"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredBanks.map((bank, index) => {
                    const status = bankStatus(bank);
                    const dotColor = STATUS_DOT[status.tone];

                    return (
                      <div
                        key={`${bank.id}-${index}`}
                        onClick={() => setSelectedBankModal(bank)}
                        className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-surface shadow-xs cursor-pointer transition-shadow duration-200 hover:shadow-md hover:border-slate-300"
                      >
                        {/* Top Area: Logo taking full space + Status badge */}
                        <div className="relative h-44 w-full bg-surface p-5 flex items-center justify-center">
                          {/* Status Badge floating at top-left */}
                          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs border border-slate-200/80 backdrop-blur-sm">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
                            />
                            <span>{status.label}</span>
                          </div>

                          {/* Full space Bank Logo */}
                          {bank.logoUrl ? (
                            <BankLogo
                              bank={bank}
                              className="h-full w-full p-2"
                            />
                          ) : (
                            <BankLogo
                              bank={bank}
                              className="h-24 w-24 rounded-3xl"
                              textClassName="text-3xl"
                            />
                          )}
                        </div>

                        {/* Middle Area: Opaque Bar with Name and Arrow */}
                        <div className="w-full bg-slate-50/95 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between backdrop-blur-xs">
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                            {bank.name}
                          </h4>
                          <div className="flex-shrink-0 ml-1.5 text-brand-318">
                            <ArrowUpRight className="h-4 w-4 stroke-[2.2]" />
                          </div>
                        </div>

                        {/* Bottom Area: Service Supported Pills */}
                        <div className="px-4 py-3 bg-surface border-t border-slate-100 flex flex-wrap gap-1.5">
                          {channelLabels(bank).map((srv) => (
                            <span
                              key={srv}
                              className="rounded-lg bg-tone-66 px-2.5 py-1 text-[11px] font-medium text-slate-800"
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
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-surface p-6 text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <BankLogo
                  bank={selectedBankModal}
                  className="h-7 w-7 flex-shrink-0 rounded-lg"
                  textClassName="text-[10px]"
                />
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
                {selectedBankModal.name} is a verified partner bank on Hatiso.
                You&apos;ll continue to its own secure banking service.
              </p>

              <div className="rounded-xl bg-tone-32 p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">
                    Gateway Status:
                  </span>
                  <span
                    className={`font-bold ${STATUS_TEXT[bankStatus(selectedBankModal).tone]}`}
                  >
                    {bankStatus(selectedBankModal).label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">
                    Official Domain:
                  </span>
                  <span className="font-mono font-medium text-slate-800">
                    {bankDomain(selectedBankModal)}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1.5">
                  Channels:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {channelLabels(selectedBankModal).map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-tone-36 px-2 py-0.5 text-[11px] font-medium text-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={bankWebsite(selectedBankModal)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-361 py-3 text-center text-xs sm:text-sm font-bold text-on-brand shadow transition hover:bg-brand-385"
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

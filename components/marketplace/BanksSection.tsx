"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import BankLogo from "@/components/banks/BankLogo";
import { useBanks } from "@/lib/queries/useBanks";
import { pickFeatured, useMarketplacePageConfiguration } from "@/lib/queries/useMarketplace";
import type { Bank } from "@/lib/api/banks";
import { bankWebsite } from "@/lib/banks/bankDisplay";

/** How many banks the home section shows before "See all Banks" when the admin hasn't picked featured banks. */
const HOME_BANK_LIMIT = 10;

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
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const { data: allBanks = [], isLoading: banksLoading, isError, refetch } = useBanks();
  const { data: config, isPending: configLoading } = useMarketplacePageConfiguration();
  // The admin's featured banks (page configuration), in their order; otherwise the first HOME_BANK_LIMIT banks.
  const featured = config?.featuredBanks ?? [];
  const banks = featured.length
    ? pickFeatured(allBanks, featured, (bank) => [String(bank.id)])
    : allBanks.slice(0, HOME_BANK_LIMIT);
  const isLoading = banksLoading || configLoading;

  // Featured banks were picked but none of them can be shown: leave the section out.
  if (!isLoading && !isError && featured.length && !banks.length) return null;

  return (
    <section
      id="banks-section"
      className="relative bg-surface px-4 py-24 sm:px-8 lg:px-14 text-slate-900"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="hz-reveal mb-12 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-361">
            Banks
          </span>
          <h2 className="text-3xl font-black tracking-tight text-ink-737 sm:text-4xl lg:text-5xl">
            Bank the way you already do,
            <span className="block mt-1 font-extrabold text-ink-737">
              just in one place
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
            Select your bank to go straight to your app or internet banking.
          </p>
        </div>

        {/* Bank cards (up to HOME_BANK_LIMIT) from GET /banks */}
        {isError ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-600">
            We couldn&apos;t load the banks.
            <button
              type="button"
              onClick={() => refetch()}
              className="ml-2 font-bold text-brand-361 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : !isLoading && banks.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            No banks are available right now.
          </p>
        ) : (
          <div
            aria-busy={isLoading}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:gap-4"
          >
            {isLoading &&
              Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="h-[200px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50 sm:h-[220px]"
                />
              ))}
            {!isLoading && banks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => setSelectedBank(bank)}
                type="button"
                className="hz-reveal hz-lift relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-surface shadow-xs text-left hover:border-slate-300 h-[200px] sm:h-[220px]"
              >
                {/* Logo taking full space of card */}
                <div className="relative flex-1 w-full bg-surface p-5 flex items-center justify-center">
                  {bank.logoUrl ? (
                    <BankLogo bank={bank} className="h-full w-full p-2" />
                  ) : (
                    <BankLogo
                      bank={bank}
                      className="h-20 w-20 rounded-3xl"
                      textClassName="text-2xl"
                    />
                  )}
                </div>

                {/* Bottom opaque bar with Bank Name and Arrow */}
                <div className="w-full bg-slate-50/95 border-t border-slate-100 px-3.5 py-2.5 flex items-center justify-between backdrop-blur-xs">
                  <span className="text-xs sm:text-[13px] font-bold text-ink-737 truncate">
                    {bank.name}
                  </span>
                  <div className="flex-shrink-0 ml-1 text-brand-361">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.2]" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* See all Banks */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/banks"
            className="group inline-flex items-center gap-2 rounded-xl bg-ink-729 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-ink-674 active:scale-95"
          >
            <span>See all Banks</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ── Bank Opening Modal ─────────────────────────────────────────────── */}
      {selectedBank && (
        <div
          className="hz-dialog fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelectedBank(null)}
        >
          {/* Card */}
          <div className="w-full max-w-sm rounded-3xl bg-surface px-6 pt-8 pb-5 shadow-2xl text-slate-900">
            {/* Bank logo — left-aligned */}
            <div className="flex mb-5">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-tone-28 p-2.5 border border-slate-100">
                <BankLogo
                  bank={selectedBank}
                  className="h-full w-full"
                  textClassName="text-lg"
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-ink-737 mb-2">
              Continue to {selectedBank.name}
            </h3>

            {/* Privacy copy */}
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              You&apos;re about to open {selectedBank.name}&apos;s secure
              banking service. Hatiso will never see your username, password,
              PIN, or account details.
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
                <p className="text-sm font-bold text-ink-737 truncate">
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
                href={bankWebsite(selectedBank)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedBank(null)}
                className="w-full rounded-xl bg-brand-305 py-3.5 text-center text-sm font-bold text-on-brand hover:bg-brand-370 active:scale-[0.98] transition-all duration-150"
              >
                Continue to bank
              </a>
              <button
                type="button"
                onClick={() => setSelectedBank(null)}
                className="w-full rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-ink-737 hover:bg-slate-50 active:scale-[0.98] transition-all duration-150"
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

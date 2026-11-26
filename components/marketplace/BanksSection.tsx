"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import BankLogo from "@/components/banks/BankLogo";
import BankOpenDialog from "@/components/banks/BankOpenDialog";
import { useBanks } from "@/lib/queries/useBanks";
import type { Bank } from "@/lib/api/banks";
import { bankStatus, channelLabels, STATUS_DOT } from "@/lib/banks/bankDisplay";

/** How many banks the home section shows before "See all Banks". */
const HOME_BANK_LIMIT = 10;

const PROMISES = [
  "Only the bank's official domain",
  "Your password and PIN stay with your bank",
  "Every partner bank is verified",
];

export default function BanksSection() {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const { data: banks = [], isLoading, isError, refetch } = useBanks();

  return (
    <section id="banks-section" className="bg-carbon text-cloud">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-[clamp(40px,6vw,80px)] px-[clamp(16px,4vw,56px)] py-[clamp(72px,9vw,128px)]">
        <div className="hz-reveal flex min-w-0 flex-[1_1_420px] flex-col gap-6">
          <p className="hz-eyebrow text-grey-400">Banks</p>
          <h2 className="text-[clamp(32px,4vw,52px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
            Your bank, <span className="text-highlight">one tap away.</span>
          </h2>
          <p className="max-w-[480px] text-[17px] leading-relaxed text-silver">
            Pick your bank and we open its official app or internet banking. You sign in with your bank, not with us.
          </p>
          <ul className="flex flex-col gap-3.5 text-[15px]">
            {PROMISES.map((line) => (
              <li key={line} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-grey-700">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {line}
              </li>
            ))}
          </ul>
          <Link
            href="/banks"
            className="hz-press inline-flex min-h-12 items-center gap-2.5 self-start rounded-xl border border-grey-700 px-6 text-[15px] font-medium hover:border-grey-400"
          >
            See all banks
            <ArrowRight className="hz-arrow h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Bank tiles from GET /banks. A bank's own colour stays inside its tile. */}
        <div className="min-w-0 flex-[1_1_480px]">
          {isError ? (
            <div className="rounded-xl border border-dashed border-grey-700 p-10 text-center text-sm text-silver">
              We couldn&apos;t load the banks.
              <button type="button" onClick={() => refetch()} className="ml-2 font-semibold text-cloud underline">
                Try again
              </button>
            </div>
          ) : !isLoading && banks.length === 0 ? (
            <p className="text-center text-sm text-grey-400">No banks are available right now.</p>
          ) : (
            <div aria-busy={isLoading} className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3">
              {isLoading &&
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-[104px] animate-pulse rounded-xl bg-graphite" />
                ))}
              {banks.slice(0, HOME_BANK_LIMIT).map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank)}
                  type="button"
                  className="hz-reveal hz-lift hz-lift-dark flex flex-col gap-[18px] rounded-[10px] border border-white/6 bg-graphite p-[18px] text-left"
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white">
                      <BankLogo bank={bank} className="h-full w-full p-1" textClassName="text-sm" />
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-silver">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[bankStatus(bank).tone]}`} />
                      {bankStatus(bank).label}
                    </span>
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="truncate text-[15px] font-semibold">{bank.name}</span>
                    <span className="truncate text-[13px] text-grey-400">
                      {channelLabels(bank)[0] ?? 'Online banking'}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBank && <BankOpenDialog bank={selectedBank} onClose={() => setSelectedBank(null)} />}
    </section>
  );
}

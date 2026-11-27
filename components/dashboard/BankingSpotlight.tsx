'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Landmark } from 'lucide-react';
import BankLogo from '@/components/banks/BankLogo';
import BankOpenDialog from '@/components/banks/BankOpenDialog';
import { useBanks } from '@/lib/queries/useBanks';
import type { Bank } from '@/lib/api/banks';
import { bankStatus } from '@/lib/banks/bankDisplay';
import { rememberBank, useRecentBanks } from '@/lib/banks/recentBanks';

/** How many bank logos the strip shows. */
const LOGO_COUNT = 4;

/**
 * Dashboard banking strip: one quiet row under the metric cards that keeps banking in view without
 * pushing the payments and numbers down. Bank logos (each opens the "Continue to <bank>" dialog), a
 * line of copy, and one button: "Open bank" for the bank they last opened, otherwise "Choose your bank".
 * Bank colours appear only inside the dialog.
 */
export default function BankingSpotlight() {
  const { data: banks = [], isLoading, isError } = useBanks();
  const recent = useRecentBanks(banks);
  const [picked, setPicked] = useState<Bank | null>(null);

  // Nothing to offer: still loading, failed, or no partner banks.
  if (isLoading || isError || !banks.length) return null;

  // Banks they've opened first, then online banks.
  const recentIds = recent.map(({ bank }) => String(bank.id));
  const logos = [...banks]
    .sort((a, b) => {
      const ra = recentIds.indexOf(String(a.id));
      const rb = recentIds.indexOf(String(b.id));
      if (ra !== rb) return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
      return Number(bankStatus(b).tone === 'online') - Number(bankStatus(a).tone === 'online');
    })
    .slice(0, LOGO_COUNT);
  const last = recent[0]?.bank;
  const button =
    'hz-press inline-flex min-h-10 items-center gap-1.5 rounded-[10px] border border-tone-100 px-4 text-sm font-medium text-tone-744 hover:border-tone-414';

  return (
    <>
      <section
        aria-label="Banking"
        className="hz-rise flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[14px] border border-tone-100 bg-surface px-5 py-4"
        style={{ '--d': 3 } as React.CSSProperties}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-tone-44 text-tone-744">
          <Landmark className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
        </span>

        <span className="flex min-w-0 flex-[1_1_240px] flex-col gap-0.5">
          <span className="text-[15px] font-semibold text-tone-744">{last ? `Back to ${last.name}?` : 'Your bank, one tap away'}</span>
          <span className="text-[13px] text-tone-414">
            {last
              ? 'Open it again from Hatiso. You sign in with your bank.'
              : `Open ${banks.length > 1 ? `any of our ${banks.length} partner banks` : 'our partner bank'}. We never see your login.`}
          </span>
        </span>

        <span className="flex items-center gap-4">
          <span className="flex -space-x-2">
            {logos.map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => setPicked(bank)}
                aria-label={`Open ${bank.name}`}
                title={bank.name}
                className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-cloud p-1 transition-transform hover:z-10 hover:-translate-y-0.5"
              >
                <BankLogo bank={bank} className="h-full w-full rounded-full" textClassName="text-[10px]" />
              </button>
            ))}
          </span>

          {last ? (
            <button type="button" onClick={() => setPicked(last)} className={button}>
              Open bank
              <ArrowUpRight className="hz-arrow h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <Link href="/dashboard/banking" className={button}>
              Choose your bank
              <ArrowRight className="hz-arrow h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </span>
      </section>
      {/* Outside the card: it animates in, which would trap a fixed dialog. */}
      {picked && <BankOpenDialog bank={picked} onClose={() => setPicked(null)} onContinue={rememberBank} />}
    </>
  );
}

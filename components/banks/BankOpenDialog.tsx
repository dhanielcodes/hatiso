"use client";

import React, { useEffect } from "react";
import { ArrowUpRight, X } from "lucide-react";
import BankLogo from "@/components/banks/BankLogo";
import type { Bank } from "@/lib/api/banks";
import {
  bankDomain,
  bankStatus,
  bankWebsite,
  channelLabels,
  STATUS_DOT,
  STATUS_TEXT,
} from "@/lib/banks/bankDisplay";
import { bankAccentStyle } from "@/lib/theme/accent";

/**
 * Banks board "Continue to <bank>" dialog, shown before Hatiso opens a bank's own service.
 * The bank's brand colour appears only in the stripe across the top.
 */
export default function BankOpenDialog({
  bank,
  onClose,
  onContinue,
}: {
  bank: Bank;
  onClose: () => void;
  /** Called when the person continues to the bank, before the dialog closes. */
  onContinue?: (bank: Bank) => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const status = bankStatus(bank);
  const opens = channelLabels(bank).join(" and ") || "Official website";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-carbon/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-dialog-title"
        style={bankAccentStyle(bank.primaryColor)}
        className="hz-pop w-full max-w-[440px] overflow-hidden rounded-[14px] bg-white text-carbon shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]"
      >
        <div aria-hidden="true" className="hz-grow h-1.5 bg-accent" />
        <div className="flex flex-col gap-5 p-7">
          <div className="flex items-start justify-between">
            <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-grey-100 bg-cloud p-1.5">
              <BankLogo bank={bank} className="h-full w-full" textClassName="text-[17px]" />
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="hz-press flex h-11 w-11 items-center justify-center rounded-full bg-cloud text-carbon hover:bg-grey-100"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <h3 id="bank-dialog-title" className="text-[22px] font-semibold tracking-[-0.02em]">
              Continue to {bank.name}
            </h3>
            <p className="text-[15px] leading-[1.6] text-grey-600">
              You&apos;re leaving Hatiso for your bank&apos;s own secure service. Sign in there; we never see your
              username, password or PIN.
            </p>
          </div>

          <dl className="divide-y divide-grey-100 rounded-lg border border-grey-100 text-sm">
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-grey-600">Status</dt>
              <dd className={`inline-flex items-center gap-1.5 font-medium ${STATUS_TEXT[status.tone]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status.tone]}`} />
                {status.label}
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-grey-600">Official site</dt>
              <dd className="truncate font-medium">{bankDomain(bank)}</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-grey-600">Opens</dt>
              <dd className="text-right font-medium">{opens}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2.5">
            <a
              href={bankWebsite(bank)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                onContinue?.(bank);
                onClose();
              }}
              className="hz-press flex min-h-[52px] items-center justify-center gap-2 rounded-[10px] bg-carbon text-[15px] font-medium text-cloud hover:bg-graphite"
            >
              Continue to bank
              <ArrowUpRight className="hz-arrow h-4 w-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="hz-press min-h-[52px] rounded-[10px] border border-grey-150 bg-white text-[15px] font-medium hover:border-grey-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

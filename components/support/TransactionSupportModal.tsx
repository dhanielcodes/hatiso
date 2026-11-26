'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import type { SupportReceipt } from '@/lib/api/support';
import { useSupportOptions } from '@/lib/queries/useSupport';
import SupportEnquiryForm from './SupportEnquiryForm';
import { ticketHref, todayIso } from './supportDisplay';

export interface TransactionSupportModalProps {
  open: boolean;
  onClose: () => void;
  transactionReference: string;
  /** e.g. "MTN airtime to 0803…" */
  summary?: string;
  /** Start the form as a complaint (failed or stuck transactions). */
  complaint?: boolean;
}

/** Raises a support ticket about one transaction, without leaving the transaction page. */
export default function TransactionSupportModal({ open, onClose, transactionReference, summary, complaint }: TransactionSupportModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const options = useSupportOptions();
  const enquiryTypes = options.data?.enquiryTypes ?? [];
  const [sent, setSent] = useState<SupportReceipt | null>(null);
  const close = () => {
    setSent(null);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-carbon/60 p-0 sm:items-center sm:p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="txn-support-title"
        onClick={(event) => event.stopPropagation()}
        className="hz-pop flex max-h-[92dvh] w-full max-w-[560px] flex-col rounded-t-2xl bg-surface shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-tone-44 px-[22px] py-5">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id="txn-support-title" className="text-lg font-semibold text-tone-744">
              Get help with this payment
            </h2>
            {summary && <p className="truncate text-sm text-tone-414">{summary}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tone-44 text-tone-744 transition-colors hover:bg-tone-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-[22px] py-5">
          {sent ? (
            <div className="hz-stagger flex flex-col items-center gap-2.5 py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-305 text-on-brand">
                <Check className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-[13px] font-medium text-tone-414">Request sent</span>
              <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-tone-744">We&apos;re on it.</h3>
              <p className="max-w-[380px] text-[15px] leading-relaxed text-tone-414">
                Your request {sent.reference} is open. We&apos;ll reply by email and you can follow it in Help and support.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2.5">
                <Link href={ticketHref(sent.ticketId)} className="hz-press inline-flex min-h-11 items-center rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium text-tone-744 hover:border-tone-414">
                  View request
                </Link>
                <button type="button" onClick={close} className="hz-press inline-flex min-h-11 items-center rounded-[10px] bg-brand-305 px-[18px] text-sm font-medium text-on-brand hover:bg-brand-361">
                  Done
                </button>
              </div>
            </div>
          ) : (
          <SupportEnquiryForm
            compact
            enquiryTypes={enquiryTypes}
            loadingTypes={options.isLoading}
            defaultEnquiryType="TRANSACTION_ISSUE"
            defaultRequestType={complaint ? 'COMPLAINT' : 'ENQUIRY'}
            defaultDate={todayIso()}
            transactionReference={transactionReference}
            submitLabel="Send to support"
            hideReceipt
            onSent={setSent}
            onCancel={close}
          />
          )}
        </div>
      </div>
    </div>
  );
}

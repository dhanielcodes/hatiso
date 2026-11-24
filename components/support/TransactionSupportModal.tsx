'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useSupportOptions } from '@/lib/queries/useSupport';
import SupportEnquiryForm from './SupportEnquiryForm';
import { todayIso } from './supportDisplay';

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="txn-support-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-[560px] flex-col rounded-t-2xl bg-surface shadow-xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-tone-78 px-6 py-5">
          <div className="min-w-0">
            <h2 id="txn-support-title" className="text-lg font-semibold text-tone-744">
              Get help with this transaction
            </h2>
            {summary && <p className="mt-1 truncate text-sm text-tone-405">{summary}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-ink-660 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-6 py-6">
          <SupportEnquiryForm
            compact
            enquiryTypes={enquiryTypes}
            loadingTypes={options.isLoading}
            defaultEnquiryType="TRANSACTION_ISSUE"
            defaultRequestType={complaint ? 'COMPLAINT' : 'ENQUIRY'}
            defaultDate={todayIso()}
            transactionReference={transactionReference}
            submitLabel="Send to support"
          />
        </div>
      </div>
    </div>
  );
}

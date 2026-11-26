'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Check, Lock, X } from 'lucide-react';

/** PayFlow board: confirm, processing and success dialogs around the Paystack checkout. */

export type PayMethod = 'card' | 'transfer';

export const PAY_METHODS: { id: PayMethod; label: string; note: string; channels: string[] }[] = [
  { id: 'card', label: 'Card', note: 'Debit or credit card', channels: ['card'] },
  { id: 'transfer', label: 'Bank transfer', note: 'Pay from your banking app', channels: ['bank_transfer'] },
];

export function nairaParts(minor: number) {
  const whole = Math.floor(minor / 100).toLocaleString('en-NG');
  const kobo = String(Math.abs(minor) % 100).padStart(2, '0');
  return { whole, kobo, full: `₦${whole}.${kobo}` };
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 px-4 py-10 backdrop-blur-sm"
      onClick={(e) => onClose && e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}

const PANEL =
  'hz-pop max-h-[calc(100dvh-2rem)] w-full max-w-[460px] overflow-y-auto overscroll-contain rounded-[14px] bg-white text-carbon shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]';

export function ConfirmPaymentDialog({
  line,
  amountMinor,
  feeMinor,
  totalMinor,
  method,
  onMethod,
  onPay,
  onClose,
  error,
}: {
  line: string;
  amountMinor: number;
  feeMinor: number;
  totalMinor: number;
  method: PayMethod;
  onMethod: (m: PayMethod) => void;
  onPay: () => void;
  onClose: () => void;
  error?: string;
}) {
  const total = nairaParts(totalMinor);
  return (
    <Backdrop onClose={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="pay-title" className={PANEL}>
        <div className="flex items-center justify-between border-b border-cloud px-6 py-5">
          <h2 id="pay-title" className="text-lg font-semibold">Confirm payment</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="hz-press flex h-10 w-10 items-center justify-center rounded-lg bg-cloud hover:bg-grey-100">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1.5 rounded-xl bg-carbon p-[18px] text-cloud">
            <span className="truncate text-sm text-grey-400">{line}</span>
            <span className="text-4xl leading-[1.1] font-semibold tracking-[-0.02em] tabular-nums">
              ₦{total.whole}
              <span className="text-lg text-grey-500">.{total.kobo}</span>
            </span>
          </div>
          <dl className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-grey-600">Amount</dt><dd className="font-medium tabular-nums">{nairaParts(amountMinor).full}</dd></div>
            <div className="flex justify-between"><dt className="text-grey-600">Charges</dt><dd className="font-medium tabular-nums">{nairaParts(feeMinor).full}</dd></div>
            <div className="flex justify-between border-t border-dashed border-grey-150 pt-2.5"><dt className="font-semibold">You pay</dt><dd className="font-semibold tabular-nums">{total.full}</dd></div>
          </dl>
          <fieldset className="flex flex-col gap-2" role="radiogroup">
            <legend className="mb-2 text-sm font-medium">Pay with</legend>
            {PAY_METHODS.map((m) => {
              const on = m.id === method;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onMethod(m.id)}
                  className={`flex min-h-14 items-center gap-3 rounded-[10px] bg-white px-3.5 text-left transition-colors ${on ? 'border-2 border-carbon px-[13px]' : 'border border-grey-100 hover:border-grey-400'}`}
                >
                  <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-carbon' : 'border-grey-400'}`}>
                    <span className={`h-2 w-2 rounded-full ${on ? 'bg-carbon' : 'bg-transparent'}`} />
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[15px] font-medium">{m.label}</span>
                    <span className="text-[13px] text-grey-600">{m.note}</span>
                  </span>
                </button>
              );
            })}
          </fieldset>
          {error ? <p role="alert" className="rounded-lg border border-status-error/30 bg-status-error/8 px-3.5 py-3 text-sm text-status-error">{error}</p> : null}
          <button
            type="button"
            onClick={onPay}
            className="hz-press inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[10px] bg-carbon text-[15px] font-medium text-cloud hover:bg-graphite"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            Pay ₦{total.whole}
            {total.kobo !== '00' ? `.${total.kobo}` : ''}
          </button>
          <span className="text-center text-[13px] text-grey-600">Payments are encrypted. Hatiso never stores your full card number.</span>
        </div>
      </div>
    </Backdrop>
  );
}

export function ProcessingDialog({ title = 'Preparing your payment' }: { title?: string }) {
  return (
    <Backdrop>
      <div role="dialog" aria-modal="true" aria-live="polite" className={`${PANEL} flex flex-col items-center gap-4 px-8 py-12 text-center`}>
        <span aria-hidden="true" className="h-12 w-12 animate-spin rounded-full border-4 border-grey-100 border-t-carbon" />
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm leading-[1.6] text-grey-600">This takes a few seconds. Please don&apos;t close this window.</p>
      </div>
    </Backdrop>
  );
}

export function PaymentSuccessDialog({
  totalMinor,
  line,
  reference,
  methodLabel,
  receiptHref,
  guest,
  onAgain,
  onClose,
}: {
  totalMinor: number;
  line: string;
  reference: string;
  methodLabel: string;
  /** Where "View receipt" goes; hidden when there is nowhere to show it (guests). */
  receiptHref?: string;
  guest?: boolean;
  onAgain: () => void;
  onClose: () => void;
}) {
  const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date());
  return (
    <Backdrop onClose={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ok-title" className={PANEL}>
        <div className="hz-stagger flex flex-col items-center gap-3 px-6 pt-7 pb-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-status-success text-white">
            <Check className="h-6 w-6" strokeWidth={2.6} aria-hidden="true" />
          </span>
          <span className="text-[13px] font-medium text-status-success">Payment successful</span>
          <h2 id="ok-title" className="text-4xl font-semibold tracking-[-0.02em] tabular-nums">{nairaParts(totalMinor).full}</h2>
          <span className="text-sm text-grey-600">{line}</span>
        </div>
        <dl className="mx-6 rounded-xl border border-grey-100 text-sm">
          <div className="flex justify-between gap-4 border-b border-cloud px-4 py-3"><dt className="text-grey-600">Reference</dt><dd className="max-w-[220px] truncate font-mono text-[13px] font-medium" title={reference}>{reference}</dd></div>
          <div className="flex justify-between gap-4 border-b border-cloud px-4 py-3"><dt className="text-grey-600">Date</dt><dd className="font-medium">{date}</dd></div>
          <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-grey-600">Paid with</dt><dd className="font-medium">{methodLabel}</dd></div>
        </dl>
        <div className="flex flex-col gap-2.5 px-6 pt-5 pb-6">
          {receiptHref && (
            <Link href={receiptHref} className="hz-press inline-flex min-h-12 items-center justify-center rounded-[10px] bg-carbon text-sm font-medium text-cloud hover:bg-graphite">
              View receipt
            </Link>
          )}
          <button
            type="button"
            onClick={onAgain}
            className={`hz-press inline-flex min-h-12 items-center justify-center rounded-[10px] text-sm font-medium ${receiptHref ? 'border border-grey-150 bg-white hover:border-grey-400' : 'bg-carbon text-cloud hover:bg-graphite'}`}
          >
            Make another payment
          </button>
          {guest && (
            <span className="text-center text-[13px] text-grey-600">
              Paying as a guest?{' '}
              <Link href="/auth/register" className="border-b border-carbon font-medium text-carbon">
                Create an account
              </Link>{' '}
              to keep this receipt.
            </span>
          )}
        </div>
      </div>
    </Backdrop>
  );
}

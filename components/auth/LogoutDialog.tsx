'use client';

import { useEffect, useRef } from 'react';
import { LogOut } from 'lucide-react';

/** Logout board: confirm before signing out. Cancel takes focus so Enter doesn't sign out by accident. */
export default function LogoutDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-carbon/60 px-4 py-10"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="lo-title"
        aria-describedby="lo-body"
        className="hz-pop flex w-full max-w-[400px] flex-col gap-4 rounded-[14px] bg-white p-6 text-carbon shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-cloud">
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 id="lo-title" className="text-xl font-semibold">Sign out of Hatiso?</h2>
          <p id="lo-body" className="text-[15px] leading-relaxed text-grey-600">
            You&apos;ll need your password to sign back in. Your saved numbers and receipts stay on your account.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="hz-press inline-flex min-h-11 items-center justify-center rounded-[10px] border border-grey-150 bg-white text-sm font-medium hover:border-grey-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="hz-press inline-flex min-h-11 items-center justify-center rounded-[10px] bg-carbon text-sm font-medium text-cloud hover:bg-graphite"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

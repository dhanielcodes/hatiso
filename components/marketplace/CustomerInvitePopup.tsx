'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import XnettLogo from '@/components/auth/XnettLogo';

const SHOWN_KEY = 'hasito_invite_shown';

/**
 * True when a guest should be invited to sign up: not logged in, and not already invited in this
 * browser session (so someone buying several services in a row sees it once).
 */
export function shouldInviteGuest(isAuthenticated: boolean) {
  if (isAuthenticated) return false;
  try {
    return sessionStorage.getItem(SHOWN_KEY) !== '1';
  } catch {
    return true;
  }
}

function markInviteShown() {
  try {
    sessionStorage.setItem(SHOWN_KEY, '1');
  } catch {
    // Storage blocked (private mode): the popup may show again, which is harmless
  }
}

/** "Customer Invite Pop up": nudges a guest who just used a service to sign in or create an account. */
export default function CustomerInvitePopup({ onClose }: { onClose: () => void }) {
  const createRef = useRef<HTMLAnchorElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Once on open: remember it was shown, focus the main action, close on Escape
  useEffect(() => {
    markInviteShown();
    createRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#102A36]/60 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        aria-describedby="invite-body"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[446px] rounded-2xl bg-white text-center shadow-[0_24px_60px_-12px_rgba(16,42,54,0.45)] animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#F1F2F4] text-[#3A4652] transition hover:bg-[#E4E7EB]"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>

        <div className="border-b border-[#ECEEF0] px-6 pb-5 pt-9 sm:px-8">
          {/* The logo's wordmark is white by default; darken it for the white card */}
          <div className="flex justify-center [&_path[fill='white']]:fill-[#1B3C4A] [&_path[fill='#F9FAFB']]:fill-[#1B3C4A]">
            <XnettLogo href="/" className="pointer-events-none [&_svg]:h-11 [&_svg]:w-auto" />
          </div>
          <h2 id="invite-title" className="mt-3 text-[19px] font-semibold leading-snug tracking-tight text-[#1C2733] sm:text-[21px]">
            Hey there! Ready to make it <span className="whitespace-nowrap">official? <span aria-hidden="true">👋</span></span>
          </h2>
          <p id="invite-body" className="mx-auto mt-2 max-w-[370px] text-[13px] leading-5 text-[#7A7F8A]">
            Pop in your details and become a QApp member. You&apos;ll get easy access to your purchases, quick checkout
            next time, and a little something special just for joining.
          </p>
        </div>

        <div className="px-6 pb-8 pt-8 sm:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center sm:gap-3.5">
            <Link
              href="/auth/login"
              className="inline-flex h-[38px] items-center justify-center whitespace-nowrap rounded-lg border border-[#1B3C4A] px-6 text-sm font-medium text-[#1B3C4A] transition hover:bg-[#1B3C4A]/5 sm:w-[148px]"
            >
              Sign in
            </Link>
            <Link
              ref={createRef}
              href="/auth/register"
              className="inline-flex h-[38px] items-center justify-center whitespace-nowrap rounded-lg bg-[#243B4A] px-6 text-sm font-medium text-white transition hover:bg-[#1B3C4A] sm:w-[152px]"
            >
              Create Account
            </Link>
          </div>
          <p className="mx-auto mt-5 max-w-[310px] text-xs leading-[18px] text-[#E95312]">
            An account gives you access to all features and helps you to track and keep data safe and secure.
          </p>
        </div>
      </div>
    </div>
  );
}

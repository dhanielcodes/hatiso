'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import HatisoLogo from '@/components/brand/HatisoLogo';

const SHOWN_KEY = 'hasito_invite_shown';

/** InvitePopup board perks. "100 welcome points" stays off while Rewards is switched off. */
const INVITE_PERKS = [
  'Faster checkout with saved numbers',
  'Every receipt in one place',
  // '100 welcome points',
];

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-carbon/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        aria-describedby="invite-body"
        onClick={(e) => e.stopPropagation()}
        className="hz-pop relative w-full max-w-[440px] overflow-hidden rounded-[14px] bg-white text-carbon shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="hz-press absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cloud hover:bg-grey-100"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="flex flex-col gap-4 px-7 pt-8 pb-2">
          <div className="flex">
            <HatisoLogo variant="carbon" height={26} href={null} />
          </div>
          <h2 id="invite-title" className="text-[28px] leading-[1.15] font-semibold tracking-[-0.02em]">
            Ready to make it official?
          </h2>
          <p id="invite-body" className="text-[15px] leading-[1.6] text-grey-600">
            Create a free account to keep your receipts and save numbers for next time.
          </p>
          <ul className="flex flex-col gap-2.5 text-sm">
            {INVITE_PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-carbon text-cloud">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2.5 px-7 pt-5 pb-7">
          <Link
            ref={createRef}
            href="/auth/register"
            className="hz-press inline-flex min-h-[50px] items-center justify-center rounded-[10px] bg-carbon text-[15px] font-medium text-cloud hover:bg-graphite"
          >
            Create free account
          </Link>
          <Link
            href="/auth/login"
            className="hz-press inline-flex min-h-[50px] items-center justify-center rounded-[10px] border border-grey-150 bg-white text-[15px] font-medium hover:border-grey-400"
          >
            Sign in
          </Link>
          <button type="button" onClick={onClose} className="p-2 text-center text-sm font-medium text-grey-600 hover:text-carbon">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

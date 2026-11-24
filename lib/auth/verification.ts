import type { ApiError } from '@/types';
import type { VerificationPurpose } from '@/lib/api/auth';

/**
 * Where an unfinished sign-up is parked while the user verifies their email or phone.
 * Kept in sessionStorage (this tab only) and never holds a password or code.
 */
export interface VerificationContext {
  userId: string;
  purpose: VerificationPurpose;
  /** The email or phone the code went to, for display and for the login page afterwards. */
  contact?: string;
  /** When the last code was sent (ms since epoch). Drives the 60-second resend wait across reloads. */
  codeSentAt?: number;
}

/** The backend sends a new code at most once every 60 seconds. */
export const RESEND_WAIT_SECONDS = 60;

const STORAGE_KEY = 'hatiso_verification_context';
const CHANGE_EVENT = 'hatiso-verification-context';

export const VERIFY_PATH = '/auth/verify';

export function isVerificationPurpose(value: unknown): value is VerificationPurpose {
  return value === 'VERIFY_EMAIL' || value === 'VERIFY_PHONE';
}

/** Guesses the purpose from the contact when the backend leaves it out. */
export function purposeFor(contact: string): VerificationPurpose {
  return contact.includes('@') ? 'VERIFY_EMAIL' : 'VERIFY_PHONE';
}

export function saveVerificationContext(context: VerificationContext) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearVerificationContext() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/* ─── useSyncExternalStore plumbing ─────────────────────────────── */
export function subscribeToVerificationContext(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** Raw string snapshot (stable between renders); parse it with `parseVerificationContext`. */
export function readVerificationContextRaw(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** `undefined` on the server, so the page can tell "not read yet" from "nothing saved". */
export function readVerificationContextOnServer(): string | null | undefined {
  return undefined;
}

export function parseVerificationContext(raw: string | null | undefined): VerificationContext | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<VerificationContext>;
    if (typeof value.userId !== 'string' || !value.userId || !isVerificationPurpose(value.purpose)) return null;
    return {
      userId: value.userId,
      purpose: value.purpose,
      contact: typeof value.contact === 'string' ? value.contact : undefined,
      codeSentAt: typeof value.codeSentAt === 'number' ? value.codeSentAt : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Login answers a correct password on an unverified account with HTTP 409 and
 * `data.error === 'verification_required'`. Returns the context to resume with, or null for any other error.
 */
export function verificationContextFromError(error: unknown, contact?: string): VerificationContext | null {
  if (typeof error !== 'object' || error === null) return null;
  const { code, data } = error as ApiError;
  if (code !== 'verification_required' || !data) return null;
  const userId = typeof data.userId === 'string' ? data.userId : '';
  if (!userId) return null;
  const purpose = isVerificationPurpose(data.purpose) ? data.purpose : purposeFor(contact ?? '');
  return { userId, purpose, contact };
}

/** Formats a Nigerian number to E.164 (+234…), the shape sign-up sends. */
export function formatNigerianPhone(phone: string): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;
  const national = digits.startsWith('234') ? digits.slice(3) : digits.startsWith('0') ? digits.slice(1) : digits;
  return national ? `+234${national}` : null;
}

/** An email (lower-cased) or a phone number (E.164), as the resume endpoint expects. */
export function normalizeIdentifier(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes('@')) return trimmed.toLowerCase();
  return formatNigerianPhone(trimmed) ?? trimmed;
}

import type { Bank } from '@/lib/api/banks';

/**
 * GET /banks has no website URL yet, so each bank's "Continue to bank" link comes from here,
 * keyed by `bankIdentifier`. Banks not listed use DEFAULT_BANK_URL.
 */
export const BANK_WEBSITES: Record<string, string> = {
  QAPPBANKPROTEST: 'https://tm-30-bank.vercel.app/',
};

export const DEFAULT_BANK_URL = 'https://tm-30-bank.vercel.app/';

export function bankWebsite(bank: Pick<Bank, 'bankIdentifier'>) {
  return BANK_WEBSITES[bank.bankIdentifier] ?? DEFAULT_BANK_URL;
}

export function bankDomain(bank: Pick<Bank, 'bankIdentifier'>) {
  return bankWebsite(bank).replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/** "INTERNET_BANKING" → "Internet banking" */
export function humanize(value: string) {
  const text = value.replace(/_/g, ' ').toLowerCase().trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function channelLabels(bank: Pick<Bank, 'channels'>) {
  return (bank.channels ?? []).map(humanize);
}

export type BankStatusTone = 'online' | 'warning' | 'down';

/** ACTIVE reads as "Online"; any other status is shown as the API sends it. */
export function bankStatus(bank: Pick<Bank, 'status'>): { label: string; tone: BankStatusTone } {
  const status = (bank.status ?? '').toUpperCase();
  if (status === 'ACTIVE') return { label: 'Online', tone: 'online' };
  if (['MAINTENANCE', 'DEGRADED'].includes(status)) return { label: humanize(status), tone: 'warning' };
  return { label: humanize(status || 'Unavailable'), tone: 'down' };
}

export const STATUS_DOT: Record<BankStatusTone, string> = {
  online: 'bg-emerald-500',
  warning: 'bg-amber-500',
  down: 'bg-red-500',
};

export const STATUS_TEXT: Record<BankStatusTone, string> = {
  online: 'text-emerald-700',
  warning: 'text-amber-700',
  down: 'text-red-700',
};

/** Up to two initials, for banks without a logo. */
export function bankInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

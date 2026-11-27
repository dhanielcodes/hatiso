import React from 'react';
import type { Bank } from '@/lib/api/banks';
import { bankInitials } from '@/lib/banks/bankDisplay';

/**
 * The bank's logo from `logoUrl`, or its initials on its `primaryColor` when there is no logo.
 * Uses a plain <img> because logo hosts aren't known ahead of time (next/image needs them listed).
 */
export default function BankLogo({
  bank,
  className = '',
  textClassName = 'text-sm',
}: {
  bank: Pick<Bank, 'name' | 'logoUrl' | 'primaryColor'>;
  className?: string;
  textClassName?: string;
}) {
  if (bank.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={bank.logoUrl} alt={bank.name} className={`object-contain ${className}`} loading="lazy" />
    );
  }
  return (
    <span
      role="img"
      aria-label={bank.name}
      // No brand colour: `bg-ink-662` (not an inline var) so dark mode treats it as a dark panel and keeps it dark.
      className={`flex items-center justify-center rounded-xl font-extrabold text-white ${bank.primaryColor ? '' : 'bg-ink-662'} ${textClassName} ${className}`}
      style={bank.primaryColor ? { background: bank.primaryColor } : undefined}
    >
      {bankInitials(bank.name)}
    </span>
  );
}

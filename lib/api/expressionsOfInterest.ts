import { apiPost } from '@/lib/api/axios';

/** The kinds of organisation that can register interest. `tenantType` is sent as the label shown. */
export const TENANT_TYPES = ['Bank', 'Fintech', 'Microfinance bank', 'Merchant', 'Other'] as const;

/** Body of POST /api/public/expressions-of-interest (the public Contact form; no sign-in). */
export interface ExpressionOfInterestPayload {
  contactName: string;
  contactRole?: string;
  email: string;
  /** International format, e.g. +2348035550212 */
  phone?: string;
  organisation: string;
  tenantType: string;
  country: string;
  website?: string;
  message: string;
}

/** Sends the Contact form. Errors show the usual toast from the axios interceptor. */
export function submitExpressionOfInterest(payload: ExpressionOfInterestPayload) {
  return apiPost<unknown>('/api/public/expressions-of-interest', payload);
}

/** "0803 555 0212", "803 555 0212" or "+234 803…" -> "+2348035550212". Empty stays empty. */
export function toInternationalPhone(value: string, dialCode = '+234') {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) return `+${digits}`;
  const code = dialCode.replace(/\D/g, '');
  if (digits.startsWith(code)) return `+${digits}`;
  return `+${code}${digits.replace(/^0+/, '')}`;
}

/** Trims every value and leaves out optional fields that were left blank. */
export function buildExpressionOfInterest(values: {
  contactName: string;
  contactRole?: string;
  email: string;
  phone?: string;
  organisation: string;
  tenantType: string;
  country: string;
  website?: string;
  message: string;
}): ExpressionOfInterestPayload {
  const optional = (v?: string) => (v && v.trim() ? v.trim() : undefined);
  const website = optional(values.website);
  return {
    contactName: values.contactName.trim(),
    contactRole: optional(values.contactRole),
    email: values.email.trim(),
    phone: optional(toInternationalPhone(values.phone ?? '')),
    organisation: values.organisation.trim(),
    tenantType: values.tenantType,
    country: values.country.trim(),
    website: website && !/^https?:\/\//i.test(website) ? `https://${website}` : website,
    message: values.message.trim(),
  };
}

/** "TRANSACTION_ISSUE" → "Transaction issue" */
export function humanizeEnum(value: string | null | undefined) {
  if (!value) return '';
  const text = value.replace(/[_-]+/g, ' ').toLowerCase().trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Ticket statuses the customer can reopen. */
export const REOPENABLE_STATUSES = ['RESOLVED', 'CLOSED'];

const STATUS_TONES: Record<string, string> = {
  OPEN: 'bg-tone-40 text-brand-499',
  REOPENED: 'bg-tone-40 text-brand-499',
  PENDING: 'bg-tone-40 text-brand-499',
  IN_PROGRESS: 'bg-tone-64 text-ink-505',
  ASSIGNED: 'bg-tone-64 text-ink-505',
  ESCALATED: 'bg-tone-64 text-ink-505',
  AWAITING_CUSTOMER: 'bg-tone-52 text-brand-447',
  RESOLVED: 'bg-tone-58 text-success-392',
  CLOSED: 'bg-tone-63 text-ink-510',
  CANCELLED: 'bg-tone-59 text-danger-404',
  REJECTED: 'bg-tone-59 text-danger-404',
};

export function ticketStatus(status: string) {
  const key = (status || '').toUpperCase();
  return {
    label: key === 'OPEN' ? 'Open' : humanizeEnum(key) || 'Unknown',
    className: STATUS_TONES[key] ?? 'bg-tone-63 text-ink-510',
  };
}

/** "Feedback" for feedback tickets, otherwise the enquiry type. */
export function ticketTypeLabel(item: { requestType: string; enquiryType?: string | null; category?: string | null; rating?: number | null }) {
  if (item.rating != null || (item.requestType === 'OTHER' && !item.enquiryType && !item.category)) return 'Feedback';
  return humanizeEnum(item.enquiryType ?? item.category) || humanizeEnum(item.requestType);
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

/** "2026-11-17" → "17 Nov 2026" (no timezone shift for plain dates). */
export function formatPlainDate(value: string | null | undefined) {
  if (!value) return '—';
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return value;
  return DATE_FORMAT.format(new Date(y, m - 1, d));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_TIME_FORMAT.format(date);
}

/** Today as YYYY-MM-DD in the user's own timezone. */
export function todayIso() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function ticketHref(ticketId: string) {
  return `/dashboard/support/tickets/${encodeURIComponent(ticketId)}`;
}

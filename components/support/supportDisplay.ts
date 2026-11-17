/** "TRANSACTION_ISSUE" → "Transaction issue" */
export function humanizeEnum(value: string | null | undefined) {
  if (!value) return '';
  const text = value.replace(/[_-]+/g, ' ').toLowerCase().trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Ticket statuses the customer can reopen. */
export const REOPENABLE_STATUSES = ['RESOLVED', 'CLOSED'];

const STATUS_TONES: Record<string, string> = {
  OPEN: 'bg-[#FFF3DB] text-[#9A4A00]',
  REOPENED: 'bg-[#FFF3DB] text-[#9A4A00]',
  PENDING: 'bg-[#FFF3DB] text-[#9A4A00]',
  IN_PROGRESS: 'bg-[#E8F1FB] text-[#2463A6]',
  ASSIGNED: 'bg-[#E8F1FB] text-[#2463A6]',
  ESCALATED: 'bg-[#E8F1FB] text-[#2463A6]',
  AWAITING_CUSTOMER: 'bg-[#FFEFE5] text-[#C2410C]',
  RESOLVED: 'bg-[#E7F5EE] text-[#2E9A4F]',
  CLOSED: 'bg-[#EEF0F2] text-[#52617A]',
  CANCELLED: 'bg-[#FDECEC] text-[#E22E41]',
  REJECTED: 'bg-[#FDECEC] text-[#E22E41]',
};

export function ticketStatus(status: string) {
  const key = (status || '').toUpperCase();
  return {
    label: key === 'OPEN' ? 'Open' : humanizeEnum(key) || 'Unknown',
    className: STATUS_TONES[key] ?? 'bg-[#EEF0F2] text-[#52617A]',
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

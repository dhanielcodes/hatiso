import { apiGet, apiPost } from '@/lib/api/axios';
import type { ApiResponse } from '@/types';

/* ─── Types ────────────────────────────────────────────────────── */
export type SupportContentSection = 'HELP' | 'FAQ' | 'CONTACT' | 'TERMS' | 'PRIVACY' | (string & {});
export type SupportRequestType = 'ENQUIRY' | 'COMPLAINT' | 'OTHER' | (string & {});

/** A published help entry from GET /api/individual/support/options. */
export interface SupportContentEntry {
  section: SupportContentSection;
  title: string;
  body: string | null;
  url: string | null;
}

export interface SupportOptions {
  /** e.g. ["GENERAL_ENQUIRY", "TRANSACTION_ISSUE", …] */
  enquiryTypes: string[];
  content: SupportContentEntry[];
}

export interface CreateEnquiryPayload {
  enquiryType: string;
  /** Incident date, YYYY-MM-DD */
  date: string;
  remark: string;
  requestType?: 'ENQUIRY' | 'COMPLAINT';
}

export interface FeedbackPayload {
  /** 1 to 5 */
  rating: number;
  remark?: string;
}

/** Returned by the enquiry and feedback endpoints. */
export interface SupportReceipt {
  ticketId: string;
  reference: string;
  status: string;
  createdAt: string;
}

export interface SupportHistoryItem {
  ticketId: string;
  reference: string;
  requestType: SupportRequestType;
  enquiryType: string | null;
  status: string;
  /** Incident date, YYYY-MM-DD */
  date: string | null;
  rating: number | null;
  remark: string | null;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  reference: string;
  customerId: string | null;
  requestType: SupportRequestType;
  category: string | null;
  subject: string | null;
  description: string | null;
  transactionReference: string | null;
  priority: string | null;
  status: string;
  channel: string | null;
  resolutionSummary: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
}

/** The spec has no example message yet, so only `body` and `createdAt` are relied on. */
export interface SupportTicketMessage {
  id: string;
  ticketId?: string;
  body: string;
  visibility?: string;
  authorId?: string | null;
  senderId?: string | null;
  actorId?: string | null;
  authorType?: string | null;
  senderType?: string | null;
  authorName?: string | null;
  createdAt: string;
}

export interface SupportTicketActivity {
  id: string;
  ticketId: string;
  actorId: string | null;
  type: string;
  description: string | null;
  fromValue: string | null;
  toValue: string | null;
  createdAt: string;
}

export interface SupportTicketDetail {
  ticket: SupportTicket;
  messages: SupportTicketMessage[];
  activities: SupportTicketActivity[];
}

/* ─── Helpers ──────────────────────────────────────────────────── */
/** A fresh key per user action. Retries of the same action must reuse it. */
export function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const withKey = (idempotencyKey?: string) =>
  idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;

const TICKETS = () => `/api/${process.env.NEXT_PUBLIC_API_VERSION}/support/tickets`;

/* ─── Endpoints ────────────────────────────────────────────────── */
export function getSupportOptions() {
  return apiGet<ApiResponse<SupportOptions>>('/api/individual/support/options');
}

export function createSupportEnquiry(payload: CreateEnquiryPayload, idempotencyKey?: string) {
  return apiPost<ApiResponse<SupportReceipt>>('/api/individual/support/enquiries', payload, withKey(idempotencyKey));
}

export function submitSupportFeedback(payload: FeedbackPayload, idempotencyKey?: string) {
  return apiPost<ApiResponse<SupportReceipt>>('/api/individual/support/feedback', payload, withKey(idempotencyKey));
}

export function getSupportHistory(page = 0, size = 20) {
  return apiGet<ApiResponse<SupportHistoryItem[]>>('/api/individual/support/history', { page, size });
}

export function getSupportTicket(ticketId: string) {
  return apiGet<ApiResponse<SupportTicketDetail>>(`${TICKETS()}/${encodeURIComponent(ticketId)}`);
}

export function replyToSupportTicket(ticketId: string, body: string, idempotencyKey?: string) {
  return apiPost<ApiResponse<SupportTicket>>(
    `${TICKETS()}/${encodeURIComponent(ticketId)}/messages`,
    { body, visibility: 'CUSTOMER_VISIBLE' },
    withKey(idempotencyKey)
  );
}

export function reopenSupportTicket(ticketId: string, reason: string, idempotencyKey?: string) {
  return apiPost<ApiResponse<SupportTicket>>(
    `${TICKETS()}/${encodeURIComponent(ticketId)}/reopen`,
    { reason },
    withKey(idempotencyKey)
  );
}

'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { ChevronLeft, Clock, Headphones, MessageSquare, RotateCcw, UserRound } from 'lucide-react';
import { SubmitButton, TextAreaField } from '@/components/forms';
import {
  REOPENABLE_STATUSES,
  formatDateTime,
  humanizeEnum,
  ticketStatus,
  ticketTypeLabel,
} from '@/components/support/supportDisplay';
import { newIdempotencyKey, type SupportTicket, type SupportTicketMessage } from '@/lib/api/support';
import { useReopenSupportTicket, useReplyToSupportTicket, useSupportTicket } from '@/lib/queries/useSupport';

const CARD = 'rounded-xl border border-[#EBE6E1] bg-white';

/* ─── Helpers ──────────────────────────────────────────────────── */
function isFromCustomer(message: SupportTicketMessage, ticket: SupportTicket) {
  const role = `${message.authorType ?? message.senderType ?? ''}`.toUpperCase();
  if (role) return role.includes('CUSTOMER') || role.includes('INDIVIDUAL');
  const author = message.authorId ?? message.senderId ?? message.actorId;
  return Boolean(author && ticket.customerId && author === ticket.customerId);
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-t border-[#EEEAE6] py-3.5 first:border-t-0">
      <dt className="shrink-0 text-sm text-[#7A7F8A]">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm font-medium text-[#20232A]">{children}</dd>
    </div>
  );
}

function Bubble({ mine, author, time, children }: { mine: boolean; author: string; time: string; children: ReactNode }) {
  return (
    <li className={`flex gap-3 ${mine ? 'flex-row-reverse' : ''}`}>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${mine ? 'bg-[#FFF3EC] text-[#E95312]' : 'bg-[#EEF4F6] text-[#2A7F86]'}`}
        aria-hidden="true"
      >
        {mine ? <UserRound className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
      </span>
      <div className={`min-w-0 max-w-[85%] ${mine ? 'text-right' : ''}`}>
        <p className="text-xs text-[#7A7F8A]">
          <span className="font-medium text-[#52617A]">{author}</span> · {time}
        </p>
        <div
          className={`mt-1.5 inline-block whitespace-pre-line break-words rounded-xl px-4 py-3 text-left text-sm leading-relaxed ${mine ? 'rounded-tr-sm bg-[#243B4A] text-white' : 'rounded-tl-sm bg-[#F4F6F8] text-[#20232A]'}`}
        >
          {children}
        </div>
      </div>
    </li>
  );
}

/* ─── Reply / reopen forms ─────────────────────────────────────── */
const replySchema = Yup.object({
  body: Yup.string().trim().required('Write a message.').max(10_000, 'Keep it under 10,000 characters.'),
});
const reopenSchema = Yup.object({
  reason: Yup.string().trim().required('Tell us why you are reopening this ticket.').max(2_000, 'Keep it under 2,000 characters.'),
});

function ReplyForm({ ticketId }: { ticketId: string }) {
  const reply = useReplyToSupportTicket(ticketId);
  const keyRef = useRef(newIdempotencyKey());

  const submit = async (values: { body: string }, { resetForm }: FormikHelpers<{ body: string }>) => {
    try {
      await reply.mutateAsync({ body: values.body.trim(), idempotencyKey: keyRef.current });
      keyRef.current = newIdempotencyKey();
      resetForm();
    } catch {
      // Error toast comes from the axios interceptor.
    }
  };

  return (
    <Formik initialValues={{ body: '' }} validationSchema={replySchema} onSubmit={submit}>
      <Form noValidate className="border-t border-[#EEEAE6] pt-5">
        <TextAreaField name="body" id="ticket-reply" label="Reply" variant="dashboard" placeholder="Write a message to support" rows={3} maxLength={10_000} />
        <div className="mt-4 flex justify-end">
          <SubmitButton variant="primary" loadingLabel="Sending…">
            Send reply
          </SubmitButton>
        </div>
      </Form>
    </Formik>
  );
}

function ReopenForm({ ticketId }: { ticketId: string }) {
  const reopen = useReopenSupportTicket(ticketId);
  const keyRef = useRef(newIdempotencyKey());

  const submit = async (values: { reason: string }, { resetForm }: FormikHelpers<{ reason: string }>) => {
    try {
      await reopen.mutateAsync({ reason: values.reason.trim(), idempotencyKey: keyRef.current });
      keyRef.current = newIdempotencyKey();
      resetForm();
    } catch {
      // Error toast comes from the axios interceptor.
    }
  };

  return (
    <Formik initialValues={{ reason: '' }} validationSchema={reopenSchema} onSubmit={submit}>
      <Form noValidate className="rounded-lg border border-[#F6D9C8] bg-[#FFF6F0] p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#20232A]">
          <RotateCcw className="h-4 w-4 text-[#E95312]" /> Still having this problem?
        </p>
        <p className="mt-1 text-xs text-[#52617A]">Reopen the ticket and tell us what happened.</p>
        <TextAreaField name="reason" id="ticket-reopen" label="Reason" variant="dashboard" placeholder="The issue occurred again…" rows={3} maxLength={2_000} className="mt-4" />
        <div className="mt-4 flex justify-end">
          <SubmitButton variant="primary" loadingLabel="Reopening…">
            Reopen ticket
          </SubmitButton>
        </div>
      </Form>
    </Formik>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
function TicketSkeleton() {
  return (
    <div className="grid gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[1.6fr_1fr] lg:py-7" aria-hidden="true">
      {[0, 1].map((col) => (
        <div key={col} className={`${CARD} space-y-4 p-6`}>
          {Array.from({ length: col ? 5 : 3 }, (_, i) => (
            <span key={i} className="block h-4 animate-pulse rounded bg-[#EEF0F2]" style={{ width: `${90 - i * 12}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function SupportTicketPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketId = params?.ticketId ? decodeURIComponent(params.ticketId) : undefined;
  const { data, isLoading, isError, refetch, isFetching } = useSupportTicket(ticketId);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const ticket = data?.ticket;
  const status = ticket ? ticketStatus(ticket.status) : null;
  const canReopen = ticket ? REOPENABLE_STATUSES.includes(ticket.status.toUpperCase()) : false;
  const messages = data?.messages ?? [];
  const activities = [...(data?.activities ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const shownActivities = showAllActivity ? activities : activities.slice(0, 5);

  return (
    <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
      {/* ── Page header ── */}
      <section className="border-b border-[#F0E9E5] px-5 py-7 sm:px-8">
        <Link href="/dashboard/support" className="mb-4 inline-flex items-center gap-1 text-sm text-[#52617A] transition hover:text-[#20232A]">
          <ChevronLeft className="h-4 w-4" /> Support
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#E95312]">Support ticket</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#20232A] sm:text-3xl">
            {ticket ? ticket.subject || ticketTypeLabel(ticket) : isLoading ? 'Loading ticket…' : 'Ticket'}
          </h2>
          {status && <span className={`rounded px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>}
        </div>
        {ticket && <p className="mt-2 break-all font-mono text-sm text-[#777486]">{ticket.reference}</p>}
      </section>

      {isLoading ? (
        <TicketSkeleton />
      ) : isError || !ticket ? (
        <div className="px-5 py-10 sm:px-8">
          <div className={`${CARD} mx-auto max-w-md px-6 py-10 text-center`}>
            <p className="text-sm text-[#52617A]">We could not load this ticket.</p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-4 rounded-md border border-[#E6E3E0] bg-white px-3.5 py-2 text-xs font-medium text-[#20232A] transition hover:bg-slate-50 disabled:opacity-60"
            >
              {isFetching ? 'Retrying…' : 'Try again'}
            </button>
          </div>
        </div>
      ) : (
        <main className="grid gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[1.6fr_1fr] lg:py-7">
          {/* ── Conversation ── */}
          <section className={`${CARD} p-5 sm:p-6`} aria-labelledby="conversation-title">
            <h3 id="conversation-title" className="flex items-center gap-2 text-base font-semibold text-[#20232A]">
              <MessageSquare className="h-4 w-4 text-[#E95312]" /> Conversation
            </h3>

            <ul className="mt-6 space-y-5">
              {ticket.description && (
                <Bubble mine author="You" time={formatDateTime(ticket.createdAt)}>
                  {ticket.description}
                </Bubble>
              )}
              {messages.map((message) => {
                const mine = isFromCustomer(message, ticket);
                return (
                  <Bubble key={message.id} mine={mine} author={mine ? 'You' : message.authorName || 'Hatiso support'} time={formatDateTime(message.createdAt)}>
                    {message.body}
                  </Bubble>
                );
              })}
            </ul>

            {!messages.length && (
              <p className="mt-6 flex items-center gap-2 rounded-lg bg-[#F9F9FA] px-4 py-3 text-xs text-[#7A7F8A]">
                <Clock className="h-4 w-4 shrink-0" /> Our support team will reply here. Most requests get a response within 24 hours.
              </p>
            )}

            {ticket.resolutionSummary && (
              <div className="mt-6 rounded-lg border border-[#D5EEDD] bg-[#F3FAF6] px-4 py-3">
                <p className="text-xs font-semibold text-[#2E9A4F]">Resolution</p>
                <p className="mt-1 whitespace-pre-line text-sm text-[#20232A]">{ticket.resolutionSummary}</p>
              </div>
            )}

            <div className="mt-6">{canReopen ? <ReopenForm ticketId={ticket.id} /> : <ReplyForm ticketId={ticket.id} />}</div>
          </section>

          {/* ── Side column ── */}
          <div className="space-y-5">
            <section className={`${CARD} p-5 sm:p-6`} aria-labelledby="ticket-details-title">
              <h3 id="ticket-details-title" className="text-base font-semibold text-[#20232A]">
                Details
              </h3>
              <dl className="mt-3">
                <DetailRow label="Type">{ticketTypeLabel(ticket)}</DetailRow>
                <DetailRow label="Request">{humanizeEnum(ticket.requestType)}</DetailRow>
                {ticket.priority && <DetailRow label="Priority">{humanizeEnum(ticket.priority)}</DetailRow>}
                {ticket.transactionReference && (
                  <DetailRow label="Transaction">
                    <span className="break-all font-mono text-[13px]">{ticket.transactionReference}</span>
                  </DetailRow>
                )}
                <DetailRow label="Created">{formatDateTime(ticket.createdAt)}</DetailRow>
                <DetailRow label="Last update">{formatDateTime(ticket.updatedAt)}</DetailRow>
                {ticket.resolvedAt && <DetailRow label="Resolved">{formatDateTime(ticket.resolvedAt)}</DetailRow>}
                {ticket.closedAt && <DetailRow label="Closed">{formatDateTime(ticket.closedAt)}</DetailRow>}
              </dl>
            </section>

            {activities.length > 0 && (
              <section className={`${CARD} p-5 sm:p-6`} aria-labelledby="ticket-activity-title">
                <h3 id="ticket-activity-title" className="text-base font-semibold text-[#20232A]">
                  Activity
                </h3>
                <ol className="mt-5">
                  {shownActivities.map((activity, index) => (
                    <li key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {index < shownActivities.length - 1 && (
                        <span className="absolute bottom-0 left-[5px] top-4 w-px bg-[#E6E3E0]" aria-hidden="true" />
                      )}
                      <span className="relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-[#E95312] bg-white" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#20232A]">
                          {activity.description || humanizeEnum(activity.type)}
                          {activity.toValue && activity.type?.toUpperCase().includes('STATUS') && (
                            <span className="font-normal text-[#52617A]"> → {humanizeEnum(activity.toValue)}</span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-[#7A7F8A]">{formatDateTime(activity.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                {activities.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllActivity((v) => !v)}
                    className="mt-4 text-xs font-medium text-[#E95312] hover:opacity-70"
                  >
                    {showAllActivity ? 'Show less' : `Show all ${activities.length}`}
                  </button>
                )}
              </section>
            )}
          </div>
        </main>
      )}
    </div>
  );
}

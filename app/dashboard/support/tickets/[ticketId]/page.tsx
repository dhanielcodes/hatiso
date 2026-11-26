'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import moment from 'moment';
import { ArrowLeft, Check, ChevronRight, LifeBuoy, Receipt, X } from 'lucide-react';
import {
  REOPENABLE_STATUSES,
  humanizeEnum,
  ticketStatus,
  ticketTypeLabel,
} from '@/components/support/supportDisplay';
import { newIdempotencyKey, type SupportTicket, type SupportTicketMessage } from '@/lib/api/support';
import {
  useReopenSupportTicket,
  useReplyToSupportTicket,
  useSubmitSupportFeedback,
  useSupportTicket,
} from '@/lib/queries/useSupport';

const CARD = 'rounded-[14px] border border-tone-100 bg-surface';
const BTN = 'hz-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium text-tone-744 hover:border-tone-414 disabled:opacity-50';
const BTN_PRIMARY = 'hz-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-brand-305 px-[18px] text-sm font-medium text-on-brand hover:bg-brand-361 disabled:opacity-50';
const TEXTAREA = 'w-full resize-y rounded-lg border border-tone-100 bg-surface px-3.5 py-3 text-[15px] leading-normal text-tone-744 outline-none placeholder:text-tone-414 focus:border-brand-305';

/* ─── Helpers ──────────────────────────────────────────────────── */
function isFromCustomer(message: SupportTicketMessage, ticket: SupportTicket) {
  const role = `${message.authorType ?? message.senderType ?? ''}`.toUpperCase();
  if (role) return role.includes('CUSTOMER') || role.includes('INDIVIDUAL');
  const author = message.authorId ?? message.senderId ?? message.actorId;
  return Boolean(author && ticket.customerId && author === ticket.customerId);
}

function when(iso: string | null | undefined) {
  const d = moment(iso);
  if (!iso || !d.isValid()) return '—';
  if (d.isSame(moment(), 'day')) return `Today, ${d.format('HH:mm')}`;
  if (d.isSame(moment().subtract(1, 'day'), 'day')) return `Yesterday, ${d.format('HH:mm')}`;
  return d.format('D MMM, HH:mm');
}

function statusColor(status: string) {
  const key = status.toUpperCase();
  if (['RESOLVED', 'CLOSED'].includes(key)) return { text: 'text-status-success', dot: 'bg-status-success' };
  if (['CANCELLED', 'REJECTED'].includes(key)) return { text: 'text-status-error', dot: 'bg-status-error' };
  return { text: 'text-status-warning', dot: 'bg-status-warning' };
}

type ThreadItem = { id: string; kind: 'me' | 'them' | 'update'; who: string; at: string; text: string };

/* ─── Reply and reopen ─────────────────────────────────────────── */
function ReplyBox({ ticketId }: { ticketId: string }) {
  const reply = useReplyToSupportTicket(ticketId);
  const keyRef = useRef(newIdempotencyKey());
  const [body, setBody] = useState('');

  const send = async () => {
    const text = body.trim();
    if (!text) return;
    try {
      await reply.mutateAsync({ body: text.slice(0, 10_000), idempotencyKey: keyRef.current });
      keyRef.current = newIdempotencyKey();
      setBody('');
    } catch {
      // Error toast comes from the axios interceptor.
    }
  };

  return (
    <div className="flex flex-col gap-2.5 border-t border-tone-44 px-[22px] pt-4 pb-[22px]">
      <label htmlFor="reply" className="sr-only">Reply</label>
      <textarea id="reply" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply" maxLength={10_000} className={TEXTAREA} />
      <div className="flex justify-end">
        <button type="button" onClick={send} disabled={!body.trim() || reply.isPending} className={BTN_PRIMARY}>
          {reply.isPending ? 'Sending…' : 'Send reply'}
        </button>
      </div>
    </div>
  );
}

function ResolvedBar({ ticketId, onRate, startAsking = false }: { ticketId: string; onRate: () => void; startAsking?: boolean }) {
  const reopen = useReopenSupportTicket(ticketId);
  const keyRef = useRef(newIdempotencyKey());
  const [asking, setAsking] = useState(startAsking);
  const [reason, setReason] = useState('');

  const submit = async () => {
    const text = reason.trim();
    if (!text) return;
    try {
      await reopen.mutateAsync({ reason: text.slice(0, 2_000), idempotencyKey: keyRef.current });
      keyRef.current = newIdempotencyKey();
      setReason('');
      setAsking(false);
    } catch {
      // Error toast comes from the axios interceptor.
    }
  };

  if (asking) {
    return (
      <div className="hz-pop flex flex-col gap-2.5 border-t border-tone-44 px-[22px] pt-4 pb-[22px]">
        <label htmlFor="reopen-reason" className="text-sm font-medium">What happened?</label>
        <textarea id="reopen-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="The problem came back…" maxLength={2_000} className={TEXTAREA} />
        <div className="flex justify-end gap-2.5">
          <button type="button" onClick={() => setAsking(false)} className={BTN}>Cancel</button>
          <button type="button" onClick={submit} disabled={!reason.trim() || reopen.isPending} className={BTN_PRIMARY}>
            {reopen.isPending ? 'Reopening…' : 'Reopen request'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hz-pop flex flex-wrap items-center gap-3 border-t border-tone-44 px-[22px] py-[18px]">
      <span className="flex-[1_1_260px] text-sm text-tone-414">This request is resolved. Still having trouble? Reopen it and tell us what happened.</span>
      <button type="button" onClick={() => setAsking(true)} className={BTN}>Reopen</button>
      <button type="button" onClick={onRate} className={BTN_PRIMARY}>Rate this help</button>
    </div>
  );
}

/* ─── Feedback dialog (Feedback board) ─────────────────────────── */
const SCORE_LABELS = ['Poor', 'Fair', 'Okay', 'Good', 'Great'];

function FeedbackDialog({ ticket, onClose, onReopen }: { ticket: SupportTicket; onClose: () => void; onReopen: () => void }) {
  const submitFeedback = useSubmitSupportFeedback();
  const keyRef = useRef(newIdempotencyKey());
  const [step, setStep] = useState<'ask' | 'rate' | 'thanks'>('ask');
  const [score, setScore] = useState(0);
  const [remark, setRemark] = useState('');

  const send = async () => {
    if (!score) return;
    const text = remark.trim();
    try {
      await submitFeedback.mutateAsync({
        rating: score,
        // Feedback isn't linked to a ticket in the API, so the reference goes in the remark.
        remark: `Support request ${ticket.reference}${text ? `\n\n${text}` : ''}`,
        idempotencyKey: keyRef.current,
      });
      keyRef.current = newIdempotencyKey();
      setStep('thanks');
    } catch {
      // Error toast comes from the axios interceptor.
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-carbon/60 px-4 py-10" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="fb-title" className="hz-pop relative w-full max-w-[460px] overflow-hidden rounded-[14px] bg-surface text-tone-744 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg bg-tone-44 hover:bg-tone-100">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {step === 'ask' && (
          <div className="flex flex-col gap-[18px] px-6 pt-7 pb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-tone-44">
              <LifeBuoy className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 id="fb-title" className="text-xl font-semibold">Do you still need our help?</h2>
              <p className="text-[15px] leading-relaxed text-tone-414">We marked &ldquo;{ticket.subject || ticketTypeLabel(ticket)}&rdquo; as resolved.</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={onReopen} className={BTN}>Yes, reopen it</button>
              <button type="button" onClick={() => setStep('rate')} className={BTN_PRIMARY}>No, all sorted</button>
            </div>
          </div>
        )}

        {step === 'rate' && (
          <div className="hz-pop flex flex-col gap-[18px] px-6 pt-7 pb-6">
            <h2 id="fb-title" className="pr-12 text-xl font-semibold">How was your experience with Hatiso support?</h2>
            <div role="radiogroup" aria-label="Rating" className="grid grid-cols-5 gap-2">
              {SCORE_LABELS.map((label, i) => {
                const on = score === i + 1;
                return (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setScore(i + 1)}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[10px] border transition-colors ${on ? 'border-brand-305 bg-brand-305 text-on-brand' : 'border-tone-100 bg-surface hover:border-tone-414'}`}
                  >
                    <span className="text-xl font-semibold">{i + 1}</span>
                    <span className="text-[11px]">{label}</span>
                  </button>
                );
              })}
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>
                Anything we could do better? <span className="font-normal text-tone-414">(optional)</span>
              </span>
              <textarea rows={3} value={remark} onChange={(e) => setRemark(e.target.value)} maxLength={9_000} className={TEXTAREA} />
            </label>
            <button type="button" onClick={send} disabled={!score || submitFeedback.isPending} className={`${BTN_PRIMARY} min-h-12`}>
              {submitFeedback.isPending ? 'Sending…' : 'Send feedback'}
            </button>
          </div>
        )}

        {step === 'thanks' && (
          <div className="hz-stagger flex flex-col items-center gap-3 px-6 pt-9 pb-7 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-status-success text-white">
              <Check className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 id="fb-title" className="text-[22px] font-semibold">Thanks for your feedback.</h2>
            <p className="text-[15px] leading-relaxed text-tone-414">It helps us make Hatiso support better.</p>
            <Link href="/dashboard/support" className={`${BTN_PRIMARY} mt-2`}>Back to help</Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function SupportTicketPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketId = params?.ticketId ? decodeURIComponent(params.ticketId) : undefined;
  const { data, isLoading, isError, refetch, isFetching } = useSupportTicket(ticketId);
  const [rating, setRating] = useState(false);
  const [reopenKey, setReopenKey] = useState(0);

  const ticket = data?.ticket;
  const status = ticket ? ticketStatus(ticket.status) : null;
  const tone = ticket ? statusColor(ticket.status) : null;
  const closed = ticket ? REOPENABLE_STATUSES.includes(ticket.status.toUpperCase()) : false;

  // One thread: the opening description, messages, and status changes as "Update" notes.
  const thread: ThreadItem[] = ticket
    ? [
      ...(ticket.description ? [{ id: 'desc', kind: 'me' as const, who: 'You', at: ticket.createdAt, text: ticket.description }] : []),
      ...(data?.messages ?? []).map((m) => {
        const mine = isFromCustomer(m, ticket);
        return { id: m.id, kind: mine ? ('me' as const) : ('them' as const), who: mine ? 'You' : m.authorName || 'Hatiso support', at: m.createdAt, text: m.body };
      }),
      ...(data?.activities ?? [])
        .filter((a) => a.type?.toUpperCase().includes('STATUS') && a.toValue)
        .map((a) => ({ id: a.id, kind: 'update' as const, who: 'Update', at: a.createdAt, text: `Status changed to ${humanizeEnum(a.toValue)}` })),
    ].sort((a, b) => a.at.localeCompare(b.at))
    : [];

  return (
    <div className="min-h-full bg-tone-44 text-tone-744">
      <div className="flex w-full flex-col gap-6 p-[clamp(20px,3vw,40px)]">
        <div className="hz-rise flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-[clamp(28px,3vw,36px)] leading-[1.1] font-semibold tracking-[-0.025em]">
              {ticket ? ticket.subject || ticketTypeLabel(ticket) : isLoading ? 'Loading request…' : 'Support request'}
            </h1>
            <span className="text-[15px] text-tone-414">
              <Link href="/dashboard/support" className="inline-flex items-center gap-1.5 font-medium text-tone-744 hover:underline">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Help and support
              </Link>
              {ticket && <> · <span className="break-all">{ticket.reference}</span></>}
            </span>
          </div>
          {status && tone && (
            <span className={`inline-flex items-center gap-1.5 rounded-md border border-tone-100 bg-surface px-3 py-1.5 text-[13px] font-medium ${tone.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
              {status.label}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-wrap gap-4" aria-hidden="true">
            <div className="h-80 flex-[999_1_560px] animate-pulse rounded-[14px] bg-surface" />
            <div className="h-56 flex-[1_1_300px] animate-pulse rounded-[14px] bg-surface" />
          </div>
        ) : isError || !ticket ? (
          <div className={`${CARD} mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-10 text-center`}>
            <p className="text-[15px] text-tone-414">We couldn&apos;t load this request.</p>
            <button type="button" onClick={() => refetch()} disabled={isFetching} className={BTN}>
              {isFetching ? 'Retrying…' : 'Try again'}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-4">
            <section className={`hz-rise ${CARD} flex min-w-0 flex-[999_1_560px] flex-col`} style={{ '--d': 1 } as React.CSSProperties}>
              <div className="hz-stagger flex flex-col gap-[18px] p-[22px]">
                {thread.map((m) => (
                  <div key={m.id} className={`flex flex-col gap-1.5 ${m.kind === 'me' ? 'items-end' : m.kind === 'them' ? 'items-start' : 'items-center'}`}>
                    <span className="text-xs text-tone-414">{m.who} · {when(m.at)}</span>
                    <div
                      className={`max-w-[80%] whitespace-pre-line break-words px-4 py-3.5 text-[15px] leading-[1.55] ${m.kind === 'me'
                        ? 'rounded-[12px_12px_4px_12px] bg-brand-305 text-on-brand'
                        : m.kind === 'them'
                          ? 'rounded-[12px_12px_12px_4px] bg-tone-44'
                          : 'rounded-lg border border-dashed border-tone-100 bg-surface text-tone-414'
                        }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {!(data?.messages ?? []).length && (
                  <p className="self-center text-[13px] text-tone-414">Our team will reply here. Most requests get an answer within 24 hours.</p>
                )}
                {ticket.resolutionSummary && (
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-xs text-tone-414">Hatiso support · Resolution</span>
                    <div className="max-w-[80%] whitespace-pre-line rounded-[12px_12px_12px_4px] bg-tone-44 px-4 py-3.5 text-[15px] leading-[1.55]">{ticket.resolutionSummary}</div>
                  </div>
                )}
              </div>
              {closed ? <ResolvedBar key={reopenKey} startAsking={reopenKey > 0} ticketId={ticket.id} onRate={() => setRating(true)} /> : <ReplyBox ticketId={ticket.id} />}
            </section>

            <aside className="hz-rise flex min-w-0 flex-[1_1_300px] flex-col gap-4" style={{ '--d': 2 } as React.CSSProperties}>
              <section className={`${CARD} flex flex-col gap-3 p-5 text-sm`}>
                <h2 className="text-lg font-semibold">Details</h2>
                <div className="flex justify-between gap-3"><span className="text-tone-414">Type</span><span className="font-medium">{ticket.requestType === 'COMPLAINT' ? 'Complaint' : ticketTypeLabel(ticket)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-tone-414">Opened</span><span className="font-medium">{when(ticket.createdAt)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-tone-414">Last update</span><span className="font-medium">{when(ticket.updatedAt)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-tone-414">Handled by</span><span className="font-medium">Hatiso support</span></div>
              </section>
              {ticket.transactionReference && (
                <Link href="/dashboard/transactions" className={`hz-lift ${CARD} flex items-center gap-3.5 p-[18px]`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-tone-44">
                    <Receipt className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[15px] font-medium">Linked payment</span>
                    <span className="truncate text-[13px] text-tone-414">{ticket.transactionReference}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-tone-414" aria-hidden="true" />
                </Link>
              )}
            </aside>
          </div>
        )}
      </div>

      {rating && ticket && (
        <FeedbackDialog
          ticket={ticket}
          onClose={() => setRating(false)}
          onReopen={() => {
            setRating(false);
            setReopenKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}

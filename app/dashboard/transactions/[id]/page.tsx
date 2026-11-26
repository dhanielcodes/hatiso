'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { ArrowLeft, Check, Clock, Copy, Download, Receipt, X } from 'lucide-react';
import TransactionSupportModal from '@/components/support/TransactionSupportModal';
import type { DigitalServiceCategory } from '@/lib/api/digitalServices';
import type { DigitalServiceOrderHistory } from '@/lib/api/orders';

/* ─── Constants ────────────────────────────────────────────────── */
const CARD = 'rounded-[14px] border border-tone-100 bg-surface';
const BTN = 'hz-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium text-tone-744 hover:border-tone-414';

const CATEGORY_LABELS: Record<DigitalServiceCategory, string> = {
    TELCO: 'Airtime and data',
    INTERNET_SERVICES: 'Internet',
    DISCO: 'Electricity',
    CABLE: 'Cable TV',
    EDUCATION: 'Education',
    INSURANCE: 'Insurance',
    OTHER_SERVICES: 'Other services',
};

const RECIPIENT_LABEL: Partial<Record<DigitalServiceCategory, string>> = {
    TELCO: 'Phone number',
    DISCO: 'Meter number',
    CABLE: 'Smartcard number',
    INTERNET_SERVICES: 'Account number',
};

const SUCCESS = new Set(['FULFILLED', 'SUCCESSFUL', 'SUCCESS', 'COMPLETED']);
const PENDING = new Set(['AWAITING_PAYMENT', 'PENDING', 'PROCESSING', 'INITIATED', 'IN_PROGRESS']);
type Group = 'SUCCESS' | 'PENDING' | 'FAILED';
const statusGroup = (s: string): Group => (SUCCESS.has(s.toUpperCase()) ? 'SUCCESS' : PENDING.has(s.toUpperCase()) ? 'PENDING' : 'FAILED');
const STATUS_VIEW: Record<Group, { label: string; text: string; dot: string }> = {
    SUCCESS: { label: 'Successful', text: 'text-status-success', dot: 'bg-status-success' },
    PENDING: { label: 'Pending', text: 'text-status-warning', dot: 'bg-status-warning' },
    FAILED: { label: 'Failed', text: 'text-status-error', dot: 'bg-status-error' },
};

/* ─── Saved transaction ────────────────────────────────────────── */
// The transactions list saves the clicked row to localStorage before opening this page.
// TODO: replace with a transaction query (looked up by the reference in the URL) once the API has one.
const STORAGE_KEY = 'transactionDetails';
const subscribeToStorage = (onChange: () => void) => {
    window.addEventListener('storage', onChange);
    return () => window.removeEventListener('storage', onChange);
};
const readSavedTransaction = () => {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};
const readOnServer = () => undefined;

function parseTransaction(raw: string | null): DigitalServiceOrderHistory | null {
    if (!raw) return null;
    try {
        const value = JSON.parse(raw) as Partial<DigitalServiceOrderHistory>;
        return value && typeof value.reference === 'string' && typeof value.fulfilmentStatus === 'string' ? (value as DigitalServiceOrderHistory) : null;
    } catch {
        return null;
    }
}

/* ─── Helpers ──────────────────────────────────────────────────── */
function providerName(productCode: string) {
    return productCode.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function serviceSlug(order: DigitalServiceOrderHistory) {
    switch (order.category) {
        case 'TELCO':
            return /data/i.test(order.productCode) ? 'data' : 'airtime';
        case 'INTERNET_SERVICES':
            return 'internet-services';
        case 'DISCO':
            return 'electricity';
        case 'CABLE':
            return 'tv';
        case 'EDUCATION':
            return 'education';
        case 'INSURANCE':
            return 'insurance';
        default:
            return 'other-services';
    }
}

function nairaParts(amountMinor: number) {
    const [whole, kobo] = (amountMinor / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.');
    return { whole: `₦${whole}`, kobo: `.${kobo}` };
}

function mask(value: string) {
    const v = value.replace(/\s+/g, '');
    return v.length > 6 ? `${v.slice(0, 4)} ••• ${v.slice(-4)}` : v;
}

function groupToken(code: string) {
    return /^\d{12,}$/.test(code) ? code.replace(/(\d{4})(?=\d)/g, '$1 ') : code;
}

function whenLine(iso: string | null | undefined, group: Group) {
    const d = moment(iso);
    if (!iso || !d.isValid()) return STATUS_VIEW[group].label;
    const verb = group === 'SUCCESS' ? 'Paid' : group === 'PENDING' ? 'Started' : 'Tried';
    if (d.isSame(moment(), 'day')) return `${verb} today at ${d.format('HH:mm')}`;
    if (d.isSame(moment().subtract(1, 'day'), 'day')) return `${verb} yesterday at ${d.format('HH:mm')}`;
    return `${verb} ${d.format('D MMM YYYY [at] HH:mm')}`;
}

function CopyTokenButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value.replace(/\s+/g, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard unavailable */
        }
    };
    return (
        <button type="button" onClick={copy} className={BTN}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy token'}
        </button>
    );
}

/* ─── Details view ─────────────────────────────────────────────── */
function TransactionDetails({ order }: { order: DigitalServiceOrderHistory }) {
    const [supportOpen, setSupportOpen] = useState(false);
    const closeSupport = useCallback(() => setSupportOpen(false), []);

    const group = statusGroup(order.fulfilmentStatus);
    const view = STATUS_VIEW[group];
    const provider = providerName(order.productCode);
    const category = CATEGORY_LABELS[order.category] ?? 'Payment';
    const amount = nairaParts(order.amountMinor);
    const recipientLabel = RECIPIENT_LABEL[order.category] ?? 'Recipient';
    const date = moment(order.expiresAt);

    const rows: [string, string][] = [
        ['Provider', provider],
        [recipientLabel, mask(order.recipient)],
        ...(order.customerName ? [['Customer name', order.customerName] as [string, string]] : []),
        ['Amount', `${amount.whole}${amount.kobo}`],
        ['Paid with', order.paymentReference ? 'Paystack' : 'Not paid'],
        ...(order.units ? [['Units', String(order.units)] as [string, string]] : []),
        ['Reference', order.reference],
        ...(order.paymentReference ? [['Payment reference', order.paymentReference] as [string, string]] : []),
        ...(order.providerReference ? [['Provider reference', order.providerReference] as [string, string]] : []),
        ...(date.isValid() ? [['Date', date.format('D MMM YYYY, HH:mm:ss')] as [string, string]] : []),
    ];

    const delivered = group === 'SUCCESS';
    const failed = group === 'FAILED';
    const paid = Boolean(order.paymentReference) || delivered;
    const steps: { t: string; note: string; state: 'done' | 'pending' | 'failed' | 'todo' }[] = [
        { t: 'Payment received', note: paid ? 'Confirmed by Paystack' : 'Waiting for payment', state: paid ? 'done' : failed ? 'failed' : 'pending' },
        { t: `Sent to ${provider}`, note: paid ? 'Order passed to the provider' : 'After payment', state: paid ? 'done' : 'todo' },
        {
            t: order.deliveryCode ? 'Token issued' : delivered ? 'Delivered' : failed ? 'Not delivered' : 'Waiting for the provider',
            note: delivered ? 'The provider confirmed delivery' : failed ? 'The provider couldn’t complete it' : 'Usually takes under a minute',
            state: delivered ? 'done' : failed ? 'failed' : paid ? 'pending' : 'todo',
        },
        { t: 'Receipt ready', note: delivered ? 'Saved in Transactions' : 'Once delivered', state: delivered ? 'done' : 'todo' },
    ];

    return (
        <>
            <div className="hz-rise flex flex-wrap items-end justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1.5">
                    <h1 className="text-[clamp(28px,3vw,36px)] leading-[1.1] font-semibold tracking-[-0.025em]">
                        {category} · {provider}
                    </h1>
                    <span className="text-[15px] text-tone-414">
                        <Link href="/dashboard/transactions" className="inline-flex items-center gap-1.5 font-medium text-tone-744 hover:underline">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Transactions
                        </Link>{' '}
                        · <span className="break-all">{order.reference}</span>
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                    <button type="button" onClick={() => window.print()} className={BTN}>
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download receipt
                    </button>
                    <Link href={`/dashboard/services?service=${serviceSlug(order)}`} className="hz-press inline-flex min-h-11 items-center justify-center rounded-[10px] bg-brand-305 px-[18px] text-sm font-medium text-on-brand hover:bg-brand-361">
                        Pay again
                    </Link>
                </div>
            </div>

            <div className="flex flex-wrap items-start gap-4">
                <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
                    <section className="hz-rise flex flex-col gap-3.5 rounded-[14px] bg-carbon p-6 text-cloud" style={{ '--d': 1 } as React.CSSProperties}>
                        <span className="flex items-center justify-between gap-3">
                            <span className="text-sm text-grey-400">{whenLine(order.expiresAt, group)}</span>
                            <span className={`inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-medium ${view.text}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${view.dot}`} />
                                {view.label}
                            </span>
                        </span>
                        <span className="text-[48px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                            {amount.whole}
                            <span className="text-[22px] text-grey-500">{amount.kobo}</span>
                        </span>
                        <span className="text-[15px] text-silver">
                            {provider} for {recipientLabel.toLowerCase()} {mask(order.recipient)}
                        </span>
                    </section>

                    {order.deliveryCode && (
                        <section className="hz-rise flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-grey-400 bg-surface p-5" style={{ '--d': 2 } as React.CSSProperties}>
                            <span className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5">
                                <span className="text-[13px] text-tone-414">Your token</span>
                                <span className="break-all text-[26px] font-semibold tracking-[0.06em] tabular-nums">{groupToken(order.deliveryCode)}</span>
                                {order.units && <span className="text-[13px] text-tone-414">{order.units}</span>}
                            </span>
                            <CopyTokenButton value={order.deliveryCode} />
                        </section>
                    )}

                    <section className={`hz-rise ${CARD} overflow-hidden`} style={{ '--d': 3 } as React.CSSProperties}>
                        <div className="px-[22px] py-[18px]">
                            <h2 className="text-lg font-semibold">Details</h2>
                        </div>
                        <dl className="text-sm">
                            {rows.map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-4 border-t border-tone-44 px-[22px] py-[13px]">
                                    <dt className="shrink-0 text-tone-414">{k}</dt>
                                    <dd className="min-w-0 break-all text-right font-medium">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                </div>

                <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4 print:hidden">
                    <section className={`hz-rise ${CARD} flex flex-col gap-4 p-[22px]`} style={{ '--d': 2 } as React.CSSProperties}>
                        <h2 className="text-lg font-semibold">Progress</h2>
                        <ol className="hz-stagger flex flex-col">
                            {steps.map((s, i) => {
                                const last = i === steps.length - 1;
                                const next = steps[i + 1];
                                return (
                                    <li key={s.t} className="flex gap-3.5">
                                        <span className="flex flex-col items-center">
                                            <span
                                                className={`flex h-6 w-6 items-center justify-center rounded-full ${s.state === 'done' ? 'bg-brand-305 text-on-brand' : s.state === 'failed' ? 'bg-status-error text-white' : s.state === 'pending' ? 'bg-status-warning text-white' : 'border border-tone-100 bg-surface text-tone-414'}`}
                                            >
                                                {s.state === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.state === 'failed' ? <X className="h-3.5 w-3.5" strokeWidth={3} /> : s.state === 'pending' ? <Clock className="h-3.5 w-3.5" /> : null}
                                            </span>
                                            {!last && <span className={`min-h-[22px] w-0.5 flex-1 ${next && next.state !== 'todo' ? 'bg-brand-305' : 'bg-tone-100'}`} />}
                                        </span>
                                        <span className="flex flex-col gap-0.5 pb-[18px]">
                                            <span className={`text-[15px] font-medium ${s.state === 'todo' ? 'text-tone-414' : ''}`}>{s.t}</span>
                                            <span className="text-[13px] text-tone-414">{s.note}</span>
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </section>
                    <section className="hz-rise flex flex-col gap-2.5 rounded-[14px] bg-carbon p-[22px] text-cloud" style={{ '--d': 3 } as React.CSSProperties}>
                        <span className="text-base font-semibold">Need help with this payment?</span>
                        <span className="text-sm leading-normal text-silver">Our support team is available 24 hours a day.</span>
                        <button type="button" onClick={() => setSupportOpen(true)} className="hz-press mt-1.5 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-cloud px-[18px] text-sm font-medium text-carbon hover:bg-white">
                            Get help
                        </button>
                    </section>
                </aside>
            </div>

            <TransactionSupportModal
                open={supportOpen}
                onClose={closeSupport}
                transactionReference={order.reference}
                summary={`${provider} ${category.toLowerCase()} to ${order.recipient} · ${amount.whole}${amount.kobo}`}
                complaint={group !== 'SUCCESS'}
            />
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function TransactionDetailsPage() {
    // `undefined` while rendering on the server, then the saved string (or null) in the browser.
    const raw = useSyncExternalStore(subscribeToStorage, readSavedTransaction, readOnServer);
    const order = useMemo(() => (raw === undefined ? null : parseTransaction(raw)), [raw]);
    const loading = raw === undefined;

    return (
        <div className="min-h-full bg-tone-44 text-tone-744">
            <div className="flex w-full flex-col gap-6 p-[clamp(20px,3vw,40px)]">
                {order ? (
                    <TransactionDetails order={order} />
                ) : loading ? (
                    <div className="flex flex-wrap gap-4" aria-hidden="true">
                        <div className="h-72 flex-[999_1_560px] animate-pulse rounded-[14px] bg-surface" />
                        <div className="h-72 flex-[1_1_300px] animate-pulse rounded-[14px] bg-surface" />
                    </div>
                ) : (
                    <div className={`${CARD} mx-auto mt-10 flex max-w-md flex-col items-center gap-2 px-6 py-10 text-center`}>
                        <Receipt className="h-8 w-8 text-tone-414" aria-hidden="true" />
                        <p className="mt-1 text-[15px] font-medium">We couldn&apos;t find this transaction.</p>
                        <p className="text-sm text-tone-414">Open it again from your transactions list.</p>
                        <Link href="/dashboard/transactions" className={`${BTN} mt-3`}>
                            Go to transactions
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

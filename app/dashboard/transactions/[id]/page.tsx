'use client';

import { useCallback, useMemo, useState, useSyncExternalStore, type ComponentType, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Check,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Copy,
    LifeBuoy,
    Receipt,
    Smartphone,
    Tv,
    Wifi,
    X,
    XCircle,
    Zap,
} from 'lucide-react';
import TransactionSupportModal from '@/components/support/TransactionSupportModal';

/* ─── Types ────────────────────────────────────────────────────── */
type Transaction = {
    reference: string;
    tenantId: string;
    productCode: string;
    category: string;
    recipient: string;
    amountMinor: number;
    currency: string;
    expiresAt: string | null;
    fulfilmentStatus: string;
    paymentReference: string;
    providerReference: string | null;
    customerName: string | null;
    deliveryCode: string | null;
    units: number | string | null;
    quantity: number;
};

type StepState = 'done' | 'failed' | 'pending' | 'upcoming';
type IconType = ComponentType<{ className?: string }>;

/* ─── Constants ────────────────────────────────────────────────── */
const CARD = 'rounded-xl border border-tone-88 bg-surface';
const SUPPORT_HREF = '/dashboard/support';

const CATEGORY_META: Record<string, { label: string; icon: IconType }> = {
    TELCO: { label: 'Telecom', icon: Smartphone },
    ELECTRICITY: { label: 'Electricity', icon: Zap },
    TV: { label: 'Cable TV', icon: Tv },
    INTERNET: { label: 'Internet', icon: Wifi },
};

const PRODUCT_NAMES: Record<string, string> = {
    etisalat: '9mobile',
    airtel: 'Airtel',
    mtn: 'MTN',
    glo: 'Glo',
    dstv: 'DStv',
    gotv: 'GOtv',
};

const STATUS_META: Record<
    string,
    { label: string; icon: IconType; pill: string; panel: string; iconColor: string; message: string }
> = {
    FULFILLED: {
        label: 'Successful',
        icon: CheckCircle2,
        pill: 'bg-tone-58 text-success-392',
        panel: 'border-tone-90 bg-tone-21',
        iconColor: 'text-success-392',
        message: 'This service was delivered successfully.',
    },
    FAILED: {
        label: 'Failed',
        icon: XCircle,
        pill: 'bg-tone-59 text-danger-404',
        panel: 'border-danger-90 bg-tone-24',
        iconColor: 'text-danger-404',
        message:
            'This service could not be delivered. If payment was collected, payment or refund status is tracked separately.',
    },
    PENDING: {
        label: 'Pending',
        icon: Clock,
        pill: 'bg-tone-40 text-brand-499',
        panel: 'border-warning-79 bg-tone-14',
        iconColor: 'text-warning-301',
        message: 'Your provider has not confirmed the final delivery outcome. Please check back before repeating the purchase.',
    },
    PROCESSING: {
        label: 'Processing',
        icon: Clock,
        pill: 'bg-tone-40 text-brand-499',
        panel: 'border-warning-79 bg-tone-14',
        iconColor: 'text-warning-301',
        message: 'Your payment was received and your digital service is being processed.',
    },
};

const STEP_CIRCLE: Record<StepState, string> = {
    done: 'bg-success-327 text-white',
    failed: 'bg-danger-404 text-white',
    pending: 'bg-warning-187 text-white',
    upcoming: 'border border-tone-114 bg-surface text-tone-304',
};

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos', // fixed zone so server and client render the same text
});

/* ─── Saved transaction ────────────────────────────────────────── */
// The transactions list saves the clicked row to localStorage before opening this page.
// localStorage only exists in the browser, so it is read with useSyncExternalStore:
// the server render (and first hydration pass) gets `null` instead of crashing.
const STORAGE_KEY = 'transactionDetails';
const subscribeToStorage = (onChange: () => void) => {
    window.addEventListener('storage', onChange);
    return () => window.removeEventListener('storage', onChange);
};
const readSavedTransaction = () => localStorage.getItem(STORAGE_KEY);
const readOnServer = () => undefined;

function parseTransaction(raw: string | null): Transaction | null {
    if (!raw) return null;
    try {
        const value = JSON.parse(raw) as Partial<Transaction>;
        return value && typeof value.reference === 'string' && typeof value.fulfilmentStatus === 'string' ? (value as Transaction) : null;
    } catch {
        return null;
    }
}

/* ─── Helpers ──────────────────────────────────────────────────── */
function titleCase(value: string) {
    return value
        .replace(/[-_]+/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMoney(amountMinor: number, currency: string) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amountMinor / 100);
}

function formatDateTime(iso: string | null) {
    if (!iso) return null;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : DATE_TIME_FORMAT.format(date);
}

/* ─── Small presentational pieces ──────────────────────────────── */
function CopyButton({ value, label }: { value: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard unavailable (e.g. insecure context): ignore silently
        }
    };

    return (
        <button
            type="button"
            onClick={copy}
            aria-label={copied ? `${label} copied` : `Copy ${label}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-tone-98 bg-surface text-ink-510 transition hover:bg-slate-50"
        >
            {copied ? <Check className="h-3.5 w-3.5 text-success-392" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
    );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div>
            <h2 className="text-base font-semibold text-tone-744">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-tone-405">{subtitle}</p>}
        </div>
    );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-6 border-t border-tone-78 py-4 first:border-t-0">
            <dt className="shrink-0 text-sm text-tone-405">{label}</dt>
            <dd className="min-w-0 break-words text-right text-sm font-medium text-tone-744">{children}</dd>
        </div>
    );
}

function ReferenceItem({ label, value }: { label: string; value: string }) {
    return (
        <li className="border-t border-tone-78 py-4 first:border-t-0 first:pt-0 last:pb-0">
            <p className="text-xs text-tone-405">{label}</p>
            <div className="mt-2 flex items-start justify-between gap-3">
                <p className="min-w-0 break-all font-mono text-[13px] leading-relaxed text-tone-744">{value}</p>
                <CopyButton value={value} label={label} />
            </div>
        </li>
    );
}

/* ─── Details view ─────────────────────────────────────────────── */
function TransactionDetails({ transaction }: { transaction: Transaction }) {
    const [supportOpen, setSupportOpen] = useState(false);
    const closeSupport = useCallback(() => setSupportOpen(false), []);
    const status = STATUS_META[transaction.fulfilmentStatus.toUpperCase()] ?? {
        label: titleCase(transaction.fulfilmentStatus),
        icon: Clock,
        pill: 'bg-tone-63 text-ink-510',
        panel: 'border-tone-98 bg-tone-18',
        iconColor: 'text-ink-510',
        message: 'We are checking the latest status of this transaction.',
    };
    const StatusIcon = status.icon;

    const category = CATEGORY_META[transaction.category.toUpperCase()];
    const CategoryIcon = category?.icon ?? Receipt;
    const categoryLabel = category?.label ?? titleCase(transaction.category);
    const productName = PRODUCT_NAMES[transaction.productCode.toLowerCase()] ?? titleCase(transaction.productCode);

    const expires = formatDateTime(transaction.expiresAt);

    // Delivery tracker. Any fulfilment status implies the order was placed and payment was received.
    const upper = transaction.fulfilmentStatus.toUpperCase();
    const deliveryState: StepState = upper === 'FULFILLED' ? 'done' : upper === 'FAILED' ? 'failed' : 'pending';
    const steps: { label: string; description: string; state: StepState }[] = [
        { label: 'Order placed', description: 'Your order was created.', state: 'done' },
        { label: 'Payment received', description: 'Your payment was confirmed.', state: 'done' },
        {
            label: deliveryState === 'done' ? 'Delivered' : deliveryState === 'failed' ? 'Delivery failed' : 'Delivery in progress',
            description:
                deliveryState === 'done'
                    ? 'The service reached the recipient.'
                    : deliveryState === 'failed'
                        ? 'The provider could not complete delivery.'
                        : 'Waiting for the provider to confirm.',
            state: deliveryState,
        },
    ];

    return (
        <main className="mx-auto px-5 py-6 sm:px-8 lg:py-7">
            <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                {/* ── Left column ── */}
                <div className="space-y-5">
                    {/* Summary */}
                    <section className={`${CARD} p-5 sm:p-6`} aria-labelledby="summary-title">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tone-30 text-brand-361">
                                    <CategoryIcon className="h-6 w-6" />
                                </span>
                                <div>
                                    <h2 id="summary-title" className="text-lg font-semibold text-tone-744">
                                        {productName}
                                    </h2>
                                    <p className="mt-1 text-sm text-tone-405">
                                        {categoryLabel} · To {transaction.recipient}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-tone-405">Amount</p>
                                <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-ink-622">
                                    {formatMoney(transaction.amountMinor, transaction.currency)}
                                </p>
                            </div>
                        </div>

                        <div className={`mt-6 flex items-start gap-3 rounded-lg border px-4 py-4 ${status.panel}`}>
                            <StatusIcon className={`mt-0.5 h-5 w-5 shrink-0 ${status.iconColor}`} />
                            <div className="min-w-0">
                                <span className={`inline-block rounded px-2.5 py-1 text-xs font-medium ${status.pill}`}>{status.label}</span>
                                <p className="mt-2 text-sm leading-relaxed text-ink-510">{status.message}</p>
                            </div>
                        </div>
                    </section>

                    {/* Delivery code (only when the provider returned one, e.g. electricity tokens) */}
                    {transaction.deliveryCode && (
                        <section className="rounded-xl border border-brand-95 bg-tone-23 p-5 sm:p-6" aria-labelledby="code-title">
                            <h2 id="code-title" className="text-base font-semibold text-tone-744">
                                Delivery code
                            </h2>
                            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-brand-95 bg-surface px-4 py-3">
                                <p className="min-w-0 break-all font-mono text-lg font-semibold tracking-wider text-brand-361">
                                    {transaction.deliveryCode}
                                </p>
                                <CopyButton value={transaction.deliveryCode} label="delivery code" />
                            </div>
                        </section>
                    )}

                    {/* Order details */}
                    <section className={`${CARD} p-5 sm:p-6`} aria-labelledby="order-title">
                        <h2 id="order-title" className="sr-only">
                            Order details
                        </h2>
                        <CardHeader title="Order details" subtitle="What was bought and who it was for." />
                        <dl className="mt-4">
                            <DetailRow label="Recipient">
                                <span className="inline-flex items-center gap-2">
                                    {transaction.recipient}
                                    <CopyButton value={transaction.recipient} label="recipient" />
                                </span>
                            </DetailRow>
                            <DetailRow label="Product">{productName}</DetailRow>
                            <DetailRow label="Product code">
                                <span className="font-mono text-[13px]">{transaction.productCode}</span>
                            </DetailRow>
                            <DetailRow label="Category">{categoryLabel}</DetailRow>
                            <DetailRow label="Quantity">{transaction.quantity}</DetailRow>
                            <DetailRow label="Amount">{formatMoney(transaction.amountMinor, transaction.currency)}</DetailRow>
                            {transaction.units != null && <DetailRow label="Units">{transaction.units}</DetailRow>}
                            {transaction.customerName && <DetailRow label="Customer name">{transaction.customerName}</DetailRow>}
                            {expires && <DetailRow label="Order expires">{expires}</DetailRow>}
                        </dl>
                    </section>
                </div>

                {/* ── Right column ── */}
                <div className="space-y-5">
                    {/* Delivery tracker */}
                    <section className={`${CARD} p-5 sm:p-6`} aria-labelledby="tracker-title">
                        <h2 id="tracker-title" className="sr-only">
                            Delivery progress
                        </h2>
                        <CardHeader title="Delivery progress" />
                        <ol className="mt-6">
                            {steps.map((step, index) => (
                                <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
                                    {index < steps.length - 1 && (
                                        <span className="absolute bottom-0 left-4 top-9 w-px -translate-x-1/2 bg-tone-98" aria-hidden="true" />
                                    )}
                                    <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${STEP_CIRCLE[step.state]}`}>
                                        {step.state === 'done' && <Check className="h-4 w-4" strokeWidth={3} />}
                                        {step.state === 'failed' && <X className="h-4 w-4" strokeWidth={3} />}
                                        {step.state === 'pending' && <Clock className="h-4 w-4" />}
                                    </span>
                                    <div className="min-w-0 pt-0.5">
                                        <p className="text-sm font-medium text-tone-744">{step.label}</p>
                                        <p className="mt-1 text-xs text-tone-405">{step.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* References */}
                    <section className={`${CARD} p-5 sm:p-6`} aria-labelledby="refs-title">
                        <h2 id="refs-title" className="sr-only">
                            References
                        </h2>
                        <CardHeader title="References" subtitle="Quote these if you contact support." />
                        <ul className="mt-5">
                            <ReferenceItem label="Order reference" value={transaction.reference} />
                            <ReferenceItem label="Payment reference" value={transaction.paymentReference} />
                            {transaction.providerReference && (
                                <ReferenceItem label="Provider reference" value={transaction.providerReference} />
                            )}
                            <ReferenceItem label="Tenant ID" value={transaction.tenantId} />
                        </ul>
                    </section>

                    {/* Help */}
                    <div className="rounded-lg bg-tone-52 px-5 py-5">
                        <div className="flex items-start gap-3">
                            <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-brand-361" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-tone-744">Need help with this transaction?</p>
                                <p className="mt-1 text-xs text-ink-510">Our support team is available 24 hours a day.</p>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSupportOpen(true)}
                                        className="rounded-md bg-brand-311 px-3.5 py-2 text-xs font-semibold text-on-brand transition hover:bg-brand-365"
                                    >
                                        Report an issue
                                    </button>
                                    <Link href={SUPPORT_HREF} className="text-xs font-medium text-ink-510 underline-offset-2 transition hover:text-tone-744 hover:underline">
                                        My support requests
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TransactionSupportModal
                open={supportOpen}
                onClose={closeSupport}
                transactionReference={transaction.reference}
                summary={`${productName} ${categoryLabel.toLowerCase()} to ${transaction.recipient} · ${formatMoney(transaction.amountMinor, transaction.currency)}`}
                complaint={upper === 'FAILED' || upper === 'PENDING' || upper === 'PROCESSING'}
            />
        </main>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function TransactionDetailsPage() {
    const router = useRouter();

    // `undefined` while rendering on the server, then the saved string (or null) in the browser.
    // TODO: replace with a transaction query (looked up by the reference in the URL) once the API has one.
    const raw = useSyncExternalStore(subscribeToStorage, readSavedTransaction, readOnServer);
    const transaction = useMemo(() => (raw === undefined ? null : parseTransaction(raw)), [raw]);
    const loading = raw === undefined;

    return (
        <div className="min-h-full bg-tone-12 text-tone-760">
            {/* ── Page header ── */}
            <section className="border-b border-tone-80 px-5 py-7 sm:px-8">
                <button
                    type="button"
                    onClick={() => {
                        localStorage.removeItem(STORAGE_KEY);
                        router.back();
                    }}
                    className="mb-4 flex items-center gap-1 text-sm text-ink-510 transition hover:text-tone-744"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-361">Transaction</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-tone-744 sm:text-3xl">
                    Every detail, <span className="text-brand-305">in one place.</span>
                </h2>
                {transaction && <p className="mt-2 break-all text-sm text-tone-432 sm:text-base">Reference: {transaction.reference}</p>}
            </section>

            {transaction ? (
                <TransactionDetails transaction={transaction} />
            ) : loading ? (
                <div className="grid gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[1.6fr_1fr] lg:py-7" aria-hidden="true">
                    {[0, 1].map((col) => (
                        <div key={col} className={`${CARD} h-64 animate-pulse bg-tone-38`} />
                    ))}
                </div>
            ) : (
                <div className="px-5 py-10 sm:px-8">
                    <div className={`${CARD} mx-auto max-w-md px-6 py-10 text-center`}>
                        <Receipt className="mx-auto h-8 w-8 text-tone-270" />
                        <p className="mt-3 text-sm font-medium text-tone-744">We couldn&apos;t find this transaction.</p>
                        <p className="mt-1 text-xs text-tone-405">Open it again from your transactions list.</p>
                        <Link
                            href="/dashboard/transactions"
                            className="mt-5 inline-block rounded-md border border-tone-98 bg-surface px-3.5 py-2 text-xs font-medium text-tone-744 transition hover:bg-slate-50"
                        >
                            Go to transactions
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
'use client';

import { useState, type ComponentType, type ReactNode } from 'react';
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
const CARD = 'rounded-xl border border-[#EBE6E1] bg-white';
const SUPPORT_HREF = '/dashboard/support'; // adjust to your support route

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
        pill: 'bg-[#E7F5EE] text-[#2E9A4F]',
        panel: 'border-[#D5EEDD] bg-[#F3FAF6]',
        iconColor: 'text-[#2E9A4F]',
        message: 'This service was delivered successfully.',
    },
    FAILED: {
        label: 'Failed',
        icon: XCircle,
        pill: 'bg-[#FDECEC] text-[#E22E41]',
        panel: 'border-[#F8D9D5] bg-[#FFF5F4]',
        iconColor: 'text-[#E22E41]',
        message:
            'This service could not be delivered. If payment was collected, payment or refund status is tracked separately.',
    },
    PENDING: {
        label: 'Pending',
        icon: Clock,
        pill: 'bg-[#FFF3DB] text-[#9A4A00]',
        panel: 'border-[#F6E3B8] bg-[#FFFAEF]',
        iconColor: 'text-[#D98A00]',
        message: 'Your provider has not confirmed the final delivery outcome. Please check back before repeating the purchase.',
    },
    PROCESSING: {
        label: 'Processing',
        icon: Clock,
        pill: 'bg-[#FFF3DB] text-[#9A4A00]',
        panel: 'border-[#F6E3B8] bg-[#FFFAEF]',
        iconColor: 'text-[#D98A00]',
        message: 'Your payment was received and your digital service is being processed.',
    },
};

const STEP_CIRCLE: Record<StepState, string> = {
    done: 'bg-[#4CAF50] text-white',
    failed: 'bg-[#E22E41] text-white',
    pending: 'bg-[#F5B53F] text-white',
    upcoming: 'border border-[#DED8D4] bg-white text-[#A29B9C]',
};

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos', // fixed zone so server and client render the same text
});

/* ─── Dummy data (replace with your query result) ──────────────── */
const TRANSACTION: Transaction = JSON.parse(localStorage.getItem('transactionDetails') || '{}');

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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E6E3E0] bg-white text-[#52617A] transition hover:bg-slate-50"
        >
            {copied ? <Check className="h-3.5 w-3.5 text-[#2E9A4F]" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
    );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div>
            <h2 className="text-base font-semibold text-[#20232A]">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-[#7A7F8A]">{subtitle}</p>}
        </div>
    );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-6 border-t border-[#EEEAE6] py-4 first:border-t-0">
            <dt className="shrink-0 text-sm text-[#7A7F8A]">{label}</dt>
            <dd className="min-w-0 break-words text-right text-sm font-medium text-[#20232A]">{children}</dd>
        </div>
    );
}

function ReferenceItem({ label, value }: { label: string; value: string }) {
    return (
        <li className="border-t border-[#EEEAE6] py-4 first:border-t-0 first:pt-0 last:pb-0">
            <p className="text-xs text-[#7A7F8A]">{label}</p>
            <div className="mt-2 flex items-start justify-between gap-3">
                <p className="min-w-0 break-all font-mono text-[13px] leading-relaxed text-[#20232A]">{value}</p>
                <CopyButton value={value} label={label} />
            </div>
        </li>
    );
}

/* ─── Details view ─────────────────────────────────────────────── */
function TransactionDetails({ transaction }: { transaction: Transaction }) {
    const status = STATUS_META[transaction.fulfilmentStatus.toUpperCase()] ?? {
        label: titleCase(transaction.fulfilmentStatus),
        icon: Clock,
        pill: 'bg-[#EEF0F2] text-[#52617A]',
        panel: 'border-[#E6E3E0] bg-[#F9F9FA]',
        iconColor: 'text-[#52617A]',
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
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF3EC] text-[#E95312]">
                                    <CategoryIcon className="h-6 w-6" />
                                </span>
                                <div>
                                    <h2 id="summary-title" className="text-lg font-semibold text-[#20232A]">
                                        {productName}
                                    </h2>
                                    <p className="mt-1 text-sm text-[#7A7F8A]">
                                        {categoryLabel} · To {transaction.recipient}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-[#7A7F8A]">Amount</p>
                                <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#364259]">
                                    {formatMoney(transaction.amountMinor, transaction.currency)}
                                </p>
                            </div>
                        </div>

                        <div className={`mt-6 flex items-start gap-3 rounded-lg border px-4 py-4 ${status.panel}`}>
                            <StatusIcon className={`mt-0.5 h-5 w-5 shrink-0 ${status.iconColor}`} />
                            <div className="min-w-0">
                                <span className={`inline-block rounded px-2.5 py-1 text-xs font-medium ${status.pill}`}>{status.label}</span>
                                <p className="mt-2 text-sm leading-relaxed text-[#52617A]">{status.message}</p>
                            </div>
                        </div>
                    </section>

                    {/* Delivery code (only when the provider returned one, e.g. electricity tokens) */}
                    {transaction.deliveryCode && (
                        <section className="rounded-xl border border-[#F6D9C8] bg-[#FFF6F0] p-5 sm:p-6" aria-labelledby="code-title">
                            <h2 id="code-title" className="text-base font-semibold text-[#20232A]">
                                Delivery code
                            </h2>
                            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#F6D9C8] bg-white px-4 py-3">
                                <p className="min-w-0 break-all font-mono text-lg font-semibold tracking-wider text-[#E95312]">
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
                                        <span className="absolute bottom-0 left-4 top-9 w-px -translate-x-1/2 bg-[#E6E3E0]" aria-hidden="true" />
                                    )}
                                    <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${STEP_CIRCLE[step.state]}`}>
                                        {step.state === 'done' && <Check className="h-4 w-4" strokeWidth={3} />}
                                        {step.state === 'failed' && <X className="h-4 w-4" strokeWidth={3} />}
                                        {step.state === 'pending' && <Clock className="h-4 w-4" />}
                                    </span>
                                    <div className="min-w-0 pt-0.5">
                                        <p className="text-sm font-medium text-[#20232A]">{step.label}</p>
                                        <p className="mt-1 text-xs text-[#7A7F8A]">{step.description}</p>
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
                    <div className="rounded-lg bg-[#FFEFE5] px-5 py-5">
                        <div className="flex items-start gap-3">
                            <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-[#E95312]" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#20232A]">Need help with this transaction?</p>
                                <p className="mt-1 text-xs text-[#52617A]">Our support team is available 24 hours a day.</p>
                                <Link
                                    href={SUPPORT_HREF}
                                    className="mt-4 inline-block rounded-md border border-[#E6E3E0] bg-white px-3.5 py-2 text-xs font-medium text-[#20232A] transition hover:bg-slate-50"
                                >
                                    Contact support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function TransactionDetailsPage() {
    const router = useRouter();

    // TODO: replace TRANSACTION with the result of your transaction query (e.g. looked up by the reference in the URL)
    const transaction: Transaction = JSON.parse(localStorage.getItem('transactionDetails') || '{}');


    return (
        <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
            {/* ── Page header ── */}
            <section className="border-b border-[#F0E9E5] px-5 py-7 sm:px-8">
                <button
                    type="button"
                    onClick={() => {
                        localStorage.removeItem('transactionDetails')
                        router.back()
                    }}
                    className="mb-4 flex items-center gap-1 text-sm text-[#52617A] transition hover:text-[#20232A]"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#E95312]">Transaction</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#20232A] sm:text-3xl">
                    Every detail, <span className="text-[#FF6500]">in one place.</span>
                </h2>
                <p className="mt-2 break-all text-sm text-[#777486] sm:text-base">Reference: {transaction.reference}</p>
            </section>

            <TransactionDetails transaction={transaction} />
        </div>
    );
}
'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNotifications } from '@/lib/queries/useNotifications';
import { ListSkeleton } from '@/components/ui/Skeleton';

/* ─── Types ────────────────────────────────────────────────────── */
type CategoryFilter = 'All' | 'Payment Updates' | 'Reminders' | 'Offers' | 'Security Alerts';
type StatusFilter = 'All' | 'Pending' | 'Success' | 'Failed';
type Tone = 'pending' | 'success' | 'failed';

/** One item as returned by the API (swap for your own type if you already have one). */
type ApiNotification = {
    id: string;
    category: string; // e.g. "PAYMENT_UPDATES"
    status: string; // e.g. "PENDING" | "FAILED" | "SUCCESS"
    eventStatus?: string;
    title: string;
    message: string;
    orderReference?: string;
    productName?: string;
    amountMinor?: number;
    currency?: string;
    createdAt: string; // ISO timestamp
};

type NotificationsPayload = {
    items: ApiNotification[];
    page: number;
    size: number;
    hasMore: boolean;
};

/** Accepts either the full envelope ({ code, status, data }) or the inner `data` object. */
function unwrapNotifications(payload: unknown): NotificationsPayload | undefined {
    if (!payload || typeof payload !== 'object') return undefined;
    const candidate = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(candidate.items)) return payload as NotificationsPayload;
    if (candidate.data && typeof candidate.data === 'object') {
        const inner = candidate.data as { items?: unknown };
        if (Array.isArray(inner.items)) return candidate.data as NotificationsPayload;
    }
    return undefined;
}

/* ─── Constants ────────────────────────────────────────────────── */
const CATEGORIES: CategoryFilter[] = ['All', 'Payment Updates', 'Reminders', 'Offers', 'Security Alerts'];
const STATUS_OPTIONS: StatusFilter[] = ['All', 'Pending', 'Success', 'Failed'];
const PAGE_SIZES = [10, 20, 50];

// UI filter → API query value (undefined = no filter)
const CATEGORY_PARAM: Record<CategoryFilter, string | undefined> = {
    All: undefined,
    'Payment Updates': 'PAYMENT_UPDATES',
    Reminders: 'REMINDERS',
    Offers: 'OFFERS',
    'Security Alerts': 'SECURITY_ALERTS',
};
const STATUS_PARAM: Record<StatusFilter, string | undefined> = {
    All: undefined,
    Pending: 'PENDING',
    Success: 'SUCCESS',
    Failed: 'FAILED',
};

const TONE_DOT: Record<Tone, string> = {
    pending: 'bg-[#F5B53F]',
    success: 'bg-[#4CAF50]',
    failed: 'bg-[#E22E41]',
};

// Label for the card's action button, by API category
const ACTION_LABEL: Record<string, string> = {
    PAYMENT_UPDATES: 'View Payment',
    REMINDERS: 'View Payment',
    OFFERS: 'View Offer',
    SECURITY_ALERTS: 'View Activity',
};

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

/* ─── Helpers ──────────────────────────────────────────────────── */
function toneFor(status: string): Tone {
    const s = status.toUpperCase();
    if (['FAILED', 'CANCELLED', 'REVERSED', 'ERROR'].includes(s)) return 'failed';
    if (['PENDING', 'PROCESSING'].includes(s)) return 'pending';
    return 'success';
}

function formatMoney(amountMinor: number, currency = 'NGN') {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amountMinor / 100);
}

/* ═══════════════════════════════════════════════════════════════ */
export default function NotificationsPage() {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<StatusFilter>('All');
    const [category, setCategory] = useState<CategoryFilter>('All');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);

    // The UI is 1-based (page 1, 2, 3…) but the backend counts pages from 0, so convert only at the API boundary
    const apiPage = page - 1;

    const { data, isLoading, isError } = useNotifications(apiPage, pageSize, STATUS_PARAM[status] as string, CATEGORY_PARAM[category] as string);

    const payload = useMemo(() => unwrapNotifications(data), [data]);
    const items = useMemo(() => payload?.items ?? [], [payload]);

    // The API has no search param, so search only narrows the page that is currently loaded
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((n) =>
            [n.title, n.message, n.productName ?? '', n.orderReference ?? ''].some((value) => value.toLowerCase().includes(q))
        );
    }, [items, query]);

    // The API returns no total count, so the footer is based on the current page and `hasMore`
    const hasMore = payload?.hasMore ?? false;
    const showingFrom = items.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const showingTo = items.length === 0 ? 0 : showingFrom + items.length - 1;

    return (
        <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
            {/* ── Page header ── */}

            <section className="border-b border-[#F0E9E5] px-5 py-7 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#E95312]">Notifications</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#20232A] sm:text-3xl">  Nothing important <span className="text-[#FF6500]">slips by.</span></h2>
                <p className="mt-2 text-sm text-[#777486] sm:text-base">Payment updates, helpful reminders, offers, and security alerts.</p>
            </section>

            <main className="mx-auto px-5 py-6 sm:px-8 lg:py-7">
                {/* ── Filters ── */}
                <section className="flex flex-wrap items-center gap-3">
                    <label className="relative flex min-w-[220px] flex-1 items-center sm:max-w-[354px]">
                        <span className="sr-only">Search notifications</span>
                        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#52617A]" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by updates,reminders,offers..."
                            className="h-12 w-full rounded-lg border border-[#E6E3E0] bg-white pl-11 pr-4 text-sm text-[#343238] outline-none placeholder:text-[#A29B9C] focus:border-[#E95312]"
                        />
                    </label>

                    <div className="border-l border-[#E6E3E0] pl-3">
                        <label className="relative flex items-center">
                            <span className="sr-only">Filter by status</span>
                            <select
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value as StatusFilter);
                                    setPage(1);
                                }}
                                className="h-11 w-[144px] appearance-none rounded-lg border border-[#E6E3E0] bg-white pl-3.5 pr-9 text-xs text-[#343238] outline-none focus:border-[#E95312]"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option}>{option}</option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#343238]" />
                        </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 border-l border-[#E6E3E0] pl-3" role="group" aria-label="Notification category">
                        {CATEGORIES.map((name) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => {
                                    setCategory(name);
                                    setPage(1);
                                }}
                                aria-pressed={category === name}
                                className={`rounded-full border px-5 py-2.5 text-sm transition ${category === name
                                    ? 'border-[#243B4A] bg-[#243B4A] font-medium text-white'
                                    : 'border-[#DED8D4] bg-white text-[#343238] hover:bg-slate-50'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </section>

                {isError && (
                    <p role="alert" className="mt-6 rounded-lg bg-[#FFF0EE] px-4 py-3 text-sm text-[#C0341D]">
                        We couldn&apos;t load your notifications. Please try again shortly.
                    </p>
                )}

                {/* ── Notification list ── */}
                <section className="mt-6 space-y-4" aria-live="polite">
                    {isLoading && <ListSkeleton rows={4} card avatar={false} label="Loading notifications" />}

                    {!isLoading &&
                        visible.map((item) => {
                            const created = new Date(item.createdAt);
                            const validDate = !Number.isNaN(created.getTime());
                            const reference = item.orderReference;
                            const meta = [
                                typeof item.amountMinor === 'number' ? formatMoney(item.amountMinor, item.currency) : null,
                                reference ? `Ref: ${reference}` : null,
                            ].filter(Boolean);

                            return (
                                <article
                                    key={item.id}
                                    className="flex flex-col gap-4 rounded-xl border border-[#F4EFEB] bg-white px-6 py-5 sm:flex-row sm:items-start sm:justify-between"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`h-3 w-3 shrink-0 rounded-full ${TONE_DOT[toneFor(item.status)]}`} aria-hidden="true" />
                                            <h2 className="text-[15px] text-[#20232A]">
                                                <span className="font-semibold">{item.title}</span>
                                                {item.productName && <span className="font-normal"> - {item.productName}</span>}
                                            </h2>
                                        </div>
                                        <p className="mt-4 text-[15px] text-[#52617A]">{item.message}</p>
                                        {meta.length > 0 && <p className="mt-2 break-all text-xs text-[#8A8F99]">{meta.join(' · ')}</p>}
                                    </div>

                                    <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                                        {validDate && (
                                            <time dateTime={item.createdAt} title={DATE_TIME_FORMAT.format(created)} className="text-sm font-semibold text-[#20232A]">
                                                {DATE_FORMAT.format(created)}
                                            </time>
                                        )}
                                        {/*  <button
                                            type="button"
                                            // Hook up navigation here, e.g. to the transaction for `item.orderReference`
                                            className="rounded-lg border border-[#E6E3E0] bg-white px-4 py-2 text-sm text-[#52617A] transition hover:bg-slate-50"
                                        >
                                            {ACTION_LABEL[item.category] ?? 'View Details'}
                                        </button> */}
                                    </div>
                                </article>
                            );
                        })}

                    {!isLoading && visible.length === 0 && (
                        <div className="rounded-xl border border-[#F4EFEB] bg-white px-6 py-16 text-center text-sm text-slate-500">
                            {query.trim() && items.length > 0 ? 'No notifications on this page match your search.' : 'No notifications match your filters.'}
                        </div>
                    )}
                </section>

                {/* ── Pagination ── */}
                <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 px-2 pb-6 text-sm text-[#52617A]">
                    <span>{items.length === 0 ? 'No entries' : `Showing ${showingFrom}-${showingTo} entries`}</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2">
                            Show
                            <label className="relative flex items-center">
                                <span className="sr-only">Entries per page</span>
                                <select
                                    value={pageSize}
                                    onChange={(event) => {
                                        setPageSize(Number(event.target.value));
                                        setPage(1);
                                    }}
                                    className="appearance-none rounded-md border border-[#E6E3E0] bg-white py-1.5 pl-3 pr-7 text-xs text-[#343238] outline-none"
                                >
                                    {PAGE_SIZES.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-500" />
                            </label>
                            entries
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                                aria-label="Previous page"
                                className="flex h-7 w-8 items-center justify-center rounded-md border border-[#E6E3E0] bg-white transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="min-w-4 text-center text-xs font-semibold text-[#20232A]">{page}</span>
                            <button
                                type="button"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!hasMore || isLoading}
                                aria-label="Next page"
                                className="flex h-7 w-8 items-center justify-center rounded-md border border-[#E6E3E0] bg-white transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
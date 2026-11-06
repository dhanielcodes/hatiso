'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { CalendarDays, ChevronDown, Upload } from 'lucide-react';
import { ServiceUsageChart, SpendingChart } from '@/components/dashboard/DashboardCharts';
import { useAuthStore } from '@/lib/store/authStore';
import { ChartSkeleton, MetricCardSkeleton, ProgressListSkeleton } from '@/components/ui/Skeleton';
import { useAnalytics, useAnalyticsCSV } from '@/lib/queries/useDashboard';
import { DashboardBucket } from '@/lib/api/dashboard';

/* ─── API types (swap for the ones in lib/api/dashboard if you already have them) ─── */
type DashboardSummary = {
    spending: { amountMinor: number; previousAmountMinor: number; changePercent: number | null };
    transactions: { count: number; previousCount: number; changePercent: number | null };
    successRate: { percent: number; previousPercent: number; changePercentagePoints: number | null };
};

type AveragePayment = {
    amountMinor: number;
    previousAmountMinor: number;
    differenceMinor: number;
    changePercent: number | null;
};

type MonthComparison = {
    currentMonth: string;
    previousMonth: string;
    fromDay: number;
    throughDay: number;
    currentAmountMinor: number;
    previousAmountMinor: number;
    differenceMinor: number;
    changePercent: number | null;
    points: { day: number; currentAmountMinor: number; previousAmountMinor: number }[];
};

type PaymentActivityRow = {
    dayOfWeek: string; // "MONDAY" … "SUNDAY"
    morning: number;
    noon: number;
    evening: number;
    night: number;
};

type AnalyticsData = {
    from: string;
    to: string;
    bucket: string;
    summary: DashboardSummary;
    averagePayment?: AveragePayment;
    averageMonthlySpendMinor?: number;
    spendingOverview: { from: string; to: string; amountMinor: number; averageDailySpendMinor?: number }[];
    digitalServicesUsage: { serviceType: string; transactions: number; percentage: number; amountMinor: number }[];
    monthComparison?: MonthComparison;
    paymentActivity: PaymentActivityRow[];
    topProviders: { providerCode: string; providerName: string; amountMinor: number }[];
    containsDemoData?: boolean;
};

/** Accepts either the full envelope ({ code, status, data }) or the inner `data` object. */
function unwrapAnalytics(payload: unknown): AnalyticsData | undefined {
    if (!payload || typeof payload !== 'object') return undefined;
    const candidate = payload as { summary?: unknown; data?: unknown };
    if (candidate.summary) return payload as AnalyticsData;
    if (candidate.data && typeof candidate.data === 'object') return candidate.data as AnalyticsData;
    return undefined;
}

/* ─── Constants ────────────────────────────────────────────────── */
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
const DAY_KEYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const TIME_SLOTS = ['Morn.', 'Noon', 'Evening', 'Night'];
const SLOT_KEYS = ['morning', 'noon', 'evening', 'night'] as const;
const HEAT_COLORS = ['#F7E1D5', '#F5B692', '#E1966C', '#D9622B'];
const HEAT_LABELS = ['<2', '2-4', '5-20', '>20'];
const CARD = 'rounded-xl border border-[#EBE6E1] bg-white';

// Display name + colour per API serviceType. Unknown types fall back to a title-cased name and a palette colour.
const SERVICE_META: Record<string, { name: string; color: string }> = {
    AIRTIME: { name: 'Airtime', color: '#2F5BDB' },
    DATA: { name: 'Data', color: '#F5B53F' },
    ELECTRICITY: { name: 'Electricity', color: '#3E8E4F' },
    TV: { name: 'Cable TV', color: '#D23B3B' },
    INSURANCE: { name: 'Insurance', color: '#8B5CF6' },
    BETTING: { name: 'Betting', color: '#1F1F1F' },
    EDUCATION: { name: 'Education', color: '#0EA5A4' },
    INTERNET: { name: 'Internet', color: '#E2733F' },
};
const FALLBACK_COLORS = ['#6B7280', '#EC4899', '#14B8A6', '#A16207'];

/* ─── Date helpers ─────────────────────────────────────────────── */
function toDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const subscribeToNothing = () => () => { };
const getServerDate = () => '';

function useClientDate() {
    return useSyncExternalStore(
        subscribeToNothing,
        () => toDateString(new Date()),
        getServerDate
    );
}

function formatRange(from: string, to: string) {
    const formatter = new Intl.DateTimeFormat('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${formatter.format(new Date(`${from}T00:00:00`))} – ${formatter.format(new Date(`${to}T00:00:00`))}`;
}

// Pick a sensible chart bucket for a custom range
function bucketForRange(from: string, to: string): DashboardBucket {
    const days = Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000) + 1;
    if (days <= 31) return 'DAY' as DashboardBucket;
    if (days <= 120) return 'WEEK' as DashboardBucket;
    return 'MONTH' as DashboardBucket;
}

// X-axis label for one spending bucket: "Nov" for months, "3 Nov" for days / weeks
function bucketLabel(from: string, bucket: string) {
    const start = new Date(`${from}T00:00:00`);
    if (bucket === 'MONTH') return new Intl.DateTimeFormat('en-NG', { month: 'short' }).format(start);
    return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(start);
}

/* ─── Number helpers ───────────────────────────────────────────── */
function formatNaira(amountMinor: number) {
    return `₦${(amountMinor / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
}

// "₦500k" / "₦2.5m" for chart axes
function compactNaira(amountMinor: number) {
    const n = amountMinor / 100;
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
    if (n >= 1_000) return `₦${Math.round(n / 1_000)}k`;
    return `₦${Math.round(n)}`;
}

/* ─── API → UI mapping ─────────────────────────────────────────── */
type Metric = { label: string; value: string; change: string; positive: boolean };

function buildMetrics(summary?: DashboardSummary, averagePayment?: AveragePayment): Metric[] {
    const empty = (label: string): Metric => ({ label, value: '—', change: '', positive: true });

    const spending: Metric = summary
        ? {
            label: 'Total spent',
            value: formatNaira(summary.spending.amountMinor),
            change:
                summary.spending.changePercent == null
                    ? ''
                    : `${summary.spending.changePercent >= 0 ? '+' : '-'} ${Math.abs(summary.spending.changePercent).toFixed(1)}%`,
            positive: (summary.spending.changePercent ?? 0) >= 0,
        }
        : empty('Total spent');

    const transactions: Metric = summary
        ? (() => {
            const diff = summary.transactions.count - summary.transactions.previousCount;
            return {
                label: 'Transactions',
                value: String(summary.transactions.count),
                change: diff === 0 ? 'No change' : `${diff > 0 ? '+' : '-'} ${Math.abs(diff)} ${diff > 0 ? 'more' : 'fewer'}`,
                positive: diff >= 0,
            };
        })()
        : empty('Transactions');

    const average: Metric = averagePayment
        ? {
            label: 'Average payment',
            value: formatNaira(averagePayment.amountMinor),
            change:
                averagePayment.differenceMinor === 0
                    ? 'No change'
                    : `${averagePayment.differenceMinor > 0 ? '+' : '-'} ${formatNaira(Math.abs(averagePayment.differenceMinor))}`,
            positive: averagePayment.differenceMinor >= 0,
        }
        : empty('Average payment');

    const successRate: Metric = summary
        ? {
            label: 'Success rate',
            value: `${summary.successRate.percent.toFixed(1)}%`,
            change:
                summary.successRate.changePercentagePoints == null
                    ? ''
                    : `${summary.successRate.changePercentagePoints >= 0 ? '↑' : '↓'} ${Math.abs(summary.successRate.changePercentagePoints).toFixed(1)} pts`,
            positive: (summary.successRate.changePercentagePoints ?? 0) >= 0,
        }
        : empty('Success rate');

    return [spending, transactions, average, successRate];
}

function titleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function buildUsageRows(items: AnalyticsData['digitalServicesUsage']) {
    return [...items]
        .sort((a, b) => b.percentage - a.percentage || b.amountMinor - a.amountMinor)
        .map((item, index) => {
            const meta = SERVICE_META[item.serviceType];
            return {
                name: meta?.name ?? titleCase(item.serviceType),
                value: item.percentage,
                spentMinor: item.amountMinor,
                color: meta?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
            };
        });
}

// Payment counts as a Mon→Sun × (morning, noon, evening, night) matrix
function buildHeatCounts(rows: PaymentActivityRow[]) {
    return DAY_KEYS.map((key) => {
        const row = rows.find((r) => r.dayOfWeek.toUpperCase() === key);
        return SLOT_KEYS.map((slot) => row?.[slot] ?? 0);
    });
}

// Maps a payment count onto the 4 shades (see HEAT_LABELS)
function heatLevel(count: number) {
    if (count < 2) return 0;
    if (count < 5) return 1;
    if (count <= 20) return 2;
    return 3;
}

/* ─── Small presentational pieces ──────────────────────────────── */
function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div>
            <h2 className="text-base font-semibold text-[#20232A]">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-[#7A7F8A]">{subtitle}</p>}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return <div className="flex h-full min-h-[120px] w-full items-center justify-center text-sm text-[#7A7F8A]">{message}</div>;
}

/* ─── Cumulative "this month vs last month" line chart (inline SVG) ─ */
function CumulativeChart({
    thisMonth,
    lastMonth,
    days,
}: {
    thisMonth: number[];
    lastMonth: number[];
    days: number;
}) {
    const W = 620;
    const H = 240;
    const L = 56;
    const R = 12;
    const T = 14;
    const B = 28;
    const maxVal = Math.max(1, ...thisMonth, ...lastMonth);
    const x = (i: number) => L + (i / Math.max(days - 1, 1)) * (W - L - R);
    const y = (v: number) => T + (1 - v / maxVal) * (H - T - B);
    const path = (values: number[]) =>
        values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

    const yTicks = [0, 1, 2, 3, 4].map((n) => (maxVal * n) / 4);
    const xTicks = Array.from({ length: days }, (_, i) => i).filter((i) => i === 0 || (i + 1) % 5 === 0);
    const lastIndex = thisMonth.length - 1;
    const lastValue = thisMonth[lastIndex] ?? 0;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative spend, this month versus last month">
            {yTicks.map((tick) => (
                <g key={tick}>
                    <line x1={L} x2={W - R} y1={y(tick)} y2={y(tick)} stroke="#EEEAE6" strokeWidth="1" />
                    <text x={L - 8} y={y(tick) + 3} textAnchor="end" fontSize="10" fill="#8A8F99">
                        {compactNaira(tick)}
                    </text>
                </g>
            ))}
            {xTicks.map((i) => (
                <g key={i}>
                    <line x1={x(i)} x2={x(i)} y1={T} y2={H - B} stroke="#F3F0EC" strokeWidth="1" />
                    <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#8A8F99">
                        {i + 1}
                    </text>
                </g>
            ))}
            <path d={path(lastMonth)} fill="none" stroke="#E8502D" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" />
            <path d={path(thisMonth)} fill="none" stroke="#4CAF50" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" />
            {lastIndex >= 0 && (
                <g>
                    <line x1={x(lastIndex)} x2={x(lastIndex)} y1={T} y2={H - B} stroke="#E8502D" strokeWidth="1.5" />
                    <circle cx={x(lastIndex)} cy={y(lastValue)} r="4" fill="#E8502D" />
                </g>
            )}
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
    const { user } = useAuthStore();
    const [period, setPeriod] = useState('Last month');
    const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
    const [customRange, setCustomRange] = useState<{ from?: string; to?: string; bucket: DashboardBucket } | null>({ bucket: 'MONTH' });
    const [pendingFrom, setPendingFrom] = useState('');
    const [pendingTo, setPendingTo] = useState('');
    const today = useClientDate();

    const { from, to, bucket } = useMemo(() => {
        if (customRange) return customRange;
        if (!today) return { from: '', to: '', bucket: 'MONTH' as DashboardBucket };
        const end = new Date(`${today}T00:00:00`);
        const start = new Date(end);
        if (period === 'Last 30 days') start.setDate(end.getDate() - 29);
        else if (period === 'Last 6 months') start.setMonth(end.getMonth() - 5, 1);
        else start.setDate(end.getDate() - 6);
        return { from: toDateString(start), to: toDateString(end), bucket: (period === 'Last 6 months' ? 'MONTH' : period === 'Last 30 days' ? 'WEEK' : 'DAY') as DashboardBucket };
    }, [customRange, period, today]);

    const { data, isLoading, isError } = useAnalytics({ from, to, bucket, recentLimit: 10 }, Boolean(today), `${user?.name}`);
    const { mutate } = useAnalyticsCSV({ from, to, bucket, recentLimit: 10 });

    /* ── Map API data into the UI ── */
    const analytics = useMemo(() => unwrapAnalytics(data), [data]);
    const metrics = useMemo(() => buildMetrics(analytics?.summary, analytics?.averagePayment), [analytics]);
    const spendingSeries = useMemo(
        () =>
            (analytics?.spendingOverview ?? []).map((point) => ({
                label: bucketLabel(point.from, analytics?.bucket ?? bucket),
                amountMinor: point.amountMinor,
            })),
        [analytics, bucket]
    );
    const usageRows = useMemo(() => buildUsageRows(analytics?.digitalServicesUsage ?? []), [analytics]);

    const comparison = analytics?.monthComparison;
    const comparisonPoints = useMemo(
        () => [...(analytics?.monthComparison?.points ?? [])].sort((a, b) => a.day - b.day),
        [analytics]
    );
    const thisMonthSeries = useMemo(() => comparisonPoints.map((p) => p.currentAmountMinor), [comparisonPoints]);
    const lastMonthSeries = useMemo(() => comparisonPoints.map((p) => p.previousAmountMinor), [comparisonPoints]);

    const heatCounts = useMemo(() => buildHeatCounts(analytics?.paymentActivity ?? []), [analytics]);

    const providers = analytics?.topProviders ?? [];
    const providerMax = Math.max(1, ...providers.map((p) => p.amountMinor));

    // When no explicit range is sent, the API falls back to its own default range, so show that
    const displayFrom = from || analytics?.from || '';
    const displayTo = to || analytics?.to || '';

    const openRangePicker = () => {
        setPendingFrom(displayFrom);
        setPendingTo(displayTo);
        setIsRangePickerOpen(true);
    };

    const applyCustomRange = () => {
        if (!pendingFrom || !pendingTo || pendingFrom > pendingTo) return;
        setCustomRange({ from: pendingFrom, to: pendingTo, bucket: bucketForRange(pendingFrom, pendingTo) });
        setPeriod('Custom range');
        setIsRangePickerOpen(false);
    };

    /* ── Export (CSV) ── */
    const handleExport = () => {
        const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
        const rows: (string | number)[][] = [
            ['Period', `${displayFrom} to ${displayTo}`],
            ...metrics.map((m) => [m.label, m.change ? `${m.value} (${m.change})` : m.value]),
            [],
            ['Spending by period', 'Amount (NGN)'],
            ...spendingSeries.map((p) => [p.label, p.amountMinor / 100]),
            [],
            ['Service', 'Transactions share (%)', 'Spent (NGN)'],
            ...usageRows.map((r) => [r.name, r.value, r.spentMinor / 100]),
            [],
            ['Day of month', 'This month (NGN)', 'Last month (NGN)'],
            ...comparisonPoints.map((p) => [p.day, p.currentAmountMinor / 100, p.previousAmountMinor / 100]),
            [],
            ['Day', ...TIME_SLOTS],
            ...heatCounts.map((counts, i) => [WEEK_DAYS[i], ...counts]),
            [],
            ['Provider', 'Amount (NGN)'],
            ...providers.map((p) => [p.providerName, p.amountMinor / 100]),
        ];
        const csv = rows.map((r) => r.map(cell).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${displayFrom}-to-${displayTo}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const comparisonSubtitle = comparison
        ? `Cumulative spend by day. You're ${formatNaira(Math.abs(comparison.differenceMinor))} ${comparison.differenceMinor >= 0 ? 'ahead' : 'behind'} at this point.`
        : 'Cumulative spend by day.';

    return (
        <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
            {/* ── Page header ── */}
            <section className="border-b border-[#F2EAE5] px-5 py-5 sm:px-8 sm:py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#E95312]">Insights</p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#20232A] sm:text-3xl">Understand where your<span className="text-[#FF6500]"> money goes.</span></h2>

                        <p className="mt-2 text-sm text-[#777486] sm:text-base">Practical patterns and gentle guidance, built from your payment history.</p>

                    </div>



                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-stretch overflow-visible rounded-lg border border-[#DED8D4] bg-white">
                            <label className="relative flex items-center">
                                <span className="sr-only">Select period</span>
                                <select
                                    value={period}
                                    onChange={(event) => {
                                        if (event.target.value !== 'Custom range') {
                                            setPeriod(event.target.value);
                                            setCustomRange(null);
                                        }
                                    }}
                                    className="appearance-none rounded-l-lg bg-transparent py-2.5 pl-3 pr-8 text-xs text-[#343238] outline-none"
                                >
                                    <option>Last 7 days</option>
                                    <option>Last 30 days</option>
                                    <option>Last month</option>
                                    <option>Last 6 months</option>
                                    {customRange && <option>Custom range</option>}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-500" />
                            </label>

                            <div className="relative border-l border-[#E6E3E0]">
                                <button
                                    type="button"
                                    onClick={openRangePicker}
                                    className="flex h-full items-center gap-2 rounded-r-lg px-3 py-2.5 text-xs text-[#343238] transition hover:bg-slate-50"
                                >
                                    <CalendarDays className="h-4 w-4 text-[#807A7B]" />
                                    {displayFrom && displayTo ? formatRange(displayFrom, displayTo) : 'Choose range'}
                                </button>

                                {isRangePickerOpen && (
                                    <div className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border border-[#E6E3E0] bg-white p-4 shadow-xl shadow-slate-900/10">
                                        <p className="text-sm font-semibold text-[#34425D]">Custom date range</p>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <label className="text-xs font-medium text-slate-600">
                                                From
                                                <input
                                                    type="date"
                                                    value={pendingFrom}
                                                    max={pendingTo || today || undefined}
                                                    onChange={(event) => setPendingFrom(event.target.value)}
                                                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-[#E95312]"
                                                />
                                            </label>
                                            <label className="text-xs font-medium text-slate-600">
                                                To
                                                <input
                                                    type="date"
                                                    value={pendingTo}
                                                    min={pendingFrom || undefined}
                                                    max={today || undefined}
                                                    onChange={(event) => setPendingTo(event.target.value)}
                                                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-[#E95312]"
                                                />
                                            </label>
                                        </div>
                                        {pendingFrom && pendingTo && pendingFrom > pendingTo && (
                                            <p className="mt-3 text-xs text-rose-600">The end date must be after the start date.</p>
                                        )}
                                        <div className="mt-4 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsRangePickerOpen(false)}
                                                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={applyCustomRange}
                                                disabled={!pendingFrom || !pendingTo || pendingFrom > pendingTo}
                                                className="rounded-lg bg-[#E95312] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#D44A10] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Apply range
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                mutate({ from, to, bucket, recentLimit: 10 })
                            }}
                            className="flex items-center gap-2 rounded-lg border border-[#DED8D4] bg-white px-3 py-2.5 text-xs text-[#343238] transition hover:bg-slate-50"
                        >
                            Export <Upload className="h-3.5 w-3.5 text-[#807A7B]" />
                        </button>
                    </div>
                </div>
            </section>

            <main className="mx-auto space-y-5 px-5 py-6 sm:px-8 lg:py-7">
                {isError && (
                    <p role="alert" className="rounded-lg bg-[#FFF0EE] px-4 py-3 text-sm text-[#C0341D]">
                        We couldn&apos;t load your analytics. Please try again shortly.
                    </p>
                )}
                {analytics?.containsDemoData && (
                    <p className="rounded-lg bg-[#FFF3DB] px-4 py-3 text-xs text-[#9A4A00]">This view includes demo data.</p>
                )}

                {/* ── Metric cards ── */}
                <section>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {isLoading && Array.from({ length: 4 }, (_, index) => <MetricCardSkeleton key={index} className={`${CARD} px-5 py-6`} />)}
                        {!isLoading && metrics.map((metric) => (
                            <article key={metric.label} className={`${CARD} px-5 py-6`}>
                                <p className="text-sm text-[#52617A]">{metric.label}</p>
                                <p className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[#364259]">{metric.value}</p>
                                {metric.change && (
                                    <p className="mt-2 text-[13px]">
                                        <span className={metric.positive ? 'text-[#2E9A4F]' : 'text-[#E22E41]'}>{metric.change}</span>
                                        <span className="text-[#A29B9C]"> from previous period</span>
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                </section>

                {/* ── Spending insights ── */}
                <section className={`${CARD} p-5 sm:p-6`}>
                    <CardHeader title="Spending Insights" subtitle="Compare how you spend the most each month." />
                    <div className="mt-6 h-[260px] sm:h-[300px]">
                        {isLoading ? (
                            <ChartSkeleton shape="bars" label="Loading spending" />
                        ) : spendingSeries.length === 0 ? (
                            <EmptyState message="No spending in this period." />
                        ) : (
                            <SpendingChart data={spendingSeries} />
                        )}
                    </div>
                </section>

                {/* ── Digital services + this month vs last month ── */}
                <section className="grid gap-5 lg:grid-cols-2">
                    <article className={`${CARD} p-5 sm:p-6`}>
                        <CardHeader title="Transaction Rate by Digital Services" subtitle="Transaction distribution across Hatiso digital services." />
                        {isLoading ? (
                            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
                                <ChartSkeleton shape="donut" className="h-[200px] w-[200px] shrink-0" label="Loading services" />
                                <ProgressListSkeleton rows={4} className="w-full flex-1" />
                            </div>
                        ) : usageRows.length === 0 ? (
                            <div className="mt-6">
                                <EmptyState message="No service usage in this period." />
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
                                <div className="relative h-[200px] w-[200px] shrink-0">
                                    <ServiceUsageChart data={usageRows} />
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-semibold text-[#18202A]">100%</span>
                                    </div>
                                </div>

                                <div className="w-full min-w-0 flex-1">
                                    <div className="grid grid-cols-[1.3fr_1fr_.6fr] border-b border-[#EEEAE6] pb-2 text-sm text-[#7A7F8A]">
                                        <span>Category</span>
                                        <span>Spent</span>
                                        <span className="text-right">Share</span>
                                    </div>
                                    <div className="divide-y divide-[#F1EDE9]">
                                        {usageRows.map((row) => (
                                            <div key={row.name} className="grid grid-cols-[1.3fr_1fr_.6fr] items-center py-2.5 text-sm">
                                                <span className="flex min-w-0 items-center gap-2 text-[#3B4150]">
                                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                                                    <span className="truncate">{row.name}</span>
                                                </span>
                                                <span className="font-medium text-[#3B4150]">{formatNaira(row.spentMinor)}</span>
                                                <span className="text-right font-medium text-[#3B4150]">{Number(row.value.toFixed(1))}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </article>

                    <article className={`${CARD} p-5 sm:p-6`}>
                        <CardHeader title="This month vs last month" subtitle={comparisonSubtitle} />
                        {isLoading ? (
                            <ChartSkeleton shape="bars" className="mt-6 h-[220px] w-full" label="Loading comparison" />
                        ) : !comparison || comparisonPoints.length === 0 ? (
                            <div className="mt-6">
                                <EmptyState message="No comparison data yet." />
                            </div>
                        ) : (
                            <>
                                <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-[#3B4150]">This Month</p>
                                        <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#18202A]">
                                            {formatNaira(comparison.currentAmountMinor)}
                                        </p>
                                        {comparison.changePercent != null && (
                                            <p className="mt-1.5 text-[11px] text-[#7A7F8A]">
                                                <span
                                                    className={`rounded px-1.5 py-0.5 font-medium ${comparison.changePercent >= 0 ? 'bg-[#E7F5EE] text-[#2E9A4F]' : 'bg-[#FDECEC] text-[#E22E41]'}`}
                                                >
                                                    {comparison.changePercent >= 0 ? '+' : '-'}
                                                    {Number(Math.abs(comparison.changePercent).toFixed(1))}%
                                                </span>{' '}
                                                vs last month
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-[#7A7F8A]">
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-[#4CAF50]" /> This Month
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-[#E8502D]" /> Last Month
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <CumulativeChart thisMonth={thisMonthSeries} lastMonth={lastMonthSeries} days={comparisonPoints.length} />
                                </div>
                            </>
                        )}
                    </article>
                </section>

                {/* ── When you pay + top providers ── */}
                <section className="grid gap-5 lg:grid-cols-[.85fr_1.4fr]">
                    <article className={`${CARD} p-5 sm:p-6`}>
                        <CardHeader title="When you pay" subtitle="Payments by day and time. Darker means more" />

                        <div className="mt-5 flex justify-center gap-1.5 text-[9px] text-[#8A8F99]">
                            {HEAT_LABELS.map((label, i) => (
                                <div key={label} className="w-12 text-center">
                                    <div className="mx-auto h-1.5 w-full rounded-full" style={{ backgroundColor: HEAT_COLORS[i] }} />
                                    <span className="mt-1 block">{label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            {isLoading ? (
                                <ChartSkeleton shape="heatmap" label="Loading activity" />
                            ) : (
                                <div className="mx-auto grid min-w-[300px] max-w-[360px] grid-cols-[44px_repeat(4,1fr)] gap-2">
                                    <span />
                                    {TIME_SLOTS.map((slot) => (
                                        <span key={slot} className="pb-1 text-center text-xs text-[#7A7F8A]">{slot}</span>
                                    ))}
                                    {WEEK_DAYS.map((day, dayIndex) => (
                                        <div key={day} className="contents">
                                            <span className="flex items-center text-xs text-[#7A7F8A]">{day}</span>
                                            {heatCounts[dayIndex].map((count, slotIndex) => (
                                                <div
                                                    key={`${day}-${slotIndex}`}
                                                    title={`${count} payment${count === 1 ? '' : 's'}`}
                                                    className="h-9 rounded-md"
                                                    style={{ backgroundColor: HEAT_COLORS[heatLevel(count)] }}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </article>

                    <article className={`${CARD} p-5 sm:p-6`}>
                        <CardHeader title="Top providers" subtitle="Where most of your money went." />
                        {isLoading ? (
                            <ProgressListSkeleton rows={5} className="mt-6" />
                        ) : providers.length === 0 ? (
                            <div className="mt-6">
                                <EmptyState message="No provider spending in this period." />
                            </div>
                        ) : (
                            <div className="mt-6 space-y-5">
                                {providers.map((provider) => (
                                    <div key={provider.providerCode}>
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="truncate font-medium text-[#52617A]">{provider.providerName}</span>
                                            <span className="shrink-0 font-semibold text-[#20232A]">{formatNaira(provider.amountMinor)}</span>
                                        </div>
                                        <div className="mt-2 h-1.5 w-full rounded-full bg-[#D9D9D9]">
                                            <div
                                                className="h-full rounded-full bg-[#E2733F]"
                                                style={{ width: `${Math.max(4, (provider.amountMinor / providerMax) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                </section>
            </main>
        </div>
    );
}
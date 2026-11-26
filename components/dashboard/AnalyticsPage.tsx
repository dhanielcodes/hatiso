'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { CalendarDays, Lightbulb, Upload } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import DateRangeDialog from '@/components/ui/DateRangeDialog';
import { ChartSkeleton, MetricCardSkeleton, ProgressListSkeleton } from '@/components/ui/Skeleton';
import { useAnalytics, useAnalyticsCSV } from '@/lib/queries/useDashboard';
import { DashboardBucket } from '@/lib/api/dashboard';
import { seriesColor, useTheme, type ThemeId } from '@/lib/theme/theme';

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

// The API can send buckets outside the dates asked for (it always returns 12 months), so keep only the ones that overlap the range.
function inRange<T extends { from: string; to?: string }>(points: T[], from: string, to: string) {
    return points.filter((p) => (p.to ?? p.from).slice(0, 10) >= from && p.from.slice(0, 10) <= to);
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

function titleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function buildUsageRows(items: AnalyticsData['digitalServicesUsage'], theme: ThemeId) {
    return [...items]
        .sort((a, b) => b.percentage - a.percentage || b.amountMinor - a.amountMinor)
        .map((item, index) => {
            const meta = SERVICE_META[item.serviceType];
            return {
                name: meta?.name ?? titleCase(item.serviceType),
                value: item.percentage,
                spentMinor: item.amountMinor,
                color: seriesColor(theme, meta?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length], index),
            };
        });
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
    const theme = useTheme();
    const { user } = useAuthStore();
    const [range, setRange] = useState<'6m' | '12m' | 'custom'>('6m');
    const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
    const [customRange, setCustomRange] = useState<{ from: string; to: string; bucket: DashboardBucket } | null>(null);
    const today = useClientDate();

    const { from, to, bucket } = useMemo(() => {
        if (range === 'custom' && customRange) return customRange;
        if (!today) return { from: '', to: '', bucket: 'MONTH' as DashboardBucket };
        const end = new Date(`${today}T00:00:00`);
        const start = new Date(end);
        start.setMonth(end.getMonth() - (range === '12m' ? 11 : 5), 1);
        return { from: toDateString(start), to: toDateString(end), bucket: 'MONTH' as DashboardBucket };
    }, [customRange, range, today]);

    // The same length of time just before, for the dashed "previous period" line.
    const previous = useMemo(() => {
        if (!from || !to) return null;
        const start = new Date(`${from}T00:00:00`);
        const end = new Date(`${to}T00:00:00`);
        if (bucket === 'MONTH' && start.getDate() === 1) {
            // Whole calendar months: the same number of months just before.
            const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
            const prevStart = new Date(start.getFullYear(), start.getMonth() - months, 1);
            const prevEnd = new Date(start.getFullYear(), start.getMonth(), 0);
            return { from: toDateString(prevStart), to: toDateString(prevEnd), bucket };
        }
        const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
        const prevEnd = new Date(start);
        prevEnd.setDate(start.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevEnd.getDate() - (days - 1));
        return { from: toDateString(prevStart), to: toDateString(prevEnd), bucket };
    }, [from, to, bucket]);

    const { data, isLoading, isError } = useAnalytics({ from, to, bucket, recentLimit: 10 }, Boolean(today), `${user?.name}`);
    const { data: prevData } = useAnalytics({ ...(previous ?? { from: '', to: '', bucket }), recentLimit: 10 }, Boolean(previous), `${user?.name}`);
    const { mutate } = useAnalyticsCSV({ from, to, bucket, recentLimit: 10 });

    const analytics = useMemo(() => unwrapAnalytics(data), [data]);
    const prevAnalytics = useMemo(() => unwrapAnalytics(prevData), [prevData]);
    const series = useMemo(
        () =>
            inRange(analytics?.spendingOverview ?? [], from, to).map((point) => ({ label: bucketLabel(point.from, analytics?.bucket ?? bucket), amountMinor: point.amountMinor })),
        [analytics, bucket, from, to]
    );
    const prevSeries = useMemo(
        () => (previous ? inRange(prevAnalytics?.spendingOverview ?? [], previous.from, previous.to).map((p) => p.amountMinor) : []),
        [prevAnalytics, previous]
    );
    const usageRows = useMemo(() => buildUsageRows(analytics?.digitalServicesUsage ?? [], theme), [analytics, theme]);
    const providers = (analytics?.topProviders ?? []).slice(0, 5);

    const summary = analytics?.summary;
    const totalMinor = summary?.spending.amountMinor ?? 0;
    const rangeLabel = range === '12m' ? 'Last 12 months' : range === '6m' ? 'Last 6 months' : from && to ? formatRange(from, to) : 'Custom range';
    const monthlyAverage = analytics?.averageMonthlySpendMinor ?? (series.length ? Math.round(totalMinor / series.length) : 0);
    const busiest = useMemo(() => {
        const rows = analytics?.paymentActivity ?? [];
        let best = { day: '', count: 0 };
        rows.forEach((r) => {
            const count = r.morning + r.noon + r.evening + r.night;
            if (count > best.count) best = { day: r.dayOfWeek, count };
        });
        return best.count ? best.day.charAt(0) + best.day.slice(1).toLowerCase() : '';
    }, [analytics]);

    const kpis = [
        { label: 'Total spent', value: summary ? formatNaira(totalMinor) : '–', note: rangeLabel },
        { label: 'Monthly average', value: summary ? formatNaira(monthlyAverage) : '–', note: 'Across all services' },
        { label: 'Payments', value: summary ? String(summary.transactions.count) : '–', note: summary ? `${Math.round(summary.successRate.percent)}% successful` : '' },
        { label: 'Busiest day', value: busiest || '–', note: busiest ? `Most payments land on ${busiest}s` : 'Not enough payments yet' },
    ];

    const spentTotal = usageRows.reduce((sum, r) => sum + r.spentMinor, 0);
    const donut = usageRows.slice(0, 4).map((r) => ({ ...r, pct: spentTotal ? Math.round((r.spentMinor / spentTotal) * 100) : 0 }));
    const biggest = [...usageRows].sort((a, b) => b.spentMinor - a.spentMinor)[0];
    const biggestPct = biggest && spentTotal ? Math.round((biggest.spentMinor / spentTotal) * 100) : 0;
    const biggestSlug = biggest ? SERVICE_SLUG_BY_NAME[biggest.name] : undefined;

    const applyCustomRange = (nextFrom: string, nextTo: string) => {
        setCustomRange({ from: nextFrom, to: nextTo, bucket: bucketForRange(nextFrom, nextTo) });
        setRange('custom');
        setIsRangePickerOpen(false);
    };
    const closeRangePicker = useCallback(() => setIsRangePickerOpen(false), []);

    const CARD = 'rounded-[14px] border border-tone-100 bg-surface';
    const BTN = 'hz-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium text-tone-744 hover:border-tone-414';

    return (
        <div className="min-h-full bg-tone-44 text-tone-744">
            <div className="flex w-full flex-col gap-6 p-[clamp(20px,3vw,40px)]">
                <div className="hz-rise flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-[clamp(28px,3vw,36px)] leading-[1.1] font-semibold tracking-[-0.025em]">Analytics</h1>
                        <span className="text-[15px] text-tone-414">Where your money goes, month by month.</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div role="radiogroup" aria-label="Period" className="flex rounded-xl border border-tone-100 bg-surface p-1">
                            {([['6m', '6 months'], ['12m', '12 months']] as const).map(([id, label]) => {
                                const on = range === id;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        role="radio"
                                        aria-checked={on}
                                        onClick={() => setRange(id)}
                                        className={`min-h-9 rounded-lg px-3.5 text-[13px] font-medium transition-colors ${on ? 'bg-brand-305 text-on-brand' : 'text-tone-432 hover:text-tone-744'}`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        <button type="button" onClick={() => mutate({ from, to, bucket, recentLimit: 10 })} className={BTN}>
                            <Upload className="h-4 w-4" aria-hidden="true" />
                            Export
                        </button>
                        <div>
                            <button type="button" onClick={() => setIsRangePickerOpen(true)} aria-expanded={isRangePickerOpen} className={`${BTN} ${range === 'custom' ? 'border-brand-305' : ''}`}>
                                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                                {range === 'custom' ? rangeLabel : 'Custom range'}
                            </button>
                        </div>
                    </div>
                </div>

                {isError && <p role="alert" className="rounded-[10px] border border-status-error/30 bg-status-error/8 px-4 py-3 text-sm text-status-error">We couldn&apos;t load your analytics. Please try again shortly.</p>}
                {analytics?.containsDemoData && <p className="rounded-[10px] bg-surface px-4 py-3 text-xs text-tone-414">This view includes demo data.</p>}

                <div className="hz-stagger grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3">
                    {isLoading
                        ? Array.from({ length: 4 }, (_, i) => <MetricCardSkeleton key={i} className={`${CARD} p-[18px]`} />)
                        : kpis.map((k) => (
                            <div key={k.label} className={`${CARD} flex flex-col gap-2.5 p-[18px]`}>
                                <span className="text-sm text-tone-414">{k.label}</span>
                                <span className="text-[28px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{k.value}</span>
                                <span className="text-[13px] text-tone-414">{k.note}</span>
                            </div>
                        ))}
                </div>

                <section className={`hz-rise ${CARD} flex flex-col gap-[18px] p-[22px]`} style={{ '--d': 2 } as React.CSSProperties}>
                    <div className="flex flex-wrap justify-between gap-3">
                        <h2 className="text-lg font-semibold">Spending over time</h2>
                        <span className="inline-flex gap-4 text-[13px] text-tone-414">
                            <span className="inline-flex items-center gap-1.5"><span className="h-[3px] w-3.5 bg-tone-744" />{rangeLabel}</span>
                            <span className="inline-flex items-center gap-1.5"><span className="w-3.5 border-t-2 border-dashed border-tone-414" />Previous period</span>
                        </span>
                    </div>
                    {isLoading ? <ChartSkeleton className="h-[240px]" /> : series.length ? (
                        <>
                            <LineChart current={series.map((p) => p.amountMinor)} previous={prevSeries} />
                            <div className="flex justify-between text-xs text-tone-414">
                                {series.map((p, i) => <span key={`${p.label}-${i}`}>{p.label}</span>)}
                            </div>
                        </>
                    ) : (
                        <p className="py-16 text-center text-sm text-tone-414">No spending in this period yet.</p>
                    )}
                </section>

                <div className="flex flex-wrap items-stretch gap-4">
                    <section className={`hz-reveal ${CARD} flex min-w-0 flex-[1_1_360px] flex-col gap-[18px] p-[22px]`}>
                        <h2 className="text-lg font-semibold">By category</h2>
                        {isLoading ? <ProgressListSkeleton /> : donut.length ? (
                            <div className="flex flex-wrap items-center gap-6">
                                <Donut slices={donut.map((d) => ({ pct: d.pct, color: d.color }))} />
                                <ul className="flex min-w-[180px] flex-1 flex-col gap-3">
                                    {donut.map((d) => (
                                        <li key={d.name} className="flex items-center gap-2.5 text-sm">
                                            <span className="h-3 w-3 rounded-[3px]" style={{ background: d.color }} />
                                            <span className="flex-1">{d.name}</span>
                                            <span className="text-tone-414">{d.pct}%</span>
                                            <span className="w-[84px] text-right font-semibold tabular-nums">{formatNaira(d.spentMinor)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : <p className="py-10 text-center text-sm text-tone-414">No payments in this period yet.</p>}
                    </section>
                    <section className={`hz-reveal ${CARD} flex min-w-0 flex-[1_1_360px] flex-col gap-3.5 p-[22px]`}>
                        <h2 className="text-lg font-semibold">Top providers</h2>
                        {isLoading ? <ProgressListSkeleton /> : providers.length ? (
                            <ol className="flex flex-col">
                                {providers.map((p, i) => (
                                    <li key={p.providerCode} className="flex items-center gap-3.5 border-b border-tone-44 py-3 last:border-b-0">
                                        <span className="w-5 text-sm font-semibold text-tone-414">{i + 1}</span>
                                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <span className="truncate text-[15px] font-medium">{p.providerName}</span>
                                            <span className="text-[13px] text-tone-414">{totalMinor ? `${Math.round((p.amountMinor / totalMinor) * 100)}% of your spending` : ''}</span>
                                        </span>
                                        <span className="text-[15px] font-semibold tabular-nums">{formatNaira(p.amountMinor)}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : <p className="py-10 text-center text-sm text-tone-414">No providers yet.</p>}
                    </section>
                </div>

                {biggest && biggestPct > 0 && (
                    <section className="hz-reveal flex flex-wrap items-center gap-[18px] rounded-[14px] bg-carbon p-[22px] text-cloud">
                        <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-graphite">
                            <Lightbulb className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="flex flex-[1_1_320px] flex-col gap-1">
                            <span className="text-base font-semibold">{biggest.name} is your biggest bill</span>
                            <span className="text-sm leading-normal text-silver">It was {biggestPct}% of your spending in this period.</span>
                        </span>
                        <Link href={biggestSlug ? `/dashboard/services?service=${biggestSlug}` : '/dashboard/services'} className="hz-press inline-flex min-h-11 items-center justify-center rounded-[10px] bg-cloud px-[18px] text-sm font-medium text-carbon hover:bg-white">
                            Pay for {biggest.name.toLowerCase()}
                        </Link>
                    </section>
                )}
            </div>

            {isRangePickerOpen && today && (
                <DateRangeDialog today={today} initialFrom={range === 'custom' ? from : undefined} initialTo={range === 'custom' ? to : undefined} onApply={applyCustomRange} onCancel={closeRangePicker} />
            )}
        </div>
    );
}

const SERVICE_SLUG_BY_NAME: Record<string, string> = {
    Airtime: 'airtime',
    Data: 'data',
    Electricity: 'electricity',
    'Cable TV': 'tv',
    Internet: 'internet-services',
    Education: 'education',
    Insurance: 'insurance',
    Betting: 'betting',
};

/** Analytics board line chart: this period solid with a soft fill, the previous period dashed. */
function LineChart({ current, previous }: { current: number[]; previous: number[] }) {
    const W = 800;
    const H = 240;
    const max = Math.max(1, ...current, ...previous) * 1.1;
    const pts = (arr: number[]) => arr.map((v, i) => `${((i / Math.max(arr.length - 1, 1)) * W).toFixed(1)},${(H - (v / max) * (H - 20)).toFixed(1)}`);
    const cur = pts(current);
    const prev = previous.length === current.length ? pts(previous) : [];
    return (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[240px] w-full text-tone-744" role="img" aria-label="Spending over time">
            {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} className="stroke-tone-44" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
            <path d={`M0,${H} L${cur.join(' L')} L${W},${H} Z`} fill="currentColor" opacity="0.06" />
            {prev.length > 0 && <polyline points={prev.join(' ')} fill="none" className="stroke-tone-414" strokeWidth="2" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />}
            <polyline points={cur.join(' ')} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

/** Ring chart for "By category"; slices are percentages. */
function Donut({ slices }: { slices: { pct: number; color: string }[] }) {
    const offsets = slices.map((_, i) => slices.slice(0, i).reduce((sum, s) => sum + s.pct, 0));
    return (
        <svg viewBox="0 0 42 42" className="h-40 w-40 shrink-0 -rotate-90" role="img" aria-label="Spending by category">
            <circle cx="21" cy="21" r="15.915" fill="none" className="stroke-tone-44" strokeWidth="6" />
            {slices.map((s, i) => (
                <circle key={i} cx="21" cy="21" r="15.915" fill="none" stroke={s.color} strokeWidth="6" strokeDasharray={`${s.pct} ${100 - s.pct}`} strokeDashoffset={-offsets[i]} />
            ))}
        </svg>
    );
}

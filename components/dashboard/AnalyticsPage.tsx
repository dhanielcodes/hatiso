'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { CalendarDays, ChevronDown, Upload } from 'lucide-react';
import { ServiceUsageChart, SpendingChart } from '@/components/dashboard/DashboardCharts';

/* ─── Constants ────────────────────────────────────────────────── */
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['Morn.', 'Noon', 'Evening', 'Night'];
const HEAT_COLORS = ['#F7E1D5', '#F5B692', '#E1966C', '#D9622B'];
const HEAT_LABELS = ['<2', '<4', '5-20', '>21'];
const CARD = 'rounded-xl border border-[#EBE6E1] bg-white';

/* ─── Dummy data (amounts are in kobo / minor units) ───────────── */
const METRICS = [
    { label: 'Total spent', value: '₦84,250', change: '+ 12.4%', positive: true },
    { label: 'Transactions', value: '35', change: '+ 3 more', positive: true },
    { label: 'Average payment', value: '₦6,100', change: '+ 124', positive: true },
    { label: 'Success rate', value: '94.4%', change: '↑ 2.1%', positive: true },
];

const YEARLY_DATA = [
    { label: 'Jan', amountMinor: 2_100_000 * 100 },
    { label: 'Feb', amountMinor: 1_300_000 * 100 },
    { label: 'Mar', amountMinor: 1_800_000 * 100 },
    { label: 'Apr', amountMinor: 1_300_000 * 100 },
    { label: 'May', amountMinor: 2_300_000 * 100 },
    { label: 'Jun', amountMinor: 1_600_000 * 100 },
    { label: 'Jul', amountMinor: 1_300_000 * 100 },
    { label: 'Aug', amountMinor: 2_100_000 * 100 },
    { label: 'Sep', amountMinor: 1_600_000 * 100 },
    { label: 'Oct', amountMinor: 2_800_000 * 100 },
    { label: 'Nov', amountMinor: 1_600_000 * 100 },
    { label: 'Dec', amountMinor: 1_300_000 * 100 },
];

const USAGE_ROWS = [
    { name: 'Airtime', value: 15, spentMinor: 37_358 * 100, color: '#2F5BDB' },
    { name: 'Data', value: 20, spentMinor: 19_058 * 100, color: '#F5B53F' },
    { name: 'Electricity', value: 10, spentMinor: 57_358 * 100, color: '#3E8E4F' },
    { name: 'Cable TV', value: 40, spentMinor: 37_358 * 100, color: '#D23B3B' },
    { name: 'Insurance', value: 5, spentMinor: 17_358 * 100, color: '#8B5CF6' },
    { name: 'Betting', value: 10, spentMinor: 33_358 * 100, color: '#1F1F1F' },
];

// Build a cumulative series that ends exactly at `totalNaira` (returned in minor units)
function buildCumulative(weights: number[], totalNaira: number) {
    const sum = weights.reduce((a, b) => a + b, 0);
    let running = 0;
    return weights.map((w) => {
        running += (w / sum) * totalNaira * 100;
        return Math.round(running);
    });
}

const THIS_MONTH_WEIGHTS = [5, 3, 0, 6, 4, 0, 8, 2, 5, 0, 7, 3, 4, 0, 6, 5, 2, 0, 9, 4, 3, 0, 6, 5, 2, 7, 0, 4, 6, 3];
const LAST_MONTH_WEIGHTS = [2, 4, 3, 0, 5, 2, 0, 6, 4, 1, 0, 5, 3, 4, 0, 7, 2, 3, 0, 5, 4, 2, 6, 0, 3, 4, 5, 0, 3, 4];

const CUMULATIVE = {
    thisMonth: buildCumulative(THIS_MONTH_WEIGHTS, 194_100),
    lastMonth: buildCumulative(LAST_MONTH_WEIGHTS, 137_800),
    thisTotal: 194_100 * 100,
    diff: 56_300 * 100,
    pct: 8,
    days: 30,
};

// Heat levels (0–3) per weekday (Mon→Sun) and time slot (Morn., Noon, Evening, Night)
const HEAT_LEVELS = [
    [3, 1, 3, 2],
    [2, 0, 3, 3],
    [1, 0, 0, 1],
    [0, 2, 3, 2],
    [0, 2, 3, 0],
    [1, 0, 2, 0],
    [0, 1, 2, 3],
];
const HEAT_COUNTS = [1, 4, 12, 24]; // representative payment count per level (tooltip only)

const PROVIDERS = [
    { name: 'Airtel', amountMinor: 37_358 * 100 },
    { name: 'DSTV', amountMinor: 62_158 * 100 },
    { name: 'IKEDC', amountMinor: 24_258 * 100 },
    { name: 'MTN', amountMinor: 11_358 * 100 },
    { name: 'Spectranet', amountMinor: 10_908 * 100 },
];
const PROVIDER_MAX = Math.max(...PROVIDERS.map((p) => p.amountMinor));

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

/* ─── Small presentational pieces ──────────────────────────────── */
function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div>
            <h2 className="text-base font-semibold text-[#20232A]">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-[#7A7F8A]">{subtitle}</p>}
        </div>
    );
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
    const [period, setPeriod] = useState('Last month');
    const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
    const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null);
    const [pendingFrom, setPendingFrom] = useState('');
    const [pendingTo, setPendingTo] = useState('');
    const today = useClientDate();

    /* Selected range (label only, since the data below is static) */
    const { from, to } = useMemo(() => {
        if (customRange) return customRange;
        if (!today) return { from: '', to: '' };
        const end = new Date(`${today}T00:00:00`);

        if (period === 'Last month') {
            const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
            const last = new Date(end.getFullYear(), end.getMonth(), 0);
            return { from: toDateString(start), to: toDateString(last) };
        }

        const start = new Date(end);
        if (period === 'Last 30 days') start.setDate(end.getDate() - 29);
        else if (period === 'Last 6 months') start.setMonth(end.getMonth() - 5, 1);
        else start.setDate(end.getDate() - 6);
        return { from: toDateString(start), to: toDateString(end) };
    }, [customRange, period, today]);

    const openRangePicker = () => {
        setPendingFrom(from);
        setPendingTo(to);
        setIsRangePickerOpen(true);
    };

    const applyCustomRange = () => {
        if (!pendingFrom || !pendingTo || pendingFrom > pendingTo) return;
        setCustomRange({ from: pendingFrom, to: pendingTo });
        setPeriod('Custom range');
        setIsRangePickerOpen(false);
    };

    /* ── Export (CSV) ── */
    const handleExport = () => {
        const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
        const rows: (string | number)[][] = [
            ['Period', `${from} to ${to}`],
            ...METRICS.map((m) => [m.label, `${m.value} (${m.change})`]),
            [],
            ['Spending (by month, this year)', 'Amount (NGN)'],
            ...YEARLY_DATA.map((m) => [m.label, m.amountMinor / 100]),
            [],
            ['Service', 'Share (%)'],
            ...USAGE_ROWS.map((r) => [r.name, r.value]),
        ];
        const csv = rows.map((r) => r.map(cell).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${from}-to-${to}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
            {/* ── Page header ── */}
            <section className="border-b border-[#F2EAE5] px-5 py-5 sm:px-8 sm:py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#E95312]">Insights</p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#18202A]">
                            Understand where your <span className="text-[#E95312]">money goes.</span>
                        </h1>
                        <p className="mt-3 text-sm text-[#7E7581]">Practical patterns and gentle guidance, built from your payment history.</p>
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
                                    {from && to ? formatRange(from, to) : 'Choose range'}
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
                            onClick={handleExport}
                            className="flex items-center gap-2 rounded-lg border border-[#DED8D4] bg-white px-3 py-2.5 text-xs text-[#343238] transition hover:bg-slate-50"
                        >
                            Export <Upload className="h-3.5 w-3.5 text-[#807A7B]" />
                        </button>
                    </div>
                </div>
            </section>

            <main className="mx-auto space-y-5 px-5 py-6 sm:px-8 lg:py-7">
                {/* ── Metric cards ── */}
                <section>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {METRICS.map((metric) => (
                            <article key={metric.label} className={`${CARD} px-5 py-6`}>
                                <p className="text-sm text-[#52617A]">{metric.label}</p>
                                <p className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[#364259]">{metric.value}</p>
                                <p className="mt-2 text-[13px]">
                                    <span className={metric.positive ? 'text-[#2E9A4F]' : 'text-[#E22E41]'}>{metric.change}</span>
                                    <span className="text-[#A29B9C]"> from previous period</span>
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ── Spending insights ── */}
                <section className={`${CARD} p-5 sm:p-6`}>
                    <CardHeader title="Spending Insights" subtitle="Compare how you spend the most each month." />
                    <div className="mt-6 h-[260px] sm:h-[300px]">
                        <SpendingChart data={YEARLY_DATA} />
                    </div>
                </section>

                {/* ── Digital services + this month vs last month ── */}
                <section className="grid gap-5 lg:grid-cols-2">
                    <article className={`${CARD} p-5 sm:p-6`}>
                        <CardHeader title="Transaction Rate by Digital Services" subtitle="Transaction distribution across Hatiso digital services." />
                        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
                            <div className="relative h-[200px] w-[200px] shrink-0">
                                <ServiceUsageChart data={USAGE_ROWS} />
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
                                    {USAGE_ROWS.map((row) => (
                                        <div key={row.name} className="grid grid-cols-[1.3fr_1fr_.6fr] items-center py-2.5 text-sm">
                                            <span className="flex min-w-0 items-center gap-2 text-[#3B4150]">
                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                                                <span className="truncate">{row.name}</span>
                                            </span>
                                            <span className="font-medium text-[#3B4150]">{formatNaira(row.spentMinor)}</span>
                                            <span className="text-right font-medium text-[#3B4150]">{row.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </article>

                    <article className={`${CARD} p-5 sm:p-6`}>
                        <CardHeader
                            title="This month vs last month"
                            subtitle={`Cumulative spend by day. You're ${formatNaira(Math.abs(CUMULATIVE.diff))} ${CUMULATIVE.diff >= 0 ? 'ahead' : 'behind'} at this point.`}
                        />
                        <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-[#3B4150]">This Month</p>
                                <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#18202A]">
                                    {formatNaira(CUMULATIVE.thisTotal)}
                                </p>
                                <p className="mt-1.5 text-[11px] text-[#7A7F8A]">
                                    <span className="rounded bg-[#E7F5EE] px-1.5 py-0.5 font-medium text-[#2E9A4F]">
                                        +{CUMULATIVE.pct}%
                                    </span>{' '}
                                    vs last month
                                </p>
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
                            <CumulativeChart thisMonth={CUMULATIVE.thisMonth} lastMonth={CUMULATIVE.lastMonth} days={CUMULATIVE.days} />
                        </div>
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
                            <div className="mx-auto grid min-w-[300px] max-w-[360px] grid-cols-[44px_repeat(4,1fr)] gap-2">
                                <span />
                                {TIME_SLOTS.map((slot) => (
                                    <span key={slot} className="pb-1 text-center text-xs text-[#7A7F8A]">{slot}</span>
                                ))}
                                {WEEK_DAYS.map((day, dayIndex) => (
                                    <div key={day} className="contents">
                                        <span className="flex items-center text-xs text-[#7A7F8A]">{day}</span>
                                        {HEAT_LEVELS[dayIndex].map((level, slotIndex) => {
                                            const count = HEAT_COUNTS[level];
                                            return (
                                                <div
                                                    key={`${day}-${slotIndex}`}
                                                    title={`${count} payment${count === 1 ? '' : 's'}`}
                                                    className="h-9 rounded-md"
                                                    style={{ backgroundColor: HEAT_COLORS[level] }}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </article>

                    <article className={`${CARD} p-5 sm:p-6`}>
                        <CardHeader title="Top providers" subtitle="Where most of your money went." />
                        <div className="mt-6 space-y-5">
                            {PROVIDERS.map((provider) => (
                                <div key={provider.name}>
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="truncate font-medium text-[#52617A]">{provider.name}</span>
                                        <span className="shrink-0 font-semibold text-[#20232A]">{formatNaira(provider.amountMinor)}</span>
                                    </div>
                                    <div className="mt-2 h-1.5 w-full rounded-full bg-[#D9D9D9]">
                                        <div
                                            className="h-full rounded-full bg-[#E2733F]"
                                            style={{ width: `${Math.max(4, (provider.amountMinor / PROVIDER_MAX) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>
            </main>
        </div>
    );
}
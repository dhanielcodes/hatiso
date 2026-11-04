'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Gift,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ServiceUsageChart, SpendingChart } from '@/components/dashboard/DashboardCharts';
import { useAuthStore } from '@/lib/store/authStore';
import { useDashboard } from '@/lib/queries/useDashboard';
import type { DashboardBucket } from '@/lib/api/dashboard';

const usageColors = ['#F45A08', '#FFA76D', '#2E75BC', '#6A4D9B', '#204555', '#C54E92'];

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

function formatNaira(amountMinor: number) {
  return `₦${(amountMinor / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
}

function formatRange(from: string, to: string) {
  const formatter = new Intl.DateTimeFormat('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${formatter.format(new Date(`${from}T00:00:00`))} – ${formatter.format(new Date(`${to}T00:00:00`))}`;
}

function formatBucketLabel(from: string, bucket: DashboardBucket) {
  const date = new Date(`${from}T00:00:00`);
  return bucket === 'MONTH'
    ? new Intl.DateTimeFormat('en-NG', { month: 'short' }).format(date)
    : new Intl.DateTimeFormat('en-NG', { month: 'short', day: 'numeric' }).format(date);
}

function bucketForRange(from: string, to: string): DashboardBucket {
  const differenceInDays = Math.floor((Date.parse(`${to}T00:00:00`) - Date.parse(`${from}T00:00:00`)) / 86_400_000) + 1;
  if (differenceInDays > 120) return 'MONTH';
  if (differenceInDays > 31) return 'WEEK';
  return 'DAY';
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'SUCCESSFUL' || status === 'FULFILLED'
    ? 'bg-[#E7F5EE] text-[#008A46]'
    : status === 'PENDING' || status === 'INITIATED'
      ? 'bg-[#FFF2D8] text-[#C86713]'
      : 'bg-[#FDE7EA] text-[#E22E41]';
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${tone}`}><span className="h-1 w-1 rounded-full bg-current" />{status.replace(/_/g, ' ')}</span>;
}

function MetricSkeleton() {
  return <article className="animate-pulse rounded-xl border border-[#E6E3E0] bg-white px-5 py-6"><div className="h-4 w-28 rounded bg-slate-100" /><div className="mt-4 h-8 w-32 rounded bg-slate-200" /><div className="mt-3 h-4 w-40 rounded bg-slate-100" /></article>;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState('Last 7 days');
  const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
  const [customRange, setCustomRange] = useState<{ from: string; to: string; bucket: DashboardBucket } | null>(null);
  const [pendingFrom, setPendingFrom] = useState('');
  const [pendingTo, setPendingTo] = useState('');
  const today = useClientDate();
  const { from, to, bucket } = useMemo(() => {
    if (customRange) return customRange;
    if (!today) return { from: '', to: '', bucket: 'DAY' as DashboardBucket };
    const end = new Date(`${today}T00:00:00`);
    const start = new Date(end);
    if (period === 'Last 30 days') start.setDate(end.getDate() - 29);
    else if (period === 'Last 6 months') start.setMonth(end.getMonth() - 5, 1);
    else start.setDate(end.getDate() - 6);
    return { from: toDateString(start), to: toDateString(end), bucket: (period === 'Last 6 months' ? 'MONTH' : period === 'Last 30 days' ? 'WEEK' : 'DAY') as DashboardBucket };
  }, [customRange, period, today]);
  const { data, isLoading, isError } = useDashboard({ from, to, bucket, recentLimit: 10 }, Boolean(today));
  const displayName = user?.name?.split(' ')[0] || 'there';

  const openRangePicker = () => {
    setPendingFrom(from);
    setPendingTo(to);
    setIsRangePickerOpen(true);
  };

  const applyCustomRange = () => {
    if (!pendingFrom || !pendingTo || pendingFrom > pendingTo) return;
    setCustomRange({ from: pendingFrom, to: pendingTo, bucket: bucketForRange(pendingFrom, pendingTo) });
    setPeriod('Custom range');
    setIsRangePickerOpen(false);
  };

  const metrics = data ? [
    { label: 'Spent this period', value: formatNaira(data.summary.spending.amountMinor), change: `${data.summary.spending.changePercent >= 0 ? '+' : ''}${data.summary.spending.changePercent.toFixed(1)}%`, detail: 'vs previous period', positive: data.summary.spending.changePercent >= 0 },
    { label: 'Transactions', value: data.summary.transactions.count.toLocaleString(), change: `${data.summary.transactions.changePercent >= 0 ? '+' : ''}${data.summary.transactions.changePercent.toFixed(1)}%`, detail: 'vs previous period', positive: data.summary.transactions.changePercent >= 0 },
    { label: 'Success rate', value: `${data.summary.successRate.percent.toFixed(1)}%`, change: `${data.summary.successRate.changePercentagePoints >= 0 ? '+' : ''}${data.summary.successRate.changePercentagePoints.toFixed(1)} pts`, detail: 'vs previous period', positive: data.summary.successRate.changePercentagePoints >= 0 },
    { label: 'Reward points', value: data.rewards.available && data.rewards.points !== null ? data.rewards.points.toLocaleString() : '—', change: data.rewards.available ? 'Available' : 'Not available', detail: '', positive: true },
  ] : [];
  const spendingData = (data?.spendingOverview ?? []).map((item) => ({ label: formatBucketLabel(item.from, bucket), amountMinor: item.amountMinor }));
  const usageData = (data?.digitalServicesUsage ?? []).map((item, index) => ({ name: item.serviceType.replace(/_/g, ' '), value: item.percentage, color: usageColors[index % usageColors.length] }));

  return (
    <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
      <section className="border-b border-[#F2EAE5] px-5 py-5 sm:px-8 sm:py-6">
        <p className="text-sm font-medium text-[#FA5B0B]">{data ? formatRange(data.from, data.to) : 'Dashboard overview'}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-[26px]">Welcome back, {displayName} 👋</h1>
        <p className="mt-1 text-[15px] text-[#7E7581]">Here&apos;s a clear look at your spending this period.</p>
      </section>

      <main className="mx-auto space-y-5 px-5 py-6 sm:px-8 lg:py-7">
        <section className="grid gap-5 xl:grid-cols-[1.85fr_.95fr]">
          <div className="relative min-h-[247px] overflow-hidden rounded-xl bg-[#204657] px-7 py-8 text-white sm:px-9"><div className="absolute inset-y-0 right-0 w-[49%] opacity-95"><Image src="/images/bills_hero.png" alt="Pay bills from home" fill sizes="(max-width: 768px) 0px, 42vw" className="object-cover object-center mix-blend-luminosity" priority /><div className="absolute inset-0 bg-gradient-to-r from-[#204657] via-[#204657]/55 to-transparent" /></div><div className="relative z-10 max-w-[430px]"><span className="inline-flex rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-semibold tracking-wide">ALL YOUR BILLS. ONE PLACE.</span><h2 className="mt-7 text-[29px] font-semibold leading-[1.17] tracking-[-0.04em] sm:text-[34px]">Let&apos;s get your <span className="text-[#F65A08]">bills out of the way.</span></h2><p className="mt-4 max-w-[390px] text-[13px] leading-5 text-[#E2E8EC]">Skip the stress and the back and forth. Pay electricity, airtime, TV and more in one safe place, anytime you like.</p></div><div className="absolute bottom-8 right-8 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#F65A08] shadow-lg"><Gift className="h-5 w-5" /></div></div>
          <article className="relative min-h-[247px] overflow-hidden rounded-xl bg-[#FFE5D5] p-6 sm:p-7"><span className="inline-flex rounded-full bg-[#FFD0B2] px-3 py-1.5 text-[10px] font-semibold text-[#F65A08]">THIS WEEK</span><h2 className="mt-5 max-w-[250px] text-[23px] font-semibold leading-[1.24] tracking-[-0.03em]">Get 5× points on every data bundle</h2><p className="mt-2 max-w-[180px] text-[13px] leading-4 text-[#967D79]">More data, more rewards.<br />Ends Sunday.</p><Link href="/dashboard/services" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F65A08]">Buy Data <ArrowRight className="h-4 w-4" /></Link><div className="absolute right-7 top-1/2 flex h-32 w-32 -translate-y-1/2 rotate-12 items-center justify-center rounded-full border-[8px] border-[#FA925A] bg-[#F57128] text-center text-white shadow-sm"><span className="text-3xl font-semibold leading-none">5×<small className="mt-1 block text-[11px] font-medium tracking-wide">POINTS</small></span></div></article>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-[#847D7E]">Metrics</h2>
            <div className="flex flex-wrap gap-2">
              <label className="relative">
                <span className="sr-only">Select period</span>
                <select
                  value={period}
                  onChange={(event) => {
                    if (event.target.value !== 'Custom range') {
                      setPeriod(event.target.value);
                      setCustomRange(null);
                    }
                  }}
                  className="appearance-none rounded-xl border border-[#DED8D4] bg-white py-2.5 pl-3 pr-9 text-xs text-[#343238] outline-none"
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 6 months</option>
                  {customRange && <option>Custom range</option>}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              </label>
              <div className="relative">
                <button type="button" onClick={openRangePicker} className="flex items-center gap-2 rounded-xl border border-[#DED8D4] bg-white px-3 py-2.5 text-xs text-[#343238] transition hover:border-[#E95312]/50 active:scale-[0.98]">
                  <CalendarDays className="h-4 w-4 text-[#807A7B]" />
                  {from && to ? formatRange(from, to) : 'Choose range'}
                </button>
                {isRangePickerOpen && <div className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border border-[#E6E3E0] bg-white p-4 shadow-xl shadow-slate-900/10">
                  <p className="text-sm font-semibold text-[#34425D]">Custom date range</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-medium text-slate-600">From<input type="date" value={pendingFrom} max={pendingTo || today || undefined} onChange={(event) => setPendingFrom(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-[#E95312]" /></label>
                    <label className="text-xs font-medium text-slate-600">To<input type="date" value={pendingTo} min={pendingFrom || undefined} max={today || undefined} onChange={(event) => setPendingTo(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-[#E95312]" /></label>
                  </div>
                  {pendingFrom && pendingTo && pendingFrom > pendingTo && <p className="mt-3 text-xs text-rose-600">The end date must be after the start date.</p>}
                  <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setIsRangePickerOpen(false)} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button type="button" onClick={applyCustomRange} disabled={!pendingFrom || !pendingTo || pendingFrom > pendingTo} className="rounded-lg bg-[#E95312] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#E95312] disabled:cursor-not-allowed disabled:opacity-50">Apply range</button></div>
                </div>}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{isLoading ? Array.from({ length: 4 }, (_, index) => <MetricSkeleton key={index} />) : metrics.map((metric) => <article key={metric.label} className="rounded-xl border border-[#E6E3E0] bg-white px-5 py-6"><p className="text-[15px] text-[#52617A]">{metric.label}</p><p className="mt-3 text-[27px] font-medium tracking-[-0.04em] text-[#364259]">{metric.value}</p><p className="mt-2 text-sm"><span className={`font-medium ${metric.positive ? 'text-[#009447]' : 'text-[#E22E41]'}`}>{metric.change}</span><span className="text-[#A29B9C]"> {metric.detail}</span></p></article>)}</div>
          {isError && <p className="mt-3 text-sm text-rose-600">We couldn&apos;t load dashboard data. Please try again.</p>}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.85fr_.95fr]"><article className="rounded-xl border border-[#E6E3E0] bg-white p-5 sm:p-6"><div><h2 className="text-xl font-medium text-[#53637C]">Spending overview</h2><p className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-[#20232A]">{data ? formatNaira(data.summary.spending.amountMinor) : '—'}</p><p className="mt-1 text-xs text-[#9C9697]">{data ? `${data.summary.spending.changePercent >= 0 ? '+' : ''}${data.summary.spending.changePercent.toFixed(1)}% vs previous period` : 'Loading spending overview'}</p></div><div className="mt-6 h-[270px] sm:h-[310px]">{isLoading ? <div className="h-full animate-pulse rounded-xl bg-slate-50" /> : spendingData.length ? <SpendingChart data={spendingData} /> : <p className="pt-24 text-center text-sm text-slate-500">No spending data for this period.</p>}</div></article><article className="rounded-xl border border-[#E6E3E0] bg-white p-5 sm:p-6"><h2 className="text-xl font-medium">Digital Services usage</h2><div className="relative mx-auto mt-4 h-[240px] max-w-[310px]">{isLoading ? <div className="h-full animate-pulse rounded-full bg-slate-100" /> : usageData.length ? <ServiceUsageChart data={usageData} /> : <p className="pt-24 text-center text-sm text-slate-500">No service usage yet.</p>}</div><div className="mt-2 space-y-2.5">{usageData.map((service) => <div key={service.name} className="flex items-center gap-3 text-sm"><span className="h-5 w-5 rounded" style={{ backgroundColor: service.color }} /><span className="flex-1">{service.name}</span><span className="text-[#647188]">{service.value.toFixed(1)}%</span></div>)}</div></article></section>

        <section className="grid gap-5 xl:grid-cols-[1.85fr_.95fr]"><article className="rounded-xl border border-[#E6E3E0] bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Recent transactions</h2><Link href="/dashboard/transactions" className="inline-flex items-center gap-2 text-sm font-medium text-[#F65A08]">View all transactions <ChevronRight className="h-4 w-4" /></Link></div><div className="mt-5 divide-y divide-[#E8E5E2]">{isLoading ? Array.from({ length: 3 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded bg-slate-50" />) : data?.recentTransactions.length ? data.recentTransactions.map((transaction) => <div key={transaction.txnRef} className="flex items-center gap-3 py-4 first:pt-2"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAF7FC] text-xs font-bold text-[#204657]">{transaction.productName.slice(0, 2).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="text-lg font-medium leading-5">{transaction.productName}</p><p className="mt-1 truncate text-sm text-[#81909B]">{new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(transaction.createdAt))}</p></div><div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4"><span className="font-semibold text-[#39475E]">{formatNaira(transaction.totalMinor)}</span><StatusBadge status={transaction.paymentStatus} /></div></div>) : <p className="py-10 text-center text-sm text-slate-500">No recent transactions yet.</p>}</div></article><aside className="overflow-hidden rounded-xl border border-[#E6E3E0] bg-white"><div className="relative bg-[#F5F5F5] p-5"><h2 className="text-xl font-semibold">Reward points</h2><p className="mt-7 text-sm text-[#60708B]">Your reward points</p><p className="mt-1 text-[31px] font-medium leading-none tracking-[-0.04em] text-[#364259]">{data?.rewards.available && data.rewards.points !== null ? data.rewards.points.toLocaleString() : '—'} <span className="text-xl">points</span></p><p className="mt-2 text-sm text-[#979797]">{data?.rewards.available ? 'Available to redeem' : 'Rewards are not available yet'}</p><div className="absolute right-4 top-8 flex h-24 w-32 rotate-[-27deg] items-center justify-center rounded-full bg-[#009B48] shadow-[14px_8px_0_#F8AF00]"><Trophy className="h-10 w-10 text-white" /><Sparkles className="absolute -right-4 -top-3 h-5 w-5 text-[#009B48]" /></div></div><div className="p-5"><span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1E8] px-3 py-1.5 text-sm text-[#F65A08]"><Gift className="h-3.5 w-3.5" /> Reward program</span><p className="mt-5 text-sm leading-6 text-[#7F7A78]">Complete digital-service payments to earn rewards when they become available.</p></div></aside></section>
      </main>
    </div>
  );
}

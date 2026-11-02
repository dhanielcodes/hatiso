'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Gift,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { ServiceUsageChart, SpendingChart } from '@/components/dashboard/DashboardCharts';

const spendingData = [
  { month: 'Mar', amount: 1.45 },
  { month: 'Apr', amount: 1.92 },
  { month: 'May', amount: 1.08 },
  { month: 'Jun', amount: 1.72 },
  { month: 'Jul', amount: 2.48 },
  { month: 'Aug', amount: 1.84 },
  { month: 'Sep', amount: 2.33 },
  { month: 'Oct', amount: 1.96 },
  { month: 'Nov', amount: 2.22 },
  { month: 'Dec', amount: 1.58 },
  { month: 'Jan', amount: 1.46 },
  { month: 'Feb', amount: 2.28 },
];

const serviceUsage = [
  { name: 'Airtime', value: 51, color: '#F45A08' },
  { name: 'Data', value: 12, color: '#FFA76D' },
  { name: 'Electricity', value: 12, color: '#2E75BC' },
  { name: 'Cable TV', value: 12, color: '#6A4D9B' },
  { name: 'Betting', value: 13, color: '#204555' },
];

const transactions = [
  { id: 'transaction-1', provider: 'MTN', service: 'Airtime - MTN Nigeria', amount: '₦8,250', status: 'Success', logo: '/images/biller_mtn.png', tone: 'success' },
  { id: 'transaction-2', provider: 'DSTV', service: 'Cable TV - DSTV', amount: '₦10,300', status: 'Pending', logo: '/images/tv_dstv.png', tone: 'pending' },
  { id: 'transaction-3', provider: 'airtel', service: 'Data - Airtel', amount: '₦2,000', status: 'Success', logo: '/images/biller_airtel.png', tone: 'success' },
  { id: 'transaction-4', provider: 'MTN', service: 'Airtime - MTN Nigeria', amount: '₦8,250', status: 'Failed', logo: '/images/biller_mtn.png', tone: 'failed' },
  { id: 'transaction-5', provider: 'Sporty', service: 'Betting', amount: '₦8,250', status: 'Success', logo: '/images/betting_sportybet.png', tone: 'success' },
];

const metrics = [
  { label: 'Spent this month', value: '₦84,250', change: '+ 12.4%', detail: 'from Last week' },
  { label: 'Transactions', value: '35', change: '+ 3 more', detail: 'from Last week' },
  { label: 'Success rate', value: '94.4%', change: '↑ 2.1%', detail: 'from Last week' },
  { label: 'Reward points', value: '2,480', change: '+ 124', detail: 'from Last week' },
];

const activity = [
  { title: 'Airtime Bonus', date: 'Today · Tue 25th, Oct', points: '281 points', day: 'TUE', number: '25' },
  { title: 'TV Bonus', date: 'Yesterday · Tue 24th, Oct', points: '142 points', day: 'MON', number: '24' },
  { title: 'Data Bonus', date: 'Sun 23th, Oct', points: '427 points', day: 'SUN', number: '23' },
];

function StatusBadge({ tone, children }: { tone: string; children: string }) {
  const styles = {
    success: 'bg-[#E7F5EE] text-[#008A46]',
    pending: 'bg-[#FFF2D8] text-[#C86713]',
    failed: 'bg-[#FDE7EA] text-[#E22E41]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles[tone as keyof typeof styles]}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState('Last 7 days');
  const [station, setStation] = useState('All Stations');
  const displayName = user?.name?.split(' ')[0] || 'Mayowa';
  const dateLabel = useMemo(
    () => (period === 'Last 7 days' ? 'Jan 5, 2026 – Jan 11, 2026' : 'Dec 29, 2025 – Jan 11, 2026'),
    [period]
  );

  return (
    <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
      <section className="border-b border-[#F2EAE5] px-5 py-5 sm:px-8 sm:py-6">
        <p className="text-sm font-medium text-[#FA5B0B]">Monday, 10th October 2026</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-[26px]">Welcome Back, {displayName} 👋</h1>
        <p className="mt-1 text-[15px] text-[#7E7581]">Here&apos;s a clear look at your spending this month.</p>
      </section>

      <main className="mx-auto space-y-5 px-5 py-6 sm:px-8 lg:py-7">
        <section className="grid gap-5 xl:grid-cols-[1.85fr_.95fr]">
          <div className="relative min-h-[247px] overflow-hidden rounded-xl bg-[#204657] px-7 py-8 text-white sm:px-9">
            <div className="absolute inset-y-0 right-0 w-[49%] opacity-95">
              <Image src="/images/bills_hero.png" alt="Pay bills from home" fill sizes="(max-width: 768px) 0px, 42vw" className="object-cover object-center mix-blend-luminosity" priority />
              <div className="absolute inset-0 bg-gradient-to-r from-[#204657] via-[#204657]/55 to-transparent" />
            </div>
            <div className="relative z-10 max-w-[430px]">
              <span className="inline-flex rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-semibold tracking-wide">ALL YOUR BILLS. ONE PLACE.</span>
              <h2 className="mt-7 text-[29px] font-semibold leading-[1.17] tracking-[-0.04em] sm:text-[34px]">Let&apos;s get your <span className="text-[#F65A08]">bills out of the way.</span></h2>
              <p className="mt-4 max-w-[390px] text-[13px] leading-5 text-[#E2E8EC]">Skip the stress and the back and forth. Pay electricity, airtime, TV and more in one safe place, anytime you like.</p>
            </div>
            <div className="absolute bottom-8 right-8 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#F65A08] shadow-lg"><Gift className="h-5 w-5" /></div>
          </div>

          <article className="relative min-h-[247px] overflow-hidden rounded-xl bg-[#FFE5D5] p-6 sm:p-7">
            <span className="inline-flex rounded-full bg-[#FFD0B2] px-3 py-1.5 text-[10px] font-semibold text-[#F65A08]">THIS WEEK</span>
            <h2 className="mt-5 max-w-[250px] text-[23px] font-semibold leading-[1.24] tracking-[-0.03em]">Get 5× points on every data bundle</h2>
            <p className="mt-2 max-w-[180px] text-[13px] leading-4 text-[#967D79]">More data, more rewards.<br />Ends Sunday.</p>
            <Link href="/categories/data" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F65A08]">Buy Data <ArrowRight className="h-4 w-4" /></Link>
            <div className="absolute right-7 top-1/2 flex h-32 w-32 -translate-y-1/2 rotate-12 items-center justify-center rounded-full border-[8px] border-[#FA925A] bg-[#F57128] text-center text-white shadow-sm">
              <span className="text-3xl font-semibold leading-none">5×<small className="mt-1 block text-[11px] font-medium tracking-wide">POINTS</small></span>
            </div>
            <div className="absolute bottom-3 left-6 flex gap-1"><span className="h-1.5 w-4 rounded-full bg-[#F65A08]" /><span className="h-1.5 w-1.5 rounded-full bg-[#D9B9A8]" /><span className="h-1.5 w-1.5 rounded-full bg-[#D9B9A8]" /></div>
          </article>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-medium text-[#847D7E]">Metrics</h2><div className="flex flex-wrap gap-2"><label className="relative"><span className="sr-only">Select period</span><select value={period} onChange={(event) => setPeriod(event.target.value)} className="appearance-none rounded-xl border border-[#DED8D4] bg-white py-2.5 pl-3 pr-9 text-xs text-[#343238] outline-none"><option>Last 7 days</option><option>Last 14 days</option></select><ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" /></label><div className="flex items-center gap-2 rounded-xl border border-[#DED8D4] bg-white px-3 py-2.5 text-xs text-[#343238]"><CalendarDays className="h-4 w-4 text-[#807A7B]" />{dateLabel}</div></div></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <article key={metric.label} className="rounded-xl border border-[#E6E3E0] bg-white px-5 py-6"><p className="text-[15px] text-[#52617A]">{metric.label}</p><p className="mt-3 text-[27px] font-medium tracking-[-0.04em] text-[#364259]">{metric.value}</p><p className="mt-2 text-sm"><span className="font-medium text-[#009447]">{metric.change}</span><span className="text-[#A29B9C]"> {metric.detail}</span></p></article>)}</div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.85fr_.95fr]">
          <article className="rounded-xl border border-[#E6E3E0] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-medium text-[#53637C]">Spending overview</h2><p className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-[#20232A]">₦126,560,000</p><p className="mt-1 text-xs text-[#9C9697]"><span className="rounded bg-[#E7F8E8] px-1 text-[#24A13F]">8% ↗</span> vs Last 7 days</p></div><label className="relative"><span className="sr-only">Filter station</span><select value={station} onChange={(event) => setStation(event.target.value)} className="appearance-none rounded-lg border border-[#EBE9E6] bg-[#FAFAFA] py-1.5 pl-2.5 pr-8 text-[11px] text-[#8A8484] outline-none"><option>All Stations</option><option>Online</option><option>Mobile app</option></select><ChevronDown className="pointer-events-none absolute right-2 top-1.5 h-3.5 w-3.5 text-[#7E7878]" /></label></div>
            <div className="mt-6 h-[270px] sm:h-[310px]"><SpendingChart data={spendingData} /></div>
          </article>

          <article className="rounded-xl border border-[#E6E3E0] bg-white p-5 sm:p-6"><h2 className="text-xl font-medium">Digital Services usage</h2><div className="relative mx-auto mt-4 h-[240px] max-w-[310px]"><ServiceUsageChart data={serviceUsage} /></div><div className="mt-2 space-y-2.5">{serviceUsage.map((service) => <div key={service.name} className="flex items-center gap-3 text-sm"><span className="h-5 w-5 rounded" style={{ backgroundColor: service.color }} /><span className="flex-1">{service.name}</span><span className="text-[#647188]">{service.value}%</span></div>)}</div></article>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.85fr_.95fr]">
          <article className="rounded-xl border border-[#E6E3E0] bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Recent Transaction</h2><Link href="/dashboard/transactions" className="inline-flex items-center gap-2 text-sm font-medium text-[#F65A08]">View all transaction <ChevronRight className="h-4 w-4" /></Link></div><div className="mt-5 divide-y divide-[#E8E5E2]">{transactions.map((transaction) => <div key={transaction.id} className="flex items-center gap-3 py-4 first:pt-2"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#F6F6F6]"><Image src={transaction.logo} alt={transaction.provider} fill sizes="48px" className="object-contain p-1" /></div><div className="min-w-0 flex-1"><p className="text-lg font-medium leading-5">09034562728</p><p className="mt-1 truncate text-sm text-[#81909B]">{transaction.service}</p></div><div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4"><span className="font-semibold text-[#39475E]">{transaction.amount}</span><StatusBadge tone={transaction.tone}>{transaction.status}</StatusBadge></div></div>)}</div></article>

          <aside className="overflow-hidden rounded-xl border border-[#E6E3E0] bg-white"><div className="relative bg-[#F5F5F5] p-5"><h2 className="text-xl font-semibold">Reward Point</h2><p className="mt-7 text-sm text-[#60708B]">Your reward point</p><p className="mt-1 text-[31px] font-medium leading-none tracking-[-0.04em] text-[#364259]">4352 <span className="text-xl">points</span></p><p className="mt-2 text-sm"><span className="font-medium text-[#009447]">+ 139 P</span><span className="text-[#979797]"> from Last week</span></p><div className="absolute right-4 top-8 flex h-24 w-32 rotate-[-27deg] items-center justify-center rounded-full bg-[#009B48] shadow-[14px_8px_0_#F8AF00]"><Trophy className="h-10 w-10 text-white" /><Sparkles className="absolute -right-4 -top-3 h-5 w-5 text-[#009B48]" /></div></div><div className="p-5"><span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1E8] px-3 py-1.5 text-sm text-[#F65A08]"><Gift className="h-3.5 w-3.5" /> Tier - Silver</span><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#EEEEEE]"><div className="h-full w-[53%] rounded-full bg-[#204657]" /></div><div className="mt-2 flex justify-between text-xs"><span className="text-[#7F7A78]">Bronze (500+)</span><span className="font-medium text-[#F65A08]">Silver (3000+)</span><span className="text-[#008A46]">Gold (5000+)</span></div><h3 className="mt-7 font-medium">Recent activity</h3><div className="mt-4 space-y-2">{activity.map((item) => <div key={item.title} className="flex items-center gap-3 rounded-xl bg-[#F5F5F5] p-3"><div className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-white text-[8px] font-bold leading-none text-[#45535A] shadow-sm"><span>{item.day}</span><span className="mt-1 text-base">{item.number}</span></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-[#46536A]">{item.title}</p><p className="mt-1 text-[10px] text-[#93999D]">{item.date}</p></div><span className="text-sm font-medium text-[#46536A]">{item.points}</span></div>)}</div></div></aside>
        </section>
      </main>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
} from 'lucide-react';
import { useDigitalServiceOrders } from '@/lib/queries/useDigitalServiceOrders';
import type { DigitalServiceOrderHistory } from '@/lib/api/orders';
import type { DigitalServiceCategory } from '@/lib/api/digitalServices';

type SortKey = 'reference' | 'provider' | 'recipient' | 'date' | 'amount' | 'status' | 'payment';
type SortDirection = 'asc' | 'desc';

const categoryLabels: Record<DigitalServiceCategory, string> = {
  TELCO: 'Airtime & data',
  INTERNET_SERVICES: 'Internet services',
  DISCO: 'Electricity',
  CABLE: 'Cable TV',
  EDUCATION: 'Education',
  INSURANCE: 'Insurance',
  OTHER_SERVICES: 'Other services',
};

function formatNaira(amountMinor: number) {
  return `₦${(amountMinor / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

function providerName(productCode: string) {
  return productCode
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

function statusLabel(status: string) {
  return status === 'FULFILLED' ? 'Success' : status === 'AWAITING_PAYMENT' ? 'Pending' : status.replace(/_/g, ' ');
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'FULFILLED'
    ? 'bg-[#E7F5EE] text-[#008A46]'
    : status === 'AWAITING_PAYMENT' || status === 'PENDING'
      ? 'bg-[#FFF2D8] text-[#C86713]'
      : 'bg-[#FDE7EA] text-[#E22E41]';
  return <span className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${tone}`}><span className="h-1 w-1 rounded-full bg-current" />{statusLabel(status)}</span>;
}

function SortHeader({ label, sortKey, activeKey, direction, onSort }: { label: string; sortKey: SortKey; activeKey: SortKey; direction: SortDirection; onSort: (key: SortKey) => void }) {
  return <th className="whitespace-nowrap px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wide text-[#657089]"><button type="button" onClick={() => onSort(sortKey)} className="inline-flex items-center gap-1 hover:text-[#204657]">{label}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeKey === sortKey && direction === 'asc' ? 'rotate-180' : ''}`} /></button></th>;
}

export default function TransactionsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'ALL' | DigitalServiceCategory>('ALL');
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { data: orders = [], isLoading, isError, isPlaceholderData } = useDigitalServiceOrders(page, size);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders
      .filter((order) => category === 'ALL' || order.category === category)
      .filter((order) => {
        if (status === 'ALL') return true;
        if (status === 'SUCCESS') return order.fulfilmentStatus === 'FULFILLED';
        if (status === 'PENDING') return order.fulfilmentStatus === 'AWAITING_PAYMENT' || order.fulfilmentStatus === 'PENDING';
        return !['FULFILLED', 'AWAITING_PAYMENT', 'PENDING'].includes(order.fulfilmentStatus);
      })
      .filter((order) => !normalizedQuery || `${order.reference} ${order.productCode} ${order.recipient} ${order.paymentReference ?? ''}`.toLowerCase().includes(normalizedQuery))
      .toSorted((first, second) => {
        const valueFor = (order: DigitalServiceOrderHistory) => ({
          reference: order.reference,
          provider: providerName(order.productCode),
          recipient: order.recipient,
          date: order.expiresAt,
          amount: order.amountMinor,
          status: order.fulfilmentStatus,
          payment: order.paymentReference ?? '',
        })[sortKey];
        const firstValue = valueFor(first);
        const secondValue = valueFor(second);
        const comparison = typeof firstValue === 'number' && typeof secondValue === 'number'
          ? firstValue - secondValue
          : String(firstValue).localeCompare(String(secondValue));
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [category, orders, query, sortDirection, sortKey, status]);

  const changeSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(nextKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
      <section className="border-b border-[#F0E9E5] px-5 py-7 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#E95312]">Activity</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#20232A] sm:text-3xl">Every payment, <span className="text-[#FF6500]">easy to follow.</span></h2>
        <p className="mt-2 text-sm text-[#777486] sm:text-base">Track payments, download receipts, repeat a purchase, or get help.</p>
      </section>

      <main className="space-y-8 px-5 py-8 sm:px-8">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <label className="relative block flex-1"><span className="sr-only">Search transactions</span><Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by reference, provider or recipient" className="h-12 w-full rounded-xl border border-[#E6E3E0] bg-white pl-13 pr-4 text-sm outline-none transition focus:border-[#E95312] focus:ring-4 focus:ring-[#E95312]/10" /></label>
          <label className="relative"><span className="sr-only">Filter category</span><select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="h-12 appearance-none rounded-xl border border-[#E6E3E0] bg-white px-4 pr-10 text-sm text-[#4C5160] outline-none"><option value="ALL">All categories</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-4 h-4 w-4 text-slate-500" /></label>
          <div className="flex gap-2">{(['ALL', 'PENDING', 'SUCCESS', 'FAILED'] as const).map((option) => <button key={option} type="button" onClick={() => setStatus(option)} className={`rounded-full px-5 py-3 text-sm font-medium transition active:scale-[0.98] ${status === option ? 'bg-[#204657] text-white' : 'border border-[#E7E3E1] bg-white text-slate-700 hover:border-[#204657]/30'}`}>{option === 'ALL' ? 'All' : option[0] + option.slice(1).toLowerCase()}</button>)}</div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#E6E3E0] bg-white">
          <div className="overflow-x-auto"><table className="min-w-[1040px] w-full border-collapse"><thead className="border-b border-[#E6E3E0] bg-[#FBFCFD]"><tr><SortHeader label="Reference" sortKey="reference" activeKey={sortKey} direction={sortDirection} onSort={changeSort} /><SortHeader label="Service / provider" sortKey="provider" activeKey={sortKey} direction={sortDirection} onSort={changeSort} /><SortHeader label="Recipient" sortKey="recipient" activeKey={sortKey} direction={sortDirection} onSort={changeSort} /><SortHeader label="Expires at" sortKey="date" activeKey={sortKey} direction={sortDirection} onSort={changeSort} /><SortHeader label="Amount" sortKey="amount" activeKey={sortKey} direction={sortDirection} onSort={changeSort} /><SortHeader label="Status" sortKey="status" activeKey={sortKey} direction={sortDirection} onSort={changeSort} /><SortHeader label="Payment" sortKey="payment" activeKey={sortKey} direction={sortDirection} onSort={changeSort} /><th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wide text-[#657089]">Action</th></tr></thead><tbody className={isPlaceholderData ? 'opacity-55' : ''}>{isLoading ? Array.from({ length: 8 }, (_, index) => <tr key={index} className="border-b border-[#EEF0F2]"><td colSpan={8} className="px-6 py-4"><div className="h-8 animate-pulse rounded bg-slate-100" /></td></tr>) : filteredOrders.map((order) => <tr key={order.reference} className="border-b border-[#EEF0F2] transition hover:bg-[#FFF9F6]"><td className="px-6 py-4 text-sm text-[#687084]">{order.reference}</td><td className="px-6 py-4"><p className="font-medium text-[#4C576A]">{providerName(order.productCode)}</p><p className="mt-1 text-xs text-[#8A929B]">{categoryLabels[order.category]}</p></td><td className="px-6 py-4 text-sm font-medium text-[#2C3340]">{order.recipient}</td><td className="px-6 py-4 text-sm text-[#727277]">{formatDate(order.expiresAt)}</td><td className="px-6 py-4 font-semibold text-[#39475E]">{formatNaira(order.amountMinor)}</td><td className="px-6 py-4"><StatusBadge status={order.fulfilmentStatus} /></td><td className="px-6 py-4"><p className="font-medium text-[#39475E]">{order.paymentReference ? `…${order.paymentReference.slice(-4)}` : '—'}</p><p className="mt-1 text-[10px] text-[#9A9A9A]">{order.paymentReference ? 'Payment reference' : 'Not paid'}</p></td><td className="px-6 py-4"><button type="button" onClick={() => navigator.clipboard?.writeText(order.reference)} className="inline-flex items-center gap-2 text-sm text-[#777274] hover:text-[#E95312]">View <Eye className="h-4 w-4" /></button></td></tr>)}{!isLoading && !filteredOrders.length && <tr><td colSpan={8} className="px-6 py-14 text-center text-sm text-slate-500">{isError ? 'We could not load your transactions. Please try again.' : 'No transactions match your filters.'}</td></tr>}</tbody></table></div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E6E3E0] px-6 py-5 text-sm text-[#657089]"><span>Showing {filteredOrders.length ? page * size + 1 : 0}–{page * size + filteredOrders.length} entries</span><div className="flex items-center gap-3"><label className="flex items-center gap-2">Show<select value={size} onChange={(event) => { setSize(Number(event.target.value)); setPage(0); }} className="rounded-lg border border-[#E6E3E0] bg-white px-2 py-1 text-sm outline-none"><option value={10}>10</option><option value={20}>20</option></select>entries</label><button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0 || isLoading} aria-label="Previous page" className="rounded-lg border border-[#E6E3E0] p-1.5 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="font-medium text-[#39475E]">{page + 1}</span><button type="button" onClick={() => setPage((current) => current + 1)} disabled={orders.length < size || isLoading} aria-label="Next page" className="rounded-lg border border-[#E6E3E0] p-1.5 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
        </section>
      </main>
    </div>
  );
}

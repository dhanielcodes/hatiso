'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import {
  Download,
  GraduationCap,
  Landmark,
  Receipt,
  ReceiptText,
  Search,
  SearchX,
  ShieldCheck,
  Smartphone,
  Tv,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDigitalServiceOrders } from '@/lib/queries/useOrders';
import { Skeleton } from '@/components/ui/Skeleton';
import StateBlock from '@/components/ui/StateBlock';
import TransactionSupportModal from '@/components/support/TransactionSupportModal';
import type { DigitalServiceOrderHistory } from '@/lib/api/orders';
import type { DigitalServiceCategory } from '@/lib/api/digitalServices';

const PAGE_SIZE = 20;

const CATEGORY_LABELS: Record<DigitalServiceCategory, string> = {
  TELCO: 'Airtime and data',
  INTERNET_SERVICES: 'Internet',
  DISCO: 'Electricity',
  CABLE: 'Cable TV',
  EDUCATION: 'Education',
  INSURANCE: 'Insurance',
  OTHER_SERVICES: 'Other services',
};

const CATEGORY_ICONS: Record<DigitalServiceCategory, LucideIcon> = {
  TELCO: Smartphone,
  INTERNET_SERVICES: Wifi,
  DISCO: Zap,
  CABLE: Tv,
  EDUCATION: GraduationCap,
  INSURANCE: ShieldCheck,
  OTHER_SERVICES: Landmark,
};

type StatusFilter = 'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED';
type SortKey = 'newest' | 'oldest' | 'high' | 'low';
type Period = 'all' | 'month' | '30d' | '90d';

const SUCCESS = new Set(['FULFILLED', 'SUCCESSFUL', 'SUCCESS', 'COMPLETED']);
const PENDING = new Set(['AWAITING_PAYMENT', 'PENDING', 'PROCESSING', 'INITIATED', 'IN_PROGRESS']);

function statusGroup(status: string): Exclude<StatusFilter, 'ALL'> {
  if (SUCCESS.has(status)) return 'SUCCESS';
  if (PENDING.has(status)) return 'PENDING';
  return 'FAILED';
}

const STATUS_VIEW = {
  SUCCESS: { label: 'Successful', text: 'text-status-success', dot: 'bg-status-success' },
  PENDING: { label: 'Pending', text: 'text-status-warning', dot: 'bg-status-warning' },
  FAILED: { label: 'Failed', text: 'text-status-error', dot: 'bg-status-error' },
};

function naira(amountMinor: number) {
  return (amountMinor / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function providerName(productCode: string) {
  return productCode.replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** Service page slug for "Pay again". TELCO covers airtime and data, told apart by the product code. */
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

function dayTitle(date: string) {
  const d = moment(date);
  if (d.isSame(moment(), 'day')) return 'Today';
  if (d.isSame(moment().subtract(1, 'day'), 'day')) return 'Yesterday';
  return d.format('dddd, D MMMM');
}

function inPeriod(date: string, period: Period) {
  if (period === 'all') return true;
  const d = moment(date);
  if (period === 'month') return d.isSame(moment(), 'month');
  return d.isAfter(moment().subtract(period === '30d' ? 30 : 90, 'days'));
}

const SELECT =
  'min-h-10 appearance-none rounded-lg border border-tone-100 bg-surface bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2714%27%20height=%2714%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%23616366%27%20stroke-width=%272%27%3E%3Cpath%20d=%27m6%209%206%206%206-6%27/%3E%3C/svg%3E")] bg-[position:right_12px_center] bg-no-repeat pr-9 pl-3.5 text-sm font-medium text-tone-744 outline-none focus:border-brand-305';

/** Transactions board: filters, payments grouped by day, and a receipt drawer. */
export default function TransactionsPage() {
  const [size, setSize] = useState(PAGE_SIZE);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [category, setCategory] = useState<'ALL' | DigitalServiceCategory>('ALL');
  const [sort, setSort] = useState<SortKey>('newest');
  const [period, setPeriod] = useState<Period>('all');
  const [selected, setSelected] = useState<DigitalServiceOrderHistory | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const { data: orders = [], isLoading, isError, isPlaceholderData, refetch } = useDigitalServiceOrders(0, size);

  // Everything except the status filter, so the chips can show counts.
  const scoped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => category === 'ALL' || o.category === category)
      .filter((o) => inPeriod(o.expiresAt, period))
      .filter((o) => !q || `${o.reference} ${providerName(o.productCode)} ${o.recipient} ${o.customerName ?? ''} ${o.paymentReference ?? ''}`.toLowerCase().includes(q));
  }, [orders, category, period, query]);

  const counts = useMemo(() => {
    const c = { ALL: scoped.length, SUCCESS: 0, PENDING: 0, FAILED: 0 };
    scoped.forEach((o) => (c[statusGroup(o.fulfilmentStatus)] += 1));
    return c;
  }, [scoped]);

  const rows = useMemo(() => {
    const list = scoped.filter((o) => status === 'ALL' || statusGroup(o.fulfilmentStatus) === status);
    return list.toSorted((a, b) => {
      if (sort === 'high') return b.amountMinor - a.amountMinor;
      if (sort === 'low') return a.amountMinor - b.amountMinor;
      const diff = Date.parse(a.expiresAt) - Date.parse(b.expiresAt);
      return sort === 'oldest' ? diff : -diff;
    });
  }, [scoped, status, sort]);

  // Group by day only when sorted by date; amount sorts read as one list.
  const groups = useMemo(() => {
    if (sort === 'high' || sort === 'low') return [{ title: sort === 'high' ? 'Highest first' : 'Lowest first', rows }];
    const out: { title: string; rows: DigitalServiceOrderHistory[] }[] = [];
    rows.forEach((o) => {
      const title = dayTitle(o.expiresAt);
      const last = out[out.length - 1];
      if (last && last.title === title) last.rows.push(o);
      else out.push({ title, rows: [o] });
    });
    return out;
  }, [rows, sort]);

  const downloadStatement = () => {
    if (!rows.length) {
      toast.error('There are no payments to download.');
      return;
    }
    const header = ['Date', 'Service', 'Provider', 'Recipient', 'Amount (NGN)', 'Status', 'Reference', 'Payment reference'];
    const lines = rows.map((o) => [
      moment(o.expiresAt).format('YYYY-MM-DD HH:mm'),
      CATEGORY_LABELS[o.category],
      providerName(o.productCode),
      o.recipient,
      (o.amountMinor / 100).toFixed(2),
      STATUS_VIEW[statusGroup(o.fulfilmentStatus)].label,
      o.reference,
      o.paymentReference ?? '',
    ]);
    const csv = [header, ...lines].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `hatiso-statement-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full bg-tone-44 text-tone-744">
      <div className="flex w-full flex-col gap-6 p-[clamp(20px,3vw,40px)]">
        <div className="hz-rise flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[clamp(28px,3vw,36px)] leading-[1.1] font-semibold tracking-[-0.025em]">Transactions</h1>
            <span className="text-[15px] text-tone-414">Every payment you&apos;ve made, with its receipt.</span>
          </div>
          <button
            type="button"
            onClick={downloadStatement}
            className="hz-press inline-flex min-h-12 items-center gap-2 rounded-[10px] border border-tone-100 bg-surface px-5 text-[15px] font-medium hover:border-tone-414"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download statement
          </button>
        </div>

        <div className="hz-rise flex flex-wrap items-center gap-3" style={{ '--d': 1 } as React.CSSProperties}>
          <label className="flex min-h-12 flex-[1_1_280px] items-center gap-2.5 rounded-[10px] border border-tone-100 bg-surface px-4 focus-within:border-brand-305">
            <Search className="h-4.5 w-4.5 shrink-0 text-tone-414" aria-hidden="true" />
            <span className="sr-only">Search transactions</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, number or reference"
              className="min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-tone-414 focus:outline-none"
            />
          </label>
          <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-2">
            {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map((key) => {
              const on = status === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setStatus(key)}
                  className={`hz-press min-h-10 rounded-lg border px-4 text-sm font-medium transition-colors ${on ? 'border-brand-305 bg-brand-305 text-on-brand' : 'border-tone-100 bg-surface hover:border-tone-414'}`}
                >
                  {key === 'ALL' ? 'All' : STATUS_VIEW[key].label} <span className="opacity-70">{counts[key]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hz-rise -mt-2 flex flex-wrap gap-2.5" style={{ '--d': 1 } as React.CSSProperties}>
          <label className="inline-flex items-center gap-2 text-sm text-tone-414">
            Service
            <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className={SELECT}>
              <option value="ALL">All services</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-tone-414">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={SELECT}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="high">Amount, high to low</option>
              <option value="low">Amount, low to high</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-tone-414">
            <span className="sr-only">Period</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className={SELECT}>
              <option value="all">All time</option>
              <option value="month">This month</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </label>
        </div>

        <section className={`hz-rise overflow-hidden rounded-[14px] border border-tone-100 bg-surface ${isPlaceholderData ? 'opacity-60' : ''}`} style={{ '--d': 2 } as React.CSSProperties}>
          <div className="flex items-center gap-4 border-b border-tone-100 bg-tone-44 px-6 py-3.5 text-xs font-medium tracking-[0.1em] text-tone-414 uppercase">
            <span className="flex-1">Payment</span>
            <span className="hidden w-[150px] md:block">Date</span>
            <span className="w-[110px] sm:w-[150px]">Status</span>
            <span className="w-[100px] text-right">Amount</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2 p-6">
              {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.title}>
                <div className="px-6 pt-3 pb-1.5 text-[13px] font-medium text-tone-414">{group.title}</div>
                <ul className="hz-stagger">
                  {group.rows.map((order) => {
                    const Icon = CATEGORY_ICONS[order.category] ?? ReceiptText;
                    const st = STATUS_VIEW[statusGroup(order.fulfilmentStatus)];
                    return (
                      <li key={order.reference}>
                        <button
                          type="button"
                          onClick={() => setSelected(order)}
                          className={`flex w-full items-center gap-4 border-t border-tone-44 px-6 py-3.5 text-left transition-colors hover:bg-tone-44 ${selected?.reference === order.reference ? 'bg-tone-44' : ''}`}
                        >
                          <span className="flex min-w-0 flex-1 items-center gap-3.5">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-tone-44">
                              <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                            </span>
                            <span className="flex min-w-0 flex-col gap-0.5">
                              <span className="truncate text-[15px] font-medium">{CATEGORY_LABELS[order.category]} · {providerName(order.productCode)}</span>
                              <span className="truncate text-[13px] text-tone-414">{order.recipient}{order.customerName ? ` · ${order.customerName}` : ''}</span>
                            </span>
                          </span>
                          <span className="hidden w-[150px] text-sm text-tone-432 md:block">{moment(order.expiresAt).format('D MMM, HH:mm')}</span>
                          <span className={`inline-flex w-[110px] items-center gap-1.5 text-[13px] font-medium sm:w-[150px] ${st.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                          <span className="w-[100px] text-right text-[15px] font-semibold tabular-nums">₦{naira(order.amountMinor)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}

          {!isLoading && !rows.length && (
            <div className="px-6 py-8">
              {isError ? (
                <StateBlock tone="error" title="Your payments are unavailable right now" action={{ label: 'Try again', onClick: () => refetch() }}>
                  Check your connection and try again. Your money hasn&apos;t moved.
                </StateBlock>
              ) : orders.length ? (
                <StateBlock icon={SearchX} title="Nothing matches">
                  No payments match these filters. Try another search or status.
                </StateBlock>
              ) : (
                <StateBlock icon={Receipt} title="No payments yet" action={{ label: 'Pay a bill', href: '/dashboard/services', primary: true }}>
                  When you pay a bill, it shows up here with its receipt.
                </StateBlock>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-tone-100 px-6 py-4 text-sm text-tone-414">
            <span>Showing {rows.length} of {orders.length} loaded</span>
            <button
              type="button"
              onClick={() => setSize((s) => s + PAGE_SIZE)}
              disabled={isLoading || orders.length < size}
              className="hz-press min-h-10 rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium text-tone-744 hover:border-tone-414 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {orders.length < size ? 'All loaded' : 'Load more'}
            </button>
          </div>
        </section>
      </div>

      {selected && (
        <ReceiptDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onReport={() => setSupportOpen(true)}
        />
      )}
      {selected && (
        <TransactionSupportModal
          open={supportOpen}
          onClose={() => setSupportOpen(false)}
          transactionReference={selected.reference}
          summary={`${providerName(selected.productCode)} ${CATEGORY_LABELS[selected.category].toLowerCase()} to ${selected.recipient} · ₦${naira(selected.amountMinor)}`}
          complaint={statusGroup(selected.fulfilmentStatus) !== 'SUCCESS'}
        />
      )}
    </div>
  );
}

function ReceiptDrawer({ order, onClose, onReport }: { order: DigitalServiceOrderHistory; onClose: () => void; onReport: () => void }) {
  const st = STATUS_VIEW[statusGroup(order.fulfilmentStatus)];
  const [whole, kobo] = naira(order.amountMinor).split('.');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const share = async () => {
    const text = `Hatiso receipt\n${CATEGORY_LABELS[order.category]} · ${providerName(order.productCode)}\nTo: ${order.recipient}\nAmount: ₦${naira(order.amountMinor)}\nStatus: ${st.label}\nReference: ${order.reference}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Hatiso receipt', text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success('Receipt copied');
      }
    } catch {
      // Share sheet dismissed
    }
  };

  const ACTION = 'hz-press inline-flex min-h-12 items-center justify-center rounded-[10px] text-sm font-medium';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-carbon/50" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        className="absolute inset-y-0 right-0 flex w-[min(440px,100%)] animate-[hz-drawer_0.35s_cubic-bezier(0.23,1,0.32,1)] flex-col bg-tone-44 text-tone-744 shadow-[-30px_0_60px_-30px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-between border-b border-tone-100 bg-surface px-6 py-5">
          <h2 id="receipt-title" className="text-lg font-semibold">Receipt</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="hz-press flex h-11 w-11 items-center justify-center rounded-full bg-tone-44 hover:bg-tone-100">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="hz-stagger flex flex-1 flex-col gap-4 overflow-auto p-6">
          <div className="flex flex-col gap-3.5 rounded-xl bg-carbon p-6 text-cloud">
            <span className="flex items-center justify-between gap-3">
              <span className="truncate text-sm text-grey-400">{CATEGORY_LABELS[order.category]} · {providerName(order.productCode)}</span>
              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-medium ${st.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            </span>
            <span className="text-[40px] leading-none font-semibold tracking-[-0.02em] tabular-nums">
              ₦{whole}
              <span className="text-xl text-grey-500">.{kobo}</span>
            </span>
            <span className="text-sm text-silver">
              {statusGroup(order.fulfilmentStatus) === 'SUCCESS' ? 'Delivered' : statusGroup(order.fulfilmentStatus) === 'PENDING' ? 'Waiting for payment or delivery' : 'This payment did not go through'}
              {order.units ? ` · ${order.units}` : ''}
            </span>
          </div>
          <dl className="rounded-[10px] border border-tone-100 bg-surface text-sm">
            {[
              ['To', `${order.recipient}${order.customerName ? ` · ${order.customerName}` : ''}`],
              ['Date', moment(order.expiresAt).format('D MMM YYYY, HH:mm')],
              ['Paid with', order.paymentReference ? `Paystack · …${order.paymentReference.slice(-4)}` : 'Not paid'],
              ['Reference', order.reference],
            ].map(([label, value], i, all) => (
              <div key={label} className={`flex justify-between gap-4 px-[18px] py-3.5 ${i < all.length - 1 ? 'border-b border-tone-44' : ''}`}>
                <dt className="text-tone-414">{label}</dt>
                <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {order.deliveryCode && (
            <div className="flex flex-col gap-1.5 rounded-[10px] border border-dashed border-tone-414 bg-surface px-[18px] py-3.5">
              <span className="text-xs font-medium tracking-[0.12em] text-tone-414 uppercase">Token</span>
              <span className="font-mono text-lg font-semibold tracking-wider">{order.deliveryCode}</span>
            </div>
          )}
          <div className="mt-auto grid grid-cols-2 gap-2.5 pt-2">
            <Link href={`/dashboard/services?service=${serviceSlug(order)}`} className={`${ACTION} bg-brand-305 text-on-brand hover:bg-brand-361`}>
              Pay again
            </Link>
            <Link
              href={`/dashboard/transactions/${order.reference}`}
              onClick={() => localStorage.setItem('transactionDetails', JSON.stringify(order))}
              className={`${ACTION} border border-tone-100 bg-surface hover:border-tone-414`}
            >
              Open full details
            </Link>
            <button type="button" onClick={share} className={`${ACTION} border border-tone-100 bg-surface hover:border-tone-414`}>
              Share receipt
            </button>
            <button type="button" onClick={onReport} className={`${ACTION} border border-tone-100 bg-surface hover:border-tone-414`}>
              Report a problem
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

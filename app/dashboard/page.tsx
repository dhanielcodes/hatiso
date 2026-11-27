"use client";

import { seriesColor, useColorMode, useTheme } from "@/lib/theme/theme";
import Link from "next/link";
import React, { useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  GraduationCap,
  Plus,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Trophy,
  Tv,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import PromoCarousel from "@/components/dashboard/PromoCarousel";
import BankingSpotlight from "@/components/dashboard/BankingSpotlight";
import ChartTooltip, { tooltipEdge } from "@/components/ui/ChartTooltip";
import { useAuthStore } from "@/lib/store/authStore";
import { useDashboard } from "@/lib/queries/useDashboard";
import {
  ChartSkeleton,
  ListSkeleton,
  MetricCardSkeleton,
  Skeleton,
} from "@/components/ui/Skeleton";
import type { DashboardBucket } from "@/lib/api/dashboard";
import moment from "moment";

// Name and colour per serviceType, as in the dashboard design. Unknown types get a palette colour.
const SERVICE_META: Record<string, { name: string; color: string }> = {
  AIRTIME: { name: "Airtime", color: "#DA5F2A" },
  DATA: { name: "Data", color: "#F4AE85" },
  ELECTRICITY: { name: "Electricity", color: "#3A78C2" },
  TV: { name: "Cable TV", color: "#6A4D9B" },
  CABLE_TV: { name: "Cable TV", color: "#6A4D9B" },
  BETTING: { name: "Betting", color: "#243B4A" },
  INTERNET: { name: "Internet", color: "#0EA5A4" },
  EDUCATION: { name: "Education", color: "#C54E92" },
  INSURANCE: { name: "Insurance", color: "#8B5CF6" },
};
const FALLBACK_COLORS = ["#6B7280", "#EC4899", "#14B8A6", "#A16207"];

function serviceName(serviceType: string) {
  return (
    SERVICE_META[serviceType]?.name ??
    serviceType
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

// Provider logos for the recent-transactions list, matched on the product code/name. Only the network
// logos exist as images; other providers get a badge in their brand colour (third-party colours, not themed).
type Provider = { match: RegExp; name: string; logo?: string; badge?: { label: string; bg: string } };
const PROVIDERS: Provider[] = [
  { match: /mtn/, name: "MTN Nigeria", logo: "/images/biller_mtn_hq.png" },
  { match: /airtel/, name: "Airtel", logo: "/images/biller_airtel_hq.png" },
  { match: /glo/, name: "Glo", logo: "/images/biller_glo_hq.png" },
  { match: /9mobile|etisalat/, name: "9mobile", logo: "/images/biller_9mobile_hq.png" },
  { match: /dstv/, name: "DSTV", badge: { label: "DStv", bg: "#1F5AA6" } },
  { match: /gotv/, name: "GOtv", badge: { label: "GOtv", bg: "#2E9A4F" } },
  { match: /startimes/, name: "StarTimes", badge: { label: "ST", bg: "#F57128" } },
  { match: /showmax/, name: "Showmax", badge: { label: "SM", bg: "#1C1C1C" } },
  { match: /sporty/, name: "SportyBet", badge: { label: "S", bg: "#E4202D" } },
  { match: /bet9ja/, name: "Bet9ja", badge: { label: "B9", bg: "#008A46" } },
  { match: /betway/, name: "Betway", badge: { label: "BW", bg: "#1C1C1C" } },
];

function providerFor(productCode: string, productName: string) {
  const key = `${productCode} ${productName}`.toLowerCase();
  return PROVIDERS.find((provider) => provider.match.test(key));
}

// Comparison wording per period: "from Last week", "vs Last 7 days".
const PERIOD_COPY: Record<string, { spent: string; previous: string }> = {
  "Last 7 days": { spent: "Spent this week", previous: "Last week" },
  "Last 30 days": { spent: "Spent this month", previous: "Last month" },
  "Last 6 months": { spent: "Spent in 6 months", previous: "the 6 months before" },
};
const CUSTOM_COPY = { spent: "Spent this period", previous: "the period before" };

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const subscribeToNothing = () => () => {};
const getServerDate = () => "";

function useClientDate() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => toDateString(new Date()),
    getServerDate,
  );
}

const isNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

function formatNaira(amountMinor: number | null | undefined) {
  return `₦${((amountMinor ?? 0) / 100).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

// "98.5%" / "—" when the value is missing
function formatFixed(value: number | null | undefined, digits = 1, unit = "") {
  return isNum(value) ? `${value.toFixed(digits)}${unit}` : "—";
}

function formatRange(from: string, to: string) {
  // "Jan 5, 2026 – Jan 11, 2026", as in the design.
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${formatter.format(new Date(`${from}T00:00:00`))} – ${formatter.format(new Date(`${to}T00:00:00`))}`;
}

// Tooltip heading: "Tuesday, Mar 21, 2026" for a day, "Week of Mar 21, 2026", or "March 2026".
function formatBucketTitle(from: string, bucket: DashboardBucket) {
  const date = new Date(`${from}T00:00:00`);
  if (bucket === "MONTH")
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: bucket === "DAY" ? "long" : undefined,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return bucket === "WEEK" ? `Week of ${day}` : day;
}

function formatBucketLabel(from: string, bucket: DashboardBucket) {
  const date = new Date(`${from}T00:00:00`);
  return bucket === "MONTH"
    ? new Intl.DateTimeFormat("en-NG", { month: "short" }).format(date)
    : new Intl.DateTimeFormat("en-NG", {
        month: "short",
        day: "numeric",
      }).format(date);
}

function bucketForRange(from: string, to: string): DashboardBucket {
  const differenceInDays =
    Math.floor(
      (Date.parse(`${to}T00:00:00`) - Date.parse(`${from}T00:00:00`)) /
        86_400_000,
    ) + 1;
  if (differenceInDays > 120) return "MONTH";
  if (differenceInDays > 31) return "WEEK";
  return "DAY";
}

const SUCCESS_STATUSES = new Set(["SUCCESSFUL", "FULFILLED", "SUCCESS", "COMPLETED"]);
const PENDING_STATUSES = new Set(["PENDING", "INITIATED", "PROCESSING", "AWAITING_PAYMENT", "IN_PROGRESS"]);

// Successful / Pending / Failed: a status dot plus its label (Dashboard board).
function statusFor(status: string) {
  if (SUCCESS_STATUSES.has(status)) return { label: "Successful", text: "text-status-success", dot: "bg-status-success" };
  if (PENDING_STATUSES.has(status)) return { label: "Pending", text: "text-status-warning", dot: "bg-status-warning" };
  return { label: status === "FAILED" ? "Failed" : status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()), text: "text-status-error", dot: "bg-status-error" };
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  AIRTIME: Smartphone,
  DATA: Wifi,
  ELECTRICITY: Zap,
  TV: Tv,
  CABLE_TV: Tv,
  BETTING: Trophy,
  INTERNET: Wifi,
  EDUCATION: GraduationCap,
  INSURANCE: ShieldCheck,
};

// serviceType → the Pay bills slug, so "Pay again" opens the right service.
const SERVICE_SLUGS: Record<string, string> = {
  AIRTIME: "airtime",
  DATA: "data",
  ELECTRICITY: "electricity",
  TV: "tv",
  CABLE_TV: "tv",
  BETTING: "betting",
  INTERNET: "internet-services",
  EDUCATION: "education",
  INSURANCE: "insurance",
};

/** "08031234512" → "0803 ••• 4512" */
function maskRecipient(value: string) {
  const v = value.replace(/\s+/g, "");
  return v.length > 8 ? `${v.slice(0, 4)} ••• ${v.slice(-4)}` : value;
}

const PERIODS: [string, string][] = [
  ["Last 7 days", "7 days"],
  ["Last 30 days", "30 days"],
  ["Last 6 months", "6 months"],
];

export default function DashboardPage() {
  const theme = useTheme();
  const mode = useColorMode();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState("Last 7 days");
  const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
  const [customRange, setCustomRange] = useState<{
    from: string;
    to: string;
    bucket: DashboardBucket;
  } | null>(null);
  const [pendingFrom, setPendingFrom] = useState("");
  const [pendingTo, setPendingTo] = useState("");
  // Which spending bar is picked; null means the latest one.
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  /** The bar under the pointer or keyboard focus, for its tooltip. */
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const today = useClientDate();
  const { from, to, bucket } = useMemo(() => {
    if (customRange) return customRange;
    if (!today) return { from: "", to: "", bucket: "DAY" as DashboardBucket };
    const end = new Date(`${today}T00:00:00`);
    const start = new Date(end);
    if (period === "Last 30 days") start.setDate(end.getDate() - 29);
    else if (period === "Last 6 months") start.setMonth(end.getMonth() - 5, 1);
    else start.setDate(end.getDate() - 6);
    return {
      from: toDateString(start),
      to: toDateString(end),
      bucket: (period === "Last 6 months"
        ? "MONTH"
        : period === "Last 30 days"
          ? "WEEK"
          : "DAY") as DashboardBucket,
    };
  }, [customRange, period, today]);
  const { data, isLoading, isError } = useDashboard(
    { from, to, bucket, recentLimit: 5 },
    Boolean(today),
    user?.name,
  );
  const displayName = user?.name?.split(" ")[0] || "there";

  const openRangePicker = () => {
    setPendingFrom(from);
    setPendingTo(to);
    setIsRangePickerOpen(true);
  };

  const applyCustomRange = () => {
    if (!pendingFrom || !pendingTo || pendingFrom > pendingTo) return;
    setCustomRange({
      from: pendingFrom,
      to: pendingTo,
      bucket: bucketForRange(pendingFrom, pendingTo),
    });
    setPeriod("Custom range");
    setIsRangePickerOpen(false);
  };

  const copy = PERIOD_COPY[period] ?? CUSTOM_COPY;
  const comparison = `from ${copy.previous}`;
  const metrics = data
    ? (() => {
        const { spending, transactions, successRate } = data.summary;
        const countChange = isNum(transactions.count) && isNum(transactions.previousCount)
          ? transactions.count - transactions.previousCount
          : null;
        return [
          {
            label: copy.spent,
            value: formatNaira(spending.amountMinor),
            // "+ 12.4%"
            change: isNum(spending.changePercent)
              ? `${spending.changePercent >= 0 ? "+" : "-"} ${Math.abs(spending.changePercent).toFixed(1)}%`
              : "—",
            detail: comparison,
            positive:
              !isNum(spending.changePercent) || spending.changePercent >= 0,
          },
          {
            label: "Transactions",
            value: (transactions.count ?? 0).toLocaleString(),
            // "+ 3 more" / "- 2 fewer"
            change: isNum(countChange)
              ? `${countChange >= 0 ? "+" : "-"} ${Math.abs(countChange).toLocaleString()} ${countChange >= 0 ? "more" : "fewer"}`
              : "—",
            detail: comparison,
            positive: !isNum(countChange) || countChange >= 0,
          },
          {
            label: "Success rate",
            value: formatFixed(successRate.percent, 1, "%"),
            // "↑ 2.1%" (percentage points)
            change: isNum(successRate.changePercentagePoints)
              ? `${successRate.changePercentagePoints >= 0 ? "↑" : "↓"} ${Math.abs(successRate.changePercentagePoints).toFixed(1)}%`
              : "—",
            detail: comparison,
            positive:
              !isNum(successRate.changePercentagePoints) ||
              successRate.changePercentagePoints >= 0,
          },
          {
            label: "Reward points",
            value:
              data.rewards.available && data.rewards.points !== null
                ? data.rewards.points.toLocaleString()
                : "—",
            change: data.rewards.available ? "Available" : "Not available",
            detail: data.rewards.available ? "to redeem" : "",
            positive: true,
          },
        ];
      })()
    : [];
  const spendingData = (data?.spendingOverview ?? []).map((item) => ({
    label: formatBucketLabel(item.from, bucket),
    title: formatBucketTitle(item.from, bucket),
    amountMinor: item.amountMinor ?? 0,
  }));
  const usageData = (data?.digitalServicesUsage ?? []).map((item, index) => ({
    name: serviceName(item.serviceType),
    value: item.percentage ?? 0,
    color: seriesColor(
      theme,
      mode,
      SERVICE_META[item.serviceType]?.color ??
        FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      index,
    ),
  }));
  const spendingChange = data?.summary.spending.changePercent;
  const maxBucket = Math.max(1, ...spendingData.map((item) => item.amountMinor));
  const selectedBar = spendingData[selectedBucket ?? spendingData.length - 1];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const periodLabel = period === "Custom range" && from && to ? formatRange(from, to) : period;
  const successPercent = data?.summary.successRate.percent;
  // Pay again: the most recent distinct product + recipient pairs.
  const payAgain = (data?.recentTransactions ?? [])
    .filter((item, index, all) =>
      all.findIndex((other) => other.productCode === item.productCode && other.recipient === item.recipient) === index,
    )
    .slice(0, 4);

  return (
    <div className="min-h-full bg-tone-44 text-tone-760">
      <div className="flex w-full flex-col gap-6 p-[clamp(20px,3vw,40px)]">
        {/* Greeting */}
        <div className="hz-rise flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-tone-426">
              {today ? moment(today).format("dddd, D MMMM") : "\u00a0"}
            </span>
            <h1 className="text-[clamp(28px,3vw,36px)] leading-[1.1] font-semibold tracking-[-0.025em] text-tone-744">
              {greeting}, {displayName}.
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/notifications"
              aria-label="Notifications"
              className="hz-press relative flex h-12 w-12 items-center justify-center rounded-full border border-tone-100 bg-surface text-tone-744"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </Link>
            <Link
              href="/dashboard/services"
              className="hz-press inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-brand-305 px-[22px] text-[15px] font-medium text-on-brand hover:bg-brand-361"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              New payment
            </Link>
          </div>
        </div>

        {/* Pay again */}
        {(isLoading || payAgain.length > 0) && (
          <div className="hz-rise flex flex-col gap-3" style={{ "--d": 1 } as React.CSSProperties}>
            <span className="text-sm font-medium text-tone-714">Pay again</span>
            <div className="hz-stagger grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3">
              {isLoading
                ? Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-[72px] rounded-[10px]" />)
                : payAgain.map((item) => {
                    const provider = providerFor(item.productCode, item.productName);
                    const Icon = SERVICE_ICONS[item.serviceType] ?? ReceiptText;
                    const slug = SERVICE_SLUGS[item.serviceType];
                    return (
                      <Link
                        key={`${item.productCode}-${item.recipient}`}
                        href={slug ? `/dashboard/services?service=${slug}` : "/dashboard/services"}
                        className="hz-lift flex items-center gap-3.5 rounded-[10px] border border-tone-100 bg-surface px-4 py-3.5"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-305 text-on-brand">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-[15px] font-medium text-tone-744">
                            {provider?.name ?? item.productName} {serviceName(item.serviceType).toLowerCase()}
                          </span>
                          <span className="truncate text-[13px] text-tone-426">
                            {item.recipient ? maskRecipient(item.recipient) : item.productName}
                          </span>
                        </span>
                        <ArrowUpRight className="hz-arrow h-4 w-4 shrink-0 text-tone-380" aria-hidden="true" />
                      </Link>
                    );
                  })}
            </div>
          </div>
        )}

        <div className="hz-rise" style={{ "--d": 2 } as React.CSSProperties}>
          <PromoCarousel />
        </div>

        {/* Metrics */}
        <div className="hz-stagger grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => <MetricCardSkeleton key={index} />)
            : metrics.map((metric, index) => (
                <article
                  key={metric.label}
                  className={`flex flex-col gap-3.5 rounded-xl p-5 ${index === 0 ? "bg-ink-724 text-cloud" : "border border-tone-100 bg-surface"}`}
                >
                  <span className={`text-sm ${index === 0 ? "text-grey-400" : "text-tone-426"}`}>
                    {index === 0 ? `Spent · ${periodLabel}` : metric.label}
                  </span>
                  <span className="text-[32px] leading-none font-semibold tracking-[-0.02em] tabular-nums">
                    {metric.value}
                  </span>
                  {metric.label === "Success rate" && isNum(successPercent) ? (
                    <span className="flex h-1.5 overflow-hidden rounded-full bg-tone-100">
                      <span className="rounded-full bg-brand-305" style={{ width: `${Math.min(100, Math.max(0, successPercent))}%` }} />
                    </span>
                  ) : (
                    <span className={`text-[13px] ${index === 0 ? "text-silver" : "text-tone-426"}`}>
                      <span className={index === 0 ? "" : metric.positive ? "text-status-success" : "text-status-error"}>{metric.change}</span>
                      {metric.detail && <span> {metric.detail}</span>}
                    </span>
                  )}
                </article>
              ))}
        </div>
        {isError && (
          <p className="text-sm text-status-error">
            We couldn&apos;t load dashboard data. Please try again.
          </p>
        )}

        {/* Banking: one quiet row under the numbers, with the last bank they opened one tap away */}
        <BankingSpotlight />

        {/* Chart + breakdown */}
        <div className="flex flex-wrap items-stretch gap-4">
          <section className="hz-rise flex min-w-0 flex-[999_1_520px] flex-col gap-6 rounded-[14px] border border-tone-100 bg-surface p-6" style={{ "--d": 3 } as React.CSSProperties}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-semibold text-tone-744">Spending</h2>
                {isLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <span className="text-sm text-tone-426">
                    {selectedBar ? selectedBar.title : periodLabel} ·{" "}
                    <span className="font-semibold text-tone-744 tabular-nums">
                      {formatNaira(selectedBar ? selectedBar.amountMinor : data?.summary.spending.amountMinor)}
                    </span>
                    {isNum(spendingChange) && !selectedBar && (
                      <span> · {spendingChange >= 0 ? "up" : "down"} {Math.abs(spendingChange).toFixed(0)}%</span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div role="radiogroup" aria-label="Period" className="flex rounded-xl border border-tone-100 bg-tone-44 p-1">
                  {PERIODS.map(([value, label]) => {
                    const on = period === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => {
                          setPeriod(value);
                          setCustomRange(null);
                          setSelectedBucket(null);
                        }}
                        className={`min-h-9 rounded-lg px-3.5 text-[13px] font-medium transition-colors ${on ? "bg-brand-305 text-on-brand" : "text-tone-714 hover:text-tone-744"}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={openRangePicker}
                    aria-pressed={period === "Custom range"}
                    className={`hz-press flex min-h-11 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-colors ${period === "Custom range" ? "border-brand-305 bg-brand-305 text-on-brand" : "border-tone-100 bg-surface text-tone-714 hover:border-tone-178"}`}
                  >
                    <CalendarDays className="h-4 w-4" />
                    {period === "Custom range" ? periodLabel : "Custom"}
                  </button>
                  {isRangePickerOpen && (
                    <div className="hz-pop absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border border-tone-100 bg-surface p-4 shadow-[0_24px_48px_-24px_rgba(18,21,26,0.35)]">
                      <p className="text-sm font-semibold text-tone-744">Custom date range</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-medium text-tone-414">
                          From
                          <input
                            type="date"
                            value={pendingFrom}
                            max={pendingTo || today || undefined}
                            onChange={(event) => setPendingFrom(event.target.value)}
                            className="mt-1.5 h-11 w-full rounded-lg border border-tone-100 bg-surface px-2 text-sm text-tone-744 outline-none focus:border-tone-744"
                          />
                        </label>
                        <label className="text-xs font-medium text-tone-414">
                          To
                          <input
                            type="date"
                            value={pendingTo}
                            min={pendingFrom || undefined}
                            max={today || undefined}
                            onChange={(event) => setPendingTo(event.target.value)}
                            className="mt-1.5 h-11 w-full rounded-lg border border-tone-100 bg-surface px-2 text-sm text-tone-744 outline-none focus:border-tone-744"
                          />
                        </label>
                      </div>
                      {pendingFrom && pendingTo && pendingFrom > pendingTo && (
                        <p className="mt-3 text-xs text-status-error">The end date must be after the start date.</p>
                      )}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setIsRangePickerOpen(false)} className="hz-press min-h-10 rounded-lg border border-tone-100 text-[13px] font-medium text-tone-714 hover:bg-tone-44">
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            applyCustomRange();
                            setSelectedBucket(null);
                          }}
                          disabled={!pendingFrom || !pendingTo || pendingFrom > pendingTo}
                          className="hz-press min-h-10 rounded-lg bg-brand-305 text-[13px] font-medium text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Apply range
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bar chart: one bar per day, week or month; tap a bar to read its amount. It grows to the card's
                height so it lines up with "Where it went" beside it (240px at least). */}
            <div className="relative min-h-60 flex-1">
              {isLoading ? (
                <ChartSkeleton shape="bars" label="Loading spending" />
              ) : spendingData.length ? (
                <>
                  <div aria-hidden="true" className="absolute inset-x-0 top-0 bottom-7 flex flex-col justify-between">
                    <span className="border-t border-dashed border-tone-100" />
                    <span className="border-t border-dashed border-tone-100" />
                    <span className="border-t border-dashed border-tone-100" />
                    <span className="border-t border-tone-178" />
                  </div>
                  <div className="absolute inset-0 flex items-stretch gap-[clamp(4px,1.2vw,16px)]">
                    {spendingData.map((item, index) => {
                      const on = index === (selectedBucket ?? spendingData.length - 1);
                      return (
                        <button
                          key={`${item.title}-${index}`}
                          type="button"
                          aria-pressed={on}
                          aria-label={`${item.title}, ${formatNaira(item.amountMinor)}`}
                          onClick={() => setSelectedBucket(index)}
                          onPointerEnter={() => setHoveredBar(index)}
                          onPointerLeave={() => setHoveredBar((h) => (h === index ? null : h))}
                          onFocus={() => setHoveredBar(index)}
                          onBlur={() => setHoveredBar((h) => (h === index ? null : h))}
                          className="group flex min-w-0 flex-1 flex-col items-center gap-2.5"
                        >
                          <span className="relative flex w-full flex-1 items-end justify-center">
                            {hoveredBar === index && (
                              <ChartTooltip
                                x="50%"
                                y={`${100 - Math.max(3, Math.round((item.amountMinor / maxBucket) * 100))}%`}
                                edge={tooltipEdge(index, spendingData.length)}
                                title={item.title}
                                rows={[{ label: "Spent", value: formatNaira(item.amountMinor) }]}
                              />
                            )}
                            <span
                              className={`hz-bar block w-[min(44px,100%)] rounded-t-md rounded-b transition-colors ${on ? "bg-brand-305" : "bg-tone-178 group-hover:bg-tone-414"}`}
                              style={{ height: `${Math.max(3, Math.round((item.amountMinor / maxBucket) * 100))}%`, animationDelay: `${index * 50}ms` }}
                            />
                          </span>
                          <span className={`h-[18px] truncate text-xs ${on ? "font-semibold text-tone-744" : "text-tone-426"}`}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="pt-24 text-center text-sm text-tone-414">No spending data for this period.</p>
              )}
            </div>
          </section>

          <section className="hz-rise flex min-w-0 flex-[1_1_300px] flex-col gap-5 rounded-[14px] border border-tone-100 bg-surface p-6" style={{ "--d": 4 } as React.CSSProperties}>
            <h2 className="text-lg font-semibold text-tone-744">Where it went</h2>
            {isLoading ? (
              <ListSkeleton rows={4} label="Loading service usage" />
            ) : usageData.length ? (
              <ul className="flex flex-col gap-[18px]">
                {usageData.map((service, index) => (
                  <li key={service.name} className="flex flex-col gap-2">
                    <span className="flex justify-between text-sm">
                      <span className="font-medium text-tone-744">{service.name}</span>
                      <span className="text-tone-426 tabular-nums">{formatFixed(service.value, 0, "%")}</span>
                    </span>
                    <span className="flex h-2 overflow-hidden rounded-full bg-tone-44">
                      <span
                        className={`hz-grow rounded-full ${index === 0 ? "bg-brand-305" : "bg-tone-380"}`}
                        style={{ width: `${Math.min(100, Math.max(0, service.value))}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-sm text-tone-414">No service usage yet.</p>
            )}
            {/* The faint inner outline separates it from a Graphite card in Hatiso dark mode. */}
            <div className="mt-auto flex flex-col gap-3 rounded-[10px] bg-ink-724 p-[18px] text-cloud ring-1 ring-white/10 ring-inset">
              <span className="flex items-baseline justify-between">
                <span className="text-sm text-grey-400">Rewards</span>
                <span className="text-[13px] text-grey-500">
                  {data?.rewards.available ? "Available" : "Coming soon"}
                </span>
              </span>
              <span className="text-[15px] leading-normal">
                {data?.rewards.available && data.rewards.points !== null ? (
                  <>
                    You have <span className="font-semibold text-highlight">{data.rewards.points.toLocaleString()} points</span> to redeem.
                  </>
                ) : (
                  <>Earn points on every payment once rewards launch.</>
                )}
              </span>
            </div>
          </section>
        </div>

        {/* Recent payments */}
        <section className="hz-reveal overflow-hidden rounded-[14px] border border-tone-100 bg-surface pt-2">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-semibold text-tone-744">Recent payments</h2>
            <Link href="/dashboard/transactions" className="border-b border-tone-744 text-sm font-medium text-tone-744">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="px-6 pb-4">
              <ListSkeleton rows={3} label="Loading recent payments" />
            </div>
          ) : data?.recentTransactions.length ? (
            <ul>
              {data.recentTransactions.slice(0, 5).map((transaction) => {
                const provider = providerFor(transaction.productCode, transaction.productName);
                const status = statusFor(transaction.fulfilmentStatus);
                const Icon = SERVICE_ICONS[transaction.serviceType] ?? ReceiptText;
                return (
                  <li key={transaction.txnRef} className="flex items-center gap-4 border-t border-tone-44 px-6 py-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-tone-44 text-tone-744">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[15px] font-medium text-tone-744">
                        {serviceName(transaction.serviceType)} · {provider?.name ?? transaction.productName}
                      </span>
                      <span className="truncate text-[13px] text-tone-426">
                        {transaction.recipient || transaction.productName} · {moment(transaction.createdAt).calendar(null, { sameDay: "[Today], HH:mm", lastDay: "[Yesterday], HH:mm", sameElse: "D MMM, HH:mm", lastWeek: "D MMM, HH:mm" })}
                      </span>
                    </span>
                    <span className={`hidden items-center gap-1.5 text-[13px] font-medium sm:inline-flex ${status.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    <span className="w-24 text-right text-[15px] font-semibold text-tone-744 tabular-nums">
                      {formatNaira(transaction.totalMinor)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="border-t border-tone-44 py-10 text-center text-sm text-tone-414">No recent payments yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

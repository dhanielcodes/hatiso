"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Dices,
  Gift, // Gift, Sparkles and Trophy are used by the commented-out Reward points card.
  GraduationCap,
  Lightbulb,
  ReceiptText,
  ShieldCheck,
  Signal,
  Smartphone,
  Sparkles,
  Trophy,
  Tv,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  ServiceUsageChart,
  SpendingChart,
} from "@/components/dashboard/DashboardCharts";
import PromoCarousel from "@/components/dashboard/PromoCarousel";
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

// Hero photo. The design's photo (a couple in a blob frame) isn't in the repo yet; swap the file here.
const HERO_IMAGE = "/images/bills_hero.png";

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

// Provider names for the recent-transactions subtitle, matched on the product code/name.
type Provider = { match: RegExp; name: string };
const PROVIDERS: Provider[] = [
  { match: /mtn/, name: "MTN Nigeria" },
  { match: /airtel/, name: "Airtel" },
  { match: /glo/, name: "Glo" },
  { match: /9mobile|etisalat/, name: "9mobile" },
  { match: /dstv/, name: "DSTV" },
  { match: /gotv/, name: "GOtv" },
  { match: /startimes/, name: "StarTimes" },
  { match: /showmax/, name: "Showmax" },
  { match: /sporty/, name: "SportyBet" },
  { match: /bet9ja/, name: "Bet9ja" },
  { match: /betway/, name: "Betway" },
];

// Icon and tint per serviceType for the recent-transactions list (the same icons and tones as Digital services).
const SERVICE_ICONS: Record<string, { Icon: LucideIcon; tone: string }> = {
  AIRTIME: { Icon: Smartphone, tone: "bg-tone-82 text-brand-361" },
  DATA: { Icon: Signal, tone: "bg-tone-65 text-brand-365" },
  INTERNET: { Icon: Wifi, tone: "bg-tone-67 text-info-453" },
  ELECTRICITY: { Icon: Zap, tone: "bg-warning-37 text-warning-336" },
  TV: { Icon: Tv, tone: "bg-tone-79 text-spot-473" },
  CABLE_TV: { Icon: Tv, tone: "bg-tone-79 text-spot-473" },
  EDUCATION: { Icon: GraduationCap, tone: "bg-tone-68 text-spot-399" },
  INSURANCE: { Icon: ShieldCheck, tone: "bg-tone-22 text-warning-293" },
  BETTING: { Icon: Dices, tone: "bg-tone-60 text-info-416" },
};
const FALLBACK_SERVICE_ICON = { Icon: ReceiptText, tone: "bg-tone-37 text-ink-626" };

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

// SUCCESS / PENDING / FAILED pill, as in the design.
function StatusBadge({ status }: { status: string }) {
  const kind = SUCCESS_STATUSES.has(status) ? "success" : PENDING_STATUSES.has(status) ? "pending" : "failed";
  const tone =
    kind === "success"
      ? "bg-tone-58 text-success-445"
      : kind === "pending"
        ? "bg-tone-39 text-brand-333"
        : "bg-tone-73 text-danger-404";
  const label = kind === "success" ? "Success" : kind === "pending" ? "Pending" : status === "FAILED" ? "Failed" : status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function ServiceIcon({ serviceType }: { serviceType: string }) {
  const { Icon, tone } = SERVICE_ICONS[serviceType] ?? FALLBACK_SERVICE_ICON;
  return (
    // Dark mode flattens the light tints to the card colour, so the circle takes the page background there.
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tone} [[data-mode=dark]_&]:bg-tone-44`}
    >
      <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
    </div>
  );
}

export default function DashboardPage() {
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
    color:
      SERVICE_META[item.serviceType]?.color ??
      FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  }));
  const spendingChange = data?.summary.spending.changePercent;

  return (
    <div className="min-h-full bg-tone-12 text-tone-760">
      <section className="hz-stagger border-b border-tone-75 px-5 py-5 sm:px-8 sm:py-6">
        <p className="text-[13px] text-brand-325">
          {today ? moment(today).format("dddd, Do MMMM YYYY") : "\u00a0"}
        </p>
        <h1 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-tone-744 sm:text-[25px]">
          Welcome Back, {displayName} 👋
        </h1>
        <p className="mt-2 text-[15px] text-tone-426">
          Here&apos;s a clear look at your spending this month.
        </p>
      </section>

      <main className="mx-auto space-y-5 px-5 py-6 sm:px-8 lg:py-7">
        <section className="hz-rise grid gap-5 [--d:1] xl:grid-cols-[1.85fr_.95fr]">
          <div className="relative min-h-[247px] overflow-hidden rounded-xl bg-ink-626 px-7 py-8 text-white sm:px-7">
            {/* Photo in a soft blob shape with floating service icons (design). */}
            <div className="absolute right-[5%] top-1/2 hidden h-[180px] w-[250px] -translate-y-1/2 md:block xl:right-[6%] 2xl:w-[290px]">
              <div className="absolute inset-0 overflow-hidden rounded-[44%_56%_40%_60%/58%_46%_54%_42%]">
                <Image
                  src={HERO_IMAGE}
                  alt="Paying a bill from a phone at home"
                  fill
                  sizes="300px"
                  className="object-cover object-top"
                  priority
                />
              </div>
              <span className="absolute -left-3 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-brand-333 shadow-md">
                <ReceiptText className="h-4 w-4" />
              </span>
              <span className="absolute -right-4 top-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand-333/25 text-brand-249">
                <Lightbulb className="h-3.5 w-3.5" />
              </span>
              <span className="absolute -bottom-1 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-brand-333 shadow-lg">
                <Tv className="h-5 w-5" />
              </span>
            </div>
            <div className="relative z-10 max-w-[400px] md:max-w-[calc(95%-270px)] 2xl:max-w-[400px]">
              <span className="inline-flex rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-semibold tracking-wide">
                ALL YOUR BILLS. ONE PLACE.
              </span>
              <h2 className="mt-7 text-[29px] font-semibold leading-[1.17] tracking-[-0.02em] sm:text-[33px]">
                Let&apos;s get your{" "}
                <span className="text-brand-305">bills out of the way.</span>
              </h2>
              <p className="mt-5 max-w-[390px] text-[13px] leading-5 text-tone-86">
                Skip the stress and the back and forth. Pay electricity,
                airtime, TV and more in one safe place, anytime you like.
              </p>
            </div>
          </div>
          <PromoCarousel />
        </section>

        <section className="hz-rise [--d:2]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg text-tone-405">Metrics</h2>
            <div className="flex flex-wrap gap-2">
              <label className="relative">
                <span className="sr-only">Select period</span>
                <select
                  value={period}
                  onChange={(event) => {
                    if (event.target.value !== "Custom range") {
                      setPeriod(event.target.value);
                      setCustomRange(null);
                    }
                  }}
                  className="appearance-none rounded-xl border border-tone-114 bg-surface py-2.5 pl-3 pr-9 text-xs text-tone-678 outline-none"
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 6 months</option>
                  {customRange && <option>Custom range</option>}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={openRangePicker}
                  className="flex items-center gap-2 rounded-xl border border-tone-114 bg-surface px-3 py-2.5 text-xs text-tone-678 transition hover:border-brand-361/50 active:scale-[0.98]"
                >
                  <CalendarDays className="h-4 w-4 text-tone-415" />
                  {from && to ? formatRange(from, to) : "Choose range"}
                </button>
                {isRangePickerOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border border-tone-98 bg-surface p-4 shadow-xl shadow-slate-900/10">
                    <p className="text-sm font-semibold text-ink-621">
                      Custom date range
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-medium text-slate-600">
                        From
                        <input
                          type="date"
                          value={pendingFrom}
                          max={pendingTo || today || undefined}
                          onChange={(event) =>
                            setPendingFrom(event.target.value)
                          }
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-brand-361"
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
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-brand-361"
                        />
                      </label>
                    </div>
                    {pendingFrom && pendingTo && pendingFrom > pendingTo && (
                      <p className="mt-3 text-xs text-rose-600">
                        The end date must be after the start date.
                      </p>
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
                        disabled={
                          !pendingFrom || !pendingTo || pendingFrom > pendingTo
                        }
                        className="rounded-lg bg-brand-361 px-4 py-2 text-xs font-semibold text-on-brand transition hover:bg-brand-361 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Apply range
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hz-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <MetricCardSkeleton key={index} />
                ))
              : metrics.map((metric) => (
                  <article
                    key={metric.label}
                    className="hz-lift rounded-xl border border-tone-98 bg-surface px-5 py-6"
                  >
                    <p className="text-[15px] text-ink-510">{metric.label}</p>
                    <p className="mt-3 text-[26px] tracking-[-0.02em] text-ink-622">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-[15px]">
                      <span
                        className={metric.positive ? "text-success-417" : "text-danger-404"}
                      >
                        {metric.change}
                      </span>
                      {metric.detail && <span className="text-tone-304"> {metric.detail}</span>}
                    </p>
                  </article>
                ))}
          </div>
          {isError && (
            <p className="mt-3 text-sm text-rose-600">
              We couldn&apos;t load dashboard data. Please try again.
            </p>
          )}
        </section>

        <section className="hz-rise grid gap-5 [--d:3] xl:grid-cols-[1.85fr_.95fr]">
          <article className="rounded-xl border border-tone-98 bg-surface p-5 sm:p-6">
            <div>
              <h2 className="text-xl text-ink-504">Spending overview</h2>
              {isLoading ? (
                <>
                  <Skeleton strong className="mt-2 h-8 w-40" />
                  <Skeleton className="mt-2 h-3.5 w-48" />
                </>
              ) : (
                <>
                  <p className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-tone-744">
                    {data
                      ? formatNaira(data.summary.spending.amountMinor)
                      : "—"}
                  </p>
                  {data && (
                    <p className="mt-2 flex items-center gap-2.5 text-xs text-tone-321">
                      {isNum(spendingChange) && (
                        <span
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium ${spendingChange >= 0 ? "bg-tone-57 text-success-392" : "bg-tone-73 text-danger-404"}`}
                        >
                          {Math.abs(spendingChange).toFixed(0)}%
                          <ArrowUpRight
                            className={`h-3 w-3 ${spendingChange < 0 ? "rotate-90" : ""}`}
                          />
                        </span>
                      )}
                      vs {period === "Custom range" ? "previous period" : period}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="relative mt-6 h-[300px] sm:h-[350px]">
              {isLoading ? (
                <ChartSkeleton shape="bars" label="Loading spending overview" />
              ) : spendingData.length ? (
                <SpendingChart data={spendingData} variant="overview" />
              ) : (
                <p className="pt-24 text-center text-sm text-slate-500">
                  No spending data for this period.
                </p>
              )}
            </div>
          </article>
          <article className="rounded-xl border border-tone-98 bg-surface p-5 sm:p-6">
            <h2 className="text-xl font-medium text-tone-744">Digital Services usage</h2>
            <div className="relative mx-auto mt-2 h-[290px] max-w-[400px]">
              {isLoading ? (
                <ChartSkeleton shape="donut" label="Loading service usage" />
              ) : usageData.length ? (
                <ServiceUsageChart data={usageData} callouts />
              ) : (
                <p className="pt-24 text-center text-sm text-slate-500">
                  No service usage yet.
                </p>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {usageData.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className="h-[18px] w-[18px] rounded"
                    style={{ backgroundColor: service.color }}
                  />
                  <span className="flex-1 text-tone-744">{service.name}</span>
                  <span className="text-info-454">
                    {formatFixed(service.value, 0, "%")}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="hz-rise grid gap-5 [--d:4] xl:grid-cols-[1.85fr_.95fr]">
          <article className="rounded-xl border border-tone-98 bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-medium text-tone-744">Recent Transaction</h2>
              <Link
                href="/dashboard/transactions"
                className="inline-flex items-center gap-2 text-[17px] text-brand-333"
              >
                View all transaction <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 divide-y divide-tone-92">
              {isLoading ? (
                <ListSkeleton rows={3} label="Loading recent transactions" />
              ) : data?.recentTransactions.length ? (
                data.recentTransactions.slice(0, 5).map((transaction) => {
                  const provider = providerFor(transaction.productCode, transaction.productName);
                  return (
                    <div
                      key={transaction.txnRef}
                      className="flex items-center gap-4 py-5 first:pt-3"
                    >
                      <ServiceIcon serviceType={transaction.serviceType} />
                      <div className="min-w-0 flex-1">
                        {/* Design shows the recipient (phone/meter/smartcard); fall back to the product name. */}
                        <p className="truncate text-lg font-medium leading-6 text-tone-744">
                          {transaction.recipient || transaction.productName}
                        </p>
                        <p className="mt-1 truncate text-[15px] text-tone-405">
                          {serviceName(transaction.serviceType)} - {provider?.name ?? transaction.productName}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <span className="text-lg font-semibold text-ink-604">
                          {formatNaira(transaction.totalMinor)}
                        </span>
                        <StatusBadge status={transaction.fulfilmentStatus} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="py-10 text-center text-sm text-slate-500">
                  No recent transactions yet.
                </p>
              )}
            </div>
          </article>
          {/*  <aside className="overflow-hidden rounded-xl border border-tone-98 bg-surface">
            <div className="relative bg-tone-33 p-5">
              <h2 className="text-xl font-semibold">Reward points</h2>
              <p className="mt-7 text-sm text-info-458">Your reward points</p>
              <p className="mt-1 text-[31px] font-medium leading-none tracking-[-0.04em] text-ink-622">
                {data?.rewards.available && data.rewards.points !== null
                  ? data.rewards.points.toLocaleString()
                  : "—"}{" "}
                <span className="text-xl">points</span>
              </p>
              <p className="mt-2 text-sm text-tone-324">
                {data?.rewards.available
                  ? "Available to redeem"
                  : "Rewards are not available yet"}
              </p>
              <div className="absolute right-4 top-8 flex h-24 w-32 rotate-[-27deg] items-center justify-center rounded-full bg-success-397 shadow-[14px_8px_0_#F8AF00]">
                <Trophy className="h-10 w-10 text-white" />
                <Sparkles className="absolute -right-4 -top-3 h-5 w-5 text-success-397" />
              </div>
            </div>
            <div className="p-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-tone-39 px-3 py-1.5 text-sm text-brand-333">
                <Gift className="h-3.5 w-3.5" /> Reward program
              </span>
              <p className="mt-5 text-sm leading-6 text-tone-417">
                Complete digital-service payments to earn rewards when they
                become available.
              </p>
            </div>
          </aside> */}
        </section>
      </main>
    </div>
  );
}

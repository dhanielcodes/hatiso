import { apiGet } from '@/lib/api/axios';
import type { ApiResponse } from '@/types';

export type DashboardBucket = 'DAY' | 'WEEK' | 'MONTH';

export interface DashboardParams {
  from?: string;
  to?: string;
  bucket?: DashboardBucket;
  recentLimit?: number;
}

export interface DashboardData {
  currency: string;
  timezone: string;
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  bucket: DashboardBucket;
  summary: {
    spending: { amountMinor: number; previousAmountMinor: number; changePercent: number };
    transactions: { count: number; previousCount: number; changePercent: number };
    successRate: { percent: number; previousPercent: number; changePercentagePoints: number };
    paymentSuccessRatePercent: number;
    successfulTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    reversedTransactions: number;
    cancelledTransactions: number;
  };
  spendingOverview: Array<{ from: string; to: string; amountMinor: number }>;
  digitalServicesUsage: Array<{ serviceType: string; transactions: number; percentage: number; amountMinor: number }>;
  recentTransactions: Array<{
    txnRef: string;
    orderRef: string;
    productCode: string;
    productName: string;
    serviceType: string;
    amountMinor: number;
    feeMinor: number;
    totalMinor: number;
    currency: string;
    paymentStatus: string;
    fulfilmentStatus: string;
    createdAt: string;
    provider: string;
    demo: boolean;
  }>;
  rewards: { available: boolean; points: number | null };
  containsDemoData: boolean;
}

export type ServiceType =
  | 'AIRTIME'
  | 'DATA'
  | 'EDUCATION'
  | 'ELECTRICITY'
  | 'INSURANCE'
  | 'INTERNET'
  | 'TV'
  | string;

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface SummaryMetric {
  amountMinor: number;
  previousAmountMinor: number;
  changePercent: number;
}

export interface TransactionCountMetric {
  count: number;
  previousCount: number;
  changePercent: number;
}

export interface SuccessRateMetric {
  percent: number;
  previousPercent: number;
  changePercentagePoints: number;
}

export interface Summary {
  spending: SummaryMetric;
  transactions: TransactionCountMetric;
  successRate: SuccessRateMetric;
  paymentSuccessRatePercent: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  reversedTransactions: number;
  cancelledTransactions: number;
}

export interface AveragePayment {
  amountMinor: number;
  previousAmountMinor: number;
  differenceMinor: number;
  changePercent: number;
}

export interface SpendingOverviewItem {
  from: string;
  to: string;
  amountMinor: number;
  averageDailySpendMinor: number;
}

export interface DigitalServicesUsageItem {
  serviceType: ServiceType;
  transactions: number;
  percentage: number;
  amountMinor: number;
}

export interface MonthComparisonPoint {
  day: number;
  currentAmountMinor: number;
  previousAmountMinor: number;
}

export interface MonthComparison {
  currentMonth: string;
  previousMonth: string;
  fromDay: number;
  throughDay: number;
  currentAmountMinor: number;
  previousAmountMinor: number;
  differenceMinor: number;
  changePercent: number;
  points: MonthComparisonPoint[];
}

export interface PaymentActivityItem {
  dayOfWeek: DayOfWeek;
  morning: number;
  noon: number;
  evening: number;
  night: number;
}

export interface TopProviderItem {
  providerCode: string;
  providerName: string;
  amountMinor: number;
}

export interface AnalyticsData {
  currency: string;
  timezone: string;
  period: string;
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  bucket: DashboardBucket;
  summary: Summary;
  averagePayment: AveragePayment;
  averageMonthlySpendMinor: number;
  spendingOverview: SpendingOverviewItem[];
  digitalServicesUsage: DigitalServicesUsageItem[];
  monthComparison: MonthComparison;
  paymentActivity: PaymentActivityItem[];
  topProviders: TopProviderItem[];
}

export function getDashboard(params: DashboardParams = {}) {
  const queryParams: Record<string, unknown> = { ...params };
  return apiGet<ApiResponse<DashboardData>>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/dashboard`, queryParams);
}


export function getAnalytics(params: DashboardParams = {}) {
  const queryParams: Record<string, unknown> = { ...params };
  return apiGet<ApiResponse<AnalyticsData>>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/analytics`, queryParams);
}

export function getAnalyticsCSV(params: DashboardParams = {}) {
  const queryParams: Record<string, unknown> = { ...params };
  return apiGet<unknown>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/analytics/export`, queryParams);
}
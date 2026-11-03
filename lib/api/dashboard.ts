import { apiGet } from '@/lib/api/axios';

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

interface DashboardResponse {
  code: number;
  status: boolean;
  data: DashboardData;
}

export function getDashboard(params: DashboardParams = {}) {
  const queryParams: Record<string, unknown> = { ...params };
  return apiGet<DashboardResponse>('/api/v1/dashboard', queryParams);
}

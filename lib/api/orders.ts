import { apiGet } from '@/lib/api/axios';
import type { DigitalServiceCategory } from '@/lib/api/digitalServices';

export interface DigitalServiceOrderHistory {
  reference: string;
  tenantId: string;
  productCode: string;
  category: DigitalServiceCategory;
  recipient: string;
  amountMinor: number;
  currency: string;
  expiresAt: string;
  fulfilmentStatus: string;
  paymentReference: string | null;
  providerReference: string | null;
  customerName: string | null;
  deliveryCode: string | null;
  units: string | null;
  quantity: number;
}

interface OrdersResponse {
  code: number;
  status: boolean;
  data: DigitalServiceOrderHistory[];
}

export function getDigitalServiceOrders(page: number, size: number) {
  return apiGet<OrdersResponse>('/api/v1/digital-services/orders', { page, size });
}

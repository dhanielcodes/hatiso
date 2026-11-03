import { apiClient, apiGet } from '@/lib/api/axios';

export interface ApiResponse<T> {
  code: number;
  status: boolean;
  data: T;
}

export type DigitalServiceCategory =
  | 'TELCO'
  | 'INTERNET_SERVICES'
  | 'DISCO'
  | 'CABLE'
  | 'EDUCATION'
  | 'INSURANCE'
  | 'OTHER_SERVICES';

export function getDigitalServiceCategories() {
  return apiGet<ApiResponse<DigitalServiceCategory[]>>(
    '/api/v1/digital-services/categories'
  );
}

export interface DigitalServiceFormField {
  path: string;
  label: string;
  type: string;
  required: boolean;
  readOnly: boolean;
  value: string | number | boolean | null;
  minimum: number | null;
  maximum: number | null;
  pattern: string | null;
}

export interface DigitalServiceProduct {
  code: string;
  tenantId: string;
  category: DigitalServiceCategory;
  name: string;
  fixedAmountMinor: null | string | number
  minimumMinor: null | string | number
  maximumMinor: null | string | number
  currency: string;
  active: boolean;
  serviceId: string;
  variationCode: null | string | number;
  profile: {
    flow: string;
    selectors: Record<string, unknown>;
    purchasable: boolean;
    unavailableReason: string | null;
    rule: {
      flow: string;
      maxQuantity: number;
      phoneRecipient: boolean;
      serverPriced: boolean;
      fields: Record<string, unknown>;
      version: number;
    };
    allowedFields: string[];
    requiredFields: string[];
  };
  formFields: DigitalServiceFormField[];
  requiredFields: string[];
  allowedFields: string[];
}

export interface DigitalServiceBiller {
  billerCode: string;
  billerName: string;
  tenantId: string;
  category: DigitalServiceCategory;
  products: DigitalServiceProduct[];
}

export interface CreateDigitalServiceOrderInput {
  productCode: string;
  recipient: string;
  fields: Record<string, unknown>;
  amountMinor: number;
  contactPhone?: string;
  email?: string;
}

export interface DigitalServiceOrder {
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
  guestToken: string;
  guestExpiresAt: string;
}

export interface CreateGuestPaymentQuoteInput {
  orderRef: string;
  provider: 'PAYSTACK';
  email: string;
}

export interface GuestPaymentQuote {
  orderRef: string;
  provider: 'PAYSTACK';
  currency: string;
  amountMinor: number;
  feeMinor: number;
  totalMinor: number;
}

export interface CreateGuestPaymentInput {
  orderRef: string;
  provider: 'PAYSTACK';
  expectedTotalMinor: number;
}

export interface GuestPayment {
  txnRef: string;
  tenantId: string;
  orderRef: string;
  provider: 'PAYSTACK';
  status: string;
  currency: string;
  amountMinor: number;
  feeMinor: number;
  totalMinor: number;
  checkoutUrl: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface VerifyGuestPaymentInput {
  txnRef: string;
}

export interface VerifiedGuestPayment {
  txnRef: string;
  tenantId: string;
  orderRef: string;
  provider: 'PAYSTACK';
  status: 'INITIATED' | 'PENDING' | 'FAILED' | 'SUCCESSFUL' | string;
  currency: string;
  amountMinor: number;
  feeMinor: number;
  totalMinor: number;
  checkoutUrl: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `hatiso-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function createDigitalServiceOrder(input: CreateDigitalServiceOrderInput) {
  const response = await apiClient.post<ApiResponse<DigitalServiceOrder>>(
    '/api/public/digital-services/orders',
    input,
    { headers: { 'Idempotency-Key': createIdempotencyKey() } }
  );
  return response.data;
}

export async function createGuestPaymentQuote(
  input: CreateGuestPaymentQuoteInput,
  guestToken: string
) {
  const response = await apiClient.post<ApiResponse<GuestPaymentQuote>>(
    '/api/public/guest-payments/quote',
    input,
    { headers: { 'X-Guest-Token': guestToken } }
  );
  return response.data;
}

export async function createGuestPayment(
  input: CreateGuestPaymentInput,
  guestToken: string
) {
  const response = await apiClient.post<ApiResponse<GuestPayment>>(
    '/api/public/guest-payments',
    input,
    {
      headers: {
        'Idempotency-Key': createIdempotencyKey(),
        'X-Guest-Token': guestToken,
      },
    }
  );
  return response.data;
}

export async function verifyGuestPayment(
  input: VerifyGuestPaymentInput,
  guestToken: string
) {
  const response = await apiClient.post<ApiResponse<VerifiedGuestPayment>>(
    '/api/public/guest-payments/verify',
    input,
    { headers: { 'X-Guest-Token': guestToken } }
  );
  return response.data;
}

export function getDigitalServiceCatalogues(category: DigitalServiceCategory, page: number = 0, size: number = 20) {
  return apiGet<ApiResponse<DigitalServiceBiller[]>>(
    `/api/v1/digital-services/catalogue/grouped?category=${category}&page=${page}&size=${size}`
  );
}

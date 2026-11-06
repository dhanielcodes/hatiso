import { apiGet, apiPost } from '@/lib/api/axios';
import type { ApiResponse } from '@/types';

export type DigitalServiceCategory =
  | 'TELCO'
  | 'INTERNET_SERVICES'
  | 'DISCO'
  | 'CABLE'
  | 'EDUCATION'
  | 'INSURANCE'
  | 'OTHER_SERVICES';

export function getDigitalServiceCategories() {
  return apiGet<ApiResponse<DigitalServiceCategory[]>>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/digital-services/categories`);
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
  logoUrl?: string;
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

export function createDigitalServiceOrder(input: CreateDigitalServiceOrderInput) {
  return apiPost<ApiResponse<DigitalServiceOrder>>(
    '/api/public/digital-services/orders',
    input,
    { headers: { 'Idempotency-Key': createIdempotencyKey() } }
  );
}

export function createGuestPaymentQuote(
  input: CreateGuestPaymentQuoteInput,
  guestToken: string
) {
  return apiPost<ApiResponse<GuestPaymentQuote>>(
    '/api/public/guest-payments/quote',
    input,
    { headers: { 'X-Guest-Token': guestToken } }
  );
}

export function createGuestPayment(
  input: CreateGuestPaymentInput,
  guestToken: string
) {
  return apiPost<ApiResponse<GuestPayment>>(
    '/api/public/guest-payments',
    input,
    {
      headers: {
        'Idempotency-Key': createIdempotencyKey(),
        'X-Guest-Token': guestToken,
      },
    }
  );
}

export function verifyGuestPayment(
  input: VerifyGuestPaymentInput,
  guestToken: string
) {
  return apiPost<ApiResponse<VerifiedGuestPayment>>(
    '/api/public/guest-payments/verify',
    input,
    { headers: { 'X-Guest-Token': guestToken } }
  );
}

export function createDigitalServiceOrderAuthenticated(input: CreateDigitalServiceOrderInput) {
  return apiPost<ApiResponse<DigitalServiceOrder>>(
    `/api/${process.env.NEXT_PUBLIC_API_VERSION}/digital-services/orders`,
    input,
    { headers: { 'Idempotency-Key': createIdempotencyKey() } }
  );
}

export function createGuestPaymentQuoteAuthenticated(
  input: CreateGuestPaymentQuoteInput,
  guestToken: string
) {
  return apiPost<ApiResponse<GuestPaymentQuote>>(
    `/api/${process.env.NEXT_PUBLIC_API_VERSION}/payments/quote`,
    input,
    { headers: { 'X-Guest-Token': guestToken } }
  );
}

export function createGuestPaymentAuthenticated(
  input: CreateGuestPaymentInput,
  guestToken: string
) {
  return apiPost<ApiResponse<GuestPayment>>(
    `/api/${process.env.NEXT_PUBLIC_API_VERSION}/payments`,
    input,
    {
      headers: {
        'Idempotency-Key': createIdempotencyKey(),
        'X-Guest-Token': guestToken,
      },
    }
  );
}

export function verifyGuestPaymentAuthenticated(
  input: VerifyGuestPaymentInput,
  guestToken: string
) {
  return apiPost<ApiResponse<VerifiedGuestPayment>>(
    `/api/${process.env.NEXT_PUBLIC_API_VERSION}/payments/verify`,
    input,
    { headers: { 'X-Guest-Token': guestToken } }
  );
}

export function getDigitalServiceCatalogues(category: DigitalServiceCategory, page: number = 0, size: number = 20) {
  return apiGet<ApiResponse<DigitalServiceBiller[]>>(
    `/api/${process.env.NEXT_PUBLIC_API_VERSION}/digital-services/catalogue/grouped`,
    { category, page, size }
  );
}
